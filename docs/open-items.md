# Open items (launch values and unverified facts)

## Launch values the owner still has to supply (v4.7)

The site reads as the live service. Each value below shows on previews as an owner-only marker
"[lipsește: …]" and blocks the production build until supplied (docs/LAUNCH.md, step 0). Send them to
Claude in one message, or edit `src/lib/launch-config.ts`.

1. Legal name of the company (`company.legalName`)
2. CUI (`company.cui`)
3. Nr. Registrul Comerțului (`company.regCom`)
4. Registered address (`company.address`)
5. Public contact e-mail (`contact.email`)
6. Usual reply time, e.g. "2 zile lucrătoare" (`contact.responseTime`)
7. Price for hair loss: amount in lei with VAT, what it covers, optional note (`prices["caderea-parului"]`)
8. Price for acne (`prices["acnee"]`)
9. Price for erectile dysfunction (`prices["disfunctie-erectila"]`)
10. (v5) No separate clinical app: the flow runs in this site. Its own launch checks are in
    `src/clinical/launch.ts` (APP_LAUNCH, Supabase, Stripe live, Brevo, doctors with 2FA, pharmacy split).
11. Lawyer sign-off on the legal pages → `legalApproved: true` (docs/legal-review-needed.md, items 20–23)

Not part of the lock but still needed for indexing: a recorded medical review per page (docs/REVIEW.md).

## Unconfirmed items

