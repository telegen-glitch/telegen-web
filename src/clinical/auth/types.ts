/** A verified sign-in. Mirrors the JWT claims Row Level Security reads. */
export interface Session {
  userId: string;
  email: string;
  /** "aal2" once the user has passed two-factor authentication. */
  aal: "aal1" | "aal2";
}

export type SendResult = { ok: true } | { ok: false; reason: "invalid_email" | "rate_limited" | "error" };
export type VerifyResult = { ok: true; session: Session } | { ok: false; reason: "invalid_code" | "error" };
export type MfaEnrollResult =
  { ok: true; factorId: string; qrSvg: string; secret: string } | { ok: false; reason: "error" };

/** Email one-time code sign-in plus TOTP two-factor authentication. */
export interface AuthAdapter {
  readonly kind: "supabase" | "dev";
  sendCode(email: string): Promise<SendResult>;
  verifyCode(email: string, code: string): Promise<VerifyResult>;
  session(): Promise<Session | null>;
  signOut(): Promise<void>;
  /** Verified TOTP factor ids of the signed-in user. */
  mfaFactors(): Promise<string[]>;
  mfaEnroll(): Promise<MfaEnrollResult>;
  /** Verifies a TOTP code for a factor; on success the session becomes aal2. */
  mfaVerify(factorId: string, code: string): Promise<boolean>;
}

export function normalEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null;
}

export function normalCode(raw: unknown, digits = 6): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.replace(/\s/g, "");
  return new RegExp(`^\\d{${digits}}$`).test(code) ? code : null;
}
