# Status

_Last updated: 2026-10-06 (v3 conditions expansion)_

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
