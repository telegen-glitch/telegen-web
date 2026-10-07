import Link from "next/link";
import { Arrow } from "@/components/ui/Button";

export interface ConditionCard {
  slug: string;
  name: string;
  teaser: string;
  href: string;
}

/** Condition cards: one per published condition, numbered like the step strip. */
export function ConditionCards({ items }: { items: ConditionCard[] }) {
  return (
    <ul data-reveal-group className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((c, i) => (
        <li key={c.slug} data-reveal>
          <Link
            href={c.href}
            className="group flex h-full min-h-[20rem] flex-col justify-between rounded-card-lg bg-navy-950 p-7 text-white transition-transform duration-300 ease-calm hover:-translate-y-1 md:p-8"
          >
            <span
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-lg font-semibold tabular-nums"
            >
              {String(i + 1).padStart(2, "0")}
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
      ))}
    </ul>
  );
}
