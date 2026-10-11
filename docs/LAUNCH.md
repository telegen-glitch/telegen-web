# Launch checklist (owner)

Everything here is done by the owner from a phone browser, **only after explicitly deciding to launch**.
Claude never changes DNS and never turns indexing on.

There are **two separate switches**, both Vercel environment variables, both off today:

| Switch             | What it does                                                                                                                                                                                                                                         | Code                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `APP_LAUNCH=on`    | The clinical flow takes **real patients** (real accounts, live card payments, real doctors and pharmacy). Without it, production shows the education pages only; previews run the whole flow in **test mode** (Stripe test cards, data marked TEST). | `src/lib/purchasable.ts`, `src/clinical/launch.ts` |
| `SITE_INDEXING=on` | Search engines may index the site (only on Vercel Production). Medical pages stay noindex until a doctor's review is recorded.                                                                                                                       | `src/lib/site.ts`, `src/lib/indexing.ts`           |

Order: finish §0 → §1 → §2 (real patients) → §3–§5 (domain, indexing, search engines). `/api/health`
shows at any time what is configured (no data, no secrets).

## 0. Values only the owner can give

Send Claude one message with them; Claude puts them in a pull request. Nothing is ever invented: a
missing value shows **[lipsește: …]** on previews and **stops the production build**
(`scripts/launch-lock.ts`).

- **Company:** legal name, CUI, Reg. Com. number, registered address, public contact e-mail, usual reply time → `src/lib/launch-config.ts`.
- **Prices:** hair loss is set (320 lei/month, 199 lei first month for half of new patients as an A/B test, 870 lei for 3 months). Confirm that 320 includes the medicines and how long the A/B test runs. Acne and ED have no price, so they cannot be started (education pages only).
- **Pharmacy split:** for each product, how much of each payment goes to the pharmacy → `PHARMACY_SPLIT` in `src/clinical/config/pharmacy.ts` (docs/PHARMACY.md).
- **Doctor fee** per review → `SERVICE.doctorFeeRon` in `src/clinical/config/service.ts`.
- **Clinical settings to confirm with the doctors:** decision within 24 h, re-review every 6 months, check-ins at month 1 and 3 and their questions (`src/clinical/config/checkins.ts`), the prescription format with the pharmacy.
- **Lawyer:** sign-off of the terms, privacy, cookies, editorial policy and the drafts in `docs/legal/` (docs/legal-review-needed.md #25–#36) → `legalApproved: true`.

## 1. Accounts to create (phone steps in each guide)

| Service                                                                                                                                                                                             | Guide                  | Gives you                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Supabase in **Frankfurt (eu-central-1)**: the preview project exists; a second one for production at launch. Tables: paste `docs/supabase-setup.sql` or ask your Claude chat; Auth settings by hand | docs/SUPABASE.md       | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`), `SUPABASE_SECRET_KEY` (`sb_secret_…`), `DATABASE_URL` (Transaction pooler). Older names also work |
| Stripe (test keys now, live keys at launch) and the webhook                                                                                                                                         | docs/STRIPE.md         | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`                                                                                                                       |
| Stripe Connect for the partner pharmacy                                                                                                                                                             | docs/PHARMACY.md       | the pharmacy's connected account                                                                                                                                   |
| Brevo, with a verified sender on telegen.ro                                                                                                                                                         | docs/EMAIL-AND-JOBS.md | `BREVO_API_KEY`, `EMAIL_SENDER`                                                                                                                                    |
| SmartBill **or** Oblio                                                                                                                                                                              | docs/PHARMACY.md       | `SMARTBILL_EMAIL` + `SMARTBILL_TOKEN` or `OBLIO_EMAIL` + `OBLIO_SECRET`, plus `INVOICE_CIF`, `INVOICE_SERIES`                                                      |
| A random secret for scheduled jobs                                                                                                                                                                  | docs/EMAIL-AND-JOBS.md | `CRON_SECRET` (also as GitHub secrets `CRON_SECRET` and `TICK_URL`)                                                                                                |
| Admin e-mails                                                                                                                                                                                       | —                      | `ADMIN_EMAILS` (comma-separated)                                                                                                                                   |

Vercel → project **telegen-web** → **Settings** → **Environment Variables** → **Add New**. Preview
values (Supabase preview project, Stripe **test** keys) go under **Preview**; live values under
**Production** only. Then **Deployments** → latest → **⋯** → **Redeploy**. Pasting keys to Claude is not
needed: Claude only needs to hear "done".

## 2. Real patients (`APP_LAUNCH=on`)

All must be true first; production refuses real patients otherwise and `/api/health` lists what is missing:

- [ ] §0 values supplied and the lawyer's sign-off recorded (`legalApproved: true`).
- [ ] Production env vars from §1 set, with Stripe **live** keys (`sk_live_…`) and the live webhook.
- [ ] A partner pharmacy is active in **/admin** with its Stripe Connect account; the split is set.
- [ ] At least one dermatologist account is created in **/admin**, has signed in and set up two-factor
      sign-in. The doctor's name and parafă code are typed in /admin only (they live in the database,
      never in the repo).
