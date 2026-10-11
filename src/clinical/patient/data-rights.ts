import "server-only";
import { CONSENT_VERSION } from "../config/consents";
import { asService, asUser } from "../db";
import { releaseFor } from "../doctor/workflow";
import { clinicalEnv } from "../env";
import { enqueue } from "../email/outbox";
import { logEvent } from "../log";
import { paymentProvider } from "../payments/provider";
import { photoStorage } from "../storage";
import type { Session } from "../auth";

/**
 * The patient's data rights in /cont (GDPR arts. 15, 17, 20 and 7(3); CLAUDE.md
 * v5): a full export, withdrawal of the health-data consent, and deletion.
 * Medical records the law requires to keep are not erased on the spot: the
 * request is recorded for the admin and the lawyer's retention rules
 * (docs/legal-review-needed.md).
 */
const actor = (s: Session) => ({ id: s.userId, aal: s.aal });

/** Everything stored about the signed-in patient, read under RLS and audited. */
export async function exportData(session: Session): Promise<Record<string, unknown>> {
  return asUser(actor(session), async (q) => {
    const one = async (sql: string, p: unknown[] = []) => (await q.query(sql, p))[0] ?? null;
    const all = (sql: string, p: unknown[] = []) => q.query(sql, p);
    const cases = await all(
      "select id, condition, status, questionnaire_version, created_at, submitted_at, decided_at, decision_reason, test from clinical.cases where patient_id = auth.uid() order by created_at",
    );
    const ids = cases.map((c) => (c as { id: string }).id);
    await q.query("select clinical.audit('read', 'export', auth.uid()::text)");
    return {
      exportedAt: new Date().toISOString(),
      account: await one("select email, created_at from clinical.profiles where id = auth.uid()"),
      delivery: await one(
        "select full_name, phone, address_line, city, county, postal_code from clinical.patients where id = auth.uid()",
      ),
      consents: await all(
        "select kind, version, action, at from clinical.consents where patient_id = auth.uid() order by at",
      ),
      cases,
      answers: await all(
        "select case_id, question_id, answer, updated_at from clinical.answers where case_id = any($1::uuid[])",
        [ids],
      ),
      photos: await all(
        "select case_id, slot, created_at from clinical.photos where case_id = any($1::uuid[])",
        [ids],
      ),
      proposals: await all(
        "select case_id, plan_id, billing, first_amount, recurring_amount, source, accepted_at, created_at from clinical.proposals where case_id = any($1::uuid[])",
        [ids],
      ),
      messages: await all(
        "select case_id, sender_role, body, created_at from clinical.messages where case_id = any($1::uuid[]) order by created_at",
        [ids],
      ),
      prescriptions: await all(
        "select case_id, items, issued_at from clinical.prescriptions where case_id = any($1::uuid[])",
        [ids],
      ),
      payments: await all(
        "select case_id, amount, currency, status, purpose, created_at, captured_at, canceled_at from clinical.payments where case_id = any($1::uuid[])",
        [ids],
      ),
      orders: await all(
        "select case_id, status, carrier, tracking_code, shipped_at, delivered_at from clinical.orders where case_id = any($1::uuid[])",
        [ids],
      ),
      subscriptions: await all(
        "select case_id, status, amount, interval_months, next_charge_at, renewal_review_at from clinical.subscriptions where patient_id = auth.uid()",
      ),
      checkins: await all(
        "select case_id, kind, due_at, completed_at, answers from clinical.checkins where case_id = any($1::uuid[])",
        [ids],
      ),
    };
  });
}

const OPEN = [
  "draft",
  "stopped",
  "awaiting_payment",
  "submitted",
  "in_review",
  "waiting_patient",
  "adjusted",
];

/** Ends everything still running: open cases (holds released) and subscriptions. */
async function stopEverything(session: Session): Promise<void> {
  const open = await asService((q) =>
    q.query<{ id: string }>(
      "update clinical.cases set status = 'canceled' where patient_id = $1 and status = any($2::text[]) returning id",
      [session.userId, OPEN],
    ),
  );
  for (const c of open) await releaseFor(c.id);
  const subs = await asService((q) =>
    q.query<{ provider_id: string | null }>(
      "update clinical.subscriptions set status = 'canceled', cancel_at = now(), updated_at = now() where patient_id = $1 and status <> 'canceled' returning provider_id",
      [session.userId],
    ),
  );
  const provider = paymentProvider();
  for (const s of subs)
    if (s.provider_id && !s.provider_id.startsWith("fake_") && provider?.kind === "stripe")
      await provider.cancelSubscription(s.provider_id).catch(() => logEvent("payment.error"));
}

/** Withdraws the health-data consent: nothing new is processed; open cases and plans stop. */
export async function withdrawConsent(session: Session): Promise<void> {
  await asUser(actor(session), (q) =>
    q.query(
      "insert into clinical.consents (patient_id, kind, version, action) values (auth.uid(), 'gdpr_art9', $1, 'withdrawn')",
      [CONSENT_VERSION],
    ),
  );
  await stopEverything(session);
}

/**
 * Deletes the account. Without any medical decision or payment on record,
 * everything is erased now (photos included). Otherwise the records the law
 * requires to keep stay, access stops, and the request goes to the admin.
 */
export async function deleteAccount(session: Session): Promise<"deleted" | "requested"> {
  const [kept] = await asService((q) =>
    q.query<{ n: number }>(
      `select count(*)::int as n from clinical.cases c where c.patient_id = $1
         and (c.status not in ('draft', 'stopped', 'awaiting_payment', 'canceled')
              or exists (select 1 from clinical.payments p where p.case_id = c.id and p.status in ('authorized', 'captured')))`,
      [session.userId],
    ),
  );
  await stopEverything(session);
  if (kept.n > 0) {
    await asService(async (q) => {
      await q.query("insert into clinical.deletion_requests (patient_id) values ($1)", [session.userId]);
      await q.query(
        "insert into clinical.consents (patient_id, kind, version, action) values ($1, 'gdpr_art9', $2, 'withdrawn')",
        [session.userId, CONSENT_VERSION],
      );
      for (const a of await q.query<{ id: string }>("select id from clinical.profiles where role = 'admin'"))
        await enqueue(q, a.id, "admin_alert", null);
    });
    return "requested";
  }
  const paths = await asService((q) =>
    q.query<{ storage_path: string }>(
      "select storage_path from clinical.photos p join clinical.cases c on c.id = p.case_id where c.patient_id = $1",
      [session.userId],
    ),
  );
  const storage = photoStorage();
  for (const p of paths) await storage?.remove(p.storage_path).catch(() => logEvent("storage.error"));
  const env = clinicalEnv();
  if (env.supabase) {
    const res = await fetch(`${env.supabase.url}/auth/v1/admin/users/${session.userId}`, {
      method: "DELETE",
      headers: { apikey: env.supabase.serviceKey, Authorization: `Bearer ${env.supabase.serviceKey}` },
    });
    if (!res.ok) throw new Error("auth delete failed");
  }
  // Removing the sign-in removes the profile and everything that hangs on it (cascade).
  await asService((q) => q.query("delete from clinical.profiles where id = $1", [session.userId]));
  if (!env.supabase)
    await asService((q) => q.query("delete from auth.users where id = $1", [session.userId]));
  return "deleted";
}
