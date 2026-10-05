import Link from "next/link";
import { StartButton } from "@/components/topic/StartButton";
import { PhoneMockup, ScreenPlan } from "./PhoneMockup";

export interface Chip {
  label: string;
  href?: string;
}

/**
 * Hero: two-part headline (second phrase in the italic accent), short subtext,
 * condition chips, primary CTA and a visual of Telegen's own interface.
 * No entrance animation here: the headline is the LCP element.
 */
export function Hero({
  eyebrow,
  title,
  accent,
  text,
  chips,
}: {
  eyebrow?: string;
  title: string;
  accent: string;
  text: string;
  chips: Chip[];
}) {
  return (
    <section className="overflow-hidden">
      <div className="container-page grid items-center gap-10 pt-8 pb-14 md:pt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-16 lg:pb-24">
        <div>
          {eyebrow && <p className="text-eyebrow text-blue-700">{eyebrow}</p>}
          <h1 className="mt-4 max-w-[15ch] text-display-1">
            {title} <span className="accent">{accent}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lead">{text}</p>
          <ul className="mt-7 flex flex-wrap gap-2" aria-label="Afecțiuni">
            {chips.map((c) => (
              <li key={c.label}>
                {c.href ? (
                  <Link
                    href={c.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-navy-950/15 bg-white px-4 text-sm font-medium text-navy-950 transition-colors hover:border-navy-950"
                  >
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    {c.label}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-dashed border-line px-4 text-sm text-ink-muted"
                  >
                    {c.label} <span className="text-xs font-semibold">· în curând</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <StartButton className="w-full sm:w-auto" />
            <p className="text-sm text-ink-muted sm:ml-3">Câteva minute · fără cont</p>
          </div>
        </div>

        <div className="relative">
          <div className="relative mx-auto flex max-w-lg items-center justify-center overflow-hidden rounded-card-lg bg-mist px-6 py-8 sm:py-14">
            <svg
              aria-hidden="true"
              viewBox="0 0 400 400"
              className="absolute -right-24 -bottom-24 h-[26rem] w-[26rem] text-blue-100"
              fill="none"
            >
              <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="44" />
            </svg>
            <PhoneMockup className="relative" size="sm">
              <ScreenPlan />
            </PhoneMockup>
            <div className="absolute top-8 left-4 hidden rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-card)] sm:block">
              <p className="text-xs text-ink-muted">Analizat de</p>
              <p className="text-sm font-semibold text-navy-950">un medic dermatolog</p>
            </div>
            <div className="absolute right-4 bottom-8 hidden rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-card)] sm:block">
              <p className="text-xs text-ink-muted">Reevaluare</p>
              <p className="text-sm font-semibold text-navy-950">în luna 6</p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-ink-muted">Interfață ilustrativă</p>
        </div>
      </div>
    </section>
  );
}
