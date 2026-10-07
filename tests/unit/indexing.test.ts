import { describe, expect, it } from "vitest";
import { team } from "@/content/clinicians";
import { content } from "@/content/source";
import type { MedicalDoc, TeamMember } from "@/content/types";
import { hasRealReview, isMedicalDocIndexable } from "@/lib/indexing";
import { isSiteIndexable } from "@/lib/site";
import { medicalPageJsonLd } from "@/lib/seo";

const prodOn = { SITE_INDEXING: "on", VERCEL_ENV: "production" } as unknown as NodeJS.ProcessEnv;

const derm: TeamMember = {
  kind: "team-member",
  id: "derm-1",
  specialty: "dermatologie",
  credentialType: "medic-specialist",
};
const uro: TeamMember = {
  kind: "team-member",
  id: "uro-1",
  specialty: "urologie",
  credentialType: "medic-primar",
};
const find = (id: string) => [derm, uro].find((m) => m.id === id);
const doc = (conditionSlug: string, review?: MedicalDoc["review"]) => ({
  review,
  conditionSlug,
  status: "published" as const,
});
const today = new Date("2026-10-07T12:00:00Z");

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

describe("medical page noindex rule (§9.2, §v4.D)", () => {
  it("requires a real team member of the right specialty and a valid, past review date", () => {
    expect(hasRealReview(doc("acnee"), find, today)).toBe(false);
    expect(
      hasRealReview(doc("acnee", { reviewerId: "missing", reviewedAt: "2026-10-01" }), find, today),
    ).toBe(false);
    expect(hasRealReview(doc("acnee", { reviewerId: "derm-1", reviewedAt: "2026-13-45" }), find, today)).toBe(
      false,
    );
    expect(hasRealReview(doc("acnee", { reviewerId: "derm-1", reviewedAt: "2027-01-01" }), find, today)).toBe(
      false,
    );
    expect(hasRealReview(doc("acnee", { reviewerId: "uro-1", reviewedAt: "2026-10-01" }), find, today)).toBe(
      false,
    );
    expect(hasRealReview(doc("acnee", { reviewerId: "derm-1", reviewedAt: "2026-10-01" }), find, today)).toBe(
      true,
    );
    expect(
      hasRealReview(
        doc("disfunctie-erectila", { reviewerId: "uro-1", reviewedAt: "2026-10-01" }),
        find,
        today,
      ),
    ).toBe(true);
    expect(
      hasRealReview(
        doc("disfunctie-erectila", { reviewerId: "derm-1", reviewedAt: "2026-10-01" }),
        find,
        today,
      ),
    ).toBe(false);
  });

  it("never indexes a medical page without a real review, even in launched production", () => {
    const docs = [
      ...content.listConditions().map((c) => c.doc),
      ...content.listGuides(),
      ...content.listTreatments(),
    ];
    expect(docs.length).toBeGreaterThan(0);
    for (const d of docs) {
      expect(isMedicalDocIndexable(d, content.getTeamMember, prodOn)).toBe(
        hasRealReview(d, content.getTeamMember),
      );
      expect(isMedicalDocIndexable(d, content.getTeamMember, {} as NodeJS.ProcessEnv)).toBe(false);
    }
  });

  it("no page is marked as reviewed in the repository yet (owner records reviews, docs/REVIEW.md)", () => {
    const docs = [
      ...content.listConditions().map((c) => c.doc),
      ...content.listGuides(),
      ...content.listTreatments(),
    ];
    for (const d of docs) expect(d.review, d.slug).toBeUndefined();
  });
});

describe("clinician privacy (§v4.D)", () => {
  it("team members carry only an opaque id, specialty and credential type", () => {
    for (const m of team) {
      expect(Object.keys(m).sort()).toEqual(["credentialType", "id", "kind", "specialty"]);
      expect(m.id).toMatch(/^[a-z]+-\d+$/);
    }
  });

  it("reviewedBy is the organisation (never a Person) and only with a visible review", () => {
    const d = content.getGuide("cauzele-caderii-parului")!;
    const none = medicalPageJsonLd(d, "/x", "Alopecie androgenetică");
    expect(none).not.toHaveProperty("reviewedBy");
    expect(none).not.toHaveProperty("lastReviewed");
    const reviewed = medicalPageJsonLd(d, "/x", "Alopecie androgenetică", "2026-10-01") as Record<
      string,
      unknown
    >;
    expect(reviewed.lastReviewed).toBe("2026-10-01");
    expect(reviewed.reviewedBy).toEqual({ "@id": "https://telegen.ro/#organizatie" });
    expect(JSON.stringify(reviewed)).not.toContain('"Person"');
  });
});
