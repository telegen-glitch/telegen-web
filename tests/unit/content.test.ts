import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { conditions } from "@/content/conditions";
import { content, hrefForDoc } from "@/content/source";
import type { MedicalDoc } from "@/content/types";
import { docTexts } from "@/lib/medical";
import { allRoutes } from "@/lib/routes";
import { faqJsonLd } from "@/lib/seo";

const published = [
  ...content.listConditions().map((c) => c.doc),
  ...content.listGuides(),
  ...content.listTreatments(),
];
const routes = new Set(allRoutes().map((r) => r.path));
const textsOf = (d: MedicalDoc) => {
  const cond = d.kind === "condition" ? content.getCondition(d.slug) : undefined;
  return [...docTexts(d, cond), d.limitations, d.metaDescription, d.metaTitle, d.h1];
};

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("sources and citations", () => {
  it("every citation and listed source exists", () => {
    const ids = new Set(content.allSources().map((s) => s.id));
    for (const d of published) {
      for (const t of textsOf(d)) {
        for (const m of t.matchAll(/\{\{cite:([a-z0-9-]+)\}\}/g))
          expect(ids, `${d.slug}: ${m[1]}`).toContain(m[1]);
      }
      for (const id of d.sourceIds) expect(ids).toContain(id);
    }
  });

  it("has no percentage without a citation in the same text (section 9.3)", () => {
    for (const d of published) {
      for (const t of textsOf(d)) {
        if (/\d\s?%/.test(t)) expect(t, `${d.slug}: unsourced percentage`).toMatch(/\{\{cite:/);
      }
    }
  });
});

describe("internal linking graph", () => {
  it("all internal links resolve to a route", () => {
    for (const d of published) {
      const links = [
        ...textsOf(d).flatMap((t) => [...t.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1])),
        ...d.related.map((r) => r.href.split("#")[0]),
      ];
      for (const l of links) expect(routes, `${d.slug} → ${l}`).toContain(l);
    }
  });

  it("condition ↔ symptoms ↔ causes ↔ treatment ↔ questions are connected", () => {
    for (const c of content.listConditions()) {
      const condHref = hrefForDoc(c.doc);
      const children = [...content.listGuides(c.slug), ...content.listTreatments(c.slug)];
      const roles = new Set(children.map((d) => d.graphRole));
      for (const role of ["symptoms", "causes", "treatment", "questions"] as const)
        expect(roles).toContain(role);
      const condLinks = new Set(c.doc.related.map((r) => r.href));
      for (const child of children) {
        expect(condLinks, `condition → ${child.slug}`).toContain(hrefForDoc(child));
        expect(
          child.related.map((r) => r.href),
          `${child.slug} → condition`,
        ).toContain(condHref);
      }
    }
  });

  it("draft topics are modelled but never published", () => {
    const drafts = conditions.filter((c) => c.status === "draft");
    expect(drafts.length).toBeGreaterThan(0);
    for (const d of drafts) {
      expect(content.getCondition(d.slug)).toBeUndefined();
      expect(routes).not.toContain(`/afectiuni/${d.slug}`);
    }
  });
});

describe("prescription-medicine promotion rules (section 9.4)", () => {
  const medicine = /minoxidil|finasterid|dutasterid/i;

  it("medicine names appear only in neutral content data, never in page or component code", () => {
    const offenders = walk("src")
      .filter((f) => /\.(tsx?|css)$/.test(f) && !f.startsWith(join("src", "content")))
      .filter((f) => medicine.test(readFileSync(f, "utf8")))
      .map((f) => relative(".", f));
    expect(offenders).toEqual([]);
  });

  it("no purchase or promotional language in medical content", () => {
    const promo = /cumpără|cumpara|comandă acum|comanda acum|reducere|ofertă|oferta|preț|pret\b|livrare/i;
    for (const d of published) for (const t of textsOf(d)) expect(t, d.slug).not.toMatch(promo);
  });

  it("no guarantee language", () => {
    // Negated statements ("nu este garantat", "nu poate fi garantat") are the honest form.
    const strip = (t: string) => t.replace(/nu (este|poate fi) garantat\w*/gi, "");
    for (const d of published) for (const t of textsOf(d)) expect(strip(t), d.slug).not.toMatch(/garant/i);
  });
});

describe("structured data mirrors visible content", () => {
  it("FAQPage questions equal the visible FAQs", () => {
    for (const d of published) {
      const ld = faqJsonLd(d.faqs) as { mainEntity: { name: string }[] } | null;
      if (d.faqs.length === 0) expect(ld).toBeNull();
      else expect(ld!.mainEntity.map((q) => q.name)).toEqual(d.faqs.map((f) => f.question));
    }
  });
});
