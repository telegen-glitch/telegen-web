// Reference capture for docs/token-map.md and docs/motion-spec.md (CLAUDE.md §4c.A).
// Writes ONLY to /reference (gitignored). Never commit or publish its output.
// Usage: node scripts/capture-reference.mjs [baseUrl]   (default https://www.fellos.nl)
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = (process.argv[2] ?? "https://www.fellos.nl").replace(/\/$/, "");
const OUT = new URL("../reference/", import.meta.url).pathname;
const PAGES = [
  "/",
  "/en",
  "/behandeling/haaruitval",
  "/hoe-het-werkt",
  "/over-ons/onze-zorgverleners",
  "/kennisbank",
  "/medicijn-informatie",
  "/quiz/start",
];
const VIEWPORTS = [
  { name: "360", width: 360, height: 780, mobile: true },
  { name: "390", width: 390, height: 844, mobile: true },
  { name: "1280", width: 1280, height: 800, mobile: false },
];
const slug = (p) => (p === "/" ? "home" : p.slice(1).replace(/\//g, "__"));

async function dismissCookies(page) {
  // Prefer the least-tracking choice; never accept marketing cookies.
  const btn = page.getByRole("button", {
    name: /weiger|alleen noodzakelijk|noodzakelijk|reject|decline|deny/i,
  });
  if (
    await btn
      .first()
      .isVisible()
      .catch(() => false)
  )
    await btn
      .first()
      .click()
      .catch(() => {});
}

/** Computed styles for the token map. */
async function measure(page) {
  return page.evaluate(() => {
    const pick = (el, props) => {
      const cs = getComputedStyle(el);
      return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
    };
    const typeProps = [
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "font-style",
      "color",
    ];
    const first = (sel) => document.querySelector(sel);
    const out = {
      type: {},
      header: null,
      buttons: [],
      sections: [],
      containers: [],
      grids: [],
      cards: [],
      transitions: [],
      keyframes: [],
      fonts: [],
    };
    for (const sel of ["h1", "h2", "h3", "h4", "p", "body", "li", "small", "em", "i"]) {
      const el = first(`main ${sel}`) ?? first(sel);
      if (el) out.type[sel] = { text: el.textContent?.trim().slice(0, 40), ...pick(el, typeProps) };
    }
    const header = first("header");
    if (header)
      out.header = {
        height: header.getBoundingClientRect().height,
        ...pick(header, [
          "position",
          "top",
          "background-color",
          "box-shadow",
          "border-bottom",
          "backdrop-filter",
          "transition",
        ]),
      };
    const btns = [...document.querySelectorAll("a, button")].filter((b) => {
      const cs = getComputedStyle(b);
      return cs.backgroundColor !== "rgba(0, 0, 0, 0)" && b.getBoundingClientRect().height >= 32;
    });
    for (const b of btns.slice(0, 12)) {
      const r = b.getBoundingClientRect();
      out.buttons.push({
        text: b.textContent?.trim().slice(0, 30),
        width: r.width,
        height: r.height,
        ...pick(b, [
          "padding",
          "border-radius",
          "font-size",
          "font-weight",
          "letter-spacing",
          "background-color",
          "color",
          "border",
          "box-shadow",
          "transition",
        ]),
      });
    }
    for (const s of [...document.querySelectorAll("main > *, main section, body > section")].slice(0, 40)) {
      const r = s.getBoundingClientRect();
      out.sections.push({
        tag: s.tagName,
        cls: String(s.className).slice(0, 80),
        top: r.top + scrollY,
        height: r.height,
        ...pick(s, ["padding-top", "padding-bottom", "margin-top", "background-color"]),
      });
    }
    for (const el of document.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      if (cs.maxWidth !== "none" && cs.maxWidth.endsWith("px") && parseFloat(cs.maxWidth) > 600)
        out.containers.push({
          cls: String(el.className).slice(0, 60),
          maxWidth: cs.maxWidth,
          paddingInline: cs.paddingLeft,
        });
      if ((cs.display === "grid" || cs.display === "flex") && cs.gap !== "normal" && el.children.length >= 3)
        out.grids.push({
          cls: String(el.className).slice(0, 60),
          display: cs.display,
          gap: cs.gap,
          cols: cs.gridTemplateColumns,
        });
      if (parseFloat(cs.borderTopLeftRadius) >= 8 && el.getBoundingClientRect().height > 120)
        out.cards.push({
          cls: String(el.className).slice(0, 60),
          radius: cs.borderRadius,
          shadow: cs.boxShadow,
          bg: cs.backgroundColor,
          padding: cs.padding,
        });
      if (cs.transitionDuration !== "0s" || cs.animationName !== "none")
        out.transitions.push({
          cls: String(el.className).slice(0, 60),
          transition: cs.transition,
          animation: `${cs.animationName} ${cs.animationDuration} ${cs.animationTimingFunction} ${cs.animationDelay}`,
        });
    }
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules)
          if (rule.type === CSSRule.KEYFRAMES_RULE) out.keyframes.push(rule.cssText.slice(0, 600));
      } catch {
        /* cross-origin sheet */
      }
    }
    document.fonts.forEach((f) => out.fonts.push(`${f.family} ${f.weight} ${f.style}`));
    out.containers = out.containers.slice(0, 30);
    out.grids = out.grids.slice(0, 40);
    out.cards = out.cards.slice(0, 40);
    out.transitions = out.transitions.slice(0, 80);
    return out;
  });
}

