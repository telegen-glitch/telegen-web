"use client";

import { useConsent } from "./ConsentProvider";

export function CookieSettingsButton({ className = "" }: { className?: string }) {
  const { openSettings } = useConsent();
  return (
    <button type="button" className={className} onClick={openSettings}>
      Setări cookie
    </button>
  );
}
