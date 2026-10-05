import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { routes, slug } from "./routes";

for (const route of routes) {
  test.describe(route, () => {
    test("renders with one h1, metadata, no overflow and is axe clean", async ({ page }, info) => {
      // Audit the settled page: reveal transitions would otherwise let axe sample half-faded text.
      await page.emulateMedia({ reducedMotion: "reduce" });
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe(`https://telegen.ro${route === "/" ? "" : route}`);
      expect(await page.title()).toMatch(/Telegen/);
      expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
      // Not launched: every page must be noindex.
      expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
      expect(res?.headers()["x-robots-tag"]).toContain("noindex");

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, "horizontal scroll").toBeLessThanOrEqual(0);

      for (const img of await page.locator("img").all()) expect(await img.getAttribute("alt")).not.toBeNull();

      // JSON-LD must parse and FAQPage must mirror visible questions.
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      const visible = (await page.locator("details > summary").allTextContents()).map((t) => t.trim());
      for (const b of blocks) {
        const data = JSON.parse(b);
        if (data["@type"] === "FAQPage") {
          expect(data.mainEntity.map((q: { name: string }) => q.name)).toEqual(visible);
        }
        expect(data).not.toHaveProperty("reviewedBy");
        expect(data).not.toHaveProperty("aggregateRating");
      }

      if (info.project.name === "mobile-360" || info.project.name === "desktop-1280") {
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual(
          [],
        );
      }

      await page.screenshot({
        path: `artifacts/screenshots/${info.project.name}/${slug(route)}.png`,
        fullPage: true,
      });
    });
  });
}

test("all internal links resolve", async ({ page, request }, info) => {
  test.skip(info.project.name !== "desktop-1280");
  const seen = new Set<string>();
  for (const route of routes) {
    await page.goto(route);
    const hrefs = await page
      .locator("a[href^='/']")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
    for (const h of hrefs) seen.add(h.split("#")[0]);
  }
  for (const h of seen) {
    const res = await request.get(h);
    expect(res.status(), h).toBe(200);
  }
});
