# Stripe set-up (owner, from a phone)

Stripe takes the card payment. At checkout the amount is only **reserved** (authorised) on the card.
It is **captured** only after the doctor approves; if there is no prescription the reservation is
released in full. The card page is Stripe's own (Stripe Checkout): card details never touch Telegen.
Stripe sees only "Plan Telegen", the amount and opaque ids, never the condition or a medicine.

Takes about 15 minutes in a phone browser. Start in **test mode** (no real money).

## 1. Account

1. Open **dashboard.stripe.com** → **Sign up** with the company e-mail. Country: **Romania**.
2. Keep the **Test mode** switch on (top of the dashboard) for everything below.
3. **Settings** → **Business** → **Public details**: statement descriptor `TELEGEN` (what patients
   see on their bank statement; never the condition).

## 2. Test keys into Vercel (Preview only)

1. **Developers** → **API keys** → copy the **Secret key** (starts with `sk_test_`).
2. Vercel → project **telegen-web** → **Settings** → **Environment Variables** → **Add New**, tick
   **Preview** only: `STRIPE_SECRET_KEY` = the `sk_test_…` key → **Save**.
   Previews refuse live keys and production refuses test keys, by design.

## 3. Webhook (recommended)

1. **Developers** → **Webhooks** → **Add endpoint**.
2. URL: `<preview link>/api/stripe/webhook`.
3. Events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.canceled`.
4. **Add endpoint**, then **Reveal** the **Signing secret** (`whsec_…`) and add it in Vercel as
   `STRIPE_WEBHOOK_SECRET` (Preview).
5. Redeploy the preview. Without a webhook the account page still confirms the reservation when the
   patient comes back from Stripe, so previews work either way.

If Vercel's preview protection is on, Stripe cannot reach a preview webhook; that is fine for testing.

## 4. Try it

On the preview: evaluation → plan → delivery → **Rezervă … pe card**. Use Stripe's test card
`4242 4242 4242 4242`, any future date, any CVC. In Stripe → **Payments** the payment shows
**Uncaptured**. The case appears in the doctors' queue (P3).

## At launch

Repeat steps 2–3 in **live mode** with **Production** ticked (`sk_live_…`, a live webhook on
`https://telegen.ro/api/stripe/webhook`). Stripe Connect for the pharmacy split is set up in P4
(docs/LAUNCH.md).
