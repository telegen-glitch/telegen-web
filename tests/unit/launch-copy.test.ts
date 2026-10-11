import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { content } from "@/content/source";
import { serviceOpen } from "@/lib/flags";
import { launchConfig, type LaunchConfig } from "@/lib/launch-config";
import { clinicalLaunchBlockers, launchBlockers, launchLocked } from "@/lib/launch-lock";
import { prelaunchPhrases } from "@/lib/launch-phrases";
import { docTexts } from "@/lib/medical";
import { staticPages } from "@/lib/page-meta";
import { prelaunchCopy } from "@/lib/prelaunch-copy";
import { priceAnswer } from "@/lib/price-text";
import { siteConfig } from "@/lib/site";

/**
 * Launch state (CLAUDE.md v4.7). Pages cannot be rendered in a unit test, so the
 * rendered HTML of every route is checked after the build
 * (scripts/launch-copy-check.ts) and in e2e (tests/e2e/launch.spec.ts). Here:
 * the defaults, the sources, every route's metadata and all content strings.
 */

const SRC = path.join(process.cwd(), "src");
const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;
/** The only files allowed to hold pre-launch wording. */
const ALLOWED = new Set(["lib/prelaunch-copy.ts", "lib/launch-phrases.ts"]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx|css)$/.test(name) ? [full] : [];
  });
}

describe("launch state", () => {
  it('defaults to "open", with the service open for every condition', () => {
    expect(siteConfig.launchState).toBe("open");
    for (const c of content.listConditions()) expect(serviceOpen[c.slug], c.slug).toBe(true);
  });

  it("detects the pre-launch phrases it is meant to", () => {
    expect(prelaunchPhrases("Serviciul nu este <span>încă deschis</span>")).toContain("încă deschis");
    expect(prelaunchPhrases('<meta content="În pre-lansare, răspunsurile">')).toContain("pre-lansare");
    expect(prelaunchPhrases("Anunță-mă la lansare")).toEqual(
      expect.arrayContaining(["anunță-mă", "la lansare"]),
    );
    expect(prelaunchPhrases("TEMPORARY")).toEqual(["temporary"]);
    // A medical instruction is not pre-launch wording.
    expect(prelaunchPhrases("anunță imediat medicul")).toEqual([]);
  });

  it("every pre-launch string lives in prelaunch-copy.ts and nowhere else in src", () => {
    const offenders = sourceFiles(SRC).flatMap((file) => {
      const rel = path.relative(SRC, file).split(path.sep).join("/");
      if (ALLOWED.has(rel)) return [];
      const found = prelaunchPhrases(readFileSync(file, "utf8"));
      return found.length > 0 ? [`${rel}: ${found.join(", ")}`] : [];
    });
    expect(offenders).toEqual([]);
    for (const text of Object.values(prelaunchCopy).flatMap((v) =>
      typeof v === "string" ? [v] : Object.values(v),
    ))
      expect(typeof text).toBe("string");
  });

  it("no route's title or description, and no content string, says the service is not open", () => {
    for (const [route, meta] of Object.entries(staticPages()))
      expect(prelaunchPhrases(`${meta.title} ${meta.description}`), route).toEqual([]);
    const docs = [
      ...content.listConditions().map((c) => ({ doc: c.doc, condition: c })),
      ...content
        .listConditions()
        .flatMap((c) => content.listSubpages(c.slug).map((doc) => ({ doc, condition: c }))),
      ...content.listGuides().map((doc) => ({ doc, condition: undefined })),
      ...content.listTreatments().map((doc) => ({ doc, condition: undefined })),
    ];
    for (const { doc, condition } of docs) {
      const texts = [
        doc.metaTitle,
        doc.metaDescription,
        doc.h1,
        ...doc.faqs.map((f) => f.question),
        ...docTexts(doc, condition),
      ];
      expect(prelaunchPhrases(texts.join("\n")), doc.slug).toEqual([]);
    }
  });
});

