/**
 * Content interface. Pages read content only through these functions, so the
 * local typed content can be swapped for Sanity (Phase 5) without touching pages.
 * Only published documents are ever returned.
 */
import { clinicians, getClinician } from "./clinicians";
import { conditions } from "./conditions";
import { guides } from "./guides";
import { getSource, sources } from "./sources";
import { treatments } from "./treatments";
import type { Clinician, Condition, MedicalDoc, Source } from "./types";

export interface ContentSource {
  listConditions(): Condition[];
  /** Modelled but unpublished topics, shown only as non-clickable "în curând". */
  listUpcomingTopics(): { slug: string; name: string }[];
  getCondition(slug: string): Condition | undefined;
  listGuides(conditionSlug?: string): MedicalDoc[];
  getGuide(slug: string): MedicalDoc | undefined;
  listTreatments(conditionSlug?: string): MedicalDoc[];
  getTreatment(slug: string): MedicalDoc | undefined;
  listClinicians(): Clinician[];
  getClinician(slug: string): Clinician | undefined;
  getSources(ids: string[]): Source[];
  allSources(): Source[];
}

const published = <T extends { status: string }>(items: T[]) => items.filter((i) => i.status === "published");

export const localContent: ContentSource = {
  listConditions: () => published(conditions),
  listUpcomingTopics: () =>
    conditions.filter((c) => c.status === "draft").map(({ slug, name }) => ({ slug, name })),
  getCondition: (slug) => published(conditions).find((c) => c.slug === slug),
  listGuides: (conditionSlug) =>
    published(guides).filter((g) => !conditionSlug || g.conditionSlug === conditionSlug),
  getGuide: (slug) => published(guides).find((g) => g.slug === slug),
  listTreatments: (conditionSlug) =>
    published(treatments).filter((t) => !conditionSlug || t.conditionSlug === conditionSlug),
  getTreatment: (slug) => published(treatments).find((t) => t.slug === slug),
  listClinicians: () => clinicians,
  getClinician,
  getSources: (ids) => ids.map(getSource).filter((s): s is Source => Boolean(s)),
  allSources: () => sources,
};

/** The active content source. Phase 5 selects Sanity here when configured. */
export const content: ContentSource = localContent;

export function hrefForDoc(doc: Pick<MedicalDoc, "kind" | "slug">): string {
  switch (doc.kind) {
    case "condition":
      return `/afectiuni/${doc.slug}`;
    case "guide":
      return `/ghiduri/${doc.slug}`;
    case "treatment":
      return `/tratamente/${doc.slug}`;
  }
}
