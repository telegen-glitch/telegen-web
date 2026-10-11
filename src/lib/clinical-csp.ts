import { createHash } from "node:crypto";
import { JS_CLASS_SCRIPT } from "./clinical-paths";

/** sha256 of the one inline script in the root layout, so it runs under the strict policy. */
export const JS_CLASS_HASH = `'sha256-${createHash("sha256").update(JS_CLASS_SCRIPT).digest("base64")}'`;

/**
 * The clinical area's Content-Security-Policy (CLAUDE.md v5): scripts only with
 * this request's nonce (plus what they load), no third-party script or frame,
 * connections only to the site and the Supabase project (photo uploads), forms
 * only to the site, Stripe Checkout and the v4.7 hand-over target.
 */
export function clinicalCsp(input: {
  nonce: string;
  supabaseUrl?: string | null;
  /** v4.7 hand-over target (CLINICAL_APP_URL): its https origin may receive the evaluation's form. */
  clinicalAppUrl?: string | null;
  dev?: boolean;
}): string {
  const origin = (raw?: string | null, httpsOnly = false) => {
    try {
      const url = new URL(raw ?? "");
      return httpsOnly && url.protocol !== "https:" ? "" : ` ${url.origin}`;
    } catch {
      return "";
    }
  };
  const supabase = origin(input.supabaseUrl);
  const clinicalApp = origin(input.clinicalAppUrl, true);
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${input.nonce}' 'strict-dynamic' ${JS_CLASS_HASH}${input.dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:${supabase}`,
    "font-src 'self'",
    `connect-src 'self'${supabase}${input.dev ? " ws:" : ""}`,
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    `form-action 'self' https://checkout.stripe.com${clinicalApp}`,
    ...(input.dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
