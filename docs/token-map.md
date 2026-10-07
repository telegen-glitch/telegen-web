# Token map (Fellos measurement → Telegen token)

**Status: Fellos column NOT YET MEASURED.** fellos.nl is blocked by this environment's network policy
(container egress and the web-fetch tool, 2026-10-05). `scripts/capture-reference.mjs` is ready and writes
measurements to `/reference/measurements.json` (gitignored). Until it runs, Telegen values below are the
implemented tokens; the Fellos column is filled in by the capture and the Telegen value is then moved to
match proportions within ~10% (CLAUDE.md §4c.E). Colours and fonts stay Telegen's own regardless.

| Role                     | Fellos (measured) | Telegen token                      | Telegen value (360 / 768 / 1280)              |
| ------------------------ | ----------------- | ---------------------------------- | --------------------------------------------- |
| H1 display               | pending           | `text-display-1`                   | 40 / 56 / 68px, lh 1.04, ls −0.035em, 600     |
| H2 section               | pending           | `text-display-2`                   | 32 / 44 / 52px, lh 1.08, ls −0.03em, 600      |
| H3 card/step             | pending           | `text-display-3`                   | 24 / 30px, lh 1.18, 600                       |
| Italic accent            | pending           | `.accent`                          | Newsreader italic 400, inherits size          |
| Lead                     | pending           | `text-lead`                        | 18 / 20px, lh 1.55                            |
| Body                     | pending           | `text-base`                        | 17px / 26.5px                                 |
| Eyebrow                  | pending           | `text-eyebrow`                     | 13px, 600, +0.06em, uppercase                 |
| Announcement bar         | pending           | SiteChrome bar                     | min-h 36px, 13px                              |
| Header height            | pending           | SiteHeader                         | 64 / 64 / 76px                                |
| Container                | pending           | `container-page`                   | max 1280px, gutters 20 / 32 / 40px            |
| Section padding          | pending           | `section-y`                        | 64 / 64 / 112px                               |
| Card radius              | pending           | `rounded-card` / `rounded-card-lg` | 24px / 32px                                   |
| Button                   | pending           | `buttonClasses` lg / md            | 52px / 44px tall, pill, 28px / 20px x-padding |
| Grid gap (cards)         | pending           | `gap-4`                            | 16px                                          |
| Card shadow              | pending           | `--shadow-card`                    | 0 1 2 / 0 8 24 −12, navy 4–12%                |
| Header shadow (scrolled) | pending           | `--shadow-header`                  | hairline + 0 6 20 −12                         |
| Phone mockup             | pending           | `PhoneMockup`                      | 200 / 248 / 272px wide, radius 42px           |
