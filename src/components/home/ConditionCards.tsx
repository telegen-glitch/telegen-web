import Link from "next/link";
import { Arrow } from "@/components/ui/Button";

export interface ConditionCard {
  slug: string;
  name: string;
  teaser: string;
  href?: string;
}

/** Condition cards. Published conditions link; upcoming ones are visibly inactive. */
export function ConditionCards({ items }: { items: ConditionCard[] }) {
  return (
    <ul data-reveal-group className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((c) =>
        c.href ? (
          <li key={c.slug} data-reveal>
            <Link
              href={c.href}
              className="group flex h-full min-h-[20rem] flex-col justify-between rounded-card-lg bg-navy-950 p-7 text-white transition-transform duration-300 ease-calm hover:-translate-y-1 md:p-8"
            >
              <span
                aria-hidden="true"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10"
              >
                <svg
                  viewBox="0 0 32 32"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M16 27V12m0 0c0-4 2-7 5-8M16 12c0-4-2-7-5-8M9 27V17m14 10V17"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>
                <span className="block text-[1.75rem] leading-tight font-semibold tracking-tight">
                  {c.name}
                </span>
                <span className="mt-2 block text-white/70">{c.teaser}</span>
                <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold">
                  Află mai multe <Arrow className="transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </li>
        ) : (
          <li key={c.slug} data-reveal>
            <div
              aria-disabled="true"
              className="flex h-full min-h-[20rem] flex-col justify-between rounded-card-lg border border-dashed border-line p-7 md:p-8"
            >
              <span className="self-start rounded-pill bg-mist px-3 py-1 text-xs font-semibold text-ink-muted">
                în curând
              </span>
              <span>
                <span className="block text-[1.75rem] leading-tight font-semibold tracking-tight text-navy-950">
                  {c.name}
                </span>
                <span className="mt-2 block text-ink-muted">{c.teaser}</span>
              </span>
            </div>
          </li>
        ),
      )}
    </ul>
  );
}