| Item                                                                                                                                                                                                                                                | Where                                                                    | Needed from                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| ANPC / SAL links and wording                                                                                                                                                                                                                        | Footer, Terms                                                            | Owner + lawyer                                                            |
| Medical coordinator and clinicians: name, grade, specialty, CMR code                                                                                                                                                                                | `src/content/clinicians.ts`, team pages, review blocks                   | Owner                                                                     |
| Medical review of every medical page (reviewer + date) — pages stay noindex until then                                                                                                                                                              | `review` field on each doc                                               | Medical reviewer                                                          |
| Verify every source URL and citation (network blocked during authoring; DOIs written from records, EMA URL especially)                                                                                                                              | `src/content/sources.ts`                                                 | Medical reviewer                                                          |
| Clinical standards wording (commitments on verification, protocols)                                                                                                                                                                                 | `/standarde-clinice`                                                     | Medical coordinator                                                       |
| Launch-notification processor (Brevo, EU): "prelaunch" fallback mode only                                                                                                                                                                           | `src/lib/notify`                                                         | Owner                                                                     |
| Analytics provider (none configured; consent banner appears only once one is)                                                                                                                                                                       | `NEXT_PUBLIC_ANALYTICS_PROVIDER`                                         | Owner                                                                     |
| Sanity project id, dataset, read token (Phase 5)                                                                                                                                                                                                    | env vars                                                                 | Owner                                                                     |
| GPTBot policy (currently "unchanged": no explicit rule)                                                                                                                                                                                             | `siteConfig.crawlers.gptbot`                                             | Owner                                                                     |
| Reference screenshots for parity (network blocked)                                                                                                                                                                                                  | `/reference`                                                             | Owner: allow domains or send screenshots                                  |
| Content behind feature flags (all OFF, `src/lib/flags.ts`): press logos, ratings/review counts, reviews, doctor photos/quotes/profiles, certification badges, refund promise, social accounts                                                       | Home, team page, footer                                                  | Owner (real assets + confirmation)                                        |
| Fellos reference capture for parity measurements (network policy)                                                                                                                                                                                   | `/reference`, docs/token-map.md, docs/motion-spec.md                     | Owner: allow fellos.nl in environment network settings                    |
| **Medical reviewer, dermatology** (specialist/primar dermatovenerolog): acne hub, 4 subpages, 6 medicine pages, acne questionnaire and hard-stop texts                                                                                              | `src/content/conditions/acne.ts`, `treatments.ts`, `evaluations/acne.ts` | Owner                                                                     |
| **Medical reviewer, ED** (urologist or GP/medic de familie): ED hub, 3 subpages, sildenafil/tadalafil pages, ED questionnaire, safety screens and thresholds (e.g. "infarct/AVC în ultimele 12 luni" is a conservative screening choice to confirm) | `erectile-dysfunction.ts`, `evaluations/erectile-dysfunction.ts`         | Owner                                                                     |
| Romanian keyword research (autocomplete, PAA, SERPs)                                                                                                                                                                                                | docs/keywords-ro.md                                                      | Network access; or Semrush API units (https://www.semrush.com/mcp-access) |
| Fellos acne/ED page capture for structure                                                                                                                                                                                                           | /reference                                                               | Network access                                                            |
| Hair-loss hero photo (Pexels stock, no model release): confirm the licence covers health-topic use, or supply a photo with a model release (legal-review-needed.md #19)                                                                             | Home hero, /caderea-parului                                              | Owner + lawyer                                                            |
| Women and hair loss: men's-health positioning vs hair-loss content covering women                                                                                                                                                                   | home, hair-loss pages, docs/legal-review-needed.md §16                   | Owner                                                                     |
| Search Console / Bing verification codes                                                                                                                                                                                                            | Vercel env (docs/LAUNCH.md)                                              | Owner at launch                                                           |

## From the source pack (2026-10-07, docs/sources/conflicts-and-decisions.md)

| Item                                                                                                                                                                                                                                                                                                                                          | Where                                                           | Needed from                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------- |
| **Alpha-blocker hard stop in the ED evaluation.** EAU: no current limitation on using alpha-blockers with PDE5 inhibitors; the sildenafil SmPC still advises caution (symptomatic hypotension in a few people). The site keeps the hard stop until the reviewing doctor chooses: keep it, or change it to "medicul va evalua" without a stop. | `src/content/evaluations/erectile-dysfunction.ts`               | Reviewing doctor (ED)             |
| **Who reviews ED pages.** CLAUDE.md §7c.G asks for a urologist or GP (medic de familie). The owner confirms which of the two doctors reviews ED pages; the visible review line shows that doctor's real specialty.                                                                                                                            | `src/content/clinicians.ts`, docs/REVIEW.md                     | Owner                             |
| **Acne red-flag list.** Nodules, scarring, widespread truncal acne, pregnancy, low mood are sourced; "fever / feeling unwell" and "sudden severe adult-onset acne" come from the owner brief. Confirm the final list.                                                                                                                         | acne pages (in-person block), `src/content/evaluations/acne.ts` | Reviewing dermatologist           |
| **ED red flags from the owner brief, not the pack:** chest pain → 112 wording; severe kidney disease safety screen; "heart attack or stroke in the last 12 months" threshold (product information: 3 months for heart attack, 6 for stroke, for tadalafil). Confirm wording and thresholds.                                                   | ED pages, `src/content/evaluations/erectile-dysfunction.ts`     | Reviewing doctor (ED)             |
| **Acne audience.** Positioning is men's health, but acne guidelines include women-only options (hormonal contraceptives, spironolactone) and the acne evaluation has a pregnancy red flag. Current default: one neutral paragraph on women's options; evaluation open to adults of any sex.                                                   | `/acnee/tratament`, acne evaluation                             | Owner                             |
| **Clascoterone** (EU authorisation 21 October 2025) is not in the EuroGuiDerm algorithm yet, so it is left out of the pages. Revisit at the next guideline update.                                                                                                                                                                            | acne pages                                                      | Reviewing dermatologist           |
| **NICE NG198** could not be read (403 from every route). EuroGuiDerm 2025 is the primary acne source; NICE is not cited.                                                                                                                                                                                                                      | `src/content/sources.ts`                                        | Next session with network access  |
| **Oral antibiotic duration for acne.** NHS says 4–6 months; EuroGuiDerm 2025 limits it to 3 months (longer only as an exception). The site follows EuroGuiDerm.                                                                                                                                                                               | acne pages                                                      | Reviewing dermatologist (confirm) |
| **Romanian status not confirmed** for adapalene alone, benzoyl peroxide alone, topical tretinoin, topical clindamycin alone and lymecycline. Pages say so plainly; no `prescriptionStatus` for adapalen and benzoyl peroxide. Check nomenclator.anm.ro when reachable.                                                                        | `src/content/medicines/acne.ts`                                 | Next session with network access  |
| **Citation details to verify:** AAD 2024 volume and pages (listed, not cited); EAU edition year (cited as "accessed 7 October 2026"); DOIs of `kanti-2018`, `olsen-2002`, `kaufman-1998`, `hamilton-1951`, `norwood-1975`, `ludwig-1977` not re-checked.                                                                                      | `src/content/sources.ts`                                        | Medical reviewer                  |
| **Not covered by the pack (left out of the pages):** acne hormones and genetics as causes, hygiene myths, isotretinoin side effects other than pregnancy and mood, retinoid irritation details. Add only from a fetched source.                                                                                                               | acne pages                                                      | Next session with network access  |

## v5 P2 (proposal and payment)

- Owner: confirm that 320 lei/month (870 lei/3 months) **includes the medicines** dispensed by the
  partner pharmacy, as the proposal now says ("tratamentul pentru perioada plătită").
- Owner: how long the 199/320 first-month A/B test runs and how it is judged (it is assigned and stored
  per patient; reporting comes with the admin view in P3).
- Doctor: confirm the plan rules (finasteride only for men; a history of depression, anxiety or
  self-harm starts the proposal from minoxidil alone) and the plan texts in `src/clinical/config/plans.ts`.
- Owner: Stripe account (docs/STRIPE.md): test key and webhook for previews now; live keys at launch.

## v5 P3 (doctor)

- Owner: the flat fee per completed review (`SERVICE.doctorFeeRon`, `src/clinical/config/service.ts`).
- Owner + lawyer + pharmacy: the prescription format and how it reaches the pharmacy (today the
  structured "manual" prescription the pharmacy sees in /farmacie).
- Doctor: confirm the 24 h SLA, the 6-month renewal review and the decline reason wording.
- Owner: Brevo key and sender, `CRON_SECRET` in Vercel, and the GitHub secrets `TICK_URL` + `CRON_SECRET`
  for the 15-minute job (docs/EMAIL-AND-JOBS.md).
- Owner (in /admin, after launch set-up): create the two doctors' accounts; each sets up 2FA on first sign-in.

## v5 P4 (pharmacy)

- Owner + pharmacy: the partner pharmacy, its Stripe Connect (Express) onboarding, and the split per
  product and billing period (docs/PHARMACY.md). Production takes no real payments until it exists.
- Owner: invoicing credentials (SmartBill or Oblio) and the invoice series.
- Owner + pharmacy: courier and parcel standard (discreet packaging, no condition or medicine on the outside).

## v5 P5 (plans and data rights)

- Doctor: confirm the 6-month re-review, the check-in months (1 and 3) and the check-in questions.
- Owner + lawyer + pharmacy: how long one prescription covers refills (each paid cycle reuses the latest
  prescription until the doctor's re-review).
- Lawyer: retention periods for medical records, and what a deletion request erases (docs/legal-review-needed.md #34).

## v5 P6 (site alignment and legal drafts)

- Lawyer: sign off the v5 terms and privacy pages (docs/legal-review-needed.md #35) and the drafts in
  `docs/legal/` (#36): DPIA, art. 30 record, processors, retention, breach procedure. Open inside them:
  DPO, the doctors' role, Stripe's role, patient identity checks, prior consultation.
- Owner + lawyer: retention periods; then Claude adds the clean-up jobs (unsubmitted evaluations, e-mail
  outbox) listed in `docs/legal/retention.md`.
- Owner: sign the processors' DPAs (Supabase, Vercel, Stripe, Brevo, SmartBill/Oblio) and the pharmacy contract.
