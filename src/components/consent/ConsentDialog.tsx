"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { type ConsentState, hasNonEssentialTrackers } from "@/lib/consent";

interface Props {
  mode: "banner" | "settings";
  initial: ConsentState | null;
  onSave: (choice: { analytics: boolean; marketing: boolean }) => void;
  onClose?: () => void;
}

export function ConsentDialog({ mode, initial, onSave, onClose }: Props) {
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false);
  const [marketing, setMarketing] = useState(initial?.marketing ?? false);
  const [details, setDetails] = useState(mode === "settings");
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const trackers = hasNonEssentialTrackers();

  useEffect(() => {
    if (mode !== "settings") return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  return (
    <div
      className={
        mode === "settings"
          ? "fixed inset-0 z-50 flex items-end justify-center bg-navy-950/40 p-3 sm:items-center"
          : "fixed inset-x-0 bottom-0 z-50 p-3"
      }
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal={mode === "settings"}
        aria-labelledby={titleId}
        tabIndex={-1}
        className="mx-auto w-full max-w-lg rounded-card border border-line-soft bg-white p-5 shadow-[0_20px_60px_-20px_rgba(10,22,49,0.35)] sm:p-6"
      >
        <h2 id={titleId} className="font-serif text-2xl text-navy-950">
          Setări cookie
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Folosim doar cookie-urile necesare funcționării site-ului.
          {trackers
            ? " Cu acordul tău, folosim și cookie-uri de analiză sau marketing. Poți alege separat pentru fiecare categorie."
            : " În prezent nu folosim cookie-uri de analiză sau marketing."}{" "}
          <Link href="/politica-cookie" className="text-blue-700 underline underline-offset-2">
            Politica de cookie-uri
          </Link>
        </p>

        {details && (
          <fieldset className="mt-4 divide-y divide-line-soft rounded-xl border border-line-soft">
            <legend className="sr-only">Categorii de cookie-uri</legend>
            <Row
              label="Necesare"
              description="Fără ele site-ul nu funcționează (de exemplu, memorarea acestei alegeri)."
              checked
              disabled
            />
            <Row
              label="Analiză"
              description="Ne arată, agregat și anonimizat, cum este folosit site-ul."
              checked={analytics}
              onChange={setAnalytics}
              disabled={!trackers}
            />
            <Row
              label="Marketing"
              description="Măsoară campaniile. Nu sunt folosite în prezent."
              checked={marketing}
              onChange={setMarketing}
              disabled={!trackers}
            />
          </fieldset>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          {trackers ? (
            <>
              <button
                type="button"
                className={buttonClasses("primary", "md", "sm:flex-1")}
                onClick={() => onSave({ analytics: true, marketing: true })}
              >
                Accept toate
              </button>
              <button
                type="button"
                className={buttonClasses("secondary", "md", "sm:flex-1")}
                onClick={() => onSave({ analytics: false, marketing: false })}
              >
                Refuz toate
              </button>
              {details ? (
                <button
                  type="button"
                  className={buttonClasses("secondary", "md", "sm:flex-1")}
                  onClick={() => onSave({ analytics, marketing })}
                >
                  Salvează alegerea
                </button>
              ) : (
                <button
                  type="button"
                  className={buttonClasses("quiet", "md")}
                  onClick={() => setDetails(true)}
                >
                  Alege categoriile
                </button>
              )}
            </>
          ) : (
            <button type="button" className={buttonClasses("primary", "md")} onClick={onClose}>
              Închide
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <label htmlFor={id} className="text-sm">
        <span className="block font-semibold text-navy-950">{label}</span>
        <span className="mt-0.5 block text-ink-muted">{description}</span>
      </label>
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-5 w-5 shrink-0 accent-navy-950"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    </div>
  );
}
