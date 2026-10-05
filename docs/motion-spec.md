# Motion spec

**Status: timings are Telegen's implementation; Fellos timings NOT YET MEASURED** (site blocked, see
token-map.md). After capture, each duration is adjusted to within ~20% of the reference video.
All motion: transform/opacity only (no layout shift), disabled under `prefers-reduced-motion: reduce`,
never applied to the hero headline (LCP). No animation library: CSS + one IntersectionObserver
(`src/components/motion/RevealObserver.tsx`).

| Animation                               | Trigger                                        | Property                                                   | Duration      | Easing                           | Delay / stagger                       | Distance |
| --------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- | ------------- | -------------------------------- | ------------------------------------- | -------- |
| Section reveal (`[data-reveal]`)        | 12% in view, −12% bottom margin, once          | opacity 0→1, translateY                                    | 700ms         | `--ease-out-soft` (0.16,1,0.3,1) | 90ms × index in `[data-reveal-group]` | 24px     |
| Reveal "scale" (mobile phone mockups)   | same                                           | opacity, translateY + scale .97→1                          | 700ms         | same                             | —                                     | 16px     |
| How-we-help phone screen swap (desktop) | step crosses viewport centre (rootMargin −45%) | opacity, translateY                                        | 500ms         | `--ease-calm` (0.22,0.61,0.36,1) | —                                     | 16px     |
| How-we-help step text dimming           | same                                           | opacity 0.35↔1                                             | 500ms         | linear                           | —                                     | —        |
| Header shadow                           | scrollY > 8px                                  | box-shadow                                                 | 300ms         | default                          | —                                     | —        |
| Mega-menu open                          | hover 80ms / click / Enter                     | opacity, translateY                                        | 260ms         | `--ease-out-soft`                | close on leave after 160ms            | −8px     |
| Mobile menu open                        | menu button                                    | opacity (sheet); items opacity + translateY                | 320ms / 420ms | `--ease-out-soft`                | 60ms per group                        | −8px     |
| Hamburger ↔ close icon                  | menu button                                    | rotate ±45°, translateY                                    | 300ms         | `--ease-calm`                    | —                                     | 4px      |
| Topic picker open/close                 | CTA click / Escape / backdrop                  | opacity, translateY (dialog); backdrop colour              | 420ms / 320ms | `--ease-out-soft`                | —                                     | 40px     |
| FAQ accordion                           | summary click                                  | block-size 0↔auto (`::details-content`), icon rotate/scale | 320ms         | `--ease-calm`                    | —                                     | —        |
| Quiz step enter                         | new question                                   | opacity, translateX                                        | 360ms         | `--ease-out-soft`                | —                                     | 20px     |
| Quiz progress bar                       | answer                                         | width                                                      | 500ms         | `--ease-calm`                    | —                                     | —        |
| Buttons press                           | active                                         | scale 0.98                                                 | 200ms         | `--ease-calm`                    | —                                     | —        |
| Card hover                              | hover                                          | translateY                                                 | 300ms         | `--ease-calm`                    | —                                     | −4px     |
