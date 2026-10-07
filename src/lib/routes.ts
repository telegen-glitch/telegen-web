import { content, hrefForDoc } from "@/content/source";
import { reviewContext } from "@/lib/medical";

export interface RouteEntry {
  path: string;
  indexable: boolean;
  lastModified?: string;
}

/** Every public route with its page-level indexability. Source for sitemap and tests. */
export function allRoutes(): RouteEntry[] {
  const staticPages: RouteEntry[] = [
    "/",
    "/afectiuni",
    "/ghiduri",
    "/tratamente",
    "/cum-functioneaza",
    "/standarde-clinice",
    "/evaluare",
    "/termeni-si-conditii",
    "/politica-de-confidentialitate",
    "/politica-cookie",
  ].map((path) => ({ path, indexable: true }));

  const docs = [
    ...content.listConditions().map((c) => c.doc),
    ...content.listConditions().flatMap((c) => content.listSubpages(c.slug)),
    ...content.listGuides(),
    ...content.listTreatments(),
  ].map((d) => ({ path: hrefForDoc(d), indexable: reviewContext(d).indexable, lastModified: d.updatedAt }));

  const team: RouteEntry[] = [{ path: "/echipa-medicala", indexable: true }];

  return [...staticPages, ...docs, ...team];
}
