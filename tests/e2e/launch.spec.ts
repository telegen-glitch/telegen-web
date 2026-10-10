import { expect, test } from "@playwright/test";
import { prelaunchPhrases } from "../../src/lib/launch-phrases";
import { routes } from "./routes";

/**
 * Launch state (CLAUDE.md v4.7): no page says the service is not open, and
 * values the owner has not supplied show only as owner-only markers (this build
 * is not production).
 */
test("no route says the service is not open", async ({ request }, info) => {
  test.skip(info.project.name !== "desktop-1280", "server HTML is the same at every width");
  const problems: string[] = [];
  for (const route of routes) {
    const res = await request.get(route);
    expect(res.status(), route).toBe(200);
    const found = prelaunchPhrases(await res.text());
    if (found.length) problems.push(`${route}: ${found.join(", ")}`);
  }
  expect(problems).toEqual([]);
});

test("missing launch values appear only as owner markers, never as invented values", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByText("[lipsește: adresa de e-mail de contact]")).toBeVisible();
  await expect(page.getByText("[lipsește: CUI]").first()).toBeVisible();
  await page.goto("/cum-functioneaza");
  await expect(page.getByRole("heading", { name: "Cât costă" })).toBeVisible();
  await expect(page.locator("[data-owner-marker]").first()).toContainText("[lipsește: prețul pentru");
  await expect(page.locator("main")).not.toContainText(/\d+\s?lei/);
});

test("pages without a recorded review make no review claim", async ({ page }) => {
  await page.goto("/acnee");
  await expect(page.getByText("Scris de echipa editorială Telegen pe baza ghidurilor citate")).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Revizuit medical");
});
