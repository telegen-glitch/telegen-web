# Clinical architecture

> **v5 (2026-10-11): superseded in part.** The owner decided on one repo and one Vercel project: the
> clinical flow is built inside telegen.ro (`src/clinical/`, `src/app/(clinical)/`), with the
> separation enforced in code (lint walls, RLS per role, nonce CSP, health-data scan). See CLAUDE.md
> "v5 CLINICAL FLOW" and docs/STATUS.md. The sections below remain the requirements list; the
> "app.telegen.ro" hand-over in §4b no longer applies.

Status of the original proposal: design for owner and lawyer review.

## 1. What the app must do

1. Patient account (email + strong authentication), identity check where the law requires it.
2. Explicit consent for processing health data (GDPR art. 9(2)(a)), separate from terms acceptance,
   recorded with version and timestamp; withdrawable.
3. Intake: the condition questionnaire (same safety hard stops as the public preview), medication
   list, photos where clinically needed (hair loss, acne; **never** for erectile dysfunction).
4. Doctor review: queue per specialty, full intake view, messaging with the patient, decision
   (treat / ask more / refer in person), clinical note, and the doctor's name and parafă code shown
   to the patient before the consult.
5. Prescription: Romanian electronic prescription (SIPE / CNAS system) issued by the doctor, or a
   paper prescription workflow until integration is approved.
6. Pharmacy fulfilment: patient chooses a partner pharmacy; the pharmacy dispenses and delivers.
   Telegen never sells medicines itself unless licensed as a pharmacy.
7. Payment for the consultation/subscription (not for medicines unless legally structured).
8. Follow-up: scheduled check-ins, photo comparisons, side-effect reports, plan changes.
9. Audit log of every access to health data; data retention and deletion.

## 2. Architecture options

|                                       | Option A — managed EU platform                                                  | Option B — custom on EU cloud                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Stack                                 | Healthcare SaaS (EHR/telehealth white-label) with EU hosting + custom front end | Next.js app + PostgreSQL + object storage on an EU cloud region (e.g. AWS eu-central-1, Azure, Scaleway, OVHcloud) |
| Time to first patient                 | 2–4 months                                                                      | 4–8 months                                                                                                         |
| Compliance effort                     | Shared: vendor provides certifications, Telegen still runs DPIA and contracts   | Full: Telegen designs and audits everything                                                                        |
| Flexibility / UX parity with the site | Limited by vendor                                                               | Full                                                                                                               |
| Lock-in                               | High                                                                            | Low                                                                                                                |

Recommendation for a first launch: Option B only if there is an engineering team to operate it;
otherwise Option A for the clinical core, with the Telegen-styled front end.

## 3. Security and data protection (both options)

- EU-only hosting and EU-only sub-processors; data processing agreements with each.
- Encryption in transit (TLS 1.2+) and at rest; separate encryption keys for photos.
- Photos in private object storage, short-lived signed URLs, no public buckets, EXIF stripped.
- Role-based access: patient, doctor (own specialty queue), support (no clinical data), admin.
- Strong authentication for doctors (2FA mandatory); session timeouts.
- Immutable audit log (who viewed or changed which record, when).
- DPIA before launch; records of processing; breach procedure (72-hour notification).
- Retention: medical records kept for the period required by Romanian law (to confirm with the
  lawyer), then deleted; marketing data never mixed with health data.
- No health data in analytics, logs, emails or push notifications (only "you have a new message").

## 4. Integrations to confirm

| Area           | Needs                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| E-prescription | Access route for prescribing doctors to SIPE / CNAS; alternatives while pending              |
| Pharmacy       | Partner pharmacy contract, order handoff, delivery, pharmacovigilance reporting              |
| Payments       | EU payment provider (e.g. Stripe, Netopia, PayU); invoices with Romanian fiscal requirements |
| Email/SMS      | EU processor (the site already proposes Brevo for launch notifications)                      |
| Identity       | Whether ID verification is required for telemedicine prescriptions                           |

## 4b. Hand-over from telegen.ro (v4.7, decided)

The evaluation on telegen.ro ends with **Continuă către consult**. Choice: **the app collects the
medical answers again**; the site never sends them.

Why: the answers on the site are health data (GDPR art. 9). Sending them from the public site would
need explicit consent before transfer, a processor chain for the site and logging rules for the
marketing stack. Re-asking in the app keeps all health data inside the reviewed clinical system, after
consent. The site's questionnaire still does its job: safety hard stops before anyone is handed over,
and the patient sees what will be asked. `CLINICAL_APP_INTAKE_URL` is therefore **not used**.

Data contract (version 1):

|             |                                                                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Request     | `POST` to `CLINICAL_APP_URL` (https; set in Vercel), `Content-Type: application/x-www-form-urlencoded`, a top-level browser navigation (form submit) from `https://telegen.ro/evaluare`                                         |
| Fields      | `condition` = `caderea-parului` \| `acnee` \| `disfunctie-erectila`; `v` = `1`                                                                                                                                                  |
| Never sent  | health answers, age, sex, name, e-mail, anything typed on the site; nothing in the URL or query string                                                                                                                          |
| Referrer    | `Referrer-Policy: strict-origin-when-cross-origin`: the app sees only `https://telegen.ro`                                                                                                                                      |
| App must    | accept the POST without authentication, ignore unknown fields, not log the body, start (or resume) the intake for `condition`, respond with `303` to its own page; reject unknown `condition` values with a friendly start page |
| Site CSP    | `form-action` allows the origin of `CLINICAL_APP_URL` (next.config.ts)                                                                                                                                                          |
| Launch lock | a production build of the site in the "open" state fails without `CLINICAL_APP_URL` (docs/LAUNCH.md)                                                                                                                            |

The site states, in the present tense, that the app hosts data in the EU, encrypts it and asks for
explicit consent (home FAQ, /standarde-clinice, privacy policy). Those statements must be true on the
launch day.

## 5. Rough costs (order of magnitude, to verify with vendors)

| Item                              | Option A                              | Option B             |
| --------------------------------- | ------------------------------------- | -------------------- |
| Build                             | €20k–60k (front end + integration)    | €80k–200k            |
| Hosting / platform                | €500–3,000 per month (vendor licence) | €300–1,500 per month |
| Security audit + penetration test | €5k–15k                               | €10k–25k             |
| DPIA + legal                      | €5k–20k                               | €5k–20k              |

These are estimates for planning only, not quotes.

## 6. Decisions for owner + lawyer

1. Option A or B; build team.
2. Telemedicine legal basis in Romania for remote evaluation and e-prescription; required records.
3. Pharmacy model (partner pharmacy vs licensed online pharmacy) and how payment is split.
4. Consent texts, privacy notice for the app, DPIA owner.
5. Age policy (currently: adults only, every evaluation stops under 18).
6. Which conditions open first (`serviceOpen` per condition, see docs/LAUNCH.md).