- [ ] A full test case was run on the **preview** with a test card: evaluation → plan → card reserved →
      doctor approves → card captured → pharmacy marks shipped → patient sees the AWB; and once with a
      decline (reservation released).
- [ ] The latest pull request is merged into `main`, and Production shows **Ready**.

Then add `APP_LAUNCH` = `on` (Production) and redeploy. To stop taking new patients at any time, delete
the variable and redeploy: existing data and accounts stay.

## 3. Connect telegen.ro (never guess DNS values)

1. Vercel → **telegen-web** → **Settings** → **Domains** → **Add** → type `telegen.ro` → **Add**.
   Add `www.telegen.ro` too and set it to **redirect** to `telegen.ro` (one canonical host).
2. Vercel now shows the exact DNS records to create (type, name, value). **Copy them exactly from
   that screen.** Do not use values from any guide, including this one.
3. Before changing anything at your DNS provider, take screenshots of **all** current DNS records
   (needed for rollback).
4. At your DNS provider, add or change **only** the records Vercel showed for `@`/`telegen.ro` and `www`.
   **Do not touch** MX, SPF (TXT `v=spf1…`), DKIM, DMARC or any other email record.
5. Wait until Vercel shows **Valid Configuration** for both domains (minutes to a few hours).
6. Claude then checks: HTTPS on both hosts, `www` → apex 301, canonical tags, `/sitemap.xml`,
   `/robots.txt`. Send Claude a message to run these checks.

Rollback: put the old records back exactly as in the screenshots from step 3.

## 4. Turn indexing on

Set `SITE_INDEXING=on` (Production) and redeploy (as in §1). Then:

- `https://telegen.ro/robots.txt` allows crawling and lists the sitemap;
- `https://telegen.ro/sitemap.xml` lists only pages with a recorded medical review plus the
  non-medical pages.

## 5. Search Console and Bing

1. Google Search Console → **Add property** → **URL prefix** `https://telegen.ro` → method **HTML tag**
   → copy only the `content` value → set it as `GOOGLE_SITE_VERIFICATION` (Production) → redeploy → **Verify**.
2. **Sitemaps** → enter `sitemap.xml` → **Submit**.
3. Bing Webmaster Tools → **Import from Google Search Console** (or add the site with the meta-tag
   method: value into `BING_SITE_VERIFICATION`, redeploy, verify) → **Sitemaps** → submit
   `https://telegen.ro/sitemap.xml`.

## 6. After launch

- Medical pages become indexable one by one as reviews are recorded (docs/REVIEW.md).
- Keep the scheduled job running (`/api/cron/tick` every 15 minutes from GitHub Actions): it sends the
  doctor reminders, the 24-hour escalation, renewal notices and check-ins.
- The breach procedure is in docs/legal/incident-response.md.

## Fallback: "prelaunch" mode

`siteConfig.launchState` (`src/lib/site.ts`) is `"open"`. `"prelaunch"` is kept only as a fallback: it
brings back the pre-launch notices and closes every condition. Switching is a one-line change by Claude
in a reviewed pull request.
