import { content } from "@/content/source";
import type { Clinician, Condition, MedicalDoc } from "@/content/types";
import { hasRealReview, isMedicalDocIndexable } from "@/lib/indexing";
import { citationOrder } from "@/lib/rich-text";

/** All rich-text strings of a doc in reading order (for citation numbering). */
export function docTexts(doc: MedicalDoc, condition?: Condition): string[] {
  const texts: string[] = [doc.summary];
  for (const s of doc.sections) {
    for (const b of s.blocks) {
      if (b.type === "list") texts.push(...b.items);
      else texts.push(b.text);
    }
  }
  if (condition?.timeline) {
    texts.push(condition.timeline.intro, ...condition.timeline.steps.map((s) => s.text));
  }
  texts.push(...doc.faqs.map((f) => f.answer));
  return texts;
}

/** Source ids numbered by first citation, then any listed-but-uncited sources. */
export function sourceOrderFor(doc: MedicalDoc, condition?: Condition): string[] {
  const cited = citationOrder(docTexts(doc, condition));
  const extra = [...doc.sourceIds, ...(condition?.timeline?.sourceIds ?? [])].filter(
    (id) => !cited.includes(id),
  );
  return [...cited, ...new Set(extra)];
}

export interface ReviewContext {
  reviewer?: Clinician;
  realReviewer?: Clinician;
  indexable: boolean;
}

export function reviewContext(doc: MedicalDoc): ReviewContext {
  const reviewer = doc.review ? content.getClinician(doc.review.reviewerSlug) : undefined;
  const real = hasRealReview(doc, content.getClinician);
  return {
    reviewer,
    realReviewer: real ? reviewer : undefined,
    indexable: isMedicalDocIndexable(doc, content.getClinician),
  };
}
