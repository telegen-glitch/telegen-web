# Launch checklist (owner)

Everything here is done by the owner, from a phone browser, **only after explicitly deciding to launch**.
Until then the site stays `noindex` everywhere and no service is open. Claude never changes DNS.

The single launch switch is the Vercel environment variable `SITE_INDEXING`. The code makes the site
indexable only when `SITE_INDEXING=on` **and** Vercel reports the Production environment
(`src/lib/site.ts`). Previews are never indexable.

## 0. The launch lock (v4.7)

The site is built in the **open** launch state: previews already read as the live service, with no
"not open yet" wording anywhere. Nothing is invented to get there. Every value the owner has not
supplied yet:

- shows on previews as a small dashed marker **[lipsește: …]** where it belongs (never in production);
- **stops the production build**. Before every build, `scripts/launch-lock.ts` checks the values below.
  On Vercel Production it fails the build and lists exactly what is missing. Previews never fail on it.

| Value                                                                                                           | Where it goes                                                                   |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Legal name of the company                                                                                       | `src/lib/launch-config.ts` → `company.legalName`                                |
| CUI                                                                                                             | `company.cui`                                                                   |
| Nr. Registrul Comerțului                                                                                        | `company.regCom`                                                                |
| Registered address                                                                                              | `company.address`                                                               |
| Public contact e-mail                                                                                           | `contact.email`                                                                 |
| Usual reply time (e.g. "2 zile lucrătoare")                                                                     | `contact.responseTime`                                                          |
| A price for each published condition (amount in lei with VAT, what it covers, optional note; no medicine names) | `prices["caderea-parului"]`, `prices["acnee"]`, `prices["disfunctie-erectila"]` |
| Address of the clinical app (https)                                                                             | Vercel variable `CLINICAL_APP_URL`                                              |
| The lawyer has signed off the legal pages                                                                       | `legalApproved: true`                                                           |

**The easiest way from a phone:** send Claude one message with the values, for example:

> Denumire: …, CUI: …, Reg. Com.: …, Sediu: …, e-mail: …, răspundem în: …, preț căderea părului: … lei
> (ce include), preț acnee: …, preț disfuncție erectilă: …, juristul a aprobat: da/nu

Claude fills `src/lib/launch-config.ts` in a pull request and reports the new preview. (Editing the file
yourself on github.com also works: open the file, tap the pencil, change the values, **Commit changes**
to the working branch, never to `main`.)

`CLINICAL_APP_URL` is set in Vercel (step 1), not in the code. It is the page of the clinical app that
receives the hand-over from the evaluation (the contract is in docs/clinical-app-architecture.md,
"Hand-over from telegen.ro").

## 0b. Before launch (must all be true)

- [ ] **The patient app exists and works** at `CLINICAL_APP_URL`: accounts, explicit GDPR art. 9
      consent, the medical questions, the doctor's review, payment, EU hosting and encryption, as the
      site now states (docs/clinical-app-architecture.md). The site hands every evaluation over to it, so
      the website must not go live without it.
- [ ] Every value in the table above is supplied; `pnpm launch:check` (run by Claude) lists nothing.
- [ ] The lawyer has signed off terms, privacy, cookies and the editorial policy
      (docs/legal-review-needed.md, items marked REQUIRES LAWYER SIGN-OFF); then `legalApproved: true`.
- [ ] At least one medical page per published condition reviewed (docs/REVIEW.md). Pages without a
      recorded review stay noindex even after launch, by design.
- [ ] The latest pull request is merged into `main` and the Production deployment on Vercel shows **Ready**.

## 1. Vercel environment variables (Production)

Vercel → project **telegen-web** → **Settings** → **Environment Variables**. For each row tap
**Add New**, choose **Production** only, then **Save**.

| Name                       | Value                                                  | When                                          |
| -------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | `https://telegen.ro`                                   | now (already the default)                     |
| `CLINICAL_APP_URL`         | the https address of the clinical app's hand-over page | when the app is live (Production and Preview) |
| `GOOGLE_SITE_VERIFICATION` | the code from Search Console (step 4)                  | at launch                                     |
| `BING_SITE_VERIFICATION`   | the code from Bing Webmaster Tools (step 4)            | at launch                                     |
| `SITE_INDEXING`            | `on`                                                   | **the launch moment**                         |

After changing variables: **Deployments** → latest Production deployment → **⋯** → **Redeploy**.

Optional, only when decided: `NEXT_PUBLIC_ANALYTICS_PROVIDER` (turns on the consent banner; requires
a provider integration first). `NOTIFY_ADAPTER=brevo` (with `BREVO_API_KEY`, `BREVO_LIST_ID` and a signed
data processing agreement) is used only in the "prelaunch" fallback mode.

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

## 5. Prices

Prices come only from `src/lib/launch-config.ts` (see step 0). They appear in the "Cât costă?" answer
on the home page and on /cum-functioneaza. The separate pricing block on condition pages stays behind
the `pricing` flag in `src/lib/flags.ts` (off). Never publish a placeholder price.

## 6. The service switch and the "prelaunch" fallback

`siteConfig.launchState` (`src/lib/site.ts`) is `"open"`, and with it `serviceOpen` is on for every
condition: the evaluation ends with **Continuă către consult**, which hands over to the clinical app.
`"prelaunch"` is kept only as a fallback mode: it brings back the pre-launch notices, the "not open yet"
screen and the notification form, and closes every condition. Switching modes is a one-line change by
Claude in a reviewed pull request.
