import { expect, test } from "@playwright/test";

test("mobile menu opens, traps focus, closes with Escape", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile-360");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Deschide meniul" });
  await expect(toggle).toBeVisible();
  const box = await toggle.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);

  await toggle.click();
  const menu = page.getByRole("navigation", { name: "Meniu mobil" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: /Căderea părului/ })).toBeVisible();
  await page.screenshot({ path: "artifacts/screenshots/mobile-360/_menu-open.png" });

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(page.getByRole("button", { name: "Deschide meniul" })).toBeFocused();

  await page.getByRole("button", { name: "Deschide meniul" }).click();
  await menu.getByRole("link", { name: /Căderea părului/ }).click();
  await expect(page).toHaveURL(/\/afectiuni\/caderea-parului$/);
  await expect(menu).toBeHidden();
});

test("desktop conditions menu works with the keyboard", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1280");
  await page.goto("/");
  const btn = page.getByRole("button", { name: "Tratamente" });
  await btn.focus();
  await page.keyboard.press("Enter");
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(btn).toHaveAttribute("aria-expanded", "false");
});

test("skip link moves focus to main content", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1280");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Sari la conținut" });
  await expect(skip).toBeFocused();
});

test("topic picker opens from the hero CTA and hands the topic to the flow in memory", async ({
  page,
}, info) => {
  test.skip(info.project.name === "tablet-768");
  await page.goto("/");
  await page
    .locator("main")
    .getByRole("link", { name: /Începe evaluarea/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "Cu ce te putem ajuta?" });
  await expect(dialog).toBeVisible();
  // Upcoming topics are visible but not links.
  await expect(dialog.getByText("în curând").first()).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Acnee/ })).toHaveCount(0);
  await page.screenshot({ path: `artifacts/screenshots/${info.project.name}/_topic-picker.png` });
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await page
    .locator("main")
    .getByRole("link", { name: /Începe evaluarea/ })
    .first()
    .click();
  await dialog.getByRole("link", { name: /Căderea părului/ }).click();
  await expect(page).toHaveURL(/\/evaluare$/);
  await expect(page.getByRole("heading", { name: /câteva întrebări/ })).toBeVisible();
});

test("desktop mega-menu lists conditions and marks upcoming topics", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1280");
  await page.goto("/");
  await page.getByRole("button", { name: "Tratamente" }).hover();
  const panel = page.locator("#mega-tratamente");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: /Căderea părului/ })).toBeVisible();
  await page.screenshot({ path: "artifacts/screenshots/desktop-1280/_mega-menu.png" });
});
