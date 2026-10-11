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
});

test("public prices are the owner's plan prices only, never with a medicine name", async ({ page }) => {
  await page.goto("/cum-functioneaza");
  const section = page.locator("section", { has: page.getByRole("heading", { name: "Cât costă" }) });
  await expect(section).toContainText("Plan pentru căderea părului, lunar");
  await expect(section).toContainText("320 lei");
  await expect(section).toContainText("870 lei");
  await expect(section).not.toContainText(/acnee|erectil/i);
  await expect(section).not.toContainText(/finasterid|minoxidil|sildenafil|tadalafil/i);
  await expect(section.locator("[data-owner-marker]")).toHaveCount(0);
});

test("pages without a recorded review make no review claim", async ({ page }) => {
  await page.goto("/acnee");
  await expect(page.getByText("Scris de echipa editorială Telegen pe baza ghidurilor citate")).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Revizuit medical");
});
