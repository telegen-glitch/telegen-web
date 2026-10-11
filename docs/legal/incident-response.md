# Personal data breach procedure — DRAFT FOR LAWYER

## Who

- Incident lead: the owner (until a DPO or security contact is named).
- Technical: whoever maintains the Vercel and Supabase projects.
- Lawyer: assesses notification duties.

## Detect

Signals: an unexpected row in `clinical.audit_log` (staff reading records outside their queue), Supabase
auth alerts, Stripe or Brevo security notices, a report from a patient, doctor or pharmacy, a leaked key.

## Contain (first hour)

1. Rotate the exposed secret: Supabase service key / JWT secret, Stripe keys, Brevo key, CRON_SECRET (Vercel → Settings → Environment Variables; redeploy).
2. Disable the affected staff account in /admin (doctor or pharmacy) or in Supabase → Authentication.
3. If the clinical app itself is affected: set `APP_LAUNCH` off in Vercel and redeploy — new evaluations stop; existing data stays.
4. Keep evidence: export the relevant audit-log rows and Vercel logs before they rotate.

## Assess (within 24 h)

Which records, which categories (health data = high risk by default), how many people, likely consequences.
Record everything in a breach register (date, facts, effects, measures) — art. 33(5), even when not notified.

## Notify

- ANSPDCP within **72 hours** of becoming aware (art. 33), via the online form on dataprotection.ro, unless the breach is unlikely to result in a risk.
- Patients without undue delay when the risk is high (art. 34): plain Romanian, what happened, what we did, what they can do, contact.
- Processors must tell Telegen without undue delay (in each DPA).
- Pharmacy partner and doctors when their data or patients are involved.

## Afterwards

Root cause, fix, a test that would have caught it, update the DPIA.
