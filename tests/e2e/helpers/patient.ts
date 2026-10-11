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

/** Called on each screen of the flow, e.g. for axe and CSP checks (tests/e2e/clinical-screens.spec.ts). */
export type Checkpoint = (screen: string) => Promise<void>;

/** A complete hair-loss case, authorised with the test provider; returns its id. */
export async function submitHairCase(
  page: Page,
  email: string,
  name = "Pacient Test",
  check: Checkpoint = async () => {},
): Promise<string> {
  await page.goto("/evaluare");
  await check("topic");
  await page.getByRole("button", { name: "Căderea părului" }).click();
  await expect(page.getByRole("button", { name: /^Începe/ })).toBeVisible();
  await check("intro");
  await page.getByRole("button", { name: /^Începe/ }).click();
  await expect(page.getByRole("button", { name: "Masculin" })).toBeVisible();
  await check("question");
  for (const label of ["Masculin", "25–34 de ani", "De 1–3 ani", "Pe creștet"]) await pick(page, label);
  await check("multi-select question");
  await pick(page, /Continuă/);
  await pick(page, "Treptat, în luni sau ani");
  await pick(page, "Niciunul");
  await pick(page, /Continuă/);
  for (const label of ["Da", "Nu, nimic", "Nu", "Nu", "Să opresc căderea"]) await pick(page, label);
  await expect(page.getByRole("heading", { name: "Rezumatul răspunsurilor" })).toBeVisible();
  await check("summary");
  await pick(page, /^Continuă/);
  await expect(page.getByLabel("Adresa de e-mail")).toBeVisible();
  await check("sign-in");
  await signIn(page, email);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("înainte să salvăm");
  await check("consents");
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page.getByRole("button", { name: "Salvează evaluarea" }).click();
  for (const slot of ["front", "top", "crown"])
    await page.locator(`#foto-${slot}`).setInputFiles({ name: "p.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByText("Salvată", { exact: true })).toHaveCount(3);
  await check("photos");
  await pick(page, /^Continuă/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("verificat de medic");
  await check("proposal");
  await pick(page, /^Continuă/);
  await expect(page.getByLabel("Nume și prenume")).toBeVisible();
  await check("delivery");
  await page.getByLabel("Nume și prenume").fill(name);
  await page.getByLabel("Telefon (pentru curier)").fill("0712345678");
  await page.getByLabel("Adresa (stradă, număr, bloc, apartament)").fill("Str. Exemplu 1");
  await page.getByLabel("Localitatea").fill("Iași");
  await page.getByLabel("Județul").fill("Iași");
  await page.getByLabel("Codul poștal").fill("700001");
  await page.getByRole("button", { name: /Salvează și continuă/ }).click();
  await expect(page.getByRole("button", { name: /^Rezervă .* pe card$/ })).toBeVisible();
  await check("checkout");
  await page.getByRole("button", { name: /^Rezervă .* pe card$/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("a ajuns la medic");
  await check("submitted");
  await page.goto("/cont");
  await expect(page.getByRole("link", { name: /Detalii și mesaje/ }).first()).toBeVisible();
  await check("account");
  const href = await page
    .getByRole("link", { name: /Detalii și mesaje/ })
    .first()
    .getAttribute("href");
  const id = href?.split("/").pop();
  expect(id).toMatch(/^[0-9a-f-]{36}$/);
  return id!;
}

/** The seeded TEST dermatologist takes and approves a case (own browser context). */
export async function approveAsDoctor(browser: import("@playwright/test").Browser, caseId: string) {
  const doctor = await (await browser.newContext()).newPage();
  await doctor.goto(`/medic/${caseId}`);
  await signIn(doctor, "medic.derm@telegen.test");
  await twoFactor(doctor);
  await doctor.getByRole("button", { name: "Preiau cazul" }).click();
  await expect(doctor.getByText("Decizia ta")).toBeVisible();
  for (const input of await doctor.getByLabel(/^Indicații:/).all()) await input.fill("conform schemei");
  await doctor.getByRole("button", { name: "Aprob și emit rețeta" }).click();
  await expect(doctor.getByText(/^Aprobat/)).toBeVisible();
  await doctor.context().close();
}
