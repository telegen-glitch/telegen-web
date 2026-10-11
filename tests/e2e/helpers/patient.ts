import { expect, type Page } from "@playwright/test";

/** Shared steps of the clinical flow with the local stand-ins (test sign-in 123456, 2FA 654321). */

export const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

export const pick = (page: Page, label: string | RegExp) =>
  page.getByRole("button", { name: label, exact: typeof label === "string" }).click();

export async function signIn(page: Page, email: string, submit = /Confirmă codul|Intră în cont/) {
  await page.getByLabel("Adresa de e-mail").fill(email);
  await page.getByRole("button", { name: "Trimite codul" }).click();
  await page.getByLabel("Codul primit").fill("123456");
  await page.getByRole("button", { name: submit }).click();
}

/** Staff second factor: set up on first use, then the code. */
export async function twoFactor(page: Page) {
  const setup = page.getByRole("button", { name: "Configurează autentificarea în doi pași" });
  const code = page.getByLabel("Codul din aplicația de autentificare");
  await expect(setup.or(code)).toBeVisible();
  if (await setup.isVisible()) await setup.click();
  await code.fill("654321");
  await page.getByRole("button", { name: "Confirmă" }).click();
}

/** A complete hair-loss case, authorised with the test provider; returns its id. */
export async function submitHairCase(page: Page, email: string): Promise<string> {
  await page.goto("/evaluare");
  await page.getByRole("button", { name: "Căderea părului" }).click();
  await page.getByRole("button", { name: /^Începe/ }).click();
  for (const label of ["Masculin", "25–34 de ani", "De 1–3 ani", "Pe creștet"]) await pick(page, label);
  await pick(page, /Continuă/);
  await pick(page, "Treptat, în luni sau ani");
  await pick(page, "Niciunul");
  await pick(page, /Continuă/);
  for (const label of ["Da", "Nu, nimic", "Nu", "Nu", "Să opresc căderea"]) await pick(page, label);
  await expect(page.getByRole("heading", { name: "Rezumatul răspunsurilor" })).toBeVisible();
  await pick(page, /^Continuă/);
  await signIn(page, email);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("înainte să salvăm");
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page.getByRole("button", { name: "Salvează evaluarea" }).click();
  for (const slot of ["front", "top", "crown"])
    await page.locator(`#foto-${slot}`).setInputFiles({ name: "p.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByText("Salvată", { exact: true })).toHaveCount(3);
  await pick(page, /^Continuă/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("verificat de medic");
  await pick(page, /^Continuă/);
  await page.getByLabel("Nume și prenume").fill("Pacient Test");
  await page.getByLabel("Telefon (pentru curier)").fill("0712345678");
  await page.getByLabel("Adresa (stradă, număr, bloc, apartament)").fill("Str. Exemplu 1");
  await page.getByLabel("Localitatea").fill("Iași");
  await page.getByLabel("Județul").fill("Iași");
  await page.getByLabel("Codul poștal").fill("700001");
  await page.getByRole("button", { name: /Salvează și continuă/ }).click();
  await page.getByRole("button", { name: /^Rezervă .* pe card$/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("a ajuns la medic");
  await page.goto("/cont");
  const href = await page
    .getByRole("link", { name: /Detalii și mesaje/ })
    .first()
    .getAttribute("href");
  const id = href?.split("/").pop();
  expect(id).toMatch(/^[0-9a-f-]{36}$/);
  return id!;
}
