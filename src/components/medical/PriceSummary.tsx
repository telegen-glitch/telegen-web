import { pricesFor } from "@/lib/launch-config";
import { formatLei } from "@/lib/price-text";

/**
 * Public plan prices, from launch-config only (never invented). Only conditions
 * with a price are listed; labels say "Plan pentru …", never a medicine
 * (CLAUDE.md v5). The section disappears when nothing is priced.
 */
export function PriceSummary({ conditions }: { conditions: { slug: string; name: string }[] }) {
  const rows = conditions.filter((c) => pricesFor(c.slug).length > 0);
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="preturi-info" className="border-t border-line-soft">
      <div className="container-page grid gap-6 py-14 lg:grid-cols-2 lg:gap-20 lg:py-20">
        <h2 id="preturi-info" className="text-display-3">
          Cât costă
        </h2>
        <dl className="divide-y divide-line-soft border-y border-line-soft">
          {rows.map((c) => (
            <div key={c.slug} className="grid gap-2 py-4 sm:grid-cols-[1fr_1.4fr] sm:gap-6">
              <dt className="font-semibold text-navy-950">{c.name}</dt>
              <dd className="space-y-1.5">
                {pricesFor(c.slug).map((p) => (
                  <p key={p.label}>
                    <span className="text-ink-soft">{p.label}</span>{" "}
                    <span className="font-semibold whitespace-nowrap text-navy-950">
                      {formatLei(p.amount)}
                    </span>
                    {p.note && <span className="block text-sm text-ink-muted">{p.note}</span>}
                  </p>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
