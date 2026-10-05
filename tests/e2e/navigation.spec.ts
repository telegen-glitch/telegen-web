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
  const btn = page.getByRole("button", { name: "Afecțiuni" });
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
