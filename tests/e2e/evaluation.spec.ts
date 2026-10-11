import { expect, type Page, test } from "@playwright/test";
import { prelaunchPhrases } from "../../src/lib/launch-phrases";

/**
 * The evaluation end to end (CLAUDE.md v5 P1), with the local stand-ins (PGlite,
 * test sign-in with code 123456, file storage): answers stay in the page until
 * the account and the four consents exist, are then saved and autosaved, photos
 * are uploaded, and no health data ever appears in a URL.
 */

// 1×1 PNG: the page re-encodes it to JPEG on a canvas before upload.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
const LEAKS = ["caderea-parului", "Hipotiroidie", "levotiroxin", "temples", "crown", "25-34", "35-44", "u18"];

const pick = (page: Page, label: string | RegExp) =>
  page.getByRole("button", { name: label, exact: typeof label === "string" }).click();

async function answerHairEvaluation(page: Page) {
  await pick(page, "Masculin");
  await pick(page, "25–34 de ani");
  await pick(page, "De 1–3 ani");
  await pick(page, "La tâmple sau la linia frunții");
  await pick(page, "Pe creștet");
  await pick(page, /Continuă/);
  await pick(page, "Treptat, în luni sau ani");
  await pick(page, "Mâncărime");
  await pick(page, "Niciunul"); // exclusive: clears "Mâncărime"
  await expect(page.getByRole("button", { name: "Mâncărime" })).toHaveAttribute("aria-pressed", "false");
  await pick(page, /Continuă/);
  await pick(page, "Da");
  await pick(page, "Nu, nimic");
  await pick(page, "Da"); // a condition or a treatment: the doctor asks for details
  await page.getByRole("textbox").fill("Hipotiroidie, levotiroxină 50 µg");
  await pick(page, /Continuă/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("depresie");
  await pick(page, "Nu");
  await pick(page, "Să opresc căderea");
}

test("evaluation: in memory until consent, then saved, with photos and nothing in a URL", async ({
  page,
  context,
}, info) => {
  test.skip(info.project.name === "tablet-768");
  const urls: string[] = [];
  const answering: string[] = [];
  let phase: "answering" | "after" = "answering";
  page.on("request", (r) => {
    urls.push(r.url());
    if (phase === "answering") answering.push(`${r.method()} ${r.url()}`);
  });

  await page.goto("/evaluare");
  const startUrl = page.url();
  await page.getByRole("button", { name: "Căderea părului" }).click();
  await expect(page.getByText("Răspunsurile se păstrează doar după ce îți creezi contul")).toBeVisible();
  await page.getByRole("button", { name: /^Începe/ }).click();
  await answerHairEvaluation(page);

  await expect(page.getByRole("heading", { name: "Rezumatul răspunsurilor" })).toBeVisible();
  await expect(page.getByText("La tâmple sau la linia frunții, Pe creștet")).toBeVisible();
  await expect(page.getByText("Hipotiroidie, levotiroxină 50 µg")).toBeVisible();
  await page.getByRole("button", { name: "Modifică răspunsul: Câți ani ai?" }).click();
  await pick(page, "35–44 de ani");
  await expect(page.getByText("35–44 de ani")).toBeVisible();
  await page.screenshot({
    path: `artifacts/screenshots/${info.project.name}/_evaluation-summary.png`,
    fullPage: true,
  });

  // Before the account: same URL, no storage, no cookies but the consent one, nothing sent.
  expect(page.url()).toBe(startUrl);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  expect((await context.cookies()).map((c) => c.name).filter((n) => n !== "telegen_consent")).toEqual([]);
  expect(
    answering.filter((r) => {
      const [method, url] = r.split(" ");
      return method !== "GET" || [...new URL(url).searchParams.keys()].some((k) => k !== "_rsc");
    }),
  ).toEqual([]);
  phase = "after";

  // Account by e-mail code (test sign-in: 123456).
  await pick(page, /^Continuă/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("fără parolă");
  await page.getByLabel("Adresa de e-mail").fill(`pacient-${info.project.name}-${Date.now()}@telegen.test`);
  await page.getByRole("button", { name: "Trimite codul" }).click();
  await expect(page.getByText("Mediu de test: codul este")).toBeVisible();
  await page.getByLabel("Codul primit").fill("000000");
  await page.getByRole("button", { name: "Confirmă codul" }).click();
  await expect(page.getByText("Codul nu este corect")).toBeVisible();
  await page.getByLabel("Codul primit").fill("123456");
  await page.getByRole("button", { name: "Confirmă codul" }).click();

  // Four separate consents, none pre-ticked; nothing saved before all four.
  await expect(page.getByRole("heading", { level: 1 })).toContainText("înainte să salvăm");
  const boxes = page.getByRole("checkbox");
  await expect(boxes).toHaveCount(4);
  for (const box of await boxes.all()) await expect(box).not.toBeChecked();
  const save = page.getByRole("button", { name: "Salvează evaluarea" });
  await expect(save).toBeDisabled();
  for (const box of await boxes.all()) await box.check();
  await page.screenshot({
    path: `artifacts/screenshots/${info.project.name}/_evaluation-consents.png`,
    fullPage: true,
  });
  await save.click();

  // Photos: front, top, crown.
  await expect(page.getByRole("heading", { level: 1 })).toContainText("pentru medic");
  const next = page.getByRole("button", { name: /^Continuă/ });
  await expect(next).toBeDisabled();
  for (const slot of ["front", "top", "crown"]) {
    await page
      .locator(`#foto-${slot}`)
      .setInputFiles({ name: "poza.png", mimeType: "image/png", buffer: PNG });
  }
  await expect(page.getByText("Salvată", { exact: true })).toHaveCount(3);
  await page.screenshot({
    path: `artifacts/screenshots/${info.project.name}/_evaluation-photos.png`,
    fullPage: true,
  });
  await next.click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText("este în cont");
  expect(prelaunchPhrases(await page.content())).toEqual([]);
  expect(page.url()).toBe(startUrl);

  // The account lists the saved evaluation, marked TEST outside production.
  await page.getByRole("link", { name: /Mergi la cont/ }).click();
  await expect(page).toHaveURL(/\/cont$/);
  await expect(page.getByText("Căderea părului")).toBeVisible();
  await expect(page.getByText("TEST", { exact: true })).toBeVisible();
  await expect(page.getByText(/Evaluare începută/)).toBeVisible();

  // Resuming happens server-side, with nothing in the URL; a change is saved as it is made.
  await page.goto("/evaluare");
  await expect(page.getByText("Ai o evaluare începută")).toBeVisible();
  await page.getByRole("button", { name: /Continuă evaluarea/ }).click();
  await expect(page.getByRole("heading", { name: "Rezumatul răspunsurilor" })).toBeVisible();
  await expect(page.getByText("35–44 de ani")).toBeVisible();
  await page.getByRole("button", { name: "Modifică răspunsul: Ce îți dorești cel mai mult?" }).click();
  await pick(page, "Să am din nou păr mai des");
  await expect(page.getByRole("heading", { name: "Rezumatul răspunsurilor" })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /Continuă evaluarea/ }).click();
  await expect(page.getByText("Să am din nou păr mai des")).toBeVisible();

  // No URL ever carried health data, and no query strings were added.
  for (const url of urls) {
    const u = new URL(url);
    if (u.origin !== new URL(startUrl).origin) continue;
    for (const leak of LEAKS) expect(decodeURIComponent(url), url).not.toContain(leak);
    for (const key of u.searchParams.keys()) expect(["_rsc"], url).toContain(key);
  }
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
});

test("signed in with consent: every answer is saved as given, and a hard stop is final", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "mobile-360");
  await page.goto("/cont");
  await page.getByLabel("Adresa de e-mail").fill(`autosave-${Date.now()}@telegen.test`);
  await page.getByRole("button", { name: "Trimite codul" }).click();
  await page.getByLabel("Codul primit").fill("123456");
  await page.getByRole("button", { name: "Intră în cont" }).click();
  await expect(page.getByText("Nu ai încă nicio evaluare.")).toBeVisible();

  // First visit: consents are asked once, after the summary.
  await page.getByRole("link", { name: /Începe evaluarea/ }).click();
  await page.getByRole("button", { name: "Căderea părului" }).click();
  await page.getByRole("button", { name: /^Începe/ }).click();
  await answerHairEvaluation(page);
  await pick(page, /^Continuă/);
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page.getByRole("button", { name: "Salvează evaluarea" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("pentru medic");

  // Start again: now each answer is saved immediately; under 18 ends the case.
  await page.goto("/evaluare");
  await page.getByRole("button", { name: "Căderea părului (o evaluare nouă)" }).click();
  await expect(page.getByText("Ești în cont: răspunsurile se salvează pe măsură ce răspunzi.")).toBeVisible();
  await page.getByRole("button", { name: /^Începe/ }).click();
  await pick(page, "Masculin");
  await expect(page.getByText("Răspunsurile se salvează în contul tău.")).toBeVisible();
  await pick(page, "Sub 18 ani");
  await expect(page.locator("main [role=alert]")).toBeVisible();
  await expect(page.getByText("Răspunsurile rămân doar în contul tău.")).toBeVisible();
  await expect(page.getByRole("button", { name: /^(Continuă|Începe)/ })).toHaveCount(0);

  await page.goto("/cont");
  await expect(page.getByText("Recomandare: consult în persoană")).toBeVisible();
  await page.goto("/evaluare");
  await expect(page.getByText("Ai o evaluare începută")).toHaveCount(0);
});

test("photo upload refuses requests from other sites and signed-out users", async ({
  request,
  baseURL,
}, info) => {
  test.skip(info.project.name !== "desktop-1280");
  const res = await request.post("/api/clinical/photos", {
    headers: { origin: "https://exemplu.test" },
    multipart: { caseId: "00000000-0000-4000-8000-000000000001", slot: "front" },
  });
  expect(res.status()).toBe(403);
  const anon = await request.post("/api/clinical/photos", {
    headers: { origin: baseURL! },
    multipart: { caseId: "00000000-0000-4000-8000-000000000001", slot: "front" },
  });
  expect(anon.status()).toBe(401);
  expect(anon.headers()["cache-control"]).toContain("no-store");
  expect((await request.get("/api/clinical/photos/00000000-0000-4000-8000-000000000001")).status()).toBe(401);
});
