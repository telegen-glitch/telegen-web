import { expect, type Page, test } from "@playwright/test";
import { evaluations } from "../../src/content/evaluations";
import type { EvaluationDefinition, Question } from "../../src/content/evaluations/types";

/**
 * Every red-flag answer must end the evaluation on a hard-stop screen with no
 * way to continue (CLAUDE.md 7c.D/H). The walker answers each screen with a
 * neutral option until it reaches the target question.
 */
async function walkTo(page: Page, def: EvaluationDefinition, target: Question, value: string) {
  await page.goto("/evaluare");
  await page.getByRole("button", { name: def.name, exact: true }).click();
  await page.getByRole("button", { name: /^Începe/ }).click();

  // Answers needed to make the target visible (e.g. sex = f for pregnancy).
  const required: Record<string, string> = target.showIf
    ? { [target.showIf.question]: target.showIf.anyOf[0] }
    : {};

  for (let guard = 0; guard < def.questions.length + 2; guard++) {
    const heading = (await page.locator("h1").innerText()).trim();
    const q = def.questions.find((x) => x.title === heading);
    if (!q) throw new Error(`Unexpected screen: ${heading}`);

    const answer =
      q.id === target.id
        ? value
        : (required[q.id] ?? q.options.find((o) => !q.stop?.anyOf.includes(o.value))!.value);
    const label = q.options.find((o) => o.value === answer)!.label;
    await page.getByRole("button", { name: label, exact: true }).click();
    if (q.type === "multi") await page.getByRole("button", { name: /^Continuă/ }).click();
    if (q.id === target.id) return;
  }
  throw new Error(`Never reached ${target.id}`);
}

for (const def of evaluations) {
  for (const q of def.questions.filter((x) => x.stop)) {
    for (const value of q.stop!.anyOf) {
      test(`${def.topic}: ${q.id} = ${value} hard-stops`, async ({ page }, info) => {
        test.skip(info.project.name !== "mobile-360");
        const startUrl = "/evaluare";
        await walkTo(page, def, q, value);
        const stop = def.stops.find((s) => s.id === q.stop!.stopId)!;
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(stop.title);
        await expect(page.locator("main [role=alert]")).toBeVisible();
        // No way forward: no continue/next, no options, no summary.
        await expect(page.getByRole("button", { name: /^(Continuă|Începe)/ })).toHaveCount(0);
        await expect(page.locator("[aria-pressed]")).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Închide evaluarea" })).toBeVisible();
        expect(new URL(page.url()).pathname).toBe(startUrl);
        expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
      });
    }
  }
}
