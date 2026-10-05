"use server";

import { getNotifyAdapter } from "@/lib/notify";
import { NOTIFY_CONSENT_TEXT, NOTIFY_CONSENT_VERSION } from "@/lib/notify/consent";
import type { NotifyResult } from "@/lib/notify/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Accepts only `email` and `consent`. Any other field is ignored, so health
 * answers cannot reach the server through this action.
 */
export async function subscribeToLaunch(
  _prev: NotifyResult | null,
  formData: FormData,
): Promise<NotifyResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const consent = formData.get("consent") === "on";
  if (!consent || email.length > 254 || !EMAIL.test(email)) return { status: "invalid" };

  const adapter = getNotifyAdapter();
  if (!adapter.enabled) return { status: "disabled" };
  return adapter.subscribe({
    email,
    consentText: NOTIFY_CONSENT_TEXT,
    consentVersion: NOTIFY_CONSENT_VERSION,
    consentedAt: new Date().toISOString(),
  });
}
