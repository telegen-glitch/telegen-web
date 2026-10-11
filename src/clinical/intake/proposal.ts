import "server-only";
import { randomInt } from "node:crypto";
import { getEvaluation } from "@/content/evaluations";
import { validateAnswers } from "@/lib/evaluation";
import { photoSlotsFor } from "../config/conditions";
import { eligiblePlans, PLANS, type Billing, type PlanDefinition, type PlanId } from "../config/plans";
import { INCLUDED, quote, type Quote, type Variant } from "../config/pricing";
import { SERVICE } from "../config/service";
import { asService, asUser, type Executor } from "../db";
import { logEvent } from "../log";
import { paymentProvider } from "../payments/provider";
import type { Session } from "../auth";
import { IntakeError, type CaseStatus } from "./cases";

/**
 * "Planul tău propus" and checkout (CLAUDE.md v5 P2). Signed-in only: this is
 * the one place where a medicine is named next to a price. Amounts, the plan
 * choice and the A/B variant are decided here, never taken from the browser.
 */

const actor = (s: Session) => ({ id: s.userId, aal: s.aal });

export interface Delivery {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  county: string;
  postalCode: string;
}

export interface ProposalView {
  caseId: string;
  status: CaseStatus;
  plans: PlanDefinition[];
  quotes: Record<Billing, Quote>;
  included: string[];
  chosen: { planId: PlanId; billing: Billing } | null;
  delivery: Delivery | null;
  provider: "stripe" | "fake" | null;
  slaHours: number;
}

interface CaseRow {
  id: string;
  condition: string;
  status: CaseStatus;
  patient_id: string;
}

/** The patient's own case, checked under RLS, ready for a proposal: complete answers and photos. */
async function readyCase(q: Executor, caseId: string) {
  const [kase] = await q.query<CaseRow>(
    "select id, condition, status, patient_id from clinical.cases where id = $1",
    [caseId],
  );
  if (!kase) throw new IntakeError("not_found");
  if (kase.status !== "draft" && kase.status !== "awaiting_payment") throw new IntakeError("locked");
  const def = getEvaluation(kase.condition);
  const rows = await q.query<{ question_id: string; answer: string[] }>(
    "select question_id, answer from clinical.answers where case_id = $1",
    [caseId],
  );
  const v = def ? validateAnswers(def, Object.fromEntries(rows.map((r) => [r.question_id, r.answer]))) : null;
  const photos = await q.query<{ slot: string }>("select slot from clinical.photos where case_id = $1", [
    caseId,
  ]);
  const photosDone = photoSlotsFor(kase.condition).every((s) => photos.some((p) => p.slot === s));
  if (!v?.complete || !photosDone) throw new IntakeError("invalid");
  await q.query("select clinical.audit('read', 'answers', $1)", [caseId]);
  return { kase, plans: eligiblePlans(kase.condition, v.answers) };
}

/** The patient's A/B variant: assigned once, 50/50, stored server-side. */
async function variantFor(patientId: string): Promise<Variant> {
  return asService(async (q) => {
    const [row] = await q.query<{ variant: Variant }>(
      "select variant from clinical.price_assignments where patient_id = $1",
      [patientId],
    );
    if (row) return row.variant;
    const variant: Variant = randomInt(2) === 0 ? "A" : "B";
    const [saved] = await q.query<{ variant: Variant }>(
      `insert into clinical.price_assignments (patient_id, variant) values ($1, $2)
       on conflict (patient_id) do update set variant = clinical.price_assignments.variant returning variant`,
      [patientId, variant],
    );
    return saved.variant;
  });
}

async function readDelivery(q: Executor): Promise<Delivery | null> {
  const [p] = await q.query<{
    full_name: string | null;
    phone: string | null;
    address_line: string | null;
    city: string | null;
    county: string | null;
    postal_code: string | null;
  }>(
    "select full_name, phone, address_line, city, county, postal_code from clinical.patients where id = auth.uid()",
  );
  if (!p?.full_name || !p.phone || !p.address_line || !p.city || !p.county || !p.postal_code) return null;
  return {
    fullName: p.full_name,
    phone: p.phone,
    addressLine: p.address_line,
    city: p.city,
    county: p.county,
    postalCode: p.postal_code,
  };
}

export async function proposalFor(session: Session, caseId: unknown): Promise<ProposalView> {
  if (typeof caseId !== "string") throw new IntakeError("invalid");
  const { kase, plans, delivery, latest } = await asUser(actor(session), async (q) => {
    const ready = await readyCase(q, caseId);
    const [latest] = await q.query<{ plan_id: PlanId; billing: Billing }>(
      "select plan_id, billing from clinical.proposals where case_id = $1 order by created_at desc limit 1",
      [caseId],
    );
    return { ...ready, delivery: await readDelivery(q), latest };
  });
  if (plans.length === 0) throw new IntakeError("invalid");
  const variant = await variantFor(kase.patient_id);
  const monthly = quote(kase.condition, "monthly", variant);
  const quarterly = quote(kase.condition, "quarterly", variant);
  if (!monthly || !quarterly) throw new IntakeError("invalid");
  return {
    caseId,
    status: kase.status,
    plans: plans.map((id) => PLANS[id]),
    quotes: { monthly, quarterly },
    included: INCLUDED,
    chosen:
      latest && plans.includes(latest.plan_id) ? { planId: latest.plan_id, billing: latest.billing } : null,
    delivery,
    provider: paymentProvider()?.kind ?? null,
    slaHours: SERVICE.slaHours,
  };
}

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

