@AGENTS.md

# Working notes (keep short; the brief below is the source of truth)

- Resume from `docs/STATUS.md` (done / next / blockers). Update it after every work block.
- Package manager: pnpm. Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm e2e`.
- Content lives in `src/content/` (typed, local) behind the interface in `src/content/source.ts`. Sanity plugs in behind the same interface in Phase 5.
- Indexing: the whole site is `noindex` unless `SITE_INDEXING=on` AND `VERCEL_ENV=production` (see `src/lib/site.ts`). Medical pages are additionally `noindex` unless their data has a real reviewer (name, credential, review date) — `src/lib/indexing.ts`, enforced by `tests/unit/indexing.test.ts`, which runs before every build (`prebuild`).
- Health answers from `/evaluare` stay in React state only. Never in URL, cookies, storage, logs or analytics.
- Open items: `docs/open-items.md`. Legal questions: `docs/legal-review-needed.md`. Parity: `docs/parity-spec.md`.

---

## 0. Owner pre-authorization (standing)
The owner pre-authorizes, for the whole project: creating branches, committing, opening PRs, installing dependencies, running builds/tests/screenshots, and merging a PR to main whenever every quality gate in section 11 passes. Do not wait for approval between phases. Work continuously through Phases 0-7 in one run, then deliver the preview link.
Stop and ask ONLY for: credentials or tokens, real legal/company details, medical or legal commitments, pricing decisions, changing DNS, and flipping the site from noindex to public. Batch every blocker into ONE message, then keep working on anything not blocked. Production stays noindex on the .vercel.app URL until the owner explicitly approves launch.
Maintain docs/STATUS.md (done, next, blockers) after every work block so a new session can resume from it.

## 0b. Owner is on a phone only
The owner has NO laptop. Never ask them to run terminal commands, edit files locally, or install software. Every manual step must be doable in a phone browser or app, with exact tap-by-tap instructions. Keep messages under ~150 words, lead with the preview link or the one thing needed, and ask for answers in a few words (yes/no, a link, a pasted value).

# TELEGEN — PRODUCTION BUILD BRIEF
Repo: telegen-web (empty, private). Build from scratch.

## 1. Mission and target
Build telegen.ro as a production Next.js site and deploy it to a Vercel preview, ready for telegen.ro.
Quality target: a premium UI VERY CLOSE in structure and feel to Fellos (fellos.nl), the primary reference, and to the Numan / Manual / Hims-class sites. A visitor comparing screenshots should read Telegen as the same product category at the same polish.
Launch topic: hair loss (androgenetic alopecia), architected for more dermatology topics later. SEO and GEO are built in from the first commit.
Two systems, strictly separated:
- telegen.ro: this repo. Public site: brand, conditions, education, trust, SEO/GEO, conversion.
- app.telegen.ro: future clinical app. Out of scope. No patient accounts, prescriptions or clinical logic here.
No third-party form tools (no Tally or similar). The evaluation flow is built in-house (section 7b).

## 2. START NOW (first session, in this order)
1. Scaffold Next.js (current stable, App Router, TypeScript strict, Tailwind), ESLint/Prettier, CI (lint, typecheck, build), README, .env.example. Save this brief as CLAUDE.md. Commit.
2. Capture reference screenshots yourself with Playwright: mobile (360x780) and desktop, of fellos.nl (home, hair-loss/condition page, how it works, pricing, team/doctors, assessment flow screens, mobile nav open, footer) and of Numan, Manual and Hims & Hers (home plus one condition page each). Look at the images. Save in /reference (gitignored, never committed or published). If network access blocks this, ask the owner for phone screenshots and list the exact screens.
3. Write docs/parity-spec.md (one page): for each reference page, the Telegen equivalent, what is MATCHED, what is DIFFERENT.
4. Build the homepage skeleton on the design system, push a branch, open a PR, and give the owner the Vercel preview link. If Vercel is not yet connected, tell the owner the exact phone steps to import telegen-web.
No long strategy documents. Code and previews first.

## 3. How you work
- You are product, design, frontend, SEO and QA. Decide, implement, test, improve.
- Feature branches and PRs; each gets a Vercel preview. Never push directly to main.
- Never claim something is done, tested or deployed unless you ran it and saw it pass. Say plainly what could not be run.

## 4. Parity rules
MATCH closely: section order and page rhythm; condition-led navigation; assessment-first CTA hierarchy and placement; short 3-step explainer near the top; education integrated with service on condition pages; month-by-month expectations; transparent how-care-works; clinical team presentation structure; pricing shown after education (config flag, OFF by default); footer structure; mobile menu pattern; type-scale proportions, spacing rhythm, content width, button and nav sizing, density.
OWN: logo and wordmark, exact colour values, licensed typefaces, all copy, imagery, illustration and code. Never copy a competitor's text, images, icons, illustrations, fonts, logo or code.
Visual loop: after each page, screenshot Telegen at 360px and 1280px, compare with the matching reference, list deviations in feel (density, whitespace, hierarchy, type weight, proportions), fix, repeat up to three passes.

## 4c. FELLOS PARITY REBUILD (v2) — overrides earlier design direction where they conflict
The current build is a good foundation but not close enough. Goal: a Telegen site whose UI, layout and motion are VERY CLOSE to fellos.nl, at the same premium level, with Telegen's own identity (logo, palette, licensed fonts, all copy and imagery). You may delete and rebuild any UI code. Keep: SEO/GEO infrastructure, schema, compliance rules, tests, CI, content model. Save this as section 4c of CLAUDE.md so future sessions follow it.

### A. Reference capture (do first)
Use Playwright at 360x780, 390x844 and 1280x800 on fellos.nl (and fellos.nl/en for meaning):
- Full-page screenshots plus section-by-section crops of: home, /behandeling/haaruitval, /hoe-het-werkt, /over-ons/onze-zorgverleners, /kennisbank, /medicijn-informatie, /quiz/start (first screens only, submit nothing).
- Screen recordings (recordVideo) of: slow full-page scroll, mobile menu open/close, desktop mega-menu, topic-picker modal, carousels being swiped, FAQ accordion, sticky header behaviour.
- Measure computed styles: font size, line height, letter spacing per heading level and body; section padding; container widths; grid gaps; radius; button height/padding; header height; shadows. Record CSS transitions/keyframes where present; for scripted interactions, derive timing from the videos.
Keep all of this in /reference (gitignored). If network blocks it, ask the owner for phone screenshots and list the exact screens.

### B. Write two short specs
- docs/token-map.md: each Fellos measurement mapped to a Telegen token, same scale and proportions, own colours and fonts.
- docs/motion-spec.md: each animation with trigger, property, duration, easing, delay/stagger and distance.

### C. Homepage — match this section order and component behaviour
(Taken from the live page text; verify against the screenshots before building.)
1. Thin announcement bar.
2. Sticky header: logo, desktop mega-menu (Tratamente / Despre Telegen), primary CTA, full-screen mobile menu. No login or cart (no app or shop yet).
3. Topic-picker modal ("Cu ce te putem ajuta?"): only published topics are selectable; others may show as non-clickable "în curând".
4. Hero: two-part headline with the second phrase in an italic accent style, short subtext, condition chips, primary CTA, real photo or high-end typographic/diagram treatment (no stock doctors).
5. Compact numbered 3-step strip (01 / 02 / 03).
6. Value section with a two-CTA pair (start / how it works).
7. Condition cards section.
8. "How we help you" 4-step section with phone-mockup visuals of Telegen's own UI, animated on scroll as Fellos does.
9. Medical team: swipe carousel plus grid plus credential badges.
10. Reviews carousel.
11. FAQ accordion with a link to the knowledge base.
12. Footer: 4 link columns, socials, legal links, cookie preferences; plus a granular cookie banner.
Sections that need assets Telegen does not have yet — press logos, star ratings, review counts, reviews, doctor photos and quotes, certification badges, refund promise — must be built as components but hidden behind feature flags (OFF) until real content and owner confirmation exist. Never fill them with placeholders that look real.

### D. Motion
Implement the motion spec with CSS plus a small IntersectionObserver utility. Add an animation library only if the spec genuinely needs it, and justify it. Respect prefers-reduced-motion. No layout shift. Do not delay the hero's LCP with entrance animations. Keep Lighthouse mobile performance at or above the current preview's score.

### E. Acceptance per section
Compare Telegen and Fellos side by side at 360/390 and 1280: same section order, component type, grid and interaction; type and spacing proportions within about 10%; motion durations within about 20%. Up to three fix passes per section, then move on and list any remaining gaps.

### F. Then extend the same system to
Hair-loss page (mirror /behandeling/haaruitval), how it works (/hoe-het-werkt), medical team (/over-ons/onze-zorgverleners), knowledge base (/kennisbank), medicine information (/medicijn-informatie), and the evaluation flow (structure of /quiz/start, still UI-only with answers kept in memory as per 7b).

### G. Never copy
No Fellos images, logos, icons, illustrations, fonts, exact colour values, code, or text — including translations of their sentences. All Romanian copy is original. All earlier compliance rules still apply (no invented doctors, reviews, ratings or statistics; no medicine names in hero/CTA/price blocks).

### H. Report back (phone-sized)
Preview link first, then at most 5 bullets on remaining gaps versus Fellos, then any batched blockers.

## 5. Design direction
Premium Romanian digital clinic: credible, calm, precise, human, European. White, deep navy, restrained clinical blue. Distinctive licensed type with full Romanian diacritics (ă â î ș ț, comma-below), disciplined spacing, strong editorial hierarchy, restrained motion. Real photography only if real and licensed; otherwise typographic and diagrammatic design.
Avoid: generic SaaS look, rows of identical cards, meaningless icons, gradients, glassmorphism, cartoon medicine, stock doctors, fake reviews/stats/doctors, fear marketing.
Mobile first at 360x780 CSS px (Galaxy S24), then tablet and desktop. Touch targets >=44px, no horizontal scroll, fast.

## 6. Stack
Next.js App Router, TypeScript strict, Tailwind plus a small custom design system, server components/SSG (all medical content in server-rendered HTML), next/font self-hosting, Playwright, GitHub Actions, Vercel previews. CMS: Sanity, added in Phase 5 behind a content interface; earlier phases use typed local content. Justify every dependency.

## 7. Launch scope (one reusable system)
Home; conditions hub; hair-loss page; guide/article template; treatment-information template; how Telegen works; clinical standards/about; clinician/reviewer template; evaluation flow; legal foundation (terms, privacy, cookies). Acne and other topics: modelled in taxonomy and templates, NOT published. Natural Romanian copy, never translated-SaaS tone. No lorem ipsum.

## 7b. Evaluation flow (in-house, UI only for now)
- Build a mobile questionnaire modelled on the Fellos-class assessment: one question per screen, progress indicator, back/next, plain-language wording, summary screen.
- Health answers stay client-side in memory only. Never send, store, log, or put them in URLs, cookies or localStorage. No photo upload.
- The real intake (health data, photos, prescriptions) belongs in app.telegen.ro under a separate reviewed architecture (GDPR special-category data, explicit consent, EU hosting, encryption, processor agreements). Do not build it here.
- Final screen says honestly that the service is not open yet and offers an email notification (email + consent checkbox only) through a storage adapter interface. Ship with the adapter disabled. Propose one EU-region processor and request the account/token as a batched blocker.

## 8. GEO/SEO from the first commit
- Semantic HTML, one H1, descriptive Romanian URLs, canonicals, title templates, meta descriptions, Open Graph, sitemap.xml, robots.txt, breadcrumbs, redirects, 404, alt text, responsive images.
- JSON-LD generated from the same data as the visible page. Never fabricate schema. FAQPage only for visible FAQs; author/reviewer only when real.
- Medical page template: concise answer up top, explanation, FAQs, references, author, medical reviewer + credentials, published/reviewed/updated dates, related links, limitations, next step.
- Internal linking graph: condition <-> symptoms <-> causes <-> treatment information <-> questions. No thin pages.
- Allow Googlebot, Bingbot and OAI-SearchBot on public content. GPTBot (training) is a separate owner decision: explicit documented config, leave unchanged. Ensure no CDN or hosting rule blocks search crawlers. Do not rely on llms.txt.
- Previews and non-production: noindex plus robots disallow.

## 9. Hard compliance rules
1. Never invent doctors, credentials, testimonials, patient counts, success rates, approvals or availability. Unconfirmed items are visibly labelled TEMPORARY and listed in docs/open-items.md.
2. Medical pages are automatically noindex unless data holds a real reviewer name, credential and review date. Enforce at build time and with a test.
3. Efficacy or safety statistics only with a primary source cited on the page. No unsourced percentages.
4. Prescription medicines: assume public promotion of prescription-only medicines is restricted (EU rule; Romanian implementation to be verified by a lawyer). Until sign-off: condition-led CTAs ("Evaluare dermatologica online"); medicine names only in neutral educational content; never in hero, CTA, price or ad-landing blocks; no buy/order language beside a medicine name. Log in docs/legal-review-needed.md.
5. No guarantees, fear framing, or before/after imagery unless real, consented and documented.
6. Footer legal details (company identity, address, ANPC links, contact) are TEMPORARY placeholders until supplied.

## 10. Privacy and security
No health data in URLs, query strings, analytics, logs, localStorage or the public CMS. Analytics and tags load only after granular consent. Tokens in env vars, never committed.

## 11. Quality gates (before any preview is called ready)
Build, tsc and lint pass; links; mobile nav and keyboard; axe clean; Lighthouse mobile with ACTUAL numbers reported; metadata, canonicals, sitemap, robots verified; structured data validated and matching visible content; 404 and redirects; Playwright screenshots at 360, 768, 1280 compared with references. Fix deviations, do not just document them.

## 12. DNS handoff for telegen.ro (only after the owner approves a preview)
1. Ask the owner to screenshot all current DNS records and say where telegen.ro currently points. The existing live site stays up until cutover.
2. Read the required records from the actual Vercel project Domains screen. Never use example values.
3. Give the owner an exact table: record type, name/host, value, TTL, and ADD, CHANGE or REMOVE. Do not touch MX, SPF, DKIM, DMARC or other email records.
4. One canonical host (apex); the other 301s to it.
5. After propagation verify HTTPS, apex, www, redirects, canonical, sitemap, robots, then guide the owner through Google Search Console and Bing Webmaster Tools.
6. Write rollback steps using the old records.

## 13. Phases
0 Foundation -> 1 Reference capture + parity spec -> 2 Design system, layout, navigation -> 3 Pages + evaluation flow (local typed content) -> 4 GEO/SEO -> 5 Sanity -> 6 Consent + analytics hooks -> 7 QA gates -> 8 Preview review on phone -> 9 DNS handoff.

## 14. Status reports
DONE (verified) / IN PROGRESS / NEXT / BLOCKED (owner-only items), with PR, commit and preview links. Never report plans as work done.
