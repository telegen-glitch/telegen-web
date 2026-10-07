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

test("reduced motion renders the panels static", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const anim = (sel: string) =>
    page
      .locator(sel)
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
  expect(await anim(".cp-panel[data-open] .cp-trace")).toBe("none");
  // The static frame is the whole line, not a half-drawn one.
  const offsets = await page
    .locator(".cp-trace")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).strokeDashoffset));
  expect(offsets.length).toBe(3);
  for (const o of offsets) expect(parseFloat(o)).toBe(0);
  expect(await anim(".cp-panel[data-open] .cp-route-line")).toBe("none");
  expect(await anim(".cp-panel[data-open] .cp-region")).toBe("none");
});

test("closed panels show their line whole and still", async ({ page }) => {
  await page.goto("/");
  const closed = page.locator(".cp-panel:not([data-open]) .cp-trace");
  await expect(closed).toHaveCount(2);
  for (const el of await closed.all()) {
    expect(await el.evaluate((e) => getComputedStyle(e).animationName)).toBe("none");
    expect(parseFloat(await el.evaluate((e) => getComputedStyle(e).strokeDashoffset))).toBe(0);
  }
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
});
