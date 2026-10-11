import { expect, test } from "@playwright/test";
import { axeViolations } from "./helpers/axe";
import { approveAsDoctor, pick, signIn, submitHairCase } from "./helpers/patient";

/** After approval (CLAUDE.md v5 P5): the plan in /cont, pause/resume/cancel, and the patient's data rights. */
test("plan: next payment shown, pause, resume, cancel; export of the patient's data", async ({
  browser,
}, info) => {
  test.skip(info.project.name !== "desktop-1280");
  const patient = await (await browser.newContext({ acceptDownloads: true })).newPage();
  const caseId = await submitHairCase(
    patient,
    `plan-${Date.now()}@telegen.test`,
    `Pacient Plan ${Date.now()}`,
  );
  await approveAsDoctor(browser, caseId);

  await patient.goto(`/cont/${caseId}`);
  await expect(patient.getByText("Planul tău")).toBeVisible();
  await expect(patient.getByText(/Următoarea plată: 320 lei/)).toBeVisible();
  expect(await axeViolations(patient)).toEqual([]);
  await patient.getByRole("button", { name: "Pune pe pauză" }).click();
  await expect(patient.getByText(/Pe pauză/)).toBeVisible();
  await patient.getByRole("button", { name: "Reia planul" }).click();
  await expect(patient.getByText("Activ", { exact: true })).toBeVisible();
  await patient.getByRole("button", { name: "Anulează planul" }).click();
  await patient.getByRole("button", { name: /Da, anulez/ }).click();
  await expect(patient.getByText(/Anulat: nu mai plătești nimic/)).toBeVisible();

  await patient.goto("/cont");
  const [download] = await Promise.all([
    patient.waitForEvent("download"),
    patient.getByRole("link", { name: /Descarcă toate datele tale/ }).click(),
  ]);
  const body = JSON.parse(
    await (await download.createReadStream()).toArray().then((c) => Buffer.concat(c).toString("utf8")),
  );
  expect(body.cases.map((c: { id: string }) => c.id)).toContain(caseId);
  expect(body.answers.length).toBeGreaterThan(5);
});

test("delete account: a patient without a medical decision is erased at once", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile-360");
  await page.goto("/evaluare");
  await page.getByRole("button", { name: "Căderea părului" }).click();
  await page.getByRole("button", { name: /^Începe/ }).click();
  await pick(page, "Masculin");
  await pick(page, "Sub 18 ani");
  await expect(page.locator("main [role=alert]")).toBeVisible();
  await page.goto("/cont");
  await signIn(page, `sterge-${Date.now()}@telegen.test`);
  await page.getByRole("button", { name: "Șterge contul și datele" }).click();
  await expect(page.getByRole("button", { name: "Șterge contul" })).toBeDisabled();
  await page.getByLabel("Scrie ȘTERGE ca să confirmi").fill("ȘTERGE");
  await page.getByRole("button", { name: "Șterge contul" }).click();
  await expect(page).toHaveURL(/\/cont\/sters$/);
  await expect(page.getByText("Contul și datele tale au fost șterse, inclusiv fotografiile.")).toBeVisible();
  await page.goto("/cont");
  await expect(page.getByLabel("Adresa de e-mail")).toBeVisible();
});
