import { expect, test } from "@playwright/test";
import { PROMISE_SHORT, PROMISE_STEPS } from "../../src/lib/promise";

/** The service promise is worded the same on every page that sells the service (docs/promise-map.md). */
test("home shows the promise steps and the payment FAQ", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Evaluare gratuită", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Când plătesc?", { exact: true })).toBeVisible();
  await expect(page.getByText("Ce se întâmplă dacă medicul nu îmi prescrie?", { exact: true })).toBeVisible();
});

test("/cum-functioneaza lists the seven promise steps in order, with the FAQ in JSON-LD", async ({
  page,
}) => {
  await page.goto("/cum-functioneaza");
  const steps = page.getByTestId("promise-steps").locator("li");
  await expect(steps).toHaveCount(PROMISE_STEPS.length);
  for (const [i, step] of PROMISE_STEPS.entries()) await expect(steps.nth(i)).toContainText(step.title);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.some((t) => t.includes('"FAQPage"') && t.includes("Pot anula?"))).toBe(true);
});

test("the hair-loss page uses the same promise next to its start button", async ({ page }) => {
  await page.goto("/caderea-parului");
  await expect(page.getByText(PROMISE_SHORT).first()).toBeAttached();
});
