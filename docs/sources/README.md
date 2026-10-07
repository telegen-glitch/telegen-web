# Source pack (fetched 2026-10-07)

The build environment cannot reach external websites (every host returns 403 /
EGRESS_BLOCKED). These files hold what the sources say, fetched and read on 2026-10-07 in a
separate Claude session that does have web access. They exist so the acne, erectile dysfunction
and hair-loss pages can be written from real sources even when the build environment is offline.

## How to use this pack

- Treat each file as the "fetched and read" source for CLAUDE.md §7c.C and §v4.A. Write only
  what these extracts support. If a page needs a claim that is not here, leave it out or list it
  in docs/open-items.md as "needs source".
- Quoted text is shown in "quotes". The extraction was made with a web tool that reads the page
  and returns the relevant passages, so a quote can be lightly shortened. Never present an
  extract as a verbatim quote on the site. Write original Romanian text and cite the source.
- Every source has a proposed `id` for src/content/sources.ts, a citation and a URL. Add each one
  with the right `kind`.
- Facts marked **VERIFY** were not confirmed from a primary source in this pack. Do not publish
  them until they are confirmed.
- The doctor reviewing each page checks the page against the source before the owner records the
  review (docs/REVIEW.md).

## Files

| File                             | Covers                                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `acne.md`                        | Acne hub, subpages, acne medicine pages                                                                     |
| `erectile-dysfunction.md`        | ED hub, subpages, sildenafil and tadalafil pages                                                            |
| `romania-prescription-status.md` | `prescriptionStatus` for every medicine named on the site                                                   |
| `hair-loss-citations.md`         | Sources and fixes for the 8 PENDING_CITATION sections                                                       |
| `conflicts-and-decisions.md`     | Where sources disagree with each other or with the current site, and what needs an owner or doctor decision |

## Not covered

- Romanian keyword research (Google.ro autocomplete, People Also Ask): it could not be done from
  here (search is US-only). Write from the intents in docs/keywords-ro.md. Keep keyword research
  listed as NOT DONE.
- NICE NG198 and NICE CKS: the NICE website refused automated access (403) from here too. The
  pack uses EuroGuiDerm 2025 (the European guideline) as the primary acne source, the AAD 2024
  guideline as secondary, and NHS patient information for practical timelines.
- Fellos visual capture: screenshots cannot be taken from here. The owner can send phone
  screenshots if needed.
