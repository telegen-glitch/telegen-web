import { describe, expect, it } from "vitest";
import { decidingDoctor } from "@/content/clinicians";
import { content } from "@/content/source";
import { careRoute } from "@/lib/care-route";
import { MEDICINE_NAMES } from "./compliance";

/** Hero condition panels (CLAUDE.md v4.3): generated from content, compliant by construction. */
describe("hero condition panels", () => {
  const conditions = content.listConditions();

  it("every published condition has exactly one panel with a lead and three points", () => {
    expect(conditions.length).toBeGreaterThan(0);
    const slugs = conditions.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of conditions) {
      expect(c.panel.lead.length, c.slug).toBeGreaterThan(10);
      expect(c.panel.analyses).toHaveLength(3);
    }
  });

  const texts = () => [
    ...conditions.flatMap((c) => [c.name, c.panel.lead, ...c.panel.analyses, decidingDoctor(c.slug)]),
    ...careRoute.flatMap((n) => [n.title, n.text]),
  ];

  it("panels never name a medicine", () => {
    for (const t of texts()) expect(t).not.toMatch(MEDICINE_NAMES);
  });

  it("panels carry no prices, percentages or other figures", () => {
    for (const t of texts()) {
      expect(t).not.toMatch(/\d/);
      expect(t).not.toMatch(/%|lei|ron\b|€|eur\b|preț|gratuit|livrare|garant/i);
    }
  });

  it("who decides names a specialty only when it is certain, never a person", () => {
    expect(decidingDoctor("caderea-parului")).toBe("Un medic dermatolog");
    expect(decidingDoctor("acnee")).toBe("Un medic dermatolog");
    // Two specialties are allowed for ED and none is configured yet.
    expect(decidingDoctor("disfunctie-erectila")).toBe("Un medic");
  });
});
