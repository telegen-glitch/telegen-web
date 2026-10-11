import { describe, expect, it } from "vitest";
import { evaluations } from "@/content/evaluations";
import { reviewerSpecialties } from "@/content/clinicians";
import { CLINICAL_CONDITIONS, photoSlotsFor } from "@/clinical/config/conditions";
import { CONSENTS, CONSENT_VERSION } from "@/clinical/config/consents";
import { purchasableTopics } from "@/clinical/launch";
import { isPurchasable } from "@/lib/purchasable";

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

describe("what can be bought (CLAUDE.md v5)", () => {
  it("only conditions with an open service AND a configured price: hair loss today", () => {
    expect(purchasableTopics()).toEqual(["caderea-parului"]);
    expect(isPurchasable("acnee")).toBe(false);
    expect(isPurchasable("disfunctie-erectila")).toBe(false);
  });

  it("production takes real patients only after APP_LAUNCH=on", () => {
    expect(isPurchasable("caderea-parului", env({ VERCEL_ENV: "production" }))).toBe(false);
    expect(isPurchasable("caderea-parului", env({ VERCEL_ENV: "production", APP_LAUNCH: "on" }))).toBe(true);
    expect(isPurchasable("caderea-parului", env({ VERCEL_ENV: "preview" }))).toBe(true);
  });

  it("every condition has a question set, a reviewing specialty and its photo rule", () => {
    for (const e of evaluations) {
      expect(CLINICAL_CONDITIONS[e.topic], e.topic).toBeDefined();
      expect(reviewerSpecialties[e.topic]?.length, e.topic).toBeGreaterThan(0);
      expect(e.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(photoSlotsFor("caderea-parului")).toEqual(["front", "top", "crown"]);
    expect(photoSlotsFor("acnee")).toEqual(["face"]);
    expect(photoSlotsFor("disfunctie-erectila")).toEqual([]);
  });
});

describe("consents", () => {
  it("four separate, versioned consents, each with its own text", () => {
    expect(CONSENTS.map((c) => c.kind)).toEqual(["gdpr_art9", "telemedicine", "terms", "privacy"]);
    expect(CONSENT_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Set(CONSENTS.map((c) => c.text)).size).toBe(4);
  });
});

describe("service not ready (CLAUDE.md v5.1)", () => {
  it("names the missing variables on previews, nothing in production", async () => {
    const { notReadyDetail } = await import("@/clinical/launch");
    const saved = { ...process.env };
    try {
      process.env.VERCEL_ENV = "preview";
      expect(notReadyDetail()).toMatch(/SUPABASE_URL/);
      process.env.VERCEL_ENV = "production";
      expect(notReadyDetail()).toBeNull();
    } finally {
      process.env = saved;
    }
  });
});
