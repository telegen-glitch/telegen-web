# Status

_Last updated: 2026-10-07 (v4.3: hero condition panels)_

## v4.3 hero condition panels

DONE (verified locally, 2026-10-07):

- Hero: the phone mockup, the plan screen and the "Interfață ilustrativă" caption are gone. In their place are
  condition panels (`src/components/home/panels/`), one per published condition and generated from content.
  From 1280 px they are vertical doors: one open, the others narrow strips with a vertical name; flex-grow
  opens a door in 520 ms (ease-out-soft) on click, hover (140 ms intent delay) or keyboard. Below 1280 px they
  are stacked cards, one open, the others a single row each. The first condition is open by default; nothing
  auto-rotates.
- The open panel shows: name, one-line lead, "Ce analizează medicul" (3 points from a new `panel` field on each
  condition), "Cine decide" (`decidingDoctor()`: a specialty only when certain, else "Un medic"; no names),
  the 4-node care route (line draws via stroke-dashoffset in 700 ms, nodes staggered 75 ms), "Începe
  evaluarea" (topic handed to the flow in module memory, never in the URL) and "Află mai multe".
- Illustrations: inline SVG, seeded and deterministic. Hair: rising strokes in 3 layers swaying over 7, 9 and
  11 s. Acne: an irregular dot field fading into an even grid over 10 s. ED: a steady beat drawn into a calm
  curve over 9 s. They play only on the open panel while it is on screen (IntersectionObserver); collapsed
  panels are static and dimmed; reduced motion is fully static. Strokes do not scale, so the look stays the
  same from the 72 px door to the full-width card.
- Pointer light: a faint radial highlight follows the pointer inside the open panel (fine pointers only, off
  with reduced motion). Hero chips open their panel; without JS they are plain links to the hub.
- Condition hubs: the phone is replaced by that condition's panel (illustration, what the doctor analyses,
  who decides, route), shown on mobile too.
- Accessibility: APG accordion (button `aria-expanded`/`aria-controls`; the open header is `aria-disabled`);
  arrow keys, Home and End move focus and open, Enter and Space open; 44 px targets; all content is in the
  server HTML.
- Visual loop: 6 screenshot passes at 360, 768 and 1280, plus recordings and timed frames of a door opening.
  Fixed along the way: names rendering navy on navy, content clipped by the height budget, a broken route
  line, illustrations ballooning on wide tiles, the collapsed ED crop missing the beat, and a muddy colour
  crossfade (now 220 ms).
- Gates: format, lint, typecheck, 46 unit tests (new: one panel per condition, no medicine names, no figures
  or prices, who decides), build, 156 Playwright tests (0 failed; new: click, keyboard, chip, topic hand-over,
  reduced motion, axe with another panel open at 360/1280, hub panel). Lighthouse mobile (local, idle): home 95,
  /acnee 95–99, /disfunctie-erectila 95, /caderea-parului 95–98; Accessibility 100 on all; CLS 0; LCP element
  is the H1. No animation had to be removed.

## v4.2 acne + ED from the source pack

Sources were fetched and read in a separate session with web access (this environment blocks every
external host) and committed as docs/sources/. Pages were written only from that pack.

DONE (verified locally, 2026-10-07):

- Step 1 Sources: 20 entries added to `src/content/sources.ts` (EuroGuiDerm 2025, AAD 2024, EMA retinoids
  2018, NHS, DermNet, EAU SRH, EMA Viagra/Cialis, ANMDM/Mediately labels, StatPearls TE, AAD hair). StatPearls
  AGA date and the EMA 2025 finasteride citation corrected.
- Step 2 Pages published (15): /acnee, /acnee/tipuri, /acnee/cauze, /acnee/tratament, /acnee/cicatrici,
  /disfunctie-erectila, /disfunctie-erectila/cauze, /disfunctie-erectila/tratament,
  /disfunctie-erectila/sanatatea-inimii, /tratamente/adapalen, /tratamente/peroxid-de-benzoil,
  /tratamente/doxiciclina-limeciclina, /tratamente/isotretinoin, /tratamente/sildenafil, /tratamente/tadalafil.
  Each: answer-first summary 45–58 words, every section cited, 4–5 FAQs (FAQPage), limitations box,
  ≥ 3 related links in and out, review meta "în așteptare", MedicalCondition entity on hubs, Drug on
  medicine pages. No doses, no efficacy percentages on medicine pages.
