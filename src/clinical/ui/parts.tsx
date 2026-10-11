import { Arrow } from "@/components/ui/Button";

export function Screen({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto w-full px-5 py-10 md:py-16 ${wide ? "max-w-3xl" : "max-w-xl"}`}>{children}</div>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-pill px-2 text-sm font-semibold text-ink-soft hover:text-navy-950"
    >
      <Arrow className="rotate-180" /> Înapoi
    </button>
  );
}

export function Progress({ current, total, label }: { current: number; total: number; label?: string }) {
  return (
    <div className="sticky top-0 z-10 border-b border-line-soft bg-white">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-5 py-3">
        <div
          role="progressbar"
          aria-label="Progresul evaluării"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={current}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-soft"
        >
          <div
            className="h-full rounded-full bg-navy-950 transition-[width] duration-500 ease-calm"
            style={{ width: `${(current / Math.max(total, 1)) * 100}%` }}
          />
        </div>
        <p className="shrink-0 text-sm font-medium text-ink-muted tabular-nums" aria-live="polite">
          {label ?? `Întrebarea ${current} din ${total}`}
        </p>
      </div>
    </div>
  );
}

export const inputClasses =
  "mt-1.5 block min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-navy-950 placeholder:text-ink-muted focus:border-navy-950";

export function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="mt-4 rounded-xl border-l-4 border-amber-800/60 bg-amber-100/60 p-3 text-sm text-navy-950"
    >
      {children}
    </p>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-card bg-white p-5 shadow-[var(--shadow-card)] md:p-6 ${className}`}>
      {children}
    </div>
  );
}

export const ERROR_TEXT: Record<string, string> = {
  invalid: "Verifică datele introduse și încearcă din nou.",
  signed_out: "Sesiunea a expirat. Intră din nou în cont.",
  closed: "Evaluarea online nu este disponibilă în acest moment. Încearcă din nou mai târziu.",
  consent: "Ai nevoie de toate cele patru acorduri ca să salvăm evaluarea.",
  locked: "Această evaluare nu mai poate fi modificată.",
  not_patient: "Acest cont nu este un cont de pacient. Folosește altă adresă de e-mail.",
  error: "Ceva nu a mers. Încearcă din nou.",
};
