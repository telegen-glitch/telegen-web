import type { MetadataRoute } from "next";
import { absoluteUrl, isSiteIndexable, siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isSiteIndexable()) {
    // Previews, local builds and production before launch approval.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  const rules: MetadataRoute.Robots["rules"] = [
    // Search and answer-engine crawlers: explicitly allowed on public content.
    { userAgent: ["Googlebot", "Bingbot", "OAI-SearchBot"], allow: "/" },
    { userAgent: "*", allow: "/" },
  ];
  // GPTBot (model training) is an owner decision; "unchanged" adds no rule.
  if (siteConfig.crawlers.gptbot === "allow") rules.push({ userAgent: "GPTBot", allow: "/" });
  if (siteConfig.crawlers.gptbot === "disallow") rules.push({ userAgent: "GPTBot", disallow: "/" });

  return { rules, sitemap: absoluteUrl("/sitemap.xml"), host: siteConfig.url };
}
