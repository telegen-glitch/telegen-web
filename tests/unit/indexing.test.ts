import { describe, expect, it } from "vitest";
import { content } from "@/content/source";
import type { Clinician, MedicalDoc } from "@/content/types";
import { hasRealReview, isMedicalDocIndexable } from "@/lib/indexing";
import { isSiteIndexable } from "@/lib/site";
import { medicalPageJsonLd } from "@/lib/seo";

const prodOn = { SITE_INDEXING: "on", VERCEL_ENV: "production" } as unknown as NodeJS.ProcessEnv;

const real: Clinician = {
  slug: "real",
  name: "Dr. Test Real",
  role: "r",
  credential: "Medic primar dermatovenerolog",
  bio: [],
  temporary: false,
};
const temp: Clinician = { ...real, slug: "temp", temporary: true };
const noCred: Clinician = { ...real, slug: "nocred", credential: undefined };
const find = (s: string) => [real, temp, noCred].find((c) => c.slug === s);
const doc = (review?: MedicalDoc["review"]) => ({ review, status: "published" as const });

describe("site-level indexing switch", () => {
  it("is off unless SITE_INDEXING=on and VERCEL_ENV=production", () => {
    expect(isSiteIndexable({} as NodeJS.ProcessEnv)).toBe(false);
    expect(isSiteIndexable({ SITE_INDEXING: "on" } as unknown as NodeJS.ProcessEnv)).toBe(false);
    expect(
      isSiteIndexable({ SITE_INDEXING: "on", VERCEL_ENV: "preview" } as unknown as NodeJS.ProcessEnv),
    ).toBe(false);
    expect(isSiteIndexable({ VERCEL_ENV: "production" } as unknown as NodeJS.ProcessEnv)).toBe(false);
    expect(isSiteIndexable(prodOn)).toBe(true);
  });
});

describe("medical page noindex rule (section 9.2)", () => {
  it("requires a real reviewer with name, credential and a valid review date", () => {
    expect(hasRealReview(doc(), find)).toBe(false);
    expect(hasRealReview(doc({ reviewerSlug: "temp", reviewedAt: "2026-10-01" }), find)).toBe(false);
    expect(hasRealReview(doc({ reviewerSlug: "nocred", reviewedAt: "2026-10-01" }), find)).toBe(false);
    expect(hasRealReview(doc({ reviewerSlug: "missing", reviewedAt: "2026-10-01" }), find)).toBe(false);
    expect(hasRealReview(doc({ reviewerSlug: "real", reviewedAt: "2026-13-45" }), find)).toBe(false);
    expect(hasRealReview(doc({ reviewerSlug: "real", reviewedAt: "2026-10-01" }), find)).toBe(true);
  });

  it("never indexes a medical page without a real review, even in launched production", () => {
    const docs = [
      ...content.listConditions().map((c) => c.doc),
      ...content.listGuides(),
      ...content.listTreatments(),
    ];
    expect(docs.length).toBeGreaterThan(0);
    for (const d of docs) {
      expect(isMedicalDocIndexable(d, content.getClinician, prodOn)).toBe(
        hasRealReview(d, content.getClinician),
      );
      expect(isMedicalDocIndexable(d, content.getClinician, {} as NodeJS.ProcessEnv)).toBe(false);
    }
  });

  it("emits reviewedBy in structured data only for a real reviewer", () => {
    const d = content.getGuide("cauzele-caderii-parului")!;
    expect(medicalPageJsonLd(d, "/x", "Alopecie androgenetică")).not.toHaveProperty("reviewedBy");
    const withReviewer = medicalPageJsonLd(d, "/x", "Alopecie androgenetică", {
      name: "Dr. A",
      credential: "c",
      reviewedAt: "2026-10-01",
    });
    expect(withReviewer).toHaveProperty("reviewedBy.name", "Dr. A");
  });

  it("does not count temporary clinicians as reviewers", () => {
    for (const c of content.listClinicians().filter((c) => c.temporary)) {
      expect(
        hasRealReview(doc({ reviewerSlug: c.slug, reviewedAt: "2026-10-01" }), content.getClinician),
      ).toBe(false);
    }
  });
});
