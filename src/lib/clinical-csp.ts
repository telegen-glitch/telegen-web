import { createHash } from "node:crypto";
import { JS_CLASS_SCRIPT } from "./clinical-paths";

/** sha256 of the one inline script in the root layout, so it runs under the strict policy. */
export const JS_CLASS_HASH = `'sha256-${createHash("sha256").update(JS_CLASS_SCRIPT).digest("base64")}'`;

/**
 * The clinical area's Content-Security-Policy (CLAUDE.md v5): scripts only with
 * this request's nonce (plus what they load), no third-party script or frame,
 * connections only to the site and the Supabase project (photo uploads), forms
 * only to the site and Stripe Checkout.
 */
export function clinicalCsp(input: { nonce: string; supabaseUrl?: string | null; dev?: boolean }): string {
  let supabase = "";
  try {
    if (input.supabaseUrl) supabase = ` ${new URL(input.supabaseUrl).origin}`;
  } catch {
    supabase = "";
  }
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
    "form-action 'self' https://checkout.stripe.com",
    ...(input.dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
