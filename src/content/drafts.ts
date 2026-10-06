import type { DocKind, GraphRole, MedicalDoc } from "./types";

/**
 * A modelled page whose clinical text is not written yet. Drafts are never
 * routed, listed or put in the sitemap. Their text is written only from sources
 * that were fetched and read (CLAUDE.md 7c.C), then status becomes "published".
 */
export function draftDoc(input: {
  kind: DocKind;
  slug: string;
  path?: string;
  conditionSlug: string;
  graphRole: GraphRole;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1?: string;
}): MedicalDoc {
  return {
    ...input,
    h1: input.h1 ?? input.title,
    summary: "",
    sections: [],
    faqs: [],
    sourceIds: [],
    limitations: "",
    publishedAt: "2026-10-06",
    updatedAt: "2026-10-06",
    related: [],
    status: "draft",
  };
}
