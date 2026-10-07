"use client";

/**
 * Analytics hook point (Phase 6). Nothing loads unless a provider is configured
 * AND the visitor consented to analytics. Events are a closed list with no free
 * payload, so health answers can never be sent by mistake.
 */
import { useEffect } from "react";
import { useConsent } from "@/components/consent/ConsentProvider";
import { analyticsProvider } from "@/lib/consent";

export type AnalyticsEvent =
  "evaluation_started" | "evaluation_completed" | "notify_form_viewed" | "cta_clicked";

let enabled = false;

export function track(event: AnalyticsEvent): void {
  if (!enabled) return;
  // Provider-specific dispatch goes here once a provider is chosen.
  void event;
}

export function AnalyticsGate() {
  const { consent } = useConsent();
  useEffect(() => {
    enabled = Boolean(analyticsProvider && consent?.analytics);
  }, [consent]);
  return null;
}
