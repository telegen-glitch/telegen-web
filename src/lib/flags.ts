/**
 * Feature flags for sections that need real assets or owner confirmation
 * (CLAUDE.md §4c.C, §9). Every flag stays OFF until real content exists and
 * the owner confirms it. Components behind these flags render nothing when off:
 * never a placeholder that could pass for real.
 */
export const flags = {
  /** Prices on condition pages, after the education. Owner pricing decision. */
  pricing: false,
  /** "Featured in" press logos. Needs real coverage + permission to use logos. */
  pressLogos: false,
  /** Star ratings and review counts. Needs a verified review source. */
  ratings: false,
  /** Reviews carousel. Needs real, consented, verifiable reviews. */
  reviews: false,
  /** Doctor photos, carousel, grid and quotes. Needs confirmed clinicians. */
  doctorProfiles: false,
  /** Certification / registration badges. Needs real registrations. */
  certificationBadges: false,
  /** Refund promise. Owner commercial + legal decision. */
  refundPromise: false,
  /** Social links in the footer. Needs real accounts. */
  socialLinks: false,
} as const;

export type FlagName = keyof typeof flags;

export function isEnabled(flag: FlagName): boolean {
  return flags[flag];
}
