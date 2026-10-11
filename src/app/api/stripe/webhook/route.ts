import { NextResponse } from "next/server";
import { clinicalEnv } from "@/clinical/env";
import { PRIVATE_HEADERS } from "@/clinical/http";
import { logEvent } from "@/clinical/log";
import { handleStripeEvent } from "@/clinical/payments/stripe-events";
import { stripeClient } from "@/clinical/payments/provider";

export const dynamic = "force-dynamic";

/** Stripe webhook: only signed events are processed; bodies are never logged. */
export async function POST(request: Request) {
  const env = clinicalEnv();
  if (!env.stripe?.webhookSecret) return new NextResponse(null, { status: 404, headers: PRIVATE_HEADERS });
  const stripe = stripeClient(env.stripe.secretKey);
  const body = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      request.headers.get("stripe-signature") ?? "",
      env.stripe.webhookSecret,
    );
  } catch {
    logEvent("webhook.ignored");
    return new NextResponse(null, { status: 400, headers: PRIVATE_HEADERS });
  }
  try {
    await handleStripeEvent(stripe, event);
  } catch {
    logEvent("payment.error", { event: event.id });
    return new NextResponse(null, { status: 500, headers: PRIVATE_HEADERS });
  }
  return NextResponse.json({ received: true }, { headers: PRIVATE_HEADERS });
}
