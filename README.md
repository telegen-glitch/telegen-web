# telegen-web

Public website for **telegen.ro**: brand, conditions, medical education, trust, SEO/GEO and the
pre-launch evaluation flow. The clinical app (app.telegen.ro) is a separate system and out of scope.

The build brief is in [`CLAUDE.md`](CLAUDE.md). Current state: [`docs/STATUS.md`](docs/STATUS.md).

## Stack

Next.js 16 (App Router, static generation), TypeScript strict, Tailwind CSS 4 with a small design system
(`src/app/globals.css`), `next/font` (Newsreader + Instrument Sans, OFL, latin-ext for Romanian
diacritics), Vitest, Playwright + axe, GitHub Actions, Vercel.

Dependencies beyond the Next.js scaffold, and why:

- `server-only` — keeps the notification adapter (API keys) out of client bundles.
- `vitest` — fast unit/compliance tests that also gate the build (`prebuild`).
- `@playwright/test`, `@axe-core/playwright` — e2e, accessibility and screenshot QA.
- `prettier`, `prettier-plugin-tailwindcss` — consistent formatting and class order.

## Commands

```
pnpm dev            # local dev server
pnpm lint           # eslint
pnpm typecheck      # next typegen + tsc
pnpm test           # unit + compliance tests (also run before every build)
pnpm build          # production build
pnpm e2e            # Playwright: pages, axe, nav, evaluation privacy, SEO; screenshots in artifacts/
```

## Rules enforced in code

- Site is `noindex` + `robots: Disallow: /` unless `SITE_INDEXING=on` and `VERCEL_ENV=production`.
- Medical pages are `noindex` unless their data names a real reviewer with credential and review date.
- Evaluation answers never leave React state (tested: URL, storage, cookies, requests).
- Medicine names never appear in page/component code (tested).

## Structure

- `src/content/` typed local content behind `ContentSource` (`source.ts`); Sanity plugs in there later.
- `src/lib/` site config, indexing rules, SEO/JSON-LD, consent, analytics gate, notify adapter.
- `src/components/` layout, medical templates, evaluation flow, consent.
- `docs/` status, parity spec, open items, legal questions.
