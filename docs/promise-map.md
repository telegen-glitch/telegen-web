# Promise map

The service promise is written once, in `src/lib/promise.ts`, and every page that describes the service
uses it. Order: evaluare gratuită → planul propus și prețul → plătești la final, suma doar se rezervă →
medic în 24 de ore → fără rețetă, fără plată → livrare gratuită și discretă → mesaje gratuite, pauză sau
anulare oricând.

| Promise (`PROMISE_STEPS` id)                        | Public pages that show it                                                    | What makes it true in the clinical flow                                                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `evaluare` — free evaluation                        | Home step strip, How we help, /cum-functioneaza, terms, FAQ "Cât costă?"     | No payment before the proposal (`src/clinical/intake`)                                                                                                      |
| `plan` — plan and price before paying               | Home step strip, /cum-functioneaza, terms                                    | Proposal page, signed in only (`src/clinical/intake/proposal.ts`, `ui/Proposal.tsx`)                                                                        |
| `plata` — pay at the end, only authorised           | ConditionView aside, ClosingCta (`PROMISE_SHORT`), FAQ "Când plătesc?"       | Stripe `capture_method=manual` (`src/clinical/payments`); capture only in `captureFor` after approval                                                       |
| `medic` — doctor within `SLA_HOURS` (24)            | Home step strip, FAQ "Cât durează?" / "Cine este medicul meu?"               | `SERVICE.slaHours` = `SLA_HOURS`; reminders and admin escalation (`src/clinical/jobs/tick.ts`); doctor name and parafă shown on take (`doctor/workflow.ts`) |
| `fara-reteta` — no prescription, no payment         | /cum-functioneaza, terms, FAQ "Ce se întâmplă dacă medicul nu îmi prescrie?" | `decline` → `releaseFor` cancels the authorisation in full                                                                                                  |
| `livrare` — free, discreet delivery                 | /cum-functioneaza, terms, FAQ "Cum se face livrarea?"                        | Price includes delivery; packing slip has no condition or medicine on the outside (`/farmacie/[orderId]`)                                                   |
| `urmarire` — free messages, pause or cancel anytime | /cum-functioneaza, terms, FAQ "Pot anula?"                                   | Messages in /cont; `changePlan` pause/resume/cancel; 3-day renewal e-mail (`subscriptions/index.ts`)                                                        |

FAQ texts: `src/lib/promise-faqs.ts` (used on the home page and /cum-functioneaza, with FAQPage JSON-LD).
Shown only while a condition is purchasable (`src/lib/purchasable-names.ts`); with none, the pages keep the
education copy.

Enforced by: `tests/unit/promise.test.ts` (texts, SLA single source, no medicine names, no pre-launch
phrases) and `tests/e2e/promise.spec.ts` (/, /cum-functioneaza, /caderea-parului).

Rules: never a medicine name or a number other than the price config and `SLA_HOURS`; public price blocks
say "Plan pentru căderea părului"; any change to a step is a change to this file and to the flow that keeps it.