- MERGED (never live, no redirect): /tratamente/tretinoin → /tratamente/adapalen (topical retinoids);
  /tratamente/clindamicina-topica → /tratamente/peroxid-de-benzoil (combination only). Reason: too little
  sourced material for separate pages and no Romanian product confirmed on its own.
- prescriptionStatus: minoxidil OTC; finasteride, sildenafil, tadalafil, isotretinoin, doxycycline
  PrescriptionOnly. Left out (unconfirmed in Romania): adapalen, peroxid de benzoil; lymecycline noted.
- Step 3 Everywhere: hero chips, condition cards, topic picker, /evaluare topic screen, mega-menu, mobile
  menu, footer hubs, /afectiuni, /ghiduri (subpages listed), /tratamente (grouped by condition), home FAQ,
  how-it-works copy, 404. Removed: "în curând", dashed upcoming style, "Pregătim protocolul clinic…",
  `listUpcomingTopics`, the draft helper. Phone mockups are per condition (no photos for ED). serviceOpen OFF.
- Step 4 Hair loss: the 8 sections fixed per docs/sources/hair-loss-citations.md; PENDING_CITATION deleted
  (every section of every medical page must cite). Finasteride page dates the EMA 2025 decision.
- Step 5 Conflicts: all items copied to docs/open-items.md and docs/legal-review-needed.md (§17–18).
  Alpha-blocker hard stop kept. Evaluation texts rechecked; 3 rewordings, 1 summary note added.
- Gates: format, lint, typecheck, 42 unit tests, build, 136 Playwright tests (0 failed; every route at
  360/768/1280, axe AA at 360/1280, 19 hard-stop paths, CSP). Lighthouse mobile (local, idle): home 96,
  /caderea-parului 99, /acnee 95, /disfunctie-erectila 96, /tratamente/sildenafil 99; Accessibility 100,
  Best Practices 100; SEO 66 only from the intended noindex. docs/geo-status.md regenerated.

NOT DONE:

- Romanian keyword research and Fellos capture/parity: network blocked (docs/keywords-ro.md).
- Length guide: pages are shorter than the brief's ranges (hubs ~680–780 body words, subpages ~520–840,
  medicine pages ~420–525) because only pack-supported claims were written. Topics the pack does not cover
  (acne hormones/genetics, hygiene myths, isotretinoin side effects beyond pregnancy and mood) are listed in
  docs/open-items.md.

NEXT: owner decisions in docs/open-items.md; doctor review per docs/REVIEW.md; keyword research and Fellos
parity in a session with network access.

## v4 final build (CLAUDE.md §v4)

DONE (verified locally, 2026-10-07):

- C1 ConditionView reads all wording from per-condition data (presentation, approaches, timeline, subpages).
- C2 Hair loss moved to /caderea-parului (301s from /afectiuni/caderea-parului, /alopecie, /alopecie-androgenetica).
- C3 Men's-health positioning, generated from the published conditions (home title, description, Organization).
- C4 MedicalCondition entity data for hair loss; a test fails if any schema value is not visible on the page.
- C6 Titles ≤ 60 and descriptions 120–160 for every page, drafts included; titles unique (unit test).
- C7 Open Graph images via next/og (self-hosted OFL fonts); medicine pages use a generic image; large Twitter card.
- C8 `pnpm geo:report` writes docs/geo-status.md; all answer-first paragraphs now 40–60 words.
- D Clinician privacy: no names, codes or photos anywhere; reviewer = team id + specialty, shown as "un medic
  dermatolog din echipa Telegen"; a page counts as reviewed only with a valid date and a matching specialty
  (tests). No page is marked reviewed. Process in docs/REVIEW.md.
- E /contact and /politica-editoriala; footer company block (TEMPORARY until supplied) + ANPC links; CSP and HSTS
  headers (checked in e2e, no violations); Search Console/Bing verification via env vars (production only);
  per-condition price config (hidden while empty); docs/LAUNCH.md; docs/clinical-app-architecture.md.
