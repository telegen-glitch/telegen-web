import "server-only";
import { SERVICE } from "../config/service";
import { asService, asUser, type Executor } from "../db";
import { enqueue } from "../email/outbox";
import { IntakeError } from "../intake/cases";
import { logEvent } from "../log";
import { paymentProvider } from "../payments/provider";
import type { Session } from "../auth";

/**
 * Plans after approval (CLAUDE.md v5): the saved card is charged from the next
 * cycle; each paid cycle sends a new order to the pharmacy; check-ins at month 1
 * and 3; a doctor re-reviews every SERVICE.renewalReviewMonths (charges stop
 * until they do); the patient can pause or cancel any time.
 */
const actor = (s: Session) => ({ id: s.userId, aal: s.aal });

const addMonths = (d: Date, m: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x;
};

/** Called once the first payment is captured. */
export async function startPlan(caseId: string): Promise<void> {
  const ctx = await asService(async (q) => {
    const [row] = await q.query<{
      patient_id: string;
      plan_id: string;
      billing: "monthly" | "quarterly";
      recurring_amount: number;
      intent_id: string | null;
      provider: string;
      exists: boolean;
    }>(
      `select c.patient_id, pr.plan_id, pr.billing, pr.recurring_amount, p.intent_id, p.provider,
              exists (select 1 from clinical.subscriptions s where s.case_id = c.id) as exists
       from clinical.cases c join clinical.proposals pr on pr.id = c.approved_proposal_id
       join lateral (select * from clinical.payments where case_id = c.id and status = 'captured'
                     order by captured_at desc limit 1) p on true
       where c.id = $1`,
      [caseId],
    );
    return row ?? null;
  });
  if (!ctx || ctx.exists) return;
  const interval = ctx.billing === "quarterly" ? 3 : 1;
  const now = new Date();
  const next = addMonths(now, interval);
  const provider = paymentProvider();
  let providerId: string | null = null;
  if (provider && ctx.intent_id && provider.kind === ctx.provider) {
    try {
      providerId = await provider.startSubscription({
        caseId,
        intentId: ctx.intent_id,
        amount: ctx.recurring_amount,
        intervalMonths: interval,
        firstChargeAt: next,
      });
    } catch {
      logEvent("payment.error", { case: caseId });
    }
  }
  await asService(async (q) => {
    await q.query(
      `insert into clinical.subscriptions (case_id, patient_id, provider_id, interval_months, amount, plan_id, billing,
         next_charge_at, renewal_review_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9) on conflict (case_id) do nothing`,
      [
        caseId,
        ctx.patient_id,
        providerId,
        interval,
        ctx.recurring_amount,
        ctx.plan_id,
        ctx.billing,
        next,
        addMonths(now, SERVICE.renewalReviewMonths),
      ],
    );
    for (const [kind, months] of [
      ["month1", SERVICE.checkinMonths[0]],
      ["month3", SERVICE.checkinMonths[1]],
    ] as const)
      await q.query(
        "insert into clinical.checkins (case_id, kind, due_at) values ($1, $2, $3) on conflict do nothing",
        [caseId, kind, addMonths(now, months)],
      );
  });
}

