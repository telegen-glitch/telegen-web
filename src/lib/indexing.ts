import type { Clinician, MedicalDoc } from "@/content/types";
import { isSiteIndexable } from "@/lib/site";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Section 9.2: a medical page may be indexed only when its data holds a real
 * reviewer (name + credential, not temporary) and a valid review date.
 */
export function hasRealReview(
  doc: Pick<MedicalDoc, "review">,
  findClinician: (slug: string) => Clinician | undefined,
): boolean {
  const review = doc.review;
  if (!review) return false;
  if (!ISO.test(review.reviewedAt) || Number.isNaN(Date.parse(review.reviewedAt))) return false;
  const reviewer = findClinician(review.reviewerSlug);
  if (!reviewer || reviewer.temporary) return false;
  return Boolean(reviewer.name.trim() && reviewer.credential?.trim());
}

export function isMedicalDocIndexable(
  doc: Pick<MedicalDoc, "review" | "status">,
  findClinician: (slug: string) => Clinician | undefined,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return doc.status === "published" && isSiteIndexable(env) && hasRealReview(doc, findClinician);
}
