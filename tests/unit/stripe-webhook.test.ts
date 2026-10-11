import Stripe from "stripe";
import { describe, expect, it } from "vitest";

/** The webhook accepts only events signed with the endpoint's secret (no network involved). */
process.env.STRIPE_SECRET_KEY = "sk_test_unit";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_unit_test_secret";

describe("Stripe webhook", () => {
  it("rejects unsigned or wrongly signed bodies and acknowledges signed ones", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const body = JSON.stringify({
      id: "evt_1",
      object: "event",
      type: "customer.created",
      data: { object: {} },
    });
    const post = (signature: string) =>
      POST(
        new Request("http://x/api/stripe/webhook", {
          method: "POST",
          body,
          headers: { "stripe-signature": signature },
        }),
      );
    expect((await post("")).status).toBe(400);
    expect((await post("t=1,v1=deadbeef")).status).toBe(400);
    const header = Stripe.webhooks.generateTestHeaderString({
      payload: body,
      secret: "whsec_unit_test_secret",
    });
    const ok = await post(header);
    expect(ok.status).toBe(200);
    expect(ok.headers.get("cache-control")).toContain("no-store");
  });
});
