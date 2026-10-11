import { NextResponse, type NextRequest } from "next/server";
import { clinicalCsp } from "@/lib/clinical-csp";

/**
 * Runs only on the clinical area (see `config.matcher`). Public pages are static
 * and never pass through here. Every clinical response gets a fresh nonce-based
 * CSP, is never cached and never indexed.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = clinicalCsp({
    nonce,
    supabaseUrl: process.env.SUPABASE_URL,
    dev: process.env.NODE_ENV === "development",
  });
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export const config = {
  matcher: [
    {
      // Whole first segments only: "/cont" must not catch "/contact".
      source: "/:area(evaluare|cont|medic|farmacie|admin)/:path*",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
