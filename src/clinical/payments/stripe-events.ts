import "server-only";
import type Stripe from "stripe";
import { asService, asUser } from "../db";
import { clinicalEnv } from "../env";
import { logEvent } from "../log";
import type { Session } from "../auth";
import { enqueue } from "../email/outbox";
import { recordRenewal } from "../subscriptions";
import { markAuthorized, markCheckoutExpired } from "./flow";
import { stripeClient } from "./provider";

const captureBefore = (pi: Stripe.PaymentIntent): Date | null => {
  const charge = pi.latest_charge;
  const ts =
    charge && typeof charge === "object" ? charge.payment_method_details?.card?.capture_before : null;
  return ts ? new Date(ts * 1000) : null;
};

/** A Checkout Session reported by Stripe (webhook or return sync). */
export async function handleCheckoutSession(stripe: Stripe, session: Stripe.Checkout.Session): Promise<void> {
  if (session.status === "expired") return markCheckoutExpired(session.id);
  if (session.status !== "complete" || !session.payment_intent) return;
  const piId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
  const pi = await stripe.paymentIntents.retrieve(piId, { expand: ["latest_charge"] });
  if (pi.status !== "requires_capture") {
    logEvent("webhook.ignored", { intent: pi.id });
    return;
  }
  const customer = typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
  await markAuthorized({
    checkoutId: session.id,
    intentId: pi.id,
    captureBefore: captureBefore(pi),
    customerId: customer,
  });
}

/** Verified Stripe webhook events. Unknown events are acknowledged and ignored. */
export async function handleStripeEvent(stripe: Stripe, event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.expired":
      return handleCheckoutSession(stripe, event.data.object);
    case "invoice.paid": {
      const inv = event.data.object;
      const caseId = inv.parent?.subscription_details?.metadata?.case_id;
      if (!caseId || !inv.amount_paid) return; // the first, free "trial" invoice
      await recordRenewal({
        caseId,
        amount: inv.amount_paid / 100,
        ref: inv.id ?? event.id,
        provider: "stripe",
      });
      return;
    }
    case "invoice.payment_failed": {
      const caseId = event.data.object.parent?.subscription_details?.metadata?.case_id;
      if (!caseId) return;
      await asService(async (q) => {
        const [c] = await q.query<{ patient_id: string }>(
          "select patient_id from clinical.cases where id = $1",
          [caseId],
        );
        if (c) await enqueue(q, c.patient_id, "payment_failed", caseId);
      });
      return;
    }
    case "payment_intent.canceled":
      await asService((q) =>
        q.query(
          "update clinical.payments set status = 'canceled', canceled_at = coalesce(canceled_at, now()) where intent_id = $1 and status in ('pending', 'authorized')",
          [event.data.object.id],
        ),
      );
      return;
    default:
      logEvent("webhook.ignored", { event: event.id });
  }
}

/**
 * When the patient comes back from Stripe Checkout, the webhook may not have
 * arrived yet (or is not configured on a preview): ask Stripe directly about
 * this patient's open checkouts.
 */
export async function syncOpenCheckouts(session: Session): Promise<void> {
  const env = clinicalEnv();
  if (!env.stripe) return;
  const open = await asUser({ id: session.userId, aal: session.aal }, (q) =>
    q.query<{ checkout_id: string }>(
      "select checkout_id from clinical.payments where provider = 'stripe' and status = 'pending' and checkout_id is not null",
    ),
  );
  if (!open.length) return;
  const stripe = stripeClient(env.stripe.secretKey);
  for (const { checkout_id } of open) {
    try {
      await handleCheckoutSession(stripe, await stripe.checkout.sessions.retrieve(checkout_id));
    } catch {
      logEvent("payment.error", { checkout: checkout_id });
    }
  }
}
