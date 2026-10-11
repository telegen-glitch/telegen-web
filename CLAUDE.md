@AGENTS.md

# Working notes (keep short; the brief below is the source of truth)

- Resume from `docs/STATUS.md` (done / next / blockers). Update it after every work block.
- Package manager: pnpm. Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm e2e`.
- Content lives in `src/content/` (typed, local) behind the interface in `src/content/source.ts`. Sanity plugs in behind the same interface in Phase 5.
- Indexing: the whole site is `noindex` unless `SITE_INDEXING=on` AND `VERCEL_ENV=production` (see `src/lib/site.ts`). Medical pages are additionally `noindex` unless their data has a real reviewer (name, credential, review date) — `src/lib/indexing.ts`, enforced by `tests/unit/indexing.test.ts`, which runs before every build (`prebuild`).
- Health data (v5) is stored only server-side in Supabase EU (Frankfurt) after explicit consent; never in URLs, query strings, analytics, logs, localStorage, non-auth cookies, Stripe metadata or e-mail bodies. Clinical code lives in `src/clinical/` and `src/app/(clinical)/` only (lint + `tests/unit/health-data-scan.test.ts`); RLS per role is tested in `tests/unit/rls.test.ts`.
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
Two systems, strictly separated: SUPERSEDED by v5 (2026-10-11): the clinical flow is built in this repo and served on telegen.ro; separation is enforced inside the code (see "v5 CLINICAL FLOW").
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

## 7b. Evaluation flow (in-house, UI only for now) — SUPERSEDED by v5: answers are stored server-side after consent
- Build a mobile questionnaire modelled on the Fellos-class assessment: one question per screen, progress indicator, back/next, plain-language wording, summary screen.
- Health answers stay client-side in memory only. Never send, store, log, or put them in URLs, cookies or localStorage. No photo upload.
- The real intake (health data, photos, prescriptions) belongs in app.telegen.ro under a separate reviewed architecture (GDPR special-category data, explicit consent, EU hosting, encryption, processor agreements). Do not build it here.
- Final screen says honestly that the service is not open yet and offers an email notification (email + consent checkbox only) through a storage adapter interface. Ship with the adapter disabled. Propose one EU-region processor and request the account/token as a batched blocker.

## 7c. CONDITIONS EXPANSION v3: ACNEE + DISFUNCȚIE ERECTILĂ (overrides section 7 "acne not published")
All earlier rules (parity, compliance, privacy, quality gates, phone-only owner) still apply.

### A. Scope
Publish two new conditions alongside hair loss, in the same system and at the same Fellos parity level: Acnee and Disfuncție erectilă.
Capture fellos.nl/behandeling/acne and /behandeling/erectiestoornis (plus their linked medicine-info pages) at 360/390/1280 for structure and section order only. Never copy their text, images or claims.

### B. Information architecture (verify the medical taxonomy, then finalise)
Each URL must answer one distinct search intent. Merge anything that would be thin.
Acnee:
- /acnee (hub)
- /acnee/tipuri (comedonal, papulo-pustular, nodular/nodulochistic, acnee la adult)
- /acnee/cauze
- /acnee/tratament (stepwise: topical, combined, oral; when specialist care is needed)
- /acnee/cicatrici
Disfuncție erectilă:
- /disfunctie-erectila (hub)
- /disfunctie-erectila/cauze (vascular, hormonal, neurological, psychological, medication, lifestyle)
- /disfunctie-erectila/tratament (lifestyle, oral treatment, counselling, specialist options)
- /disfunctie-erectila/sanatatea-inimii (ED as a cardiovascular warning sign; evidence-based)
Medicine information (neutral education, under the existing treatment-info template): benzoyl peroxide, adapalene, tretinoin, topical clindamycin (in combination only), doxycycline/lymecycline, isotretinoin (education only, not prescribed via Telegen: EU specialist supervision and pregnancy-prevention programme), sildenafil, tadalafil.
Update: conditions hub, header mega-menu, mobile menu, topic-picker (all three selectable), homepage condition cards, footer, breadcrumbs, sitemap.

### C. Medical content standards
- Write from primary or authoritative sources that you fetch and read, never from memory: EAU Guidelines on Sexual and Reproductive Health; the European (EuroGuiDerm/S3) acne guideline; NICE NG198 (acne); EMA product information / ANMDM RCP for every medicine; peer-reviewed reviews where needed.
- Cite every clinical claim on the page with a linked reference list. No statistic without a source.
- Correct Romanian medical terminology and diacritics. Calm, discreet, non-shaming tone.
- Every page follows the section 8 medical template and includes a "Când ai nevoie de consult în persoană" block derived from the guidelines. Minimum:
  - ED: chest pain or heart symptoms, erection lasting over 4 hours (emergency), sudden onset after injury, penile curvature or pain.
  - Acne: nodular/scarring acne, fever with severe acne, sudden severe adult-onset acne.
- ED copy: no sexual imagery, no performance or size claims, no "buy" language next to a medicine name. Acne: no "cure" claims, no before/after imagery.

### D. Evaluation flows (UI only, answers in memory only, per 7b)
Condition-specific questionnaires in the existing flow pattern.
- ED: mandatory safety screens: nitrates or riociguat, recent heart attack or stroke, chest pain on exertion, uncontrolled blood pressure, severe liver/kidney disease, alpha-blockers. Any positive answer leads to a hard-stop screen recommending in-person care, with no continue option.
- Acne: severity, duration, prior treatments, isotretinoin history, current medicines. No photo upload. Red flags lead to a hard-stop screen.
- Do not reproduce validated questionnaires (e.g. IIEF-5) verbatim unless their licence is verified. Log it in docs/legal-review-needed.md.
- Add a per-condition serviceOpen flag (default OFF). While OFF, the final screen shows the honest "not open yet" notification step.

### E. SEO
- Research Romanian search intent per condition: Google autocomplete, People Also Ask, related searches, and the top-ranking Romanian pages. Write docs/keywords-ro.md mapping keyword clusters to URLs, one primary intent per URL.
- Unique title and meta description per page, canonicals, sitemap entries, lang="ro", descriptive alt text, descriptive internal anchor text.
- Internal links: condition hub to subpages to medicine pages to evaluation, cross-links (acne with hair loss under dermatology; ED with heart health), related links at the end of each page.

### F. GEO
- A 40-60 word answer-first paragraph at the top of every page that can be quoted on its own.
- Question-led H2s matching real queries, short definitions, sourced comparison tables (e.g. sildenafil vs tadalafil; topical options compared), clear entity naming.
- JSON-LD only for visible content: MedicalWebPage with about: MedicalCondition (alternateName, signOrSymptom, riskFactor, possibleTreatment as shown on the page); Drug on medicine pages (activeIngredient, prescriptionStatus); FAQPage for visible FAQs; BreadcrumbList; dates; reviewedBy only when real.
- All substantive content in server-rendered HTML. Crawler rules unchanged (OAI-SearchBot allowed).

### G. Compliance additions
- Medicine names never in hero, CTA, price or ad-landing blocks. Log Meta's sexual-health ad restrictions and Romanian Rx-advertising rules in docs/legal-review-needed.md.
- Pages stay noindex until a real reviewer of the right specialty is attached (dermatology for acne; GP or urology for ED). List the required reviewers in docs/open-items.md.

### H. QA
All section 11 gates, plus:
- a source check (every claim cited),
- Playwright tests that each red-flag answer reaches a hard stop,
- a parity comparison against the Fellos acne and ED pages.

### I. Report (phone-sized)
Preview link first, then the list of new URLs, then the reviewers and blockers needed, in at most 5 bullets.

## v4. FINAL BUILD (launch-ready site)
Execute end to end without stopping for confirmation, on branch claude/telegen-production-build-sv94k7.

HARD RULES (unchanged): never touch DNS; production stays noindex (SITE_INDEXING off) until the owner launches; serviceOpen stays OFF for every condition; never invent clinicians, reviews, statistics, sources or press; medicine names never in hero, CTA, price or ad blocks; no health data in URLs, analytics, logs or storage; never report planned work as done.

### A. Sources and research first
1. Fetch and read the sources before writing: EuroGuiDerm acne guideline (2025 update, guidelines.edf.one), NICE NG198, AAD 2024 acne guideline (doi 10.1016/j.jaad.2023.12.017), EAU Guidelines on Sexual and Reproductive Health (latest), EMA product information and referrals (sildenafil, tadalafil, isotretinoin/retinoids, oral tetracyclines, finasteride), ANMDM nomenclator (nomenclator.anm.ro) for Romanian prescription status. Verify every entry in src/content/sources.ts (URL resolves, citation correct); fix wrong ones.
2. Romanian keyword research (autocomplete, People Also Ask, related searches, top-ranking RO pages) for every URL in docs/keywords-ro.md plus hair loss. Finalize docs/keywords-ro.md (one primary intent per URL; merge URLs without distinct intent into the hub). Use PAA questions for H2s and FAQs.
3. Capture fellos.nl (home, a condition page, acne and ED or equivalent) and 2 competitors with scripts/capture-reference.mjs. Complete docs/token-map.md and docs/motion-spec.md with measured values. Run the §4c.E parity passes (3 loops) on home, hair loss, acne and ED at 360 and 1280.

### B. Write and publish acne + ED (all 17 pages)
Write all draft pages in Romanian (ș ț comma-below) from the sources read in A and set status "published": /acnee (+ tipuri, cauze, tratament, cicatrici); /disfunctie-erectila (+ cauze, tratament, sanatatea-inimii); /tratamente: peroxid-de-benzoil, adapalen, tretinoin, clindamicina-topica, doxiciclina-limeciclina, isotretinoin (information only), sildenafil, tadalafil.
Every page: answer-first "Pe scurt" of 40–60 words; H2s from real PAA questions; every section cited; 4–6 FAQs; limitations; related links (≥3 in, ≥3 out, no orphans); medical review meta; MedicalCondition entity or Drug data with terms visible on the page. Length: hubs 1,200–1,800 words, subpages 900–1,400, medicine pages 700–1,100. Medicine pages neutral, no CTA, no price. ED: no performance or size language, discreet, cardiovascular link explained, nitrate and riociguat warnings prominent. Acne: when to see a doctor in person (nodules, scarring, sudden adult onset).
Make all three conditions available across the site (hero, chips, cards, topic picker, mega-menu, mobile menu, footer, /afectiuni, /ghiduri, /tratamente, evaluation topic screen). Delete the "Pregătim protocolul clinic…" copy and the upcoming-topic path if unused. Recheck every acne/ED hard-stop and safety text against the sources.

### C. GEO / SEO fixes
1. ConditionView: no hard-coded hair-loss wording; per-condition data. ED never mentions dermatologist.
2. Move the hair-loss hub to /caderea-parului; 301 /afectiuni/caderea-parului, /alopecie, /alopecie-androgenetica to it; remove the old reverse redirect; update links, breadcrumbs, routes, sitemap, tests. /afectiuni stays the listing hub.
3. Positioning: Telegen is an online men's health clinic. Rewrite homepage title, description and hero, root default title, siteConfig.description and hub metadata to cover every published condition (lists generated from published content). No medicine names.
4. Hair-loss hub entity and minoxidil/finasteride drug data filled (terms visible; prescription status per ANMDM).
5. Cite the 8 PENDING_CITATION hair-loss sections from verified sources (rewrite or remove unsourced claims), then delete the allowance.
6. Titles ≤ 60 characters including " | Telegen"; meta descriptions 120–160. Unit test.
7. Open Graph images per page with next/og (title + brand, no medicine names on condition pages); twitter:card summary_large_image.
8. `pnpm geo:report` → docs/geo-status.md from allRoutes() + content (index status + reason, title/description length, answer-first word count, FAQs, sources, links in/out, schema types).

### D. Clinician privacy model (owner decision: 2 real accredited doctors, never named or pictured publicly)
1. Clinician kind "team-member": opaque id (e.g. "derm-1"), specialty, credential type. No names, parafă codes or photos anywhere in the repo, docs, commits or schema. Remove the placeholder role page.
2. /echipa-medicala: team by specialty and CMR registration; every patient receives the doctor's name and parafă code before the consult. No photos, no invented people, no stock images.
3. Review = { reviewerId, reviewedAt }. Indexing gate: published + reviewerId of a real team member + valid date. Visible line: "Revizuit medical de un medic [specialitate] din echipa Telegen · {data}", linked to /politica-editoriala.
4. Schema: reviewedBy = Organization (#organizatie) + lastReviewed, only when the visible line shows. Never a Person. Tested.
5. Remove every promise that doctors will be "prezentați pe site cu nume, grad profesional și cod de parafă".
6. Do NOT mark any page as reviewed. docs/REVIEW.md: how the owner records a review (file, fields, one commit per page) and a per-page doctor sign-off checklist. The owner keeps the name-to-id log privately, outside the repo.

### E. Missing pieces for a final build
1. /contact: company identity (siteConfig, TEMPORARY until supplied), contact email, response time, "nu oferim sfaturi medicale prin e-mail". In footer and sitemap.
2. /politica-editoriala: writing and review process, source selection, update cycle, corrections, honest AI-assistance note (EU AI Act Art. 50 → docs/legal-review-needed.md).
3. Footer legal block: company name, CUI, Reg. Com., address (TEMPORARY), ANPC SAL link; verify the current Romanian requirement (incl. EU ODR link) and record it in docs/legal-review-needed.md.
4. Content-Security-Policy compatible with next/font, JSON-LD and consent; keep existing headers; no console CSP errors.
5. GOOGLE_SITE_VERIFICATION / BING_SITE_VERIFICATION env vars, rendered only when set and only in production.
6. Per-condition price config (empty); Pricing renders only when the flag is on AND a price exists. No placeholder prices.
7. docs/LAUNCH.md: exact owner steps (Vercel env vars incl. SITE_INDEXING=on, adding telegen.ro in Vercel and copying the DNS records Vercel shows, keeping email DNS untouched, submitting sitemap.xml in Search Console and Bing, pricing flag, prerequisites for any serviceOpen).
8. docs/clinical-app-architecture.md: design only, for app.telegen.ro (EU hosting, accounts, GDPR art. 9 consent, encrypted intake, photo upload, doctor dashboard, e-prescription handoff, payments, pharmacy fulfilment, audit log, retention), options and costs, for owner + lawyer review.
9. Fix anything else a launch-ready, Fellos-class site needs; list each addition in STATUS.md.

### F. Quality gates and report
Format, lint, typecheck, unit, build, e2e (all routes at 360/768/1280, axe AA, hard-stop paths), Lighthouse mobile on home and one page per condition (Performance ≥ 90, Accessibility 100, SEO 100 except intended noindex). Logical commits, push, keep PR #1 current. Update STATUS.md, open-items.md, geo-status.md. Final report: every item DONE / NOT DONE / BLOCKED with reason, plus open owner decisions.

## v4.7 LAUNCH STATE (owner decision; overrides earlier pre-launch rules where they conflict)
- `siteConfig.launchState` is "open" by default on previews and production; "prelaunch" is only a fallback mode. All pre-launch strings live in `src/lib/prelaunch-copy.ts` and render only in "prelaunch".
- `serviceOpen` follows the launch state (open for every condition when "open"); this replaces "serviceOpen stays OFF" and the §7b "not open yet" final screen. The evaluation ends with "Continuă către consult": a POST of the chosen condition only to `CLINICAL_APP_URL`; answers never leave the browser and the app asks again (docs/clinical-app-architecture.md §4b).
- No "TEMPORARY", pre-launch or waitlist wording on public pages (replaces the visible TEMPORARY labels of §9.1 and §9.6). Owner values live in `src/lib/launch-config.ts`; a missing one shows "[lipsește: …]" on previews only and the prebuild launch lock fails the production build until it is supplied. Never invent a value to pass the lock.
- Unreviewed medical pages show "Scris de echipa editorială Telegen pe baza ghidurilor citate · actualizat {dată}" and stay noindex. Indexing rules, DNS rules and every other hard rule are unchanged.

## v5 CLINICAL FLOW INSIDE THIS SITE (owner decision 2026-10-11; overrides §1 "two systems", §7b and the v4.7 hand-over)
- One repo, one Vercel project. Clinical code: `src/clinical/` (`import "server-only"` for data access) and the route group `src/app/(clinical)/`: /evaluare, /cont, /medic (2FA mandatory), /farmacie, /admin, plus `src/app/api/`. ESLint forbids importing clinical code anywhere else. Clinical routes are dynamic, noindex, disallowed in robots.txt, out of the sitemap, without analytics or third-party scripts, with a nonce CSP (src/proxy.ts).
- Data: Supabase EU (Frankfurt), schema `clinical` (not exposed to Supabase's REST API), RLS on every table, queries run as the signed-in user's role; doctors need aal2; pharmacies see a narrow view without the condition; admins see operations, never answers, photos or messages; every read/write of health data is audited (who, when, which record, never content). Local/CI use PGlite with the same migrations.
- Model: free evaluation (all hard stops kept) → personal proposed plan with the medicine named and the price (logged-in only) → pay at the end, card authorised not charged → a Telegen doctor reviews within the SLA (default 24 h) → approved: capture, prescription, partner pharmacy delivers free and discreetly; not prescribed: authorisation released in full → free follow-up messages, pause or cancel anytime, periodic re-review.
- Lawyer (reported by the owner, 2026-10-11): medicine names with a price only inside the logged-in proposal and checkout; public pages keep the old rule (no medicine names in hero, CTA, price or ad blocks; public price blocks say "Plan pentru căderea părului").
- Real patients only when APP_LAUNCH=on in production and the launch checks pass (company details, Stripe live keys, pharmacy split, doctor accounts with 2FA, legal texts). Previews: Stripe test mode, seeded data marked TEST. Doctor identities live only in the database.

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