/** One paid cycle (Stripe invoice.paid, or the local fake charge): payment record + pharmacy order. */
export async function recordRenewal(input: {
  caseId: string;
  amount: number;
  ref: string;
  provider: "stripe" | "fake";
}) {
  const added = await asService(async (q) => {
    const [sub] = await q.query<{ id: string; interval_months: number; status: string; patient_id: string }>(
      "select id, interval_months, status, patient_id from clinical.subscriptions where case_id = $1",
      [input.caseId],
    );
    if (!sub) return false;
    const inserted = await q.query(
      `insert into clinical.payments (case_id, provider, amount, status, purpose, invoice_ref, captured_at)
       values ($1, $2, $3, 'captured', 'renewal', $4, now()) on conflict (invoice_ref) do nothing returning id`,
      [input.caseId, input.provider, input.amount, input.ref],
    );
    if (!inserted.length) return false;
    const [rx] = await q.query<{ id: string }>(
      "select id from clinical.prescriptions where case_id = $1 order by issued_at desc limit 1",
      [input.caseId],
    );
    await q.query(
      `insert into clinical.orders (case_id, prescription_id, pharmacy_id)
       values ($1, $2, (select id from clinical.pharmacies where active order by created_at limit 1))`,
      [input.caseId, rx?.id ?? null],
    );
    await q.query("insert into clinical.invoices (case_id, payment_id, amount) values ($1, $2, $3)", [
      input.caseId,
      (inserted[0] as { id: string }).id,
      input.amount,
    ]);
    await q.query(
      `update clinical.subscriptions set next_charge_at = next_charge_at + make_interval(months => interval_months),
         updated_at = now() where id = $1`,
      [sub.id],
    );
    return true;
  });
  if (added) logEvent("payment.captured", { case: input.caseId });
}

export interface PlanView {
  status: "active" | "paused" | "canceled" | "renewal_review";
  amount: number;
  intervalMonths: number;
  nextChargeAt: string | null;
  renewalReviewAt: string | null;
}

export async function planFor(session: Session, caseId: string): Promise<PlanView | null> {
  const [s] = await asUser(actor(session), (q) =>
    q.query<{
      status: PlanView["status"];
      amount: number;
      interval_months: number;
      next_charge_at: Date | null;
      renewal_review_at: Date | null;
    }>(
      "select status, amount, interval_months, next_charge_at, renewal_review_at from clinical.subscriptions where case_id = $1",
      [caseId],
    ),
  );
  if (!s) return null;
  return {
    status: s.status,
    amount: s.amount,
    intervalMonths: s.interval_months,
    nextChargeAt: s.next_charge_at ? new Date(s.next_charge_at).toISOString() : null,
    renewalReviewAt: s.renewal_review_at ? new Date(s.renewal_review_at).toISOString() : null,
  };
}

async function ownSubscription(session: Session, caseId: string) {
  const [s] = await asUser(actor(session), (q) =>
    q.query<{ id: string; status: string; provider_id: string | null }>(
      "select id, status, provider_id from clinical.subscriptions where case_id = $1 and patient_id = auth.uid()",
      [caseId],
    ),
  );
  if (!s) throw new IntakeError("not_found");
  return s;
}

const isFake = (id: string | null) => !id || id.startsWith("fake_");

/** Pause (no charges until resumed), resume, or cancel (no further charges). */
export async function changePlan(session: Session, caseId: string, action: "pause" | "resume" | "cancel") {
  const s = await ownSubscription(session, caseId);
  const allowed =
    (action === "pause" && s.status === "active") ||
    (action === "resume" && s.status === "paused") ||
    (action === "cancel" && s.status !== "canceled");
  if (!allowed) throw new IntakeError("locked");
  const provider = paymentProvider();
  if (s.provider_id && !isFake(s.provider_id) && provider?.kind === "stripe") {
    if (action === "cancel") await provider.cancelSubscription(s.provider_id);
    else await provider.pauseSubscription(s.provider_id, action === "pause");
  }
  await asService((q) =>
    q.query(
      action === "pause"
        ? "update clinical.subscriptions set status = 'paused', paused_at = now(), updated_at = now() where id = $1"
        : action === "resume"
          ? "update clinical.subscriptions set status = 'active', paused_at = null, updated_at = now() where id = $1"
          : "update clinical.subscriptions set status = 'canceled', cancel_at = now(), updated_at = now() where id = $1",
      [s.id],
    ),
  );
}