- Gates: format, lint, typecheck, 41 unit tests, build, 91 Playwright tests (0 failed; incl. 19 hard-stop paths,
  axe clean at 360/1280, CSP). Lighthouse mobile (local, idle): home 95–96, /caderea-parului 97, /evaluare 99,
  /contact 96; Accessibility 100, Best Practices 100; SEO 66 only because of the intended noindex.

BLOCKED by network (every external host denied in this session, incl. web fetch; Semrush has no API units):

- A1 fetching EAU / EuroGuiDerm / NICE / EMA / ANMDM sources; A2 Romanian keyword research; A3 Fellos capture and
  parity passes.
- B the 17 acne and ED pages stay drafts (no clinical text without fetched sources).
- C5 the 8 older hair-loss sections still lack citations (PENDING_CITATION allowance kept).
- Drug prescriptionStatus for minoxidil/finasteride (needs ANMDM status).

NEXT: start a new session (network settings apply to new sessions) and run A, B, C5 from the v4 brief.

## v3 conditions expansion: acne + ED (CLAUDE.md §7c), in progress

DONE (verified locally, 2026-10-06):

- Brief saved as CLAUDE.md §7c.
- IA modelled in content: /acnee (+ tipuri, cauze, tratament, cicatrici), /disfunctie-erectila (+ cauze, tratament,
  sanatatea-inimii), 8 medicine pages under /tratamente. Routes `[condition]` and `[condition]/[sub]` built. All new
  pages are DRAFTS (not routed, listed or in the sitemap) until their clinical text is written from fetched sources.
- Evaluation engine is data-driven (`src/content/evaluations/`): hair loss, acne, ED. ED has the 6 mandatory safety
  screens plus onset-after-injury and curvature/pain; acne red flags (nodules, scarring, sudden adult onset, systemic
  symptoms, current isotretinoin, pregnancy). Every red flag ends on a hard stop with no continue option. Adults only.
  Per-condition `serviceOpen` flags (all OFF). Topic picker and /evaluare offer all three.
- Structured data: MedicalCondition (alternateName, signOrSymptom, riskFactor, possibleTreatment) and Drug
  (activeIngredient, prescriptionStatus) supported; a test fails if any value is schema-only.
- Source check: every published medical summary and section must cite a source (8 older hair-loss sections listed
  as pending). Medicine-name compliance test extended to the new medicines.
- Gates: lint, typecheck, 36 unit tests, build, 88 Playwright tests incl. 19 hard-stop paths.

BLOCKED: guideline/EMA/ANMDM sources, Romanian keyword research and Fellos acne/ED capture all blocked by the network
policy (container + web fetch); Semrush has no API units. Therefore NOT done: clinical text for the 16 new pages,
docs/keywords-ro.md validation, Fellos parity for acne/ED.

## v2 Fellos-parity rebuild (CLAUDE.md §4c) — in progress

DONE (verified locally, 2026-10-05):

- Brief saved as CLAUDE.md §4c. Capture script ready: `scripts/capture-reference.mjs` (writes to gitignored /reference).
- New UI system: sans display type with italic serif accent, mist surfaces, 24/32px card radii, `section-y` rhythm.
- Homepage in §4c.C order: announcement bar, sticky header with mega-menus (Tratamente / Despre Telegen) and full-screen
  mobile menu, topic-picker modal (published topics only; upcoming "în curând"), hero with accent headline + chips,
  01/02/03 strip, value section with CTA pair, condition cards, 4-step "Cum te ajutăm" with phone mockups (desktop
  pinned phone cross-fades per step; mobile reveal), team section, FAQ with knowledge-base link, 4-column footer.
- Feature flags OFF (`src/lib/flags.ts`): pricing, press logos, ratings, reviews, doctor profiles, certification
  badges, refund promise, social links. Components exist; render nothing while off; no sample data.
- Motion: CSS + one IntersectionObserver (`RevealObserver`), reduced-motion respected, hero not animated.
  `docs/motion-spec.md`, `docs/token-map.md` written (Fellos columns pending capture).
- Same system on: hair-loss page, how it works, team, knowledge base (/ghiduri), medicine info (/tratamente),
  evaluation flow (topic screen → intro → questions with sticky progress; focused layout without site chrome;
  topic handed over from the picker in module memory only).