async function sectionCrops(page, dir) {
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll("header, main > *, main section, footer")]
      .map((el) => el.getBoundingClientRect())
      .map((r) => ({ y: Math.round(r.top + scrollY), h: Math.round(r.height), w: Math.round(r.width) }))
      .filter((b) => b.h > 80),
  );
  let i = 0;
  for (const b of boxes.slice(0, 30)) {
    await page
      .screenshot({
        path: `${dir}/section-${String(i++).padStart(2, "0")}.png`,
        clip: { x: 0, y: b.y, width: b.w, height: Math.min(b.h, 4000) },
        fullPage: true,
      })
      .catch(() => {});
  }
}

async function slowScroll(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 120) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(60);
  }
}

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });
const report = {};

for (const vp of VIEWPORTS) {
  for (const path of PAGES) {
    const dir = `${OUT}${vp.name}/${slug(path)}`;
    await mkdir(dir, { recursive: true });
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      locale: "nl-NL",
      recordVideo: { dir, size: { width: vp.width, height: vp.height } },
    });
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + path, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(1500);
      await dismissCookies(page);
      await page.screenshot({ path: `${dir}/viewport.png` });
      await slowScroll(page);
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${dir}/full.png`, fullPage: true });
      await sectionCrops(page, dir);
      report[`${vp.name} ${path}`] = await measure(page);
      // Sticky header behaviour: screenshot after scrolling down then up a little.
      await page.evaluate(() => scrollTo(0, 900));
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${dir}/scrolled-900.png` });
      await page.evaluate(() => scrollTo(0, 700));
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${dir}/scrolled-up.png` });

      if (path === "/") {
        await page.evaluate(() => scrollTo(0, 0));
        // Navigation: mobile menu or desktop mega-menu.
        const nav = vp.mobile
          ? page
              .locator("header button[aria-label], header button")
              .filter({ hasNotText: /\w{4,}/ })
              .first()
          : page.locator("header [aria-expanded], header nav button, header nav a").first();
        if (await nav.isVisible().catch(() => false)) {
          await (vp.mobile ? nav.click() : nav.hover());
          await page.waitForTimeout(900);
          await page.screenshot({ path: `${dir}/nav-open.png` });
          await page.keyboard.press("Escape");
          if (vp.mobile) await nav.click().catch(() => {});
          await page.waitForTimeout(900);
        }
        // Topic picker: the primary CTA usually opens a modal.
        const cta = page
          .locator("main a, main button")
          .filter({ hasText: /start|consult|begin/i })
          .first();
        if (await cta.isVisible().catch(() => false)) {
          await cta.click().catch(() => {});
          await page.waitForTimeout(1000);
          if (
            await page
              .locator("[role=dialog], dialog[open]")
              .first()
              .isVisible()
              .catch(() => false)
          ) {
            await page.screenshot({ path: `${dir}/topic-picker.png` });
            await page.keyboard.press("Escape");
            await page.waitForTimeout(800);
          } else if (!page.url().startsWith(BASE + "/")) {
            await page.goBack();
          }
        }
        // FAQ accordion.
        const faq = page.locator("details > summary, main [aria-expanded=false]").last();
        if (await faq.isVisible().catch(() => false)) {
          await faq.scrollIntoViewIfNeeded();
          await faq.click().catch(() => {});
          await page.waitForTimeout(900);
          await page.screenshot({ path: `${dir}/faq-open.png` });
        }
        // Carousels: drag the first horizontally scrollable track.
        const track = await page.evaluateHandle(() =>
          [...document.querySelectorAll("*")].find(
            (el) =>
              el.scrollWidth > el.clientWidth + 40 && /auto|scroll/.test(getComputedStyle(el).overflowX),
          ),
        );
        const el = track.asElement();
        if (el) {
          await el.scrollIntoViewIfNeeded();
          const b = await el.boundingBox();
          if (b) {
            await page.mouse.move(b.x + b.width * 0.8, b.y + b.height / 2);
            await page.mouse.down();
            await page.mouse.move(b.x + b.width * 0.2, b.y + b.height / 2, { steps: 20 });
            await page.mouse.up();
            await page.waitForTimeout(900);
            await page.screenshot({ path: `${dir}/carousel-swiped.png` });
          }
        }
      }
    } catch (e) {
      report[`${vp.name} ${path}`] = { error: String(e) };
    }
    await ctx.close(); // flushes the video for this page
  }
}

await writeFile(`${OUT}measurements.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(`Captured ${Object.keys(report).length} page/viewport combinations into ${OUT}`);
