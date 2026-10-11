import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SERVICE } from "@/clinical/config/service";
import { prelaunchPhrases } from "@/lib/launch-phrases";
import { PROMISE_SHORT, PROMISE_STEPS, SLA_HOURS } from "@/lib/promise";
import { promiseFaqs } from "@/lib/promise-faqs";
import { purchasableConditionNames } from "@/lib/purchasable-names";
import { MEDICINE_NAMES } from "./compliance";

/** The service promise (CLAUDE.md v5, docs/promise-map.md): one wording, one SLA. */
describe("promise", () => {
  const texts = [
    ...PROMISE_STEPS.flatMap((s) => [s.title, s.text]),
    PROMISE_SHORT,
    ...promiseFaqs("Plan pentru căderea părului: 320 lei pe lună.").flatMap((f) => [f.question, f.answer]),
  ];

  it("keeps the seven steps in the owner's order", () => {
    expect(PROMISE_STEPS.map((s) => s.id)).toEqual([
      "evaluare",
      "plan",
      "plata",
      "medic",
      "fara-reteta",
      "livrare",
      "urmarire",
    ]);
    expect(PROMISE_STEPS.map((s) => s.title.toLowerCase())).toEqual([
      "evaluare gratuită",
      "planul propus și prețul",
      "plătești la final, suma doar se rezervă",
      `medic în ${SLA_HOURS} de ore`,
      "fără rețetă, fără plată",
      "livrare gratuită și discretă",
      "mesaje gratuite, pauză sau anulare oricând",
    ]);
  });

  it("uses one SLA for the public promise and the clinical service", () => {
    expect(SERVICE.slaHours).toBe(SLA_HOURS);
    expect(SLA_HOURS).toBe(24);
    for (const t of texts) {
      for (const m of t.matchAll(/(\d+) de ore/g)) expect(Number(m[1])).toBe(SLA_HOURS);
    }
  });

  it("names no medicine and no pre-launch phrase", () => {
    for (const t of texts) {
      expect(t).not.toMatch(MEDICINE_NAMES);
      expect(prelaunchPhrases(t)).toEqual([]);
    }
  });

  it("answers the seven service questions", () => {
    expect(promiseFaqs(null).map((f) => f.question)).toEqual([
      "Cât costă?",
      "Când plătesc?",
      "Ce se întâmplă dacă medicul nu îmi prescrie?",
      "Cine este medicul meu?",
      "Cât durează?",
      "Cum se face livrarea?",
      "Pot anula?",
    ]);
  });

  it("offers the service only for priced conditions", () => {
    expect(purchasableConditionNames()).toEqual(["Căderea părului"]);
  });

  it("no public page says the answers are not saved", () => {
    const pages = ["page.tsx", "cum-functioneaza/page.tsx", "termeni-si-conditii/page.tsx"];
    for (const p of pages) {
      const src = readFileSync(path.join(process.cwd(), "src/app/(site)", p), "utf8");
      expect(src).not.toMatch(/nu ajung pe acest site|nu părăsesc|rămân în browser/i);
    }
  });
});
