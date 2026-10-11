import { content, hrefForDoc } from "@/content/source";
import { reviewContext } from "@/lib/medical";
import { isClinicalPath } from "@/lib/clinical-paths";
import { staticPages as staticPagesMeta } from "@/lib/page-meta";

export interface RouteEntry {
  path: string;
  indexable: boolean;
  lastModified?: string;
}

/** Every public route with its page-level indexability. Source for sitemap and tests. Clinical paths are excluded. */
export function allRoutes(): RouteEntry[] {
  // Static pages come from the central metadata table (single source of truth).
  // /contact and /politica-editoriala are listed there and built in §v4.E.
  // The clinical area (/evaluare and the rest) is never in the sitemap.
  const staticPages: RouteEntry[] = Object.keys(staticPagesMeta())
    .filter((path) => path !== "/echipa-medicala" && !isClinicalPath(path))
    .map((path) => ({ path, indexable: true }));

  const docs = [
    ...content.listConditions().map((c) => c.doc),
    ...content.listConditions().flatMap((c) => content.listSubpages(c.slug)),
    ...content.listGuides(),
    ...content.listTreatments(),
  ].map((d) => ({ path: hrefForDoc(d), indexable: reviewContext(d).indexable, lastModified: d.updatedAt }));

  const team: RouteEntry[] = [{ path: "/echipa-medicala", indexable: true }];

  return [...staticPages, ...docs, ...team];
}
