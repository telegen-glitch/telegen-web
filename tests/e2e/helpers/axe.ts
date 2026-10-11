import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * WCAG A/AA violations on a settled page. After a Server Action refresh,
 * Next.js streams the page metadata back in, so the <title> can be briefly
 * empty: wait for it first, then scan. Returns "rule: targets" lines.
 */
export async function axeViolations(page: Page): Promise<string[]> {
  await expect(page).toHaveTitle(/\S/);
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}
