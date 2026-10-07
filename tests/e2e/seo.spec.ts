import { routes } from "./routes";
import { expect, test } from "@playwright/test";

test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop-1280"));

test("robots.txt disallows everything before launch", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/User-Agent: \*\s+Disallow: \//i);
});

test("sitemap.xml is valid and empty before launch", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain("<urlset");
  expect(body).not.toContain("<url>");
});

test("unknown pages return 404 with a helpful page", async ({ page }) => {
  const res = await page.goto("/pagina-care-nu-exista");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText("Pagina nu există");
});

test("legacy paths redirect permanently", async ({ request }) => {
  for (const [from, to] of [
    ["/afectiuni/caderea-parului", "/caderea-parului"],
    ["/alopecie-androgenetica", "/caderea-parului"],
    ["/alopecie", "/caderea-parului"],
    ["/despre", "/standarde-clinice"],
    ["/cookies", "/politica-cookie"],
  ]) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(308);
    expect(res.headers().location, from).toBe(to);
  }
});

test("treatment pages carry no evaluation call to action", async ({ page }) => {
  for (const p of [...routes.filter((r) => r.startsWith("/tratamente/")), "/tratamente"]) {
    await page.goto(p);
    await expect(page.locator("main a[href='/evaluare']")).toHaveCount(0);
  }
});
