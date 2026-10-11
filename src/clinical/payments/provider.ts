import "server-only";
import Stripe from "stripe";
import { clinicalEnv } from "../env";
import { STATEMENT_DESCRIPTOR, stripeMetadata } from "./metadata";

/**
 * Card payments (CLAUDE.md v5): the amount is only authorised at checkout and
 * captured after the doctor approves; when there is no prescription the
 * authorisation is released in full. Stripe Checkout (hosted by Stripe) is used,
 * so no payment script runs on Telegen's pages. Only opaque ids travel to
 * Stripe: never a condition, a medicine or an answer. Locally (never on Vercel)
 * a fake provider stands in.
 */
export interface StartInput {
  caseId: string;
  paymentId: string;
  amount: number;
  email: string;
  customerId: string | null;
  returnUrl: string;
}

export interface StartResult {
  checkoutId: string;
  /** Where to send the browser: Stripe Checkout, or null for the fake provider. */
  redirectUrl: string | null;
  customerId: string | null;
}

export interface PaymentProvider {
  readonly kind: "stripe" | "fake";
  startAuthorization(input: StartInput): Promise<StartResult>;
  /** Abandons an unpaid checkout so it can no longer authorise anything. */
  expireCheckout(checkoutId: string): Promise<void>;
  capture(intentId: string, amount: number): Promise<void>;
  cancel(intentId: string): Promise<void>;
}

/** Lei to the smallest unit Stripe expects (bani). */
export const toMinor = (lei: number) => Math.round(lei * 100);

/** The only product name Stripe, the card statement and the receipt ever see. */
export const PRODUCT_NAME = "Plan Telegen";

export function stripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { appInfo: { name: "telegen-web" } });
}

function stripeProvider(secretKey: string): PaymentProvider {
  const stripe = stripeClient(secretKey);
  return {
    kind: "stripe",
    async startAuthorization(input) {
      let customerId = input.customerId;
      if (!customerId) customerId = (await stripe.customers.create({ email: input.email })).id;
      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          customer: customerId,
          locale: "ro",
          payment_method_types: ["card"],
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: "ron",
                unit_amount: toMinor(input.amount),
                product_data: { name: PRODUCT_NAME },
              },
            },
          ],
          payment_intent_data: {
            capture_method: "manual",
            setup_future_usage: "off_session",
            statement_descriptor_suffix: STATEMENT_DESCRIPTOR,
            metadata: stripeMetadata({ caseId: input.caseId, purpose: "first_order" }),
          },
          metadata: stripeMetadata({ caseId: input.caseId, purpose: "first_order" }),
          client_reference_id: input.paymentId,
          success_url: input.returnUrl,
          cancel_url: input.returnUrl,
        },
        { idempotencyKey: `checkout-${input.paymentId}` },
      );
      return { checkoutId: session.id, redirectUrl: session.url, customerId };
    },
    async expireCheckout(checkoutId) {
      try {
        await stripe.checkout.sessions.expire(checkoutId);
      } catch {
        // Already completed or expired.
      }
    },
    async capture(intentId, amount) {
      await stripe.paymentIntents.capture(
        intentId,
        { amount_to_capture: toMinor(amount) },
        { idempotencyKey: `capture-${intentId}` },
      );
    },
    async cancel(intentId) {
      await stripe.paymentIntents.cancel(intentId, {}, { idempotencyKey: `cancel-${intentId}` });
    },
  };
}

function fakeProvider(): PaymentProvider {
  return {
    kind: "fake",
    async startAuthorization(input) {
      return {
        checkoutId: `fake_cs_${input.paymentId.replace(/-/g, "")}`,
        redirectUrl: null,
        customerId: input.customerId,
      };
    },
    async expireCheckout() {},
    async capture() {},
    async cancel() {},
  };
}

export function paymentProvider(): PaymentProvider | null {
  const env = clinicalEnv();
  if (env.stripe) return stripeProvider(env.stripe.secretKey);
  if (env.localDrivers) return fakeProvider();
  return null;
}
