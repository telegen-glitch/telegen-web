import Link from "next/link";
import type { RelatedLink } from "@/content/types";
import { Arrow } from "@/components/ui/Button";

export function RelatedLinks({
  links,
  heading = "Citește mai departe",
  className = "mt-14",
}: {
  links: RelatedLink[];
  heading?: string;
  className?: string;
}) {
  if (links.length === 0) return null;
  return (
    <section aria-labelledby="legaturi" className={className}>
      <h2 id="legaturi" className="text-display-3">
        {heading}
      </h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="group flex min-h-14 items-center justify-between gap-4 py-4">
              <span>
                <span className="block font-semibold text-navy-950 group-hover:underline">{l.label}</span>
                {l.description && (
                  <span className="mt-0.5 block text-sm text-ink-muted">{l.description}</span>
                )}
              </span>
              <Arrow className="text-blue-700 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
