# Status

_Last updated: 2026-10-11 (v5 P0: clinical foundation, branch claude/v5-p0-foundation)_

## v5 clinical flow inside the site

Owner decision 2026-10-11: one repo, one Vercel project; the clinical flow is built here with the
separation enforced in code. Phases P0–P6, one stacked pull request each.

### P0 foundation (branch claude/v5-p0-foundation) — DONE (verified locally, 2026-10-11)

- **Schema** `supabase/migrations/0001_clinical_core.sql`, in a `clinical` schema that Supabase's REST
  API does not expose:
  - Tables: profiles, patients, doctors, pharmacies, consents (insert-only, versioned), cases, answers,
    photos, proposals, payments, subscriptions, messages, prescriptions, orders, check-ins, doctor
    ledger, SLA events, e-mail outbox (template + ids only), audit log.
  - RLS on every table, by role. Patients see only their own records. Doctors need two-factor (aal2)
    and see their specialty's open queue plus their own cases. Pharmacies get a narrow view with the
    prescription and the delivery address, never the condition. Admins see operations, never answers,
    photos or messages.
  - The case state machine is enforced by a trigger. Writes to health tables are audited by trigger;
    reads are audited by the app (who, when, which record, never the content).
- **Data access** (`src/clinical/db`): every query runs in a transaction as the signed-in user's role
  with Supabase-style JWT claims, so RLS always applies. The service role is used only for webhooks,
  jobs and account set-up. Drivers: postgres.js against Supabase in deployed environments; PGlite
  (Postgres 18 in WebAssembly, same migrations, same `auth.uid()`) locally and in CI. The build applies
  migrations itself when `DATABASE_URL` is set (`scripts/db-migrate.ts`).
- **Walls.**
  - ESLint forbids importing `src/clinical` outside `src/clinical`, `src/app/(clinical)` and
    `src/app/api` (verified to fire), and forbids `console`, analytics and `next/script` in clinical
    code.
  - /evaluare moved into the `(clinical)` route group: dynamic, `noindex`, `no-store`.
  - `src/proxy.ts` gives clinical paths a per-request nonce CSP (`strict-dynamic`, a hash for the one
    inline layout script, forms only to the site and Stripe Checkout, no frames). Public paths keep
    their static CSP: exactly one policy per path, and `/contact` is not caught by the `/cont` rule.
  - robots.txt disallows the clinical paths and `/api/` even in indexable mode. The sitemap excludes
    them. Analytics never runs on clinical paths.
  - Functions are pinned to Frankfurt (`vercel.json` regions `fra1`) so health data is processed in the EU.
- **Health-data scan** (`tests/unit/health-data-scan.test.ts`, runs before every build). It checks:
  - no clinical imports in public code, and no request-time APIs in public pages;
  - only opaque ids in clinical route segments;
  - no query strings with health fields, and no console or analytics in clinical code;
  - the logger keeps only opaque ids;
  - Stripe metadata is `case_id` and `purpose` only;
  - every e-mail template is free of conditions, medicines and answers.
- **Other.** `/api/health` (booleans and counts only) lets the owner check the set-up from a phone.
  Phone steps are in `docs/SUPABASE.md`. CLAUDE.md is updated with the v5 overrides. The lawyer
  confirmation reported by the owner is recorded in docs/legal-review-needed.md #25.
- **Tests:** 12 RLS tests (`tests/unit/rls.test.ts`), 10 scan tests, 80 unit tests in total, and 191
  Playwright tests (0 failed), including the clinical-wall headers and the evaluation under the strict
  CSP with no violations.

Stack additions (why each):

- `@supabase/supabase-js`, `@supabase/ssr`: Supabase Auth (e-mail one-time code, TOTP for staff) and
  private Storage with signed URLs; the official clients.
- `postgres` (postgres.js): talks SQL to Supabase Postgres from the server, so every query runs under
  RLS as the signed-in user instead of through the public REST API.
- `@electric-sql/pglite` (dev only): the same Postgres engine in-process for RLS tests, CI and local
  e2e, with no database server to run.
