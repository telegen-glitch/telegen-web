import type { MedicalDoc, TeamMember } from "@/content/types";
import { reviewerSpecialties } from "@/content/clinicians";
import { isSiteIndexable } from "@/lib/site";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Section 9.2 + §v4.D: a medical page may be indexed only when it is published
 * and its review names a real team member (by opaque id) of the right specialty
 * for the condition, with a valid review date that is not in the future.
 */
export function hasRealReview(
  doc: Pick<MedicalDoc, "review" | "conditionSlug">,
  findMember: (id: string) => TeamMember | undefined,
  today: Date = new Date(),
): boolean {
  const review = doc.review;
  if (!review) return false;
  if (!ISO.test(review.reviewedAt)) return false;
  const reviewed = Date.parse(`${review.reviewedAt}T00:00:00Z`);
  if (Number.isNaN(reviewed) || reviewed > today.getTime()) return false;
  const member = findMember(review.reviewerId);
  if (!member) return false;
  const allowed = reviewerSpecialties[doc.conditionSlug];
  return !allowed || allowed.includes(member.specialty);
}

export function isMedicalDocIndexable(
  doc: Pick<MedicalDoc, "review" | "status" | "conditionSlug">,
  findMember: (id: string) => TeamMember | undefined,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return doc.status === "published" && isSiteIndexable(env) && hasRealReview(doc, findMember);
}
