import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Hero condition panels (CLAUDE.md v4.3): click, keyboard, chips, topic hand-over, motion, axe. */

const button = (page: import("@playwright/test").Page, name: RegExp) =>
  page.locator(".cp-panels").getByRole("button", { name });

test("one panel per condition, the first open; a click opens another", async ({ page }) => {
  await page.goto("/");
  const buttons = page.locator(".cp-button");
  await expect(buttons).toHaveCount(3);
  await expect(buttons.first()).toHaveAttribute("aria-expanded", "true");
  await button(page, /Acnee/).click();
  await expect(button(page, /Acnee/)).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#panou-acnee")).toBeVisible();
  await expect(page.locator("#panou-caderea-parului")).toBeHidden();
  // Every panel's content is in the server HTML, open or not.
  const html = await (await page.request.get("/")).text();
  for (const id of ["panou-caderea-parului", "panou-acnee", "panou-disfunctie-erectila"])
    expect(html).toContain(`id="${id}"`);
});

test("arrow keys move between panels and open them; Enter opens", async ({ page }) => {
  await page.goto("/");
  await page.locator(".cp-button").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(button(page, /Acnee/)).toBeFocused();
  await expect(button(page, /Acnee/)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("End");
  await expect(button(page, /Disfuncție/)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowLeft");
  await expect(button(page, /Disfuncție/)).toBeFocused();
  await button(page, /Acnee/).focus();
  await page.keyboard.press("Enter");
  await expect(button(page, /Acnee/)).toHaveAttribute("aria-expanded", "true");
});

test("a hero chip opens its panel and stays on the page", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("list", { name: "Afecțiuni" })
    .getByRole("link", { name: "Disfuncție erectilă" })
    .click();
  await expect(button(page, /Disfuncție/)).toHaveAttribute("aria-expanded", "true");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#panou-disfunctie-erectila")).toBeInViewport();
});

test("the panel CTA hands its topic to the evaluation in memory, not in the URL", async ({ page }) => {
  await page.goto("/");
  await button(page, /Acnee/).click();
  await page.getByRole("link", { name: "Începe evaluarea pentru acnee" }).click();
  await expect(page).toHaveURL(/\/evaluare$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Acneea");
});

test("reduced motion: posters only, no WebGL scene, and the ED line drawn whole and still", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(3500);
  await expect(page.locator(".cp-canvas[data-live]")).toHaveCount(0);
  for (const kind of ["hair", "skin"])
    await expect(page.locator(`img.cp-poster[data-kind="${kind}"]`)).toHaveCount(1);
  await expect(page.locator('.cp-panel[data-open] img.cp-poster[data-kind="hair"]')).toBeVisible();
  const trace = page.locator(".cp-trace");
  await expect(trace).toHaveCount(1);
  expect(await trace.evaluate((e) => getComputedStyle(e).animationName)).toBe("none");
  expect(parseFloat(await trace.evaluate((e) => getComputedStyle(e).strokeDashoffset))).toBe(0);
});

test("without a GPU the scene declines and the poster stays", async ({ page }) => {
  await page.goto("/");
  const software = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    return /swiftshader|llvmpipe|software/i.test(
      String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER)),
    );
  });
  test.skip(!software, "this browser has a GPU");
  await page.locator(".cp-panels").scrollIntoViewIfNeeded();
  await page.waitForTimeout(4000);
  await expect(page.locator(".cp-canvas[data-live]")).toHaveCount(0);
  await expect(page.locator('.cp-panel[data-open] img.cp-poster[data-kind="hair"]')).toBeVisible();
});

test("without WebGL the posters stay and nothing breaks", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    // Simulate a browser without WebGL2.
    Object.defineProperty(window, "WebGL2RenderingContext", { value: undefined });
  });
  await page.goto("/");
  await button(page, /Acnee/).click();
  await page.waitForTimeout(3500);
  await expect(page.locator(".cp-canvas[data-live]")).toHaveCount(0);
  await expect(page.locator('.cp-panel[data-open] img.cp-poster[data-kind="skin"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test("one live scene at a time, none for ED, no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  // CI browsers render WebGL in software; the site skips that, so opt in for this test.
  await page.addInitScript(() => {
    (window as Window & { __telegenSoftwareGL?: boolean }).__telegenSoftwareGL = true;
  });
  await page.goto("/");
  const webgl = await page.evaluate(() => Boolean(document.createElement("canvas").getContext("webgl2")));
  await page.locator(".cp-panels").scrollIntoViewIfNeeded();
  if (webgl)
    await expect(page.locator(".cp-panel[data-open] .cp-canvas[data-live]")).toHaveCount(1, {
      timeout: 15000,
    });
  await button(page, /Acnee/).click();
  await page.locator(".cp-panel[data-open]").scrollIntoViewIfNeeded();
  if (webgl) {
    await expect(page.locator('[data-panel="acnee"] .cp-canvas[data-live]')).toHaveCount(1, {
      timeout: 15000,
    });
    await expect(page.locator(".cp-canvas[data-live]")).toHaveCount(1);
  }
  await button(page, /Disfuncție/).click();
  await page.waitForTimeout(1500);
  await expect(page.locator(".cp-canvas[data-live]")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("closed panels show a still poster or the whole ED line", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.cp-panel:not([data-open]) img.cp-poster[data-kind="skin"]')).toHaveCount(1);
  const trace = page.locator(".cp-panel:not([data-open]) .cp-trace");
  await expect(trace).toHaveCount(1);
  expect(await trace.evaluate((e) => getComputedStyle(e).animationName)).toBe("none");
  expect(parseFloat(await trace.evaluate((e) => getComputedStyle(e).strokeDashoffset))).toBe(0);
});

test("axe clean with another panel open", async ({ page }, info) => {
  test.skip(info.project.name === "tablet-768");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await button(page, /Disfuncție/).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: `artifacts/screenshots/${info.project.name}/_panels-ed.png` });
});

test("the condition hub shows its own panel, without switching", async ({ page }) => {
  await page.goto("/acnee");
  const panel = page.locator(".cp-single");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Ce analizează medicul")).toBeVisible();
  await expect(panel.locator(".cp-node")).toHaveCount(4);
  await expect(panel.getByRole("button")).toHaveCount(0);
  await expect(panel.locator('img.cp-poster[data-kind="skin"]')).toHaveCount(1);
});