- Coming in later phases: `stripe` (P2), Brevo over plain `fetch` (no SDK), and invoicing over plain
  `fetch` (adapter disabled until credentials).

## v4.7 launch state: no "not open / at launch" signals

DONE (verified locally, 2026-10-10):

- **One switch.** `siteConfig.launchState` is "open" on previews and production; "prelaunch" is only a
  fallback. `serviceOpen` follows it (open for all three conditions). Every pre-launch string (announcement,
  intro note, "not open yet" screen, notification form, closing line, FAQ, meta text, legal note) lives in
  `src/lib/prelaunch-copy.ts` and renders only in "prelaunch".
- **Evaluation end screen.** "Ultimul pas: consultul cu medicul." with what happens next (account and
  consent, answers in the app, the doctor's review, plan and follow-up) and **Continuă către consult**: a
  form POST of the chosen condition only to `CLINICAL_APP_URL`. Answers never leave the browser; the app
  asks again (contract in docs/clinical-app-architecture.md §4b). CSP `form-action` allows the app's
  origin. Without the variable, previews show an owner marker; production cannot build.
- **Copy rewritten in the present tense:** home FAQ ("Telegen funcționează deja?" removed in "open"; data
  answer; "Cât costă?" from config), /cum-functioneaza prices from config, /afectiuni lead,
  /standarde-clinice, /contact, ClosingCta, announcement bar, footer line, mockup line, an ED FAQ answer,
  /evaluare, /termeni-si-conditii and privacy meta descriptions, /politica-editoriala. Unreviewed medical
  pages show "Scris de echipa editorială Telegen pe baza ghidurilor citate · actualizat {dată}" (no badge,
  no review claim). Launch versions of terms, privacy and cookies (marked REQUIRES LAWYER SIGN-OFF in
  docs/legal-review-needed.md, items 20–23); no note on the site.
- **No TEMPORARY anywhere public.** TemporaryBadge/TemporaryNote deleted. Company identity, contact
  e-mail, response time, prices and the legal sign-off come from `src/lib/launch-config.ts`; a missing
  value shows a dashed "[lipsește: …]" marker on previews and local builds only, never in production.
- **Launch lock.** `scripts/launch-lock.ts` runs before every build; with VERCEL_ENV=production and
  "open" it fails and lists what is missing (verified: exit 1 with 11 items; previews exit 0).
  `scripts/launch-copy-check.ts` runs after every build and fails if any prerendered page contains a
  pre-launch phrase (36 pages, clean). On Vercel the builder keeps prerendered pages elsewhere, so there
  the check warns and passes (the first v4.7 preview failed on this; fixed in babe4d9); CI and e2e run it
  on every pull request. The production lock itself was verified locally only (VERCEL_ENV=production
  exits 1); it runs before the build on Vercel too.
- **Tests:** unit `tests/unit/launch-copy.test.ts` (defaults; phrase detector; no pre-launch phrase in any
  source file outside prelaunch-copy.ts; every route's title/description and every content string; lock
  logic; no invented values; price answer; owner markers; https-only app URL). Pages cannot be rendered in
  a unit test, so every route's HTML is checked after the build and in e2e (`tests/e2e/launch.spec.ts`);
  the evaluation e2e checks the final screen and that the hand-over POST carries only the condition.
- **Gates:** format, lint, typecheck, 59 unit tests, build (with and without `CLINICAL_APP_URL`), 187 Playwright tests (0 failed), axe on every route. Lighthouse mobile (local): home Perf 95 / A11y
  100 / CLS 0 (LCP element the H1), /caderea-parului 98, /acnee 95, /disfunctie-erectila 95, /contact 95;
  A11y 100 everywhere; SEO 66 only because of the intended noindex.

STILL NEEDED FROM THE OWNER (the production build is locked until then): see docs/open-items.md, "Launch
values the owner still has to supply" (11 items: company name, CUI, Reg. Com., address, contact e-mail,
reply time, three prices, `CLINICAL_APP_URL` with a live app, lawyer sign-off).

