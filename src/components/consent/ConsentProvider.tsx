"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  CONSENT_VERSION,
  type ConsentState,
  hasNonEssentialTrackers,
  readConsent,
  serializeConsentCookie,
} from "@/lib/consent";
import { ConsentDialog } from "./ConsentDialog";

interface ConsentContextValue {
  consent: ConsentState | null;
  save: (choice: { analytics: boolean; marketing: boolean }) => void;
  openSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getCookie = () => document.cookie;
const getServerCookie = () => "";

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const cookie = useSyncExternalStore(subscribe, getCookie, getServerCookie);
  const consent = useMemo(() => readConsent(cookie), [cookie]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const save = useCallback((choice: { analytics: boolean; marketing: boolean }) => {
    const state: ConsentState = { ...choice, version: CONSENT_VERSION, decidedAt: new Date().toISOString() };
    document.cookie = serializeConsentCookie(state, location.protocol === "https:");
    listeners.forEach((fn) => fn());
    setSettingsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ consent, save, openSettings: () => setSettingsOpen(true) }),
    [consent, save],
  );

  // The banner only appears when a non-essential tracker is actually configured.
  const showBanner = hydrated && hasNonEssentialTrackers() && consent === null;

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {(settingsOpen || showBanner) && (
        <ConsentDialog
          mode={settingsOpen ? "settings" : "banner"}
          initial={consent}
          onSave={save}
          onClose={settingsOpen ? () => setSettingsOpen(false) : undefined}
        />
      )}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used inside ConsentProvider");
  return ctx;
}
