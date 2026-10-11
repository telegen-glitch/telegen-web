import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { signIn, submitHairCase, twoFactor } from "./helpers/patient";

/** axe on a settled page (after a Server Action refresh, Next.js streams the title back in). */
const axe = async (page: Page) => {
  await expect(page).toHaveTitle(/\S/);
  return (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
};

/**
 * The doctor's side end to end (CLAUDE.md v5 P3) with the local stand-ins: the
 * seeded TEST dermatologist signs in with an e-mail code and mandatory 2FA,
 * takes the case, approves it with instructions; the patient sees the doctor's
 * name, specialty and parafă, the decision and the pharmacy step.
 */
test("doctor: 2FA, queue, take, message, approve; the patient sees the doctor and the outcome", async ({
  browser,
}, info) => {
  test.skip(info.project.name === "tablet-768");
  const patient = await (await browser.newContext()).newPage();
  const caseId = await submitHairCase(patient, `doctor-flow-${info.project.name}-${Date.now()}@telegen.test`);

  const doctor = await (await browser.newContext()).newPage();
  await doctor.goto("/medic");
  await expect(doctor.getByRole("heading", { level: 1 })).toHaveText("Panoul medicului");
  await signIn(doctor, "medic.derm@telegen.test");
  // No health data before the second factor.
  await expect(doctor.getByText("Coada specialității tale")).toHaveCount(0);
  await twoFactor(doctor);
  await expect(doctor.getByRole("heading", { name: "Coada specialității tale" })).toBeVisible();
  await expect(doctor.getByText(`caz ${caseId.slice(0, 8)}`)).toBeVisible();

  await doctor.goto(`/medic/${caseId}`);
  await expect(doctor.getByText("Răspunsurile pacientului")).toBeVisible();
  await expect(doctor.getByRole("img", { name: /Fotografie/ })).toHaveCount(3);
  await doctor.getByRole("button", { name: "Preiau cazul" }).click();
  await expect(doctor.getByText("Decizia ta")).toBeVisible();
  expect(await axe(doctor)).toEqual([]);
  await doctor.screenshot({
    path: `artifacts/screenshots/${info.project.name}/_doctor-case.png`,
    fullPage: true,
  });

  // The patient now sees their doctor: name, specialty, parafă (TEST data).
  await patient.goto(`/cont/${caseId}`);
  await expect(patient.getByText("Medic TEST (dermatologie)")).toBeVisible();
  await expect(patient.getByText(/cod de parafă TEST-000/)).toBeVisible();

  await doctor.getByLabel("Mesaj pentru pacient").fill("Bună ziua, mă ocup eu de evaluarea ta.");
  await doctor.getByRole("button", { name: "Trimite mesajul" }).click();
  await expect(doctor.getByText("mă ocup eu de evaluarea ta")).toBeVisible();

  await doctor.getByRole("button", { name: "Aprob și emit rețeta" }).click();
  await expect(doctor.getByText(/Completează toate câmpurile/)).toBeVisible();
  for (const input of await doctor.getByLabel(/^Indicații:/).all())
    await input.fill("conform schemei discutate");
  await doctor.getByRole("button", { name: "Aprob și emit rețeta" }).click();
  await expect(doctor.getByText(/^Aprobat/)).toBeVisible();

  await patient.reload();
  await expect(patient.getByText("Plan aprobat")).toBeVisible();
  await expect(patient.getByText("Rețeta a ajuns la farmacie")).toBeVisible();
  await expect(patient.getByText("mă ocup eu de evaluarea ta")).toBeVisible();
  await patient.getByLabel("Mesaj pentru medic").fill("Mulțumesc!");
  await patient.getByRole("button", { name: "Trimite mesajul" }).click();
  await expect(patient.getByText("Mulțumesc!")).toBeVisible();
  expect(await axe(patient)).toEqual([]);
});

test("admin: 2FA, operations without health content, doctor accounts", async ({ browser }, info) => {
  test.skip(info.project.name !== "desktop-1280");
  const admin = await (await browser.newContext()).newPage();
  await admin.goto("/admin");
  await signIn(admin, "admin@telegen.test");
  await twoFactor(admin);
  await expect(admin.getByRole("heading", { name: "Pacienți reali" })).toBeVisible();
  await expect(admin.getByRole("heading", { name: "Medici", exact: true })).toBeVisible();
  await expect(admin.getByText("Medic TEST (dermatologie)", { exact: true })).toBeVisible();
  // Admins never see answers, photos or messages.
  await expect(admin.locator("main")).not.toContainText(/Hipotiroidie|Mulțumesc|mă ocup eu/);
  await expect(admin.locator("main img")).toHaveCount(0);
  expect(await axe(admin)).toEqual([]);
});

test("a patient account cannot open the doctor or admin areas", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile-360");
  await page.goto("/medic");
  await signIn(page, `pacient-${Date.now()}@telegen.test`);
  await expect(page.getByText("Acest cont nu are acces aici.")).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByText("Acest cont nu are acces aici.")).toBeVisible();
});
