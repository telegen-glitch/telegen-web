import { expect, test } from "@playwright/test";

test("evaluation keeps answers in memory only", async ({ page, context }, info) => {
  test.skip(info.project.name === "tablet-768");
  const requests: string[] = [];
  await page.goto("/evaluare");
  const startUrl = page.url();
  page.on("request", (r) => requests.push(`${r.method()} ${r.url()}`));

  await page.getByRole("button", { name: /Începe/ }).click();

  // single-choice screens advance on click; multi-choice need "Continuă"
  const pick = async (label: string | RegExp) =>
    page.getByRole("button", { name: label, exact: typeof label === "string" }).click();
  await pick("Masculin");
  await pick("25–34 de ani");
  await pick("De 1–3 ani");
  await pick("La tâmple sau la linia frunții");
  await pick("Pe creștet");
  await pick(/Continuă/);
  await pick("Treptat, în luni sau ani");
  await pick("Mâncărime");
  await pick("Niciunul"); // exclusive: clears "Mâncărime"
  await expect(page.getByRole("button", { name: "Mâncărime" })).toHaveAttribute("aria-pressed", "false");
  await pick(/Continuă/);
  await pick("Da");
  await pick("Nu, nimic");
  await pick("Nu");
  await pick("Să opresc căderea");

  await expect(page.getByRole("heading", { name: "Rezumatul răspunsurilor" })).toBeVisible();
  await expect(page.getByText("La tâmple sau la linia frunții, Pe creștet")).toBeVisible();

  // Edit one answer from the summary and come back to it.
  await page.getByRole("button", { name: "Modifică răspunsul: Câți ani ai?" }).click();
  await pick("35–44 de ani");
  await expect(page.getByText("35–44 de ani")).toBeVisible();
  await page.screenshot({
    path: `artifacts/screenshots/${info.project.name}/_evaluation-summary.png`,
    fullPage: true,
  });

  // Privacy contract: same URL, no storage, no cookies with answers, no requests while answering.
  expect(page.url()).toBe(startUrl);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  const cookies = await context.cookies();
  expect(cookies.map((c) => c.name).filter((n) => n !== "telegen_consent")).toEqual([]);
  // Only static assets and link-prefetch GETs (?_rsc=…) are allowed while answering: nothing is sent.
  const unexpected = requests.filter((r) => {
    const [method, url] = r.split(" ");
    if (method !== "GET") return true;
    const u = new URL(url);
    return [...u.searchParams.keys()].some((k) => k !== "_rsc");
  });
  expect(unexpected).toEqual([]);

  await pick(/^Continuă/);
  await expect(page.getByRole("heading", { name: "Serviciul nu este încă deschis" })).toBeVisible();

  // Notify form: adapter disabled → honest message; request carries only email + consent.
  await page.getByLabel("Adresa de e-mail").fill("test@exemplu.ro");
  await page.getByRole("checkbox").check();
  const post = page.waitForRequest((r) => r.method() === "POST");
  await page.getByRole("button", { name: "Anunță-mă" }).click();
  const body = (await post).postData() ?? "";
  expect(body).toContain("test@exemplu.ro");
  for (const leaked of ["25–34", "35–44", "Masculin", "temples", "crown"]) expect(body).not.toContain(leaked);
  await expect(page.getByText("Înscrierea pentru anunț nu este încă activă")).toBeVisible();
  await page.screenshot({
    path: `artifacts/screenshots/${info.project.name}/_evaluation-final.png`,
    fullPage: true,
  });
  expect(page.url()).toBe(startUrl);
});