describe("launch lock", () => {
  const conditions = content.listConditions();
  const complete: LaunchConfig = {
    company: { legalName: "Exemplu SRL", cui: "RO1", regCom: "J1/1/2026", address: "Str. Exemplu 1" },
    contact: { email: "contact@exemplu.ro", responseTime: "2 zile lucrătoare" },
    prices: Object.fromEntries(conditions.map((c) => [c.slug, [{ amount: 100, label: "Plan" }]])),
    legalApproved: true,
  };

  it("lists every missing value, and nothing once all are supplied", () => {
    const now = launchBlockers({ config: launchConfig, conditions });
    // company (4), contact (2), the lawyer's sign-off; the hair-loss plan is priced.
    expect(now.length).toBe(6 + 1);
    expect(now.join("\n")).toMatch(/CUI[\s\S]*legalApproved/);
    expect(launchBlockers({ config: complete, conditions })).toEqual([]);
  });

  it("a condition without a price simply cannot be bought; at least one must be priced, completely", () => {
    const acneUnpriced = { ...complete, prices: { ...complete.prices, acnee: [] } };
    expect(launchBlockers({ config: acneUnpriced, conditions })).toEqual([]);
    expect(launchBlockers({ config: { ...complete, prices: {} }, conditions })).toEqual([
      "prețul pentru cel puțin o afecțiune (prices)",
    ]);
    const broken = { ...complete, prices: { ...complete.prices, acnee: [{ amount: 0, label: "Plan" }] } };
    expect(launchBlockers({ config: broken, conditions })).toEqual([
      'prețul pentru acnee este incomplet (prices["acnee"])',
    ]);
  });

  it("with APP_LAUNCH=on, the build also needs live keys for every clinical service", () => {
    expect(clinicalLaunchBlockers(env({}))).toEqual([]);
    expect(clinicalLaunchBlockers(env({ APP_LAUNCH: "on" }))).toHaveLength(4);
    const live = {
      APP_LAUNCH: "on",
      SUPABASE_URL: "https://x.supabase.co",
      SUPABASE_ANON_KEY: "a",
      SUPABASE_SERVICE_ROLE_KEY: "s",
      DATABASE_URL: "postgres://x",
      STRIPE_SECRET_KEY: "sk_live_x",
      STRIPE_WEBHOOK_SECRET: "whsec_x",
      BREVO_API_KEY: "b",
      EMAIL_SENDER: "e@x.ro",
      CRON_SECRET: "c",
    };
    expect(clinicalLaunchBlockers(env(live))).toEqual([]);
    expect(clinicalLaunchBlockers(env({ ...live, STRIPE_SECRET_KEY: "sk_test_x" }))).toEqual([
      "Stripe live (STRIPE_SECRET_KEY sk_live_…, STRIPE_WEBHOOK_SECRET)",
    ]);
  });

  it("fails production builds only, and only in the open state", () => {
    const missing = ["x"];
    expect(launchLocked(env({ VERCEL_ENV: "production" }), "open", missing)).toBe(true);
    expect(launchLocked(env({ VERCEL_ENV: "preview" }), "open", missing)).toBe(false);
    expect(launchLocked(env({}), "open", missing)).toBe(false);
    expect(launchLocked(env({ VERCEL_ENV: "production" }), "prelaunch", missing)).toBe(false);
    expect(launchLocked(env({ VERCEL_ENV: "production" }), "open", [])).toBe(false);
  });

  it("ships with no invented launch values; prices are the owner's hair-loss plan only", () => {
    expect(launchConfig.company).toEqual({ legalName: null, cui: null, regCom: null, address: null });
    expect(launchConfig.contact).toEqual({ email: null, responseTime: null });
    expect(Object.keys(launchConfig.prices)).toEqual(["caderea-parului"]);
    expect(launchConfig.prices["caderea-parului"].map((p) => p.amount)).toEqual([320, 870]);
    for (const p of launchConfig.prices["caderea-parului"])
      expect(p.label).toMatch(/^Plan pentru căderea părului/);
    expect(launchConfig.legalApproved).toBe(false);
  });
});

describe("price answer", () => {
  const conditions = [
    { slug: "acnee", name: "Acnee" },
    { slug: "caderea-parului", name: "Căderea părului" },
  ];

  it("lists only conditions with a configured price, never a marker or an invented price", () => {
    const config: LaunchConfig = {
      ...launchConfig,
      prices: { acnee: [{ amount: 149, label: "Plan pentru acnee" }] },
    };
    expect(priceAnswer(conditions, config)).toBe("**Acnee:** plan pentru acnee, 149 lei.");
    expect(priceAnswer(conditions, { ...launchConfig, prices: {} })).toBeNull();
    expect(priceAnswer(conditions, launchConfig)).toBe(
      "**Căderea părului:** plan pentru căderea părului, lunar, 320 lei; plan pentru căderea părului, 3 luni, 870 lei.",
    );
  });
});

describe("owner markers", () => {
  it("render on previews and locally, never in production", async () => {
    const { showOwnerMarkers } = await import("@/lib/launch-config");
    expect(showOwnerMarkers(env({ VERCEL_ENV: "production" }))).toBe(false);
    expect(showOwnerMarkers(env({ VERCEL_ENV: "preview" }))).toBe(true);
    expect(showOwnerMarkers(env({}))).toBe(true);
  });
});
