/**
 * Site-wide configuration. Anything an owner may need to change without a code
 * review of its own (feature flags, crawler policy) lives here and is documented.
 */

export type GptBotPolicy = "unchanged" | "allow" | "disallow";
export type LaunchState = "open" | "prelaunch";

export const siteConfig = {
  name: "Telegen",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://telegen.ro").replace(/\/$/, ""),
  locale: "ro_RO",
  language: "ro",
  description:
    "Clinică online pentru sănătatea bărbaților din România: evaluare medicală, plan de tratament clar și urmărire, de pe telefon.",
  /**
   * Launch state (CLAUDE.md v4.7). "open" is the default on previews and in
   * production: the site reads as the live service. "prelaunch" is kept only as a
   * fallback mode; it alone shows the pre-launch notices and the launch-
   * notification form. Company identity, contact, prices and the legal sign-off
   * live in src/lib/launch-config.ts; the production build refuses to launch
   * while any of them is missing (scripts/launch-lock.ts).
   */
  launchState: "open" as LaunchState,
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

export const isPrelaunch = (): boolean => siteConfig.launchState === "prelaunch";

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
