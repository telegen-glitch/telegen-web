import { isServiceOpen } from "./flags";
import { pricesFor } from "./launch-config";

/**
 * Real patients only once the owner launches the clinical service (CLAUDE.md v5):
 * production needs APP_LAUNCH=on; previews and local builds run in test mode.
 * Read at build time, so public pages stay static.
 */
export function clinicalOpen(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL_ENV !== "production" || env.APP_LAUNCH === "on";
}

/**
 * A condition can be evaluated and bought only when the clinical service is
 * open, its service switch is on AND it has a configured price (CLAUDE.md v5).
 * Others keep their education pages, with no evaluation button and no price.
 * The clinical side applies the same rule (src/clinical/launch.ts).
 */
export function isPurchasable(slug: string, env: NodeJS.ProcessEnv = process.env): boolean {
  return clinicalOpen(env) && isServiceOpen(slug) && pricesFor(slug).length > 0;
}
