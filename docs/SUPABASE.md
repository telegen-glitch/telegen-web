# Supabase set-up (owner, from a phone)

Supabase holds the clinical data: accounts, evaluations, photos, plans, messages.
It must be in the **EU (Frankfurt)**. Make two projects: **telegen-test** now (for
previews, with TEST data) and **telegen-live** only at launch (for real patients).

Everything below works in a phone browser. Takes about 15 minutes.

## 1. Create the test project

1. Open **supabase.com** → **Sign in** (with GitHub is easiest).
2. Tap **New project**.
3. Name: `telegen-test`.
4. Database password: tap **Generate a password**, then save it in your password manager.
5. Region: **Central EU (Frankfurt)**. This matters: no other region.
6. Plan: **Free** is enough for testing.
7. Tap **Create new project** and wait until it says it is ready (1–2 minutes).

## 2. Turn on e-mail codes and two-factor sign-in

1. In the project: **Authentication** → **Sign In / Providers** → **Email**: make sure it is **enabled**.
2. **Authentication** → **Emails** → **Magic Link** template: replace the body with
   `Codul tău Telegen: {{ .Token }}` and tap **Save**. (Patients sign in with a 6-digit code.)
3. **Authentication** → **Multi-Factor** → **TOTP (authenticator app)**: **enabled**. Doctors and
   admins must use it.
4. **Authentication** → **URL Configuration** → **Site URL**: paste the preview link Claude gave you.

## 3. Copy four values

1. **Project Settings** → **API Keys** (or **API**): copy
   - the **Project URL** (starts with `https://` and ends with `.supabase.co`);
   - the **anon / publishable** key;
   - the **service_role / secret** key (secret: never share it in a chat or screenshot).
2. Tap **Connect** (top of the project page) → **Connection string** → **Transaction pooler**
   (port 6543) → copy the URI and replace `[YOUR-PASSWORD]` with the database password from step 1.

## 4. Put them into Vercel (not into a chat)

Vercel → project **telegen-web** → **Settings** → **Environment Variables**. For each row tap
**Add New**, tick **Preview** only, paste, **Save**:

| Name                        | Value                                    |
| --------------------------- | ---------------------------------------- |
| `SUPABASE_URL`              | the Project URL                          |
| `SUPABASE_ANON_KEY`         | the anon / publishable key               |
| `SUPABASE_SERVICE_ROLE_KEY` | the service_role / secret key            |
| `DATABASE_URL`              | the Transaction pooler URI with password |
| `ADMIN_EMAILS`              | your e-mail address (becomes the admin)  |

Then **Deployments** → the latest preview → **⋯** → **Redeploy**. The build creates all tables
by itself (`scripts/db-migrate.ts`); nothing has to be pasted into Supabase.

## 5. Check

Open `<preview link>/api/health` on your phone. It should show `"database": "ok"` and a number of
clinical tables. Send Claude a screenshot of that page (it contains no secrets).

## At launch (later)

Repeat steps 1–4 with a project named `telegen-live` (Region Frankfurt, a paid plan with backups),
ticking **Production** instead of Preview. Production refuses real patients until `APP_LAUNCH=on`
and the launch checks pass (docs/LAUNCH.md).
