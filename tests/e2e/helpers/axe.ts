import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * WCAG A/AA violations on a settled page. After a Server Action refresh,
 * Next.js streams the page metadata back in, so the <title> can be briefly
 * empty: wait for it first. Colour transitions (e.g. a selected answer turning
 * navy) are waited out too, so contrast is measured on the final colours.
 * A "document-title" result caught mid-refresh is re-checked once the title is
 * back. Returns "rule: targets" lines.
 */
async function settle(page: Page) {
  await expect(page).toHaveTitle(/\S/);
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running" || a instanceof CSSAnimation),
  );
  await expect(page).toHaveTitle(/\S/);
}

export async function axeViolations(page: Page): Promise<string[]> {
  for (let attempt = 0; ; attempt++) {
    await settle(page);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const raced =
      result.violations.some((v) => v.id === "document-title") && (await page.title()).trim() !== "";
    if (raced && attempt < 2) continue;
    return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  }
}