/** Validates and saves the delivery details (patients row, under RLS). */
export async function saveDelivery(session: Session, raw: Record<string, unknown>): Promise<Delivery> {
  const d: Delivery = {
    fullName: clean(raw.fullName, 120),
    phone: clean(raw.phone, 20).replace(/[^\d+]/g, ""),
    addressLine: clean(raw.addressLine, 200),
    city: clean(raw.city, 80),
    county: clean(raw.county, 80),
    postalCode: clean(raw.postalCode, 6),
  };
  const ok =
    d.fullName.length >= 3 &&
    /^(\+40|0)\d{9}$/.test(d.phone) &&
    d.addressLine.length >= 5 &&
    d.city.length >= 2 &&
    d.county.length >= 2 &&
    /^\d{6}$/.test(d.postalCode);
  if (!ok) throw new IntakeError("invalid");
  await asUser(actor(session), (q) =>
    q.query(
      `update clinical.patients set full_name = $1, phone = $2, address_line = $3, city = $4, county = $5,
         postal_code = $6, updated_at = now() where id = auth.uid()`,
      [d.fullName, d.phone, d.addressLine, d.city, d.county, d.postalCode],
    ),
  );
  return d;
}

export interface CheckoutStart {
  paymentId: string;
  redirectUrl: string | null;
}

/**
 * The patient accepts the proposed plan: the proposal is recorded with the
 * server's amounts, any earlier unpaid checkout is abandoned, and a card
 * authorisation (not a charge) is started for the first amount.
 */
export async function startCheckout(
  session: Session,
  input: { caseId: unknown; planId: unknown; billing: unknown; returnUrl: string },
): Promise<CheckoutStart> {
  if (typeof input.caseId !== "string") throw new IntakeError("invalid");
  const caseId = input.caseId;
  const billing = input.billing === "monthly" || input.billing === "quarterly" ? input.billing : null;
  const provider = paymentProvider();
  if (!provider) throw new IntakeError("closed");

  const { kase, plans, delivery } = await asUser(actor(session), async (q) => ({
    ...(await readyCase(q, caseId)),
    delivery: await readDelivery(q),
  }));
  const planId = plans.find((p) => p === input.planId);
  if (!planId || !billing || !delivery) throw new IntakeError("invalid");
  const variant = await variantFor(kase.patient_id);
  const offer = quote(kase.condition, billing, variant);
  if (!offer) throw new IntakeError("invalid");

  const { paymentId, previous, customerId } = await asService(async (q) => {
    const previous = await q.query<{ id: string; checkout_id: string | null }>(
      "update clinical.payments set status = 'expired' where case_id = $1 and status = 'pending' returning id, checkout_id",
      [caseId],
    );
    const [proposal] = await q.query<{ id: string }>(
      `insert into clinical.proposals (case_id, plan_id, billing, first_amount, recurring_amount, source, accepted_at)
       values ($1, $2, $3, $4, $5, 'system', now()) returning id`,
      [caseId, planId, billing, offer.firstAmount, offer.recurringAmount],
    );
    await q.query(
      "update clinical.cases set plan_id = $2, price_variant = $3, status = 'awaiting_payment' where id = $1",
      [caseId, planId, variant],
    );
    const [payment] = await q.query<{ id: string }>(
      "insert into clinical.payments (case_id, provider, amount, proposal_id) values ($1, $2, $3, $4) returning id",
      [caseId, provider.kind, offer.firstAmount, proposal.id],
    );
    const [patient] = await q.query<{ stripe_customer_id: string | null }>(
      "select stripe_customer_id from clinical.patients where id = $1",
      [kase.patient_id],
    );
    return { paymentId: payment.id, previous, customerId: patient?.stripe_customer_id ?? null };
  });
  for (const p of previous) if (p.checkout_id) await provider.expireCheckout(p.checkout_id);

  let started;
  try {
    started = await provider.startAuthorization({
      caseId,
      paymentId,
      amount: offer.firstAmount,
      email: session.email,
      customerId,
      returnUrl: input.returnUrl,
    });
  } catch {
    logEvent("payment.error", { case: caseId, payment: paymentId });
    await asService((q) =>
      q.query("update clinical.payments set status = 'failed' where id = $1", [paymentId]),
    );
    throw new IntakeError("closed");
  }
  await asService(async (q) => {
    await q.query("update clinical.payments set checkout_id = $2 where id = $1", [
      paymentId,
      started.checkoutId,
    ]);
    if (started.customerId)
      await q.query(
        "update clinical.patients set stripe_customer_id = $2 where id = $1 and stripe_customer_id is null",
        [kase.patient_id, started.customerId],
      );
  });
  return { paymentId, redirectUrl: started.redirectUrl };
}

/** Local and CI only: the fake provider's "card" authorises the pending payment. */
export async function fakeAuthorize(session: Session, paymentId: unknown) {
  if (paymentProvider()?.kind !== "fake") throw new IntakeError("closed");
  if (typeof paymentId !== "string") throw new IntakeError("invalid");
  const [p] = await asUser(actor(session), (q) =>
    q.query<{ id: string; checkout_id: string | null; provider: string }>(
      "select id, checkout_id, provider from clinical.payments where id = $1",
      [paymentId],
    ),
  );
  if (!p || p.provider !== "fake" || !p.checkout_id) throw new IntakeError("not_found");
  const { markAuthorized } = await import("../payments/flow");
  return markAuthorized({
    checkoutId: p.checkout_id,
    intentId: `fake_pi_${p.id.replace(/-/g, "")}`,
    captureBefore: new Date(Date.now() + 7 * 24 * 3600 * 1000),
  });
}
