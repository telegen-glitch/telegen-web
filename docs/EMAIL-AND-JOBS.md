# E-mails and the scheduled job (owner, from a phone)

## E-mails (Brevo, EU)

Telegen's e-mails never contain health data: they say something changed and link to the account.
Without Brevo they wait in the outbox (nothing is lost; they are sent once Brevo is set).

1. **brevo.com** → sign up with the company e-mail.
2. **Senders, Domains & Dedicated IPs** → **Domains** → add `telegen.ro`. Brevo shows DNS records
   (DKIM, DMARC): **send them to Claude as a screenshot**; they are added only with your approval,
   never touching the existing e-mail records.
3. **Senders** → add `no-reply@telegen.ro`.
4. **SMTP & API** → **API Keys** → **Generate a new API key** → copy it.
5. Vercel → **Settings** → **Environment Variables** (Preview, and Production at launch):
   `BREVO_API_KEY` = the key, `EMAIL_SENDER` = `no-reply@telegen.ro`.
6. Supabase sign-in codes: Supabase → **Authentication** → **Emails** → **SMTP Settings** → use the
   SMTP login from Brevo → **SMTP & API** → **SMTP** (docs/SUPABASE.md).

## Scheduled job (reminders, escalation, card holds)

The job reminds doctors at 12 h and 20 h, alerts admins at 24 h and before a card hold lapses, closes
cases whose hold lapsed (the hold is released in full) and sends queued e-mails.

1. Make a long random secret: on the phone, a password manager's "generate password" (40+ characters).
2. Vercel → **Environment Variables** (Production): `CRON_SECRET` = that secret. Vercel then runs the
   job once a day by itself (the Hobby plan allows no more).
3. For every 15 minutes: GitHub → repository **telegen-web** → **Settings** → **Secrets and variables**
   → **Actions** → **New repository secret**: `TICK_URL` = `https://telegen.ro/api/cron/tick`, and
   `CRON_SECRET` = the same secret. The workflow `clinical-tick` then calls the job every 15 minutes.