## v4.6 animated photo in the hair-loss panel

DONE (verified locally, 2026-10-07):

- The Căderea părului panel (home hero and the /caderea-parului hub) shows the licensed Pexels photo of a
  man styling his hair in a mirror (docs/media-credits.md). Acne and ED are unchanged; the doors keep the
  same 39rem height budget.
- Art direction: the wide crop (1600 × 1000) in every open band (mobile cards 14rem, desktop door 11.25rem,
  hub 15rem), because the open band is a wide shape and the wide crop keeps the whole face, the mirror and
  his shoulder; the portrait crop (1100 × 1375) in the tall, narrow closed desktop door, cropped to the
  face, desaturated and dimmed, full colour when opened. AVIF → WebP → JPG, `alt=""` (decorative), same
  inset frame and radius as the other panels. The panel title sits over the photo's lower edge on a navy
  scrim (≥ 80% navy under the title); the rest of the text is on solid navy.
- Caption, top right: "Imagine de prezentare. Persoana este model." No name, quote, patient or result.
- Motion (CSS transforms and opacity, docs/motion-spec.md): reveal 1.08 → 1 with fade in 700ms when the
  panel opens or when the photo arrives; breathing 1 → 1.05 toward the face over 15s, alternating, only
  while open and on screen; one 12% white diagonal light sweep per opening (1.4s); desktop parallax ±8px
  opposite the cursor with the existing pointer light on top, off on touch. Reduced motion: still.
- Switch: `heroMedia.hair = "photo" | "illustration"` in `src/lib/flags.ts`. "photo" takes effect only
  when all six files exist (checked at build in `src/lib/hero-media.ts`); otherwise the line drawing. If
  the photo fails to load in the browser, the line drawing shows instead (`PhotoGuard`).
- Performance: both images are lazy; on mobile only the 17 KB wide AVIF loads, at low priority, and the
  portrait is never fetched. Reserved box sizes, CLS 0. The photo is not the LCP element (the H1 is on
  home), so no preload was added.
- Visual loop: 3 passes at 360 and 1280 (open, closed next to ED, timed frames, recordings). Fixed: the
  portrait crop hid the eyes under the scrim in the wide desktop band, a hairline at the band's bottom
  corners, the photo popping in after its reveal had already played, and a front-loaded light sweep.
- Gates: format, lint, typecheck, 48 unit tests (new: the media switch and its file check), build, 171
  Playwright tests (0 failed; new: photo and caption, fallback when the files return 404, reduced motion
  still, closed-door portrait, axe on home and hub). Lighthouse mobile (local): home Perf 95, A11y 100,
  CLS 0, TBT 53 ms, LCP 2.97 s (H1, same as before this change); /caderea-parului Perf 95, A11y 100,
  CLS 0, LCP 2.93 s (text). SEO 66 locally only because of the intended noindex.

NOT DONE / open:

