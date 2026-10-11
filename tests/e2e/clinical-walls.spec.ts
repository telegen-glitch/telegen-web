import { expect, test } from "@playwright/test";

/** CLAUDE.md v5 WALLS: the clinical area is dynamic, never cached or indexed, with its own strict CSP. */
test("clinical paths get the strict per-request CSP; public paths keep theirs", async ({ request }, info) => {
  test.skip(info.project.name !== "desktop-1280", "headers are the same at every width");
  for (const path of ["/evaluare", "/cont"]) {
    const a = await request.get(path);
    const b = await request.get(path);
    const csp = a.headers()["content-security-policy"];
    expect(csp, path).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(csp, path).not.toContain("'unsafe-inline' https");
    expect(csp).not.toBe(b.headers()["content-security-policy"]); // a fresh nonce per request
    expect(a.headers()["x-robots-tag"]).toContain("noindex");
    expect(a.headers()["cache-control"]).toContain("no-store");
  }
  for (const path of ["/", "/contact", "/acnee"]) {
    const res = await request.get(path);
    const csp = res.headers()["content-security-policy"];
    expect(csp, path).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp, path).not.toContain("nonce-");
  }
});

test("the evaluation runs under the strict CSP without violations", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text());
  });
  await page.goto("/evaluare");
  await page.getByRole("button", { name: "Căderea părului" }).click();
  await expect(page.getByRole("button", { name: /^Începe/ })).toBeVisible();
  expect(violations).toEqual([]);
});

test("the owner's health check reports the database up to date, without data or keys", async ({
  request,
}, info) => {
  test.skip(info.project.name !== "mobile-360");
  const res = await request.get("/api/health");
  expect(res.ok()).toBe(true);
  const body = await res.json();
  expect(body.database).toBe("ok");
  expect(body.missingMigrations).toEqual([]);
  expect(JSON.stringify(body)).not.toMatch(/sb_secret_|sb_publishable_|eyJ|postgres(ql)?:\/\//);
});
