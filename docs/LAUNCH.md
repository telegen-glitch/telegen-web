# Launch checklist (owner)

Everything here is done by the owner, from a phone browser, **only after explicitly deciding to launch**.
Until then the site stays `noindex` everywhere and no service is open. Claude never changes DNS.

The single launch switch is the Vercel environment variable `SITE_INDEXING`. The code makes the site
indexable only when `SITE_INDEXING=on` **and** Vercel reports the Production environment
(`src/lib/site.ts`). Previews are never indexable.

## 0. Before launch (must all be true)

- [ ] Company details supplied and filled in `siteConfig.company` (legal name, CUI, Reg. Com., address,
      contact email, response time) — no TEMPORARY labels left in the footer or on /contact.
- [ ] Legal texts (terms, privacy, cookies, editorial policy) reviewed by a lawyer (docs/legal-review-needed.md).
- [ ] At least one medical page per published condition reviewed (docs/REVIEW.md). Pages without a
      recorded review stay noindex even after launch, by design.
- [ ] The latest pull request is merged into `main` and the Production deployment on Vercel shows **Ready**.

## 1. Vercel environment variables (Production)

Vercel → project **telegen-web** → **Settings** → **Environment Variables**. For each row tap
**Add New**, choose **Production** only, then **Save**.

| Name                       | Value                                       | When                      |
| -------------------------- | ------------------------------------------- | ------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | `https://telegen.ro`                        | now (already the default) |
| `GOOGLE_SITE_VERIFICATION` | the code from Search Console (step 4)       | at launch                 |
| `BING_SITE_VERIFICATION`   | the code from Bing Webmaster Tools (step 4) | at launch                 |
| `SITE_INDEXING`            | `on`                                        | **the launch moment**     |

After changing variables: **Deployments** → latest Production deployment → **⋯** → **Redeploy**.

Optional, only when decided: `NOTIFY_ADAPTER=brevo` with `BREVO_API_KEY` and `BREVO_LIST_ID` (after a
signed data processing agreement with Brevo); `NEXT_PUBLIC_ANALYTICS_PROVIDER` (turns on the consent
banner; requires a provider integration first).

## 2. Connect telegen.ro (never guess DNS values)

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

## 3. Turn indexing on

Set `SITE_INDEXING=on` (Production) and redeploy (step 1). Then:

- `https://telegen.ro/robots.txt` allows crawling and lists the sitemap;
- `https://telegen.ro/sitemap.xml` lists only pages with a recorded medical review plus the
  non-medical pages.

## 4. Search Console and Bing

1. Google Search Console → **Add property** → **URL prefix** `https://telegen.ro` → method **HTML tag**
   → copy only the `content` value → set it as `GOOGLE_SITE_VERIFICATION` → redeploy → **Verify**.
2. **Sitemaps** → enter `sitemap.xml` → **Submit**.
3. Bing Webmaster Tools → **Import from Google Search Console** (or add the site with the meta-tag
   method: value into `BING_SITE_VERIFICATION`, redeploy, verify) → **Sitemaps** → submit
   `https://telegen.ro/sitemap.xml`.

## 5. Prices (only when decided)

Prices are an owner decision. In `src/lib/flags.ts` set `pricing: true`, and in `src/lib/pricing.ts`
fill the price for each condition. A condition without a price shows no pricing block, even with the
flag on. Never publish a placeholder price.

## 6. Opening a service (`serviceOpen`) — not part of the website launch

`serviceOpen` stays **OFF** for every condition until all of these exist and are signed off:

- the clinical app (app.telegen.ro) live, per docs/clinical-app-architecture.md;
- GDPR art. 9 explicit consent flow, DPIA, processor agreements (hosting, email, payments, pharmacy);
- doctors contracted, with the review process in docs/REVIEW.md;
- e-prescription and pharmacy fulfilment agreed and tested;
- lawyer sign-off on telemedicine, medicine advertising and consumer law (docs/legal-review-needed.md);
- prices published.

Then, per condition, `serviceOpen[slug] = true` in `src/lib/flags.ts` in a reviewed pull request.
