/**
 * Site-wide configuration. Anything an owner may need to change without a code
 * review of its own (feature flags, crawler policy) lives here and is documented.
 */

export type GptBotPolicy = "unchanged" | "allow" | "disallow";

export const siteConfig = {
  name: "Telegen",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://telegen.ro").replace(/\/$/, ""),
  locale: "ro_RO",
  language: "ro",
  description:
    "Clinică online pentru sănătatea bărbaților din România: evaluare medicală, plan de tratament clar și urmărire, de pe telefon.",
  /**
   * Company identity for the footer, /contact and legal pages. Every null value is
   * shown as TEMPORARY until the owner supplies it (CLAUDE.md §9.6). Never invent.
   */
  company: {
    legalName: null as string | null,
    cui: null as string | null,
    regCom: null as string | null,
    address: null as string | null,
    email: null as string | null,
    /** e.g. "2 zile lucrătoare" — an owner commitment, so not set by default. */
    responseTime: null as string | null,
  },
  /** Status shown on the site while the clinical service is not open. */
  launchState: "prelaunch" as "prelaunch" | "open",
  crawlers: {
    /**
     * GPTBot (OpenAI model training) is a separate owner decision.
     * "unchanged" = no explicit rule, so it falls under the generic `*` group.
     * Search/answer crawlers (Googlebot, Bingbot, OAI-SearchBot) are always allowed
     * on public content when the site is indexable.
     */
    gptbot: "unchanged" as GptBotPolicy,
  },
} as const;

/**
 * The whole site is noindex unless BOTH are true:
 *  - SITE_INDEXING=on (set by the owner only after explicit launch approval)
 *  - VERCEL_ENV=production (previews and local builds are never indexable)
 */
export function isSiteIndexable(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.SITE_INDEXING === "on" && env.VERCEL_ENV === "production";
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
