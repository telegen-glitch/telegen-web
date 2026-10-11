import "server-only";
import { SERVICE } from "../config/service";
import { asService, type Executor } from "../db";
import { releaseFor } from "../doctor/workflow";
import { deliverPending } from "../email/send";
import { enqueue } from "../email/outbox";
import { logEvent } from "../log";
import { issuePendingInvoices } from "../pharmacy/orders";

/**
 * The scheduled job (CLAUDE.md v5): doctor reminders at 12 h and 20 h, admin
 * escalation at 24 h (scaled when SLA_HOURS changes), an admin warning before a
 * card hold lapses, expiry of undecided cases whose hold has lapsed, then the
 * e-mail queue. Safe to run as often as wanted: every event happens once.
 */
const SPECIALTIES: Record<string, string[]> = {
  "caderea-parului": ["dermatologie"],
  acnee: ["dermatologie"],
  "disfunctie-erectila": ["urologie", "medicina-de-familie"],
};

async function once(q: Executor, caseId: string, kind: string): Promise<boolean> {
  const rows = await q.query(
    "insert into clinical.sla_events (case_id, kind) values ($1, $2) on conflict do nothing returning case_id",
    [caseId, kind],
  );
  return rows.length > 0;
}

async function admins(q: Executor): Promise<string[]> {
  return (await q.query<{ id: string }>("select id from clinical.profiles where role = 'admin'")).map(
    (r) => r.id,
  );
}

export interface TickResult {
  reminders: number;
  escalations: number;
  expiring: number;
  expired: number;
  invoices: number;
  emails: { sent: number; failed: number };
}

export async function tick(now: Date = new Date()): Promise<TickResult> {
  const result: TickResult = {
    reminders: 0,
    escalations: 0,
    expiring: 0,
    expired: 0,
    invoices: 0,
    emails: { sent: 0, failed: 0 },
  };
  const scale = SERVICE.slaHours / 24;

  await asService(async (q) => {
    const open = await q.query<{
      id: string;
      condition: string;
      assigned_doctor_id: string | null;
      sla_due_at: Date;
    }>(
      `select id, condition, assigned_doctor_id, sla_due_at from clinical.cases
       where status in ('submitted', 'in_review') and sla_due_at is not null and sla_paused_at is null`,
    );
    for (const c of open) {
      const remainingH = (new Date(c.sla_due_at).getTime() - now.getTime()) / 3_600_000;
      const elapsedH = SERVICE.slaHours - remainingH;
      for (const [i, h] of SERVICE.reminderHours.entries()) {
        if (elapsedH < h * scale || !(await once(q, c.id, i === 0 ? "reminder_12h" : "reminder_20h")))
          continue;
        const doctors = c.assigned_doctor_id
          ? [c.assigned_doctor_id]
          : (
              await q.query<{ id: string }>(
                "select id from clinical.doctors where active and specialty = any($1::text[])",
                [SPECIALTIES[c.condition] ?? []],
              )
            ).map((r) => r.id);
        for (const d of doctors) await enqueue(q, d, "doctor_reminder", c.id);
        result.reminders += 1;
        logEvent("sla.reminder", { case: c.id });
      }
      if (remainingH <= 0 && (await once(q, c.id, "escalated_24h"))) {
        for (const a of await admins(q)) await enqueue(q, a, "admin_alert", c.id);
        result.escalations += 1;
        logEvent("sla.escalated", { case: c.id });
      }
    }

    const holds = await q.query<{ case_id: string; capture_before: Date }>(
      `select p.case_id, p.capture_before from clinical.payments p join clinical.cases c on c.id = p.case_id
       where p.status = 'authorized' and p.capture_before is not null
         and c.status in ('submitted', 'in_review', 'waiting_patient', 'adjusted')`,
    );
    for (const h of holds) {
      const left = new Date(h.capture_before).getTime() - now.getTime();
      if (left <= 0) {
        await q.query("update clinical.cases set status = 'expired', sla_paused_at = null where id = $1", [
          h.case_id,
        ]);
        const [k] = await q.query<{ patient_id: string }>(
          "select patient_id from clinical.cases where id = $1",
          [h.case_id],
        );
        await enqueue(q, k.patient_id, "case_expired", h.case_id);
        result.expired += 1;
      } else if (
        left <= SERVICE.authorizationWarningDays * 86_400_000 &&
        (await once(q, h.case_id, "authorization_expiring"))
      ) {
        for (const a of await admins(q)) await enqueue(q, a, "admin_alert", h.case_id);
        result.expiring += 1;
      }
    }
  });

  // Release the holds of cases that just expired (outside the transaction: it calls the card provider).
  const expired = await asService((q) =>
    q.query<{ case_id: string }>(
      "select distinct p.case_id from clinical.payments p join clinical.cases c on c.id = p.case_id where c.status = 'expired' and p.status = 'authorized'",
    ),
  );
  for (const e of expired) await releaseFor(e.case_id);

  result.invoices = await issuePendingInvoices();
  result.emails = await deliverPending(50);
  return result;
}