- Gates: lint, typecheck, format, 17 unit tests, build, 68 Playwright tests (axe clean 360/1280, nav, topic picker,
  mega-menu, evaluation privacy, SEO) all pass. Lighthouse mobile (local): Performance 95 / 95 / 96 / 98
  (home / hair loss / guide / evaluare), Accessibility 100, Best Practices 100, SEO 66 (noindex by design), CLS 0.

BLOCKED: reference capture (fellos.nl denied by network policy, also via web fetch). Therefore NOT done:
measured token/motion mapping, side-by-side acceptance passes (§4c.E).

## v1 foundation

## DONE (verified locally in the build container)

- Phase 0: Next.js 16.3 App Router, TS strict, Tailwind 4, ESLint, Prettier, Vitest, Playwright + axe,
  GitHub Actions CI (`.github/workflows/ci.yml`: format, lint, typecheck, unit, build, e2e), README,
  `.env.example`, brief saved as `CLAUDE.md`.
- Phase 2: design system (tokens, type scale, buttons, header with condition-led desktop menu,
  full-height mobile menu, footer), pre-launch bar.
- Phase 3: 18 pages from typed local content: home, conditions hub, hair-loss page (with month-by-month
  expectations), 3 guides (symptoms, causes, questions), 2 treatment-information pages + index, how it
  works, clinical standards, team + clinician template, evaluation flow, terms, privacy, cookies, 404.
  Acne is modelled as a draft and not published.
- Evaluation flow: 10 questions, one per screen, progress, back, summary with edit, final "not open yet"
  screen, email + consent notify form through a storage adapter (disabled; Brevo adapter written,
  not run against the real API).
- Phase 4: canonicals, title template, meta descriptions, Open Graph, sitemap, robots, breadcrumbs +
  BreadcrumbList, MedicalWebPage, FAQPage (visible FAQs only), Organization/WebSite JSON-LD, redirects,
  X-Robots-Tag noindex pre-launch.
- Phase 6: granular cookie consent (necessary / analytics / marketing), settings in footer; banner
  only appears once an analytics provider is configured; analytics gate with closed event list.
- Quality gates run on the last build: lint, typecheck, format check pass; 17 unit/compliance tests pass;
  65 Playwright tests pass (18 pages × 360/768/1280, axe WCAG 2.1 AA clean at 360 and 1280, mobile
  nav + keyboard, evaluation privacy, redirects, 404, robots, sitemap, internal links).
- Lighthouse mobile (local `next start`, simulated throttling): Performance 95–96, Accessibility 100,
  Best Practices 100, SEO 66 (only failing audit: `is-crawlable`, intended noindex). LCP 2.86–3.01 s,
  TBT 45–61 ms, CLS 0.

## Links

- PR: https://github.com/telegen-glitch/telegen-web/pull/1 (branch `claude/telegen-production-build-sv94k7`)
- Preview: https://telegen-web-git-claude-telegen-production-build-sv94k7-telegem.vercel.app (Vercel: Ready at e515f2f)

## NOT DONE / NOT VERIFIED

- Reference screenshots (fellos.nl, numan.com, manual.co, hims.com): blocked by network policy (403).
  `docs/parity-spec.md` is written from the known category pattern and must be re-checked.
- GitHub CI on PR #1: green (checks + e2e) at 7398a0a.
- Vercel: connected 2026-10-05. First build failed (project imported while repo was empty → no framework detected); fixed by `vercel.json` `framework: nextjs`. Preview deployed. Not opened from this container (vercel.app blocked by network policy).
- Phase 5 Sanity: interface ready (`src/content/source.ts`); needs project id/token.
- Structured data validated by our own tests (parse + mirrors visible content); Google Rich Results
  Test not run (no network access to it).

## NEXT

1. Get CI green and the Vercel preview link on PR #1; owner reviews the preview on a phone.
2. Reference capture → visual parity passes (3 loops) against real screenshots.
3. Sanity adapter behind `ContentSource` once credentials arrive.

## BLOCKED (owner-only)

- Allow reference domains in the environment's network settings, or send phone screenshots.
- Later: company details, clinicians, prices, Brevo account/API key (owner approved Brevo), lawyer review, Sanity credentials.
