import type { MetadataRoute } from "next";
import { allRoutes } from "@/lib/routes";
import { absoluteUrl, isSiteIndexable } from "@/lib/site";

/** Lists only pages that are allowed in the index. Empty while the site is noindex. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSiteIndexable()) return [];
  return allRoutes()
    .filter((r) => r.indexable)
    .map((r) => ({ url: absoluteUrl(r.path), ...(r.lastModified ? { lastModified: r.lastModified } : {}) }));
}
