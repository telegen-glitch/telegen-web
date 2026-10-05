import { isEnabled } from "@/lib/flags";

/*
 * Components for content Telegen does not have yet (CLAUDE.md §4c.C).
 * Each returns null while its flag is OFF and takes only real, supplied data.
 * There is deliberately no sample data in this file.
 */

export interface Review {
  author: string;
  date: string;
  text: string;
  rating?: number;
  sourceUrl: string;
}

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  if (!isEnabled("reviews") || reviews.length === 0) return null;
  return (
    <section aria-labelledby="recenzii" className="bg-mist section-y">
      <div className="container-page">
        <h2 id="recenzii" className="text-display-2">
          Ce spun pacienții
        </h2>
        <ul className="mt-10 snap-track auto-cols-[85%] gap-4 sm:auto-cols-[45%] lg:auto-cols-[30%]">
          {reviews.map((r) => (
            <li key={r.sourceUrl} className="rounded-card bg-white p-6">
              <p className="text-ink">{r.text}</p>
              <p className="mt-4 text-sm text-ink-muted">
                {r.author} · <time>{r.date}</time> ·{" "}
                <a href={r.sourceUrl} className="underline" rel="noopener noreferrer">
                  sursa
                </a>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export interface PressLogo {
  name: string;
  src: string;
  href: string;
}

export function PressLogos({ logos }: { logos: PressLogo[] }) {
  if (!isEnabled("pressLogos") || logos.length === 0) return null;
  return (
    <section aria-label="Apariții în presă" className="border-y border-line-soft py-8">
      <ul className="container-page flex flex-wrap items-center justify-center gap-10">
        {logos.map((l) => (
          <li key={l.name}>
            <a href={l.href} rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.src} alt={l.name} className="h-6 w-auto opacity-70 grayscale" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RatingSummary({
  rating,
  count,
  sourceUrl,
}: {
  rating: number;
  count: number;
  sourceUrl: string;
}) {
  if (!isEnabled("ratings")) return null;
  return (
    <a
      href={sourceUrl}
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-ink-soft"
    >
      <span className="font-semibold text-navy-950">{rating.toFixed(1)}</span> din 5 · {count} recenzii
      verificate
    </a>
  );
}