/** The scheduled job's part: notices, fake renewals, check-in reminders, renewal reviews. */
export async function subscriptionTick(now: Date): Promise<void> {
  const fakeDue: { case_id: string; amount: number; next_charge_at: Date }[] = [];
  await asService(async (q: Executor) => {
    const soon = new Date(now.getTime() + 3 * 86_400_000);
    const upcoming = await q.query<{ id: string; case_id: string; patient_id: string; next_charge_at: Date }>(
      `select id, case_id, patient_id, next_charge_at from clinical.subscriptions
       where status = 'active' and next_charge_at <= $1 and next_charge_at > $2
         and (upcoming_notice_for is null or upcoming_notice_for <> next_charge_at)`,
      [soon, now],
    );
    for (const u of upcoming) {
      await enqueue(q, u.patient_id, "payment_upcoming", u.case_id);
      await q.query("update clinical.subscriptions set upcoming_notice_for = next_charge_at where id = $1", [
        u.id,
      ]);
    }

    const due = await q.query<{ case_id: string; patient_id: string; id: string }>(
      `select k.id, k.case_id, c.patient_id from clinical.checkins k join clinical.cases c on c.id = k.case_id
       join clinical.subscriptions s on s.case_id = k.case_id
       where k.due_at <= $1 and k.completed_at is null and k.notified_at is null and s.status <> 'canceled'`,
      [now],
    );
    for (const d of due) {
      await enqueue(q, d.patient_id, "checkin_due", d.case_id);
      await q.query("update clinical.checkins set notified_at = now() where id = $1", [d.id]);
    }

    // The renewal check-in opens two weeks before the doctor's re-review.
    const reviewSoon = await q.query<{ case_id: string; renewal_review_at: Date }>(
      `select s.case_id, s.renewal_review_at from clinical.subscriptions s
       where s.status in ('active', 'paused') and s.renewal_review_at <= $1
         and not exists (select 1 from clinical.checkins k where k.case_id = s.case_id and k.kind = 'renewal'
                         and k.due_at = s.renewal_review_at)`,
      [new Date(now.getTime() + 14 * 86_400_000)],
    );
    for (const r of reviewSoon)
      await q.query(
        "insert into clinical.checkins (case_id, kind, due_at) values ($1, 'renewal', $2) on conflict do nothing",
        [r.case_id, r.renewal_review_at],
      );

    // At the review date without the doctor's decision: charges stop until they decide.
    const toReview = await q.query<{
      id: string;
      case_id: string;
      provider_id: string | null;
      doctor: string | null;
    }>(
      `select s.id, s.case_id, s.provider_id, c.assigned_doctor_id as doctor from clinical.subscriptions s
       join clinical.cases c on c.id = s.case_id where s.status = 'active' and s.renewal_review_at <= $1`,
      [now],
    );
    for (const r of toReview) {
      await q.query(
        "update clinical.subscriptions set status = 'renewal_review', updated_at = now() where id = $1",
        [r.id],
      );
      if (r.doctor) await enqueue(q, r.doctor, "renewal_review_due", r.case_id);
    }

    fakeDue.push(
      ...(await q.query<{ case_id: string; amount: number; next_charge_at: Date }>(
        `select case_id, amount, next_charge_at from clinical.subscriptions
         where status = 'active' and next_charge_at <= $1 and (provider_id is null or provider_id like 'fake_%')`,
        [now],
      )),
    );
  });
  const provider = paymentProvider();
  for (const r of await asService((q) =>
    q.query<{ provider_id: string | null }>(
      "select provider_id from clinical.subscriptions where status = 'renewal_review' and provider_id is not null and provider_id not like 'fake_%'",
    ),
  ))
    if (provider?.kind === "stripe" && r.provider_id)
      await provider.pauseSubscription(r.provider_id, true).catch(() => undefined);
  if (paymentProvider()?.kind === "fake")
    for (const d of fakeDue)
      await recordRenewal({
        caseId: d.case_id,
        amount: d.amount,
        ref: `fake_in_${d.case_id.replace(/-/g, "")}_${new Date(d.next_charge_at).getTime()}`,
        provider: "fake",
      });
}
