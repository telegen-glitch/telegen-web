"use client";

/**
 * Analytics hook point (Phase 6). Nothing loads unless a provider is configured
 * AND the visitor consented to analytics. Events are a closed list with no free
 * payload, so health answers can never be sent by mistake.
 */
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useConsent } from "@/components/consent/ConsentProvider";
import { isClinicalPath } from "@/lib/clinical-paths";
import { analyticsProvider } from "@/lib/consent";

export type AnalyticsEvent =
  "evaluation_started" | "evaluation_completed" | "evaluation_handoff" | "notify_form_viewed" | "cta_clicked";

let enabled = false;

/** Never inside the clinical area (CLAUDE.md v5 WALLS), whatever the consent. */
const onClinicalPage = () => typeof window !== "undefined" && isClinicalPath(window.location.pathname);

export function track(event: AnalyticsEvent): void {
  if (!enabled || onClinicalPage()) return;
  // Provider-specific dispatch goes here once a provider is chosen.
  void event;
}

export function AnalyticsGate() {
  const { consent } = useConsent();
  const pathname = usePathname();
  useEffect(() => {
    enabled = Boolean(analyticsProvider && consent?.analytics) && !isClinicalPath(pathname);
  }, [consent, pathname]);
  return null;
}
