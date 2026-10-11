import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Keeps the Supabase session fresh on clinical pages (called from src/proxy.ts):
 * Server Components cannot write cookies, so an expiring access token is renewed
 * here and the new auth cookies go out with the response. Auth cookies only.
 */
export async function refreshSupabaseSession(
  request: NextRequest,
  response: NextResponse,
  config: { url: string; publicKey: string },
): Promise<void> {
  const sb = createServerClient(config.url, config.publicKey, {
    cookieOptions: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value, options } of list) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  await sb.auth.getClaims();
}
