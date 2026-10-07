import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { conditions } from "@/content/conditions";
import { guides as guidesAll } from "@/content/guides";
import { treatments as treatmentsAll } from "@/content/treatments";
import { staticPages } from "@/lib/page-meta";
import { content, hrefForDoc } from "@/content/source";
import type { MedicalDoc } from "@/content/types";
import { docTexts } from "@/lib/medical";
import { allRoutes } from "@/lib/routes";
import { faqJsonLd } from "@/lib/seo";
import { routes as e2eRoutes } from "../e2e/routes";

const published = [
  ...content.listConditions().map((c) => c.doc),
  ...content.listConditions().flatMap((c) => content.listSubpages(c.slug)),
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

/**
 * Source check (CLAUDE.md 7c.H): every published medical page cites a source in
 * its answer-first summary and in every section. No exceptions.
 */
describe("source check: every claim cited", () => {
  const docs = [
    ...content.listConditions().map((c) => c.doc),
    ...content.listConditions().flatMap((c) => content.listSubpages(c.slug)),
    ...content.listGuides(),
    ...content.listTreatments(),
  ];
  it("summaries cite a source", () => {
    for (const d of docs) expect(d.summary, d.slug).toMatch(/\{\{cite:/);
  });
  it("every section cites a source", () => {
    for (const d of docs) {
      for (const sec of d.sections) {
        expect(JSON.stringify(sec.blocks), `${d.slug}#${sec.id}`).toMatch(/\{\{cite:/);
      }
    }
  });
});

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
  it("the e2e route list covers every route (no page skips axe, metadata and CSP checks)", () => {
    expect(new Set(e2eRoutes)).toEqual(routes);
  });

  it("all internal links resolve to a route", () => {
    for (const c of content.listConditions()) {
      for (const a of c.approaches ?? []) expect(routes, `${c.slug} approach → ${a.href}`).toContain(a.href);
    }
    for (const d of published) {
      const links = [
        ...textsOf(d).flatMap((t) => [...t.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1])),
        ...d.related.map((r) => r.href.split("#")[0]),
      ];
      for (const l of links) expect(routes, `${d.slug} → ${l}`).toContain(l);
    }
  });

  it("condition ↔ causes ↔ treatment ↔ medicine pages are connected both ways", () => {
    for (const c of content.listConditions()) {
      const condHref = hrefForDoc(c.doc);
      const children = [
        ...content.listSubpages(c.slug),
        ...content.listGuides(c.slug),
        ...content.listTreatments(c.slug),
      ];
      const roles = new Set(children.map((d) => d.graphRole));
      for (const role of ["causes", "treatment"] as const) expect(roles, c.slug).toContain(role);
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

  it("drafts, if any, are never routed", () => {
    for (const d of conditions.filter((c) => c.status === "draft")) {
      expect(content.getCondition(d.slug)).toBeUndefined();
      expect(routes).not.toContain(d.basePath);
    }
    const draftDocs = [...conditions.flatMap((c) => c.subpages ?? []), ...guidesAll, ...treatmentsAll].filter(
      (d) => d.status === "draft",
    );
    for (const d of draftDocs) expect(routes).not.toContain(hrefForDoc(d));
  });

  it("every published medical page has ≥ 3 related links, 4–6 FAQs on new pages, and is linked from ≥ 3 pages", () => {
    const inbound = new Map<string, number>();
    for (const d of published) {
      const targets = new Set([
        ...d.related.map((r) => r.href.split("#")[0]),
        ...textsOf(d).flatMap((t) => [...t.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1])),
      ]);
      targets.delete(hrefForDoc(d));
      for (const t of targets) inbound.set(t, (inbound.get(t) ?? 0) + 1);
    }
    for (const d of published) {
      expect(d.related.length, `${d.slug} related`).toBeGreaterThanOrEqual(3);
      expect(inbound.get(hrefForDoc(d)) ?? 0, `${hrefForDoc(d)} inbound`).toBeGreaterThanOrEqual(3);
      if (d.conditionSlug !== "caderea-parului") {
        expect(d.faqs.length, `${d.slug} FAQs`).toBeGreaterThanOrEqual(4);
        expect(d.faqs.length, `${d.slug} FAQs`).toBeLessThanOrEqual(6);
      }
    }
  });
});

describe("prescription-medicine promotion rules (section 9.4)", () => {
  const medicine =
    /minoxidil|finasterid|dutasterid|sildenafil|tadalafil|isotretinoin|adapalen|tretinoin|benzoil|clindamicin|doxiciclin|limeciclin|nitroglicerin|riociguat|tamsulosin|doxazosin|alfuzosin|terazosin/i;

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
  it("entity and drug facts appear in the page's visible text", () => {
    const docs = [
      ...content.listConditions().map((c) => c.doc),
      ...content.listConditions().flatMap((c) => content.listSubpages(c.slug)),
      ...content.listTreatments(),
    ];
    for (const d of docs) {
      const cond = d.kind === "condition" ? content.getCondition(d.conditionSlug) : undefined;
      const visible = [
        d.h1,
        d.title,
        ...textsOf(d),
        ...d.sections.map((x) => x.heading),
        // Shown on the hub: medical name (eyebrow) and the approach cards.
        ...(cond ? [cond.medicalName, ...(cond.approaches ?? []).flatMap((a) => [a.title, a.text])] : []),
      ]
        .join(" ")
        .toLowerCase();
      const facts = [
        ...(d.entity?.alternateName ?? []),
        ...(d.entity?.signOrSymptom ?? []),
        ...(d.entity?.riskFactor ?? []),
        ...(d.entity?.possibleTreatment ?? []),
        ...(d.drug ? [d.drug.activeIngredient] : []),
      ];
      for (const f of facts) expect(visible, `${d.slug}: "${f}" is schema-only`).toContain(f.toLowerCase());
    }
  });

  it("FAQPage questions equal the visible FAQs", () => {
    for (const d of published) {
      const ld = faqJsonLd(d.faqs) as { mainEntity: { name: string }[] } | null;
      if (d.faqs.length === 0) expect(ld).toBeNull();
      else expect(ld!.mainEntity.map((q) => q.name)).toEqual(d.faqs.map((f) => f.question));
    }
  });
});

describe("titles and descriptions (§v4.C6)", () => {
  const all = [
    ...conditions.map((c) => c.doc),
    ...conditions.flatMap((c) => c.subpages ?? []),
    ...guidesAll,
    ...treatmentsAll,
  ];
  it("medical pages: title ≤ 60 with suffix, description 120–160 (drafts included)", () => {
    for (const d of all) {
      expect(`${d.metaTitle} | Telegen`.length, `${d.slug} title`).toBeLessThanOrEqual(60);
      expect(d.metaDescription.length, `${d.slug} description`).toBeGreaterThanOrEqual(120);
      expect(d.metaDescription.length, `${d.slug} description`).toBeLessThanOrEqual(160);
    }
  });
  it("static pages: title ≤ 60 with suffix, description 120–160", () => {
    for (const [path, m] of Object.entries(staticPages())) {
      const title = m.absolute ? m.title : `${m.title} | Telegen`;
      expect(title.length, `${path} title`).toBeLessThanOrEqual(60);
      expect(m.description.length, `${path} description`).toBeGreaterThanOrEqual(120);
      expect(m.description.length, `${path} description`).toBeLessThanOrEqual(160);
    }
  });
  it("titles are unique", () => {
    const titles = [
      ...all.filter((d) => d.status === "published").map((d) => d.metaTitle),
      ...Object.values(staticPages()).map((m) => m.title),
    ];
    expect(new Set(titles).size).toBe(titles.length);
  });
});
