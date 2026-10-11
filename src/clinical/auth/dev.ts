import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { asService } from "../db";
import type { AuthAdapter, Session } from "./types";

/**
 * Development and test sign-in, never on Vercel (clinicalEnv().localDrivers).
 * No e-mail is sent: the code is always DEV_CODE, and the two-factor code is
 * DEV_TOTP. The session is an HMAC-signed, httpOnly cookie holding only the
 * user id, e-mail and assurance level.
 */
export const DEV_CODE = "123456";
export const DEV_TOTP = "654321";
const COOKIE = "tg_dev_session";
const SECRET = process.env.DEV_SESSION_SECRET || "telegen-local-development-only";
const TTL_S = 8 * 60 * 60;

const sign = (payload: string) => createHmac("sha256", SECRET).update(payload).digest("base64url");

function encode(s: Session): string {
  const payload = Buffer.from(JSON.stringify({ ...s, exp: Math.floor(Date.now() / 1000) + TTL_S })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

function decode(raw: string | undefined): Session | null {
  if (!raw) return null;
  const [payload, mac] = raw.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Date.now() / 1000) return null;
    return { userId: data.userId, email: data.email, aal: data.aal === "aal2" ? "aal2" : "aal1" };
  } catch {
    return null;
  }
}

async function write(s: Session) {
  (await cookies()).set(COOKIE, encode(s), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: TTL_S,
    secure: process.env.NODE_ENV === "production",
  });
}

export function devAuth(): AuthAdapter {
  const session = async () => decode((await cookies()).get(COOKIE)?.value);
  return {
    kind: "dev",
    async sendCode() {
      return { ok: true };
    },
    async verifyCode(email, code) {
      if (code !== DEV_CODE) return { ok: false, reason: "invalid_code" };
      const userId = await asService(async (q) => {
        const found = await q.query<{ id: string }>("select id from auth.users where email = $1", [email]);
        if (found[0]) return found[0].id;
        const created = await q.query<{ id: string }>(
          "insert into auth.users (email) values ($1) returning id",
          [email],
        );
        return created[0].id;
      });
      const s: Session = { userId, email, aal: "aal1" };
      await write(s);
      return { ok: true, session: s };
    },
    session,
    async signOut() {
      (await cookies()).delete(COOKIE);
    },
    async mfaFactors() {
      const s = await session();
      if (!s) return [];
      const rows = await asService((q) =>
        q.query<{ id: string }>(
          "select id from auth.mfa_factors where user_id = $1 and status = 'verified'",
          [s.userId],
        ),
      );
      return rows.map((r) => r.id);
    },
    async mfaEnroll() {
      const s = await session();
      if (!s) return { ok: false, reason: "error" };
      const [row] = await asService((q) =>
        q.query<{ id: string }>("insert into auth.mfa_factors (user_id) values ($1) returning id", [
          s.userId,
        ]),
      );
      const qrSvg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#fff"/><text x="60" y="66" font-size="14" text-anchor="middle" font-family="sans-serif">TEST 2FA</text></svg>';
      return { ok: true, factorId: row.id, qrSvg, secret: "TEST-ONLY" };
    },
    async mfaVerify(factorId, code) {
      const s = await session();
      if (!s || code !== DEV_TOTP) return false;
      const updated = await asService((q) =>
        q.query(
          "update auth.mfa_factors set status = 'verified' where id = $1 and user_id = $2 returning id",
          [factorId, s.userId],
        ),
      );
      if (!updated.length) return false;
      await write({ ...s, aal: "aal2" });
      return true;
    },
  };
}
