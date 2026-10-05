# Open items (TEMPORARY content and unverified facts)

Everything below is visibly labelled TEMPORARY on the site or is otherwise unconfirmed.

| Item                                                                                                                   | Where                                                  | Needed from                              |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| Company identity: legal name, CUI, Reg. Com. no., registered address, contact                                          | Footer, legal pages, `siteConfig.legalName`            | Owner                                    |
| ANPC / SAL links and wording                                                                                           | Footer, Terms                                          | Owner + lawyer                           |
| Medical coordinator and clinicians: name, grade, specialty, CMR code                                                   | `src/content/clinicians.ts`, team pages, review blocks | Owner                                    |
| Medical review of every medical page (reviewer + date) — pages stay noindex until then                                 | `review` field on each doc                             | Medical reviewer                         |
| Verify every source URL and citation (network blocked during authoring; DOIs written from records, EMA URL especially) | `src/content/sources.ts`                               | Medical reviewer                         |
| Clinical standards wording (commitments on verification, protocols)                                                    | `/standarde-clinice`                                   | Medical coordinator                      |
| Prices and pricing structure (`features.pricing` stays OFF)                                                            | Pricing block, how-it-works                            | Owner                                    |
| Legal texts: terms, privacy, cookies are working drafts                                                                | Legal pages                                            | Lawyer                                   |
| Launch-notification processor (proposed: Brevo, EU) + API key, list id, DPA                                            | `src/lib/notify`                                       | Owner                                    |
| Analytics provider (none configured; consent banner appears only once one is)                                          | `NEXT_PUBLIC_ANALYTICS_PROVIDER`                       | Owner                                    |
| Sanity project id, dataset, read token (Phase 5)                                                                       | env vars                                               | Owner                                    |
| GPTBot policy (currently "unchanged": no explicit rule)                                                                | `siteConfig.crawlers.gptbot`                           | Owner                                    |
| Reference screenshots for parity (network blocked)                                                                     | `/reference`                                           | Owner: allow domains or send screenshots |
