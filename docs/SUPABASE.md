# Supabase set-up (owner, from a phone)

Supabase holds the clinical data: accounts, evaluations, photos, plans, messages. Your project is in
the **EU (Frankfurt)** and is used for **previews** (test mode, TEST data). A second project for real
patients comes only at launch (end of this page).

Preview link (branch `claude/hero-realistic`): https://telegen-web-git-claude-hero-realistic-telegem.vercel.app

## 1. Create the tables (once, and again after Claude adds a migration)

Pick **one** way:

- **Your Claude chat with the Supabase connector:** send it this message:

  > Apply every SQL file in `supabase/migrations` of the GitHub repo telegen-glitch/telegen-web
  > (branch claude/hero-realistic), in name order, to my Telegen project with apply_migration. Skip a
  > file if `clinical_meta.migrations` already lists it. Then run the verification query at the end
  > of `docs/supabase-setup.sql` and show me the result.

- **Or paste it yourself:** open
  https://github.com/telegen-glitch/telegen-web/blob/claude/hero-realistic/docs/supabase-setup.sql
  → tap the **Copy raw file** icon (two squares, top right of the file; on a narrow screen it is
  under **⋯**). Then Supabase → your project → **SQL Editor** → **New query** → long-press → **Paste**
  → **Run**. If it asks to confirm a "destructive operation", tap **Run this query**: nothing is
  deleted, the block only creates what is missing.

The result is a table. Every `table` row must say **RLS on**, the `bucket` row **private**, and there
are 7 `migration` rows. Running it twice is safe: what exists is skipped.

Optional, previews only: `supabase/seed-preview.sql` adds a "Farmacie TEST (preview)" pharmacy. Never
run it on the live project.

## 2. Authentication settings (by hand, once)

In Supabase → your project → **Authentication**:

**a. Six-digit code instead of a link**

1. **Sign In / Providers** → **Email**: **Enable Email provider** on; **Email OTP Length** = `6`;
   **Save**.
2. **Emails** (under Notifications) → **Templates** → **Magic Link**:
   - Subject: `Codul tău Telegen`
   - Body (replace everything, tap **Source** first if you see a formatted editor):
     `<p>Codul tău Telegen: <strong>{{ .Token }}</strong></p><p>Codul este valabil câteva minute. Dacă nu l-ai cerut tu, ignoră acest e-mail.</p>`
   - **Save changes**.
3. Same template → **Confirm signup** (a new patient's first code uses it): same subject and body,
   **Save changes**. Neither e-mail may contain a link (`{{ .ConfirmationURL }}`) or anything about
   health.

**b. Site URL and redirect URLs**

1. **URL Configuration** → **Site URL**:
   `https://telegen-web-git-claude-hero-realistic-telegem.vercel.app` → **Save changes**.
   (At launch change it to `https://telegen.ro`.)
2. **Redirect URLs** → **Add URL**, one at a time, then **Save URLs**:
   - `https://telegen-web-git-claude-hero-realistic-telegem.vercel.app/**`
   - `https://*-telegem.vercel.app/**`
   - `https://telegen.ro/**`

**c. Two-factor sign-in for doctors, pharmacies and admins**

**Multi-Factor** → **TOTP (App Authenticator)** → **Enabled** → **Save**.

**d. Custom SMTP through Brevo (before any real user)**

Supabase's own sender allows only a few e-mails per hour and is meant for testing. Before real users:

1. Brevo → your account → **SMTP & API** → **SMTP** tab → **Generate a new SMTP key** → copy the
   **Login** and the **SMTP key** (do not paste them into a chat).
2. Supabase → **Authentication** → **Emails** → **SMTP Settings** → **Enable Custom SMTP** on:
   - Sender email: `no-reply@telegen.ro` · Sender name: `Telegen`
   - Host: `smtp-relay.brevo.com` · Port: `587`
   - Username: the Brevo **Login** · Password: the Brevo **SMTP key**
   - **Save changes**.
3. Brevo must be allowed to send for telegen.ro: Brevo → **Senders, Domains & Dedicated IPs** →
   **Domains** → add `telegen.ro` → it shows DNS records to add. That is a DNS change: only you
   decide it, and only those records (it does not touch the website or existing e-mail records).

Until a Brevo key exists, previews use Supabase's built-in sender (a few codes per hour).

## 3. Variables in Vercel (not in a chat)

Supabase → **Project Settings** → **API Keys**: copy the **Publishable key** (`sb_publishable_…`) and,
under **Secret keys**, tap the eye/copy icon of the default key (`sb_secret_…`). The **Project URL**
is in **Project Settings** → **Data API** (`https://….supabase.co`). The database string: **Connect**
(top of the project) → **Connection String** → **Transaction pooler** (port 6543) → copy, and replace
`[YOUR-PASSWORD]` with the database password (forgotten? **Project Settings** → **Database** →
**Reset database password**).

Vercel → project **telegen-web** → **Settings** → **Environment Variables** → **Add New**, tick
**Preview** only, **Save**, once per row:

| Name                       | Value                                        |
| -------------------------- | -------------------------------------------- |
| `SUPABASE_URL`             | the Project URL                              |
| `SUPABASE_PUBLISHABLE_KEY` | the publishable key `sb_publishable_…`       |
| `SUPABASE_SECRET_KEY`      | the secret key `sb_secret_…`                 |
| `DATABASE_URL`             | the Transaction pooler string, with password |
| `ADMIN_EMAILS`             | your e-mail address (becomes the admin)      |

The older names (`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
`POSTGRES_URL`) also work, so the Vercel–Supabase integration's variables are fine too. Never give the
secret key a name starting with `NEXT_PUBLIC_`: the site refuses it.

Why `DATABASE_URL` is needed: the clinical tables live in a private schema that Supabase's web API does
not expose, so the server reaches them only over Postgres, always as the signed-in person's role.

Then **Deployments** → the newest **Preview** of `claude/hero-realistic` → **⋯** → **Redeploy** →
**Redeploy**.

## 4. Check

Open `https://telegen-web-git-claude-hero-realistic-telegem.vercel.app/api/health`. Expected:
`"database": "ok"`, `"missingMigrations": []`, `"photoBucket": "private"`,
`"auth": "supabase (publishable key)"`, and `"problems": []`. The page contains no data and no
keys; a screenshot to Claude is fine.

Then try `/evaluare` → **Căderea părului**: at the end it asks for your e-mail and sends a 6-digit code.

## At launch (later)

A second project `telegen-live` (Frankfurt, a paid plan with backups): §1 and §2 again (Site URL
`https://telegen.ro`), §3 with **Production** ticked instead of Preview. Production refuses real
patients until `APP_LAUNCH=on` and the launch checks pass (docs/LAUNCH.md).
