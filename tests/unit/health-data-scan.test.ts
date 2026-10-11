import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { templates } from "@/clinical/email/templates";
import { logEvent, opaqueIds } from "@/clinical/log";
import { stripeMetadata } from "@/clinical/payments/metadata";
import { content } from "@/content/source";
import { MEDICINE_NAMES } from "./compliance";

/**
 * Health-data scan and walls (CLAUDE.md v5). Runs before every build: health
 * data must never reach a URL, a log line, an analytics call, Stripe metadata or
 * an e-mail body, and public pages must stay static and free of clinical code.
 */

const ROOT = process.cwd();
const rel = (f: string) => path.relative(ROOT, f).split(path.sep).join("/");
function files(dir: string, ext = /\.(ts|tsx)$/): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full, ext) : ext.test(name) ? [full] : [];
  });
}
const all = files(path.join(ROOT, "src"));
const isClinical = (f: string) => /^src\/(clinical\/|app\/\(clinical\)\/|app\/api\/)/.test(rel(f));
const clinical = all.filter(isClinical);
const publicFiles = all.filter((f) => !isClinical(f));
const read = (f: string) => readFileSync(f, "utf8");

const CONDITION_WORDS = /cădere|caderea|păr\b|acnee|disfuncți|disfunctie|erecți|erectil|alopecie/i;

describe("walls", () => {
  it("public code never imports clinical code", () => {
    const offenders = publicFiles.filter((f) =>
      /from ["'](@\/clinical|[./]+\/clinical)(\/|["'])/.test(read(f)),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it("public pages stay static: no request-time APIs or forced dynamic rendering", () => {
    const pages = files(path.join(ROOT, "src/app/(site)"));
    const offenders = pages.filter((f) =>
      /from ["']next\/headers["']|\bconnection\(\)|export const dynamic\s*=\s*["']force-dynamic/.test(
        read(f),
      ),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it("the clinical area is a single route group whose routes carry only opaque ids", () => {
    const dirs = readdirSync(path.join(ROOT, "src/app/(clinical)"), { recursive: true, withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    const dynamicSegments = dirs.filter((d) => d.startsWith("["));
    for (const seg of dynamicSegments) expect(seg, seg).toMatch(/^\[(caseId|orderId|id|token)\]$/);
    const top = readdirSync(path.join(ROOT, "src/app/(clinical)")).filter((d) => !d.includes("."));
    for (const t of top) expect(["evaluare", "cont", "medic", "farmacie", "admin"], t).toContain(t);
  });
});

describe("crawlers", () => {
  it("robots.txt keeps every clinical path out even when the site is indexable; the sitemap never lists them", async () => {
    const saved = { SITE_INDEXING: process.env.SITE_INDEXING, VERCEL_ENV: process.env.VERCEL_ENV };
    process.env.SITE_INDEXING = "on";
    process.env.VERCEL_ENV = "production";
    try {
      const { default: robots } = await import("@/app/robots");
      const rules = [robots().rules].flat();
      for (const r of rules) {
        const disallow = [r.disallow ?? []].flat();
        for (const p of ["/evaluare", "/cont", "/medic", "/farmacie", "/admin", "/api/"])
          expect(disallow).toContain(p);
      }
      const { default: sitemap } = await import("@/app/sitemap");
      expect(
        sitemap().some((e) => /\/(evaluare|cont|medic|farmacie|admin)(\/|$)/.test(new URL(e.url).pathname)),
      ).toBe(false);
    } finally {
      process.env.SITE_INDEXING = saved.SITE_INDEXING;
      process.env.VERCEL_ENV = saved.VERCEL_ENV;
    }
  });
});

describe("health data never travels in URLs, logs or analytics", () => {
  it("clinical code builds no query strings with health fields", () => {
    const offenders = clinical.filter((f) =>
      /[?&](condition|topic|answer|answers|question|q|slot|plan|planId|medicine|reason)=|searchParams\.set\(|new URLSearchParams\(/.test(
        read(f),
      ),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it("clinical code never calls console or analytics directly", () => {
    const offenders = clinical
      .filter((f) => rel(f) !== "src/clinical/log.ts")
      .filter((f) => /\bconsole\.|@\/lib\/analytics|next\/script/.test(read(f)));
    expect(offenders.map(rel)).toEqual([]);
  });

  it("the logger keeps only opaque ids", () => {
    expect(opaqueIds({ case: "00000000-0000-4000-8000-000000000001", note: "acnee severă" })).toEqual({
      case: "00000000-0000-4000-8000-000000000001",
      note: "[redacted]",
    });
    expect(() => logEvent("case.created", { case: "x" })).not.toThrow();
  });

  it("analytics events are a closed list without payload", () => {
    const src = read(path.join(ROOT, "src/lib/analytics.ts"));
    expect(src).toMatch(/export function track\(event: AnalyticsEvent\): void/);
  });
});

describe("Stripe metadata and e-mails carry no health data", () => {
  it("Stripe metadata is opaque ids only", () => {
    const meta = stripeMetadata({ caseId: "00000000-0000-4000-8000-000000000001", purpose: "first_order" });
    expect(Object.keys(meta).sort()).toEqual(["case_id", "purpose"]);
    expect(JSON.stringify(meta)).not.toMatch(CONDITION_WORDS);
    expect(JSON.stringify(meta)).not.toMatch(MEDICINE_NAMES);
    expect(() => stripeMetadata({ caseId: "acnee", purpose: "first_order" })).toThrow();
  });

  it("every e-mail template is free of conditions, medicines and answers", () => {
    const answers = content.listConditions().flatMap((c) => [c.name, c.slug]);
    for (const [name, render] of Object.entries(templates)) {
      const out = render({ firstName: "Andrei", link: "https://telegen.ro/cont" });
      const text = `${out.subject}\n${out.text}`;
      expect(text, name).not.toMatch(CONDITION_WORDS);
      expect(text, name).not.toMatch(MEDICINE_NAMES);
      for (const a of answers) expect(text, name).not.toContain(a);
      expect(text, name).not.toMatch(/https?:\/\/\S*\?/);
    }
  });
});
