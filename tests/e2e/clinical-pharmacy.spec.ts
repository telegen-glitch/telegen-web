import { expect, test } from "@playwright/test";
import { axeViolations } from "./helpers/axe";
import { signIn, submitHairCase, twoFactor } from "./helpers/patient";

/**
 * The pharmacy's side (CLAUDE.md v5 P4): after the doctor approves, the seeded
 * TEST pharmacy (e-mail code + 2FA) sees the prescription and the delivery
 * address, never the condition; it packs and ships with an AWB; the patient sees
 * the tracking in the account.
 */
test("pharmacy: 2FA, order without the condition, packing slip, shipped with AWB", async ({
  browser,
}, info) => {
  test.skip(info.project.name !== "desktop-1280");
  const patient = await (await browser.newContext()).newPage();
  const name = `Pacient Test ${Date.now()}`;
  const caseId = await submitHairCase(patient, `pharmacy-flow-${Date.now()}@telegen.test`, name);

  const doctor = await (await browser.newContext()).newPage();
  await doctor.goto(`/medic/${caseId}`);
  await signIn(doctor, "medic.derm@telegen.test");
  await twoFactor(doctor);
  await doctor.getByRole("button", { name: "Preiau cazul" }).click();
  await expect(doctor.getByText("Decizia ta")).toBeVisible();
  for (const input of await doctor.getByLabel(/^Indicații:/).all()) await input.fill("conform schemei");
  await doctor.getByRole("button", { name: "Aprob și emit rețeta" }).click();
  await expect(doctor.getByText(/^Aprobat/)).toBeVisible();

  const pharmacy = await (await browser.newContext()).newPage();
  await pharmacy.goto("/farmacie");
  await signIn(pharmacy, "farmacie@telegen.test");
  await expect(pharmacy.getByText("Comenzi")).toHaveCount(0);
  await twoFactor(pharmacy);
  await expect(pharmacy.getByRole("heading", { level: 1 })).toContainText("de pregătit");
  const card = pharmacy.locator("li", { hasText: name }).filter({ hasText: "Nouă" });
  await expect(card).toBeVisible();
  await expect(card).toContainText("Finasteridă 1 mg");
  await expect(card).toContainText("Medic TEST (dermatologie)");
  await expect(pharmacy.locator("main")).not.toContainText(/căderea părului|alopecie|acnee|erectil/i);
  expect(await axeViolations(pharmacy)).toEqual([]);

  const slipHref = await card.getByRole("link", { name: /Fișa de însoțire/ }).getAttribute("href");
  const slip = await pharmacy.context().newPage();
  await slip.goto(slipHref!);
  await expect(slip.getByText(/Fișă de însoțire/)).toBeVisible();
  await expect(slip.getByText("COMANDĂ TEST: nu se expediază.")).toBeVisible();
  await expect(slip.locator("body")).not.toContainText(/căderea părului|alopecie/i);
  await slip.screenshot({ path: "artifacts/screenshots/desktop-1280/_packing-slip.png", fullPage: true });

  await card.getByRole("button", { name: "Pregătesc coletul" }).click();
  const packing = pharmacy
    .locator("li", { hasText: "Pacient Test" })
    .filter({ hasText: "În pregătire" })
    .first();
  await packing.getByLabel("Curier").fill("Curier TEST");
  await packing.getByLabel("Cod AWB").fill("AWB123456");
  await packing.getByRole("button", { name: "Coletul a plecat" }).click();
  await expect(pharmacy.locator("li", { hasText: name })).toContainText("AWB AWB123456");

  await patient.goto(`/cont/${caseId}`);
  await expect(patient.getByText("Coletul a plecat")).toBeVisible();
  await expect(patient.getByText(/AWB AWB123456/)).toBeVisible();
});
