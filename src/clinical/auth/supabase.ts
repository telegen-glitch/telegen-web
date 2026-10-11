import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { ClinicalEnv } from "../env";
import type { AuthAdapter, Session } from "./types";

/**
 * Supabase Auth (EU project): sign-in with a 6-digit code sent by e-mail and TOTP
 * two-factor authentication. Session cookies are httpOnly and hold only the auth
 * tokens. The JWT is verified on every read (getClaims), never trusted blindly.
 */
async function client(config: NonNullable<ClinicalEnv["supabase"]>) {
  const store = await cookies();
  return createServerClient(config.url, config.anonKey, {
    cookieOptions: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Server Components cannot set cookies; src/proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

export function supabaseAuth(config: NonNullable<ClinicalEnv["supabase"]>): AuthAdapter {
  const session = async (): Promise<Session | null> => {
    const sb = await client(config);
    const { data, error } = await sb.auth.getClaims();
    const claims = data?.claims;
    if (error || !claims?.sub || typeof claims.email !== "string") return null;
    return {
      userId: claims.sub,
      email: claims.email.toLowerCase(),
      aal: claims.aal === "aal2" ? "aal2" : "aal1",
    };
  };

  return {
    kind: "supabase",
    async sendCode(email) {
      const sb = await client(config);
      const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (!error) return { ok: true };
      return { ok: false, reason: error.status === 429 ? "rate_limited" : "error" };
    },
    async verifyCode(email, code) {
      const sb = await client(config);
      const { data, error } = await sb.auth.verifyOtp({ email, token: code, type: "email" });
      if (error || !data.user)
        return {
          ok: false,
          reason: error?.status === 403 || error?.status === 400 ? "invalid_code" : "error",
        };
      const s = await session();
      return s ? { ok: true, session: s } : { ok: false, reason: "error" };
    },
    session,
    async signOut() {
      const sb = await client(config);
      await sb.auth.signOut();
    },
    async mfaFactors() {
      const sb = await client(config);
      const { data } = await sb.auth.mfa.listFactors();
      return (data?.totp ?? []).filter((f) => f.status === "verified").map((f) => f.id);
    },
    async mfaEnroll() {
      const sb = await client(config);
      const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: "Telegen" });
      if (error || !data) return { ok: false, reason: "error" };
      return { ok: true, factorId: data.id, qrSvg: data.totp.qr_code, secret: data.totp.secret };
    },
    async mfaVerify(factorId, code) {
      const sb = await client(config);
      const { error } = await sb.auth.mfa.challengeAndVerify({ factorId, code });
      return !error;
    },
  };
}
