import { siteConfig } from "./site";

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
  /** Certification / registration badges. Needs real registrations. */
  certificationBadges: false,
  /** Refund promise. Owner commercial + legal decision. */
  refundPromise: false,
  /** Social links in the footer. Needs real accounts. */
  socialLinks: false,
} as const;

export type FlagName = keyof typeof flags;

export type HeroMedia = "photo" | "illustration";

/**
 * What each hero condition panel shows (A/B switch for after launch). "photo"
 * only takes effect when every photo file exists in public/media/hero/; until
 * then the illustration is used automatically (see src/lib/hero-media.ts).
 */
export const heroMedia: { hair: HeroMedia } = {
  hair: "photo",
};

/**
 * Per-condition service switch (CLAUDE.md 7c.D, v4.7). Open for every condition
 * when the site is in the "open" launch state: the evaluation then ends with the
 * hand-over to the clinical app. In "prelaunch" every condition is closed and the
 * evaluation ends on the "not open yet" screen with the notification form.
 */
const open = siteConfig.launchState === "open";
export const serviceOpen: Record<string, boolean> = {
  "caderea-parului": open,
  acnee: open,
  "disfunctie-erectila": open,
};

export function isServiceOpen(topic: string): boolean {
  return serviceOpen[topic] === true;
}

export function isEnabled(flag: FlagName): boolean {
  return flags[flag];
}
