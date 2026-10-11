import type { MetadataRoute } from "next";
import { CLINICAL_PREFIXES } from "@/lib/clinical-paths";
import { absoluteUrl, isSiteIndexable, siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isSiteIndexable()) {
    // Previews, local builds and production before launch approval.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  // The clinical area and the API are never crawled, in any group (CLAUDE.md v5).
  const disallow = [...CLINICAL_PREFIXES.map((p) => `${p}/`), ...CLINICAL_PREFIXES, "/api/"];
  const rules: MetadataRoute.Robots["rules"] = [
    // Search and answer-engine crawlers: explicitly allowed on public content.
    { userAgent: ["Googlebot", "Bingbot", "OAI-SearchBot"], allow: "/", disallow },
    { userAgent: "*", allow: "/", disallow },
  ];
  // GPTBot (model training) is an owner decision; "unchanged" adds no rule.
  if (siteConfig.crawlers.gptbot === "allow") rules.push({ userAgent: "GPTBot", allow: "/", disallow });
  if (siteConfig.crawlers.gptbot === "disallow") rules.push({ userAgent: "GPTBot", disallow: "/" });

  return { rules, sitemap: absoluteUrl("/sitemap.xml"), host: siteConfig.url };
}
