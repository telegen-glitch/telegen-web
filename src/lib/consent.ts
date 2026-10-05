/**
 * Granular cookie consent. The consent record itself is a strictly necessary
 * first-party cookie; it never contains health data.
 */
export const CONSENT_COOKIE = "telegen_consent";
export const CONSENT_VERSION = 1;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  version: number;
  decidedAt: string;
}

export type ConsentCategory = "analytics" | "marketing";

/** Configured analytics provider, if any. None is configured yet. */
export const analyticsProvider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? "";

export function hasNonEssentialTrackers(): boolean {
  return analyticsProvider !== "";
}

export function readConsent(cookieString: string): ConsentState | null {
  const raw = cookieString
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      version: CONSENT_VERSION,
      decidedAt: String(parsed.decidedAt ?? ""),
    };
  } catch {
    return null;
  }
}

export function serializeConsentCookie(state: ConsentState, secure: boolean): string {
  const value = encodeURIComponent(JSON.stringify(state));
  return `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure ? "; Secure" : ""}`;
}
