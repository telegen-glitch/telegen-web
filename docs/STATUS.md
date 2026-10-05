# Status

_Last updated: 2026-10-05_

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

## NOT DONE / NOT VERIFIED

- Reference screenshots (fellos.nl, numan.com, manual.co, hims.com): blocked by network policy (403).
  `docs/parity-spec.md` is written from the known category pattern and must be re-checked.
- Push to GitHub, PR, CI on GitHub and Vercel preview: blocked (GitHub App not installed for the
  repo owner; git push returns 403).
- Phase 5 Sanity: interface ready (`src/content/source.ts`); needs project id/token.
- Structured data validated by our own tests (parse + mirrors visible content); Google Rich Results
  Test not run (no network access to it).

## NEXT

1. Owner unblocks GitHub → push `claude/telegen-production-build-sv94k7`, open PR, get Vercel preview.
2. Reference capture → visual parity passes (3 loops) against real screenshots.
3. Sanity adapter behind `ContentSource` once credentials arrive.

## BLOCKED (owner-only)

- Install the Claude GitHub App on `telegen-glitch/telegen-web` (push + PR).
- Connect Vercel to the repo (import project).
- Allow reference domains in the environment's network settings, or send phone screenshots.
- Later: company details, clinicians, prices, Brevo account/API key, lawyer review, Sanity credentials.
