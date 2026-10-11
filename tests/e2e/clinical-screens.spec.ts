import { expect, type Page, test } from "@playwright/test";
import { axeViolations } from "./helpers/axe";
import { submitHairCase } from "./helpers/patient";

/**
 * CLAUDE.md v5 P6: every screen of the patient flow, from the topic picker to the
 * account, is WCAG A/AA clean (axe) and runs under the strict clinical CSP with no
 * violation, at 360, 768 and 1280 px.
 */
async function watchCsp(page: Page): Promise<string[]> {
  const violations: string[] = [];
  page.on("console", (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text());
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) =>
      console.error(`Refused to load (CSP ${e.violatedDirective}): ${e.blockedURI}`),
    );
  });
  return violations;
}

test("every patient screen passes axe and the strict CSP", async ({ page }, info) => {
  test.setTimeout(120_000);
  const csp = await watchCsp(page);
  const problems: string[] = [];
  const caseId = await submitHairCase(
    page,
    `ecrane-${info.project.name}-${Date.now()}@t.test`,
    "Pacient Ecrane",
    async (screen) => {
      for (const v of await axeViolations(page)) problems.push(`${screen}: ${v}`);
      for (const c of csp.splice(0)) problems.push(`${screen}: ${c}`);
    },
  );
  await page.goto(`/cont/${caseId}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const v of await axeViolations(page)) problems.push(`case: ${v}`);
  problems.push(...csp);
  expect(problems).toEqual([]);
});
