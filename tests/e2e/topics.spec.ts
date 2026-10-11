import { expect, test } from "@playwright/test";
import { evaluations } from "../../src/content/evaluations";
import { isPurchasable } from "../../src/lib/purchasable";
import { axeViolations } from "./helpers/axe";

/**
 * CLAUDE.md v5.1: all three published conditions are always selectable on the
 * topic screen. Price and the service switch only change the end: a condition
 * without an online plan ends on "next steps", with nothing sent or saved.
 */
test("the topic screen offers every published condition", async ({ page }) => {
  await page.goto("/evaluare");
  for (const name of ["Căderea părului", "Acnee", "Disfuncție erectilă"])
    await expect(page.getByRole("button", { name, exact: true })).toBeEnabled();
});

const unpriced = evaluations.filter((e) => !isPurchasable(e.topic));

for (const def of unpriced) {
  test(`${def.topic}: a complete evaluation ends on next steps, nothing sent or stored`, async ({
    page,
  }, info) => {
    test.skip(info.project.name === "tablet-768");
    const posts: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET") posts.push(r.url());
    });
    await page.goto("/evaluare");
    await page.getByRole("button", { name: def.name, exact: true }).click();
    await expect(page.getByText("nu se trimit și nu se salvează")).toBeVisible();
    await page.getByRole("button", { name: /^Începe/ }).click();
    // Neutral answers all the way: never a stop value; first visible option otherwise.
    for (let guard = 0; guard < def.questions.length + 2; guard++) {
      const heading = (await page.locator("h1").innerText()).trim();
      if (/Rezumatul/.test(heading)) break;
      const q = def.questions.find((x) => x.title === heading);
      if (!q) throw new Error(`Unexpected screen: ${heading}`);
      if (q.type === "text") {
        await page.getByRole("textbox").fill("nimic");
        await page.getByRole("button", { name: /^Continuă/ }).click();
        continue;
      }
      const option =
        q.options.find((o) => !q.stop?.anyOf.includes(o.value) && !o.value.startsWith("da")) ??
        q.options.find((o) => !q.stop?.anyOf.includes(o.value))!;
      await page.getByRole("button", { name: option.label, exact: true }).click();
      if (q.type === "multi") await page.getByRole("button", { name: /^Continuă/ }).click();
    }
    await expect(page.getByRole("heading", { name: /Rezumatul/ })).toBeVisible();
    await page.getByRole("button", { name: /^Continuă/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Iată ce îți recomandăm");
    await expect(page.getByText("Telegen nu oferă acum un plan de tratament online")).toBeVisible();
    // No account step, no price, no medicine name, nothing sent, nothing in the URL or browser storage.
    await expect(page.getByLabel("Adresa de e-mail")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/lei|sildenafil|tadalafil|isotretinoin|adapalen/i);
    expect(posts).toEqual([]);
    expect(new URL(page.url()).pathname).toBe("/evaluare");
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
    expect(await axeViolations(page)).toEqual([]);
  });
}
