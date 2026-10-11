# DPIA — Telegen clinical flow — DRAFT FOR LAWYER

GDPR art. 35 requires a DPIA before processing that is likely to be high-risk; large-scale processing of
health data (art. 9) and the ANSPDCP list (Decision 174/2018) point to one here. This draft gives the
lawyer the facts; the risk ratings are the build team's proposal.

## 1. Description

Men answer an online questionnaire about a condition (hair loss now; acne and erectile dysfunction have
education pages only). After creating an account (e-mail code) and giving four separate consents, answers
and photos are saved. They see a proposed plan and price, the card amount is authorised, a Telegen doctor
decides within 24 hours, the card is captured only on approval, a partner pharmacy delivers, and the plan
renews with periodic doctor re-review. Data flows: docs/clinical-app-architecture.md and processors.md.

## 2. Necessity and proportionality

- Questions are limited to what the doctor needs for the decision (questionnaire version stored per case).
- Photos only where the condition is visual (hair: 3, acne: 1, ED: none). re-encoded in the browser, metadata (EXIF, location) stripped again on the server.
- No answers before consent: the questionnaire runs in page memory until the account and consents exist.
- Consent per purpose, versioned, withdrawable in /cont; export and deletion request in /cont.
- Minimal data to each recipient (processors.md).

## 3. Risks and measures

| Risk                                                             | Likelihood / severity (proposal) | Measures in place                                                                                         | Residual                              |
| ---------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Unauthorised access to a patient's record by another patient     | Low / high                       | RLS on every table, tested per role (`tests/unit/rls.test.ts`)                                            | Low                                   |
| Staff account takeover                                           | Medium / high                    | Mandatory TOTP 2FA (aal2) checked in app and database; audit log                                          | Low–medium                            |
| Admin or pharmacy sees health data                               | Low / high                       | Narrow views; RLS denies answers, photos, messages                                                        | Low                                   |
| Health data leaks through URLs, logs, analytics, e-mails, Stripe | Medium / high                    | Lint wall + health-data scan before every build; e-mails carry links only; Stripe metadata limited to ids | Low                                   |
| Third-party scripts on clinical pages                            | Low / high                       | No analytics, nonce CSP with strict-dynamic, no third-party scripts                                       | Low                                   |
| Transfer outside the EU                                          | Medium / medium                  | EU regions; processors' SCCs/DPF                                                                          | To confirm per processor              |
| Wrong or unsafe prescription                                     | Low / high                       | Hard-stop screens per guideline; doctor decision required; renewal re-review                              | Clinical governance (owner + doctors) |
| Patient identity (someone else's details)                        | Medium / medium                  | Delivery name/phone; doctor can ask questions                                                             | Lawyer: is ID verification required?  |
| Over-retention                                                   | Medium / medium                  | retention.md; deletion requests tracked                                                                   | Until periods decided                 |
| Breach not detected or not notified in 72 h                      | Low / high                       | Audit log; incident-response.md                                                                           | Depends on ops readiness              |

## 4. Consultation

- DPO opinion (if appointed): pending.
- Prior consultation with ANSPDCP (art. 36) only if a high residual risk remains: lawyer to decide.

## 5. Sign-off

Lawyer: ____ Date: ____ Owner: ____ Date: ____
