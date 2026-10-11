import "server-only";
import { SERVICE } from "../config/service";
import { asService } from "../db";
import { enqueue } from "../email/outbox";
import { logEvent } from "../log";
import { paymentProvider } from "./provider";

/**
 * What happens once the card is authorised (Stripe webhook, return sync or the
 * local fake provider): the case goes to the doctors' queue with its SLA.
 * Anything that does not match the case's current checkout is released at once,
 * so a patient is never left with two holds on the card.
 */
export async function markAuthorized(input: {
  checkoutId: string;
  intentId: string;
  captureBefore: Date | null;
  customerId?: string | null;
}): Promise<"submitted" | "duplicate" | "released"> {
  const outcome = await asService(async (q) => {
    const [pay] = await q.query<{
      id: string;
      case_id: string;
      status: string;
      case_status: string;
      patient_id: string;
    }>(
      `select p.id, p.case_id, p.status, c.status as case_status, c.patient_id
       from clinical.payments p join clinical.cases c on c.id = p.case_id
       where p.checkout_id = $1 for update of p`,
      [input.checkoutId],
    );
    if (!pay) return "released" as const;
    if (pay.status === "authorized" && pay.case_status !== "awaiting_payment") return "duplicate" as const;
    const [latest] = await q.query<{ id: string }>(
      "select id from clinical.payments where case_id = $1 order by created_at desc limit 1",
      [pay.case_id],
    );
    if (pay.status !== "pending" || pay.case_status !== "awaiting_payment" || latest?.id !== pay.id) {
      await q.query(
        "update clinical.payments set status = 'canceled', intent_id = $2, canceled_at = now() where id = $1",
        [pay.id, input.intentId],
      );
      return "released" as const;
    }
    const expires = input.captureBefore ?? new Date(Date.now() + 7 * 24 * 3600 * 1000);
    await q.query(
      `update clinical.payments set status = 'authorized', intent_id = $2, authorized_at = now(),
         capture_before = $3, expires_at = $3 where id = $1`,
      [pay.id, input.intentId, expires],
    );
    await q.query(
      `update clinical.cases set status = 'submitted', submitted_at = now(),
         sla_due_at = now() + make_interval(hours => $2::int) where id = $1`,
      [pay.case_id, SERVICE.slaHours],
    );
    if (input.customerId)
      await q.query(
        "update clinical.patients set stripe_customer_id = $2 where id = $1 and stripe_customer_id is null",
        [pay.patient_id, input.customerId],
      );
    await enqueue(q, pay.patient_id, "case_received", pay.case_id);
    logEvent("payment.authorized", { case: pay.case_id, payment: pay.id });
    logEvent("case.submitted", { case: pay.case_id });
    return "submitted" as const;
  });
  if (outcome === "released") {
    await paymentProvider()
      ?.cancel(input.intentId)
      .catch(() => logEvent("payment.error", { intent: input.intentId }));
    logEvent("payment.canceled", { intent: input.intentId });
  }
  return outcome;
}

/** A checkout that was never completed. */
export async function markCheckoutExpired(checkoutId: string): Promise<void> {
  await asService((q) =>
    q.query("update clinical.payments set status = 'expired' where checkout_id = $1 and status = 'pending'", [
      checkoutId,
    ]),
  );
}