- The Pexels licence gives no model release; whether it covers a health topic is listed for the lawyer
  (docs/legal-review-needed.md #19, docs/open-items.md).
- Merged into PR #2 (claude/hero-realistic): there the hair panel shows this photo by default, the WebGL
  hair scene is the switch's "illustration" option and its still poster is the photo's load fallback;
  acne keeps its WebGL scene.

## v4.5 realistic WebGL scenes for hair and acne (branch claude/hero-realistic, separate PR, not merged)

DONE (verified locally, 2026-10-07):

- The ED line (Pulse) is unchanged. Hair and acne are now GPU-rendered scenes in raw WebGL2, no library
  (`src/components/home/panels/scenes/`): `gl.ts` (helpers, shared duotone grade in brand colours, same key
  light), `hair.ts`, `skin.ts`. Loader: `SceneArt.tsx`. Gzipped chunks: hair 4.5 KB, skin 3.4 KB (target ≤ 30).
- Hair: about 1,400 strands on desktop, 700 on mobile, 480 on low-end devices (instanced, tapered ribbons
  with curl, dark roots and light tips, Kajiya-Kay sliding highlight, 3 depth layers, wind sway). Story: six
  strands detach and drift down like feathers, then new strands grow in over about 4 s until the field is
  fuller; afterwards a single strand is shed and regrown every 24 s. On desktop the strands lean away from
  the cursor (spring); no touch interaction.
- Acne: a full-panel skin shader (Worley pores, fbm micro-relief and crossing fine furrows, normal from the
  height field, wrapped diffuse as a soft subsurface stand-in, faint sheen). Six soft raised areas with a
  restrained rose tint flatten and fade over about 8 s while a light sweeps across. On desktop the light
  follows the cursor. No pus, no sharp red.
- Lifecycle: the scene code is imported only after page load and idle, only for the open panel while it is on
  screen. One WebGL context at a time; disposed on close; paused offscreen and in a hidden tab; 30 fps after
  the story. DPR cap 2 (1.5 on mobile); lower quality with fewer than 4 cores. Reduced motion, Save-Data, no
  WebGL, no GPU (software renderer) or sustained slow frames: the poster stays.
- Posters: `pnpm render:posters` (Playwright + sharp) renders each scene at its calm state into
  `public/posters/{hair,skin}.{avif,webp}` (hair 38/108 KB, skin 16/19 KB). Shown in closed doors, before
  load and in every fallback. Fixed 1400 × 560 box, no CLS. All art is `aria-hidden`. The same scenes run on
  the /caderea-parului and /acnee hub panels (checked live at 360 and 1280).
- Visual loop: 6 screenshot passes at 360 and 1280 (open, closed, posters, recordings). Fixed: hair reading
  as grass, skin reading as reptile scales or cracked glaze, a washed-out grade.
- Gates: format, lint, typecheck, 46 unit tests, build, 168 Playwright tests (0 failed; new: posters with
  reduced motion, without WebGL and without a GPU, one live scene at a time, none for ED, no console errors).
  Lighthouse mobile (local): home Perf 94, TBT 72 ms, CLS 0, A11y 100, LCP element the H1; /acnee 95;
  /caderea-parului 98. SEO 66 locally only because the site is noindex (intended).

NOT VERIFIED / honest notes:

- Lighthouse's headless Chrome has no GPU, so it measures the poster path (as on any device without GPU
  acceleration). The first run without the software-renderer check scored home Perf 64 (TBT 79 s). Real-GPU
  frame times on a mid-range phone were not measured here; the slow-frame guard falls back to the poster.
- Nothing was cut from the brief's counts or effects; the subsurface look is an approximation (wrapped
  diffuse), not a true scattering model.

## v4.4 hair and acne illustrations redesigned

DONE (verified locally, 2026-10-07):

- The ED illustration (Pulse) is the quality bar and is unchanged. Hair and acne were deleted and redrawn in
  the same visual language: each is one continuous, hand-authored line (no randomness). They use the same
  ghost layer (navy, 2 px, 0.16) and blue trace (2.4 px, round caps and joins, pathLength 1, `cp-trace`), the
  same 960 × 200 canvas and crop, and the same trace timing. All three lines start flat on the baseline
  (y=112), keep their key feature at the centre and end in the same calm curve.
- Căderea părului: ten narrow hairpin strands with rounded tips, curving gently forward, growing taller and
  closer together from left to right. Acnee: the skin surface with small, uneven, soft bumps that shrink and
  spread out until the line is calm.
- The static frame (reduced motion, closed panel) is the whole line; e2e checks it. Each narrow closed door
  shows a strand, a bump or a beat. Removed: the sway, unrest and calm CSS and keyframes, the PRNG and the
  210-stroke and dot-field markup.
- Visual loop: 2 passes at 360 and 1280 (each panel open, closed doors, hub panels, recordings, mid-trace
  frames).
- Gates: format, lint, typecheck, 46 unit tests, build, 159 Playwright tests (0 failed). Lighthouse mobile
  (local, idle): home 95, /acnee 95, /caderea-parului 95; Accessibility 100; CLS 0.

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
