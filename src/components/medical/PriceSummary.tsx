import { Missing } from "@/components/ui/Missing";
import { pricesFor, showOwnerMarkers } from "@/lib/launch-config";
import { formatLei } from "@/lib/price-text";

/**
 * Prices per published condition, from launch-config only (never invented). A
 * condition without a price shows an owner-only marker on previews; in
 * production it is left out, and the section disappears when nothing is left.
 */
export function PriceSummary({ conditions }: { conditions: { slug: string; name: string }[] }) {
  const rows = conditions.filter((c) => pricesFor(c.slug).length > 0 || showOwnerMarkers());
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="preturi-info" className="border-t border-line-soft">
      <div className="container-page grid gap-6 py-14 lg:grid-cols-2 lg:gap-20 lg:py-20">
        <h2 id="preturi-info" className="text-display-3">
          Cât costă
        </h2>
        <dl className="divide-y divide-line-soft border-y border-line-soft">
          {rows.map((c) => {
            const items = pricesFor(c.slug);
            return (
              <div key={c.slug} className="grid gap-2 py-4 sm:grid-cols-[1fr_1.4fr] sm:gap-6">
                <dt className="font-semibold text-navy-950">{c.name}</dt>
                <dd className="space-y-1.5">
                  {items.length === 0 ? (
                    <Missing what={`prețul pentru ${c.name.toLowerCase()}`} />
                  ) : (
                    items.map((p) => (
                      <p key={p.label}>
                        <span className="text-ink-soft">{p.label}</span>{" "}
                        <span className="font-semibold whitespace-nowrap text-navy-950">
                          {formatLei(p.amount)}
                        </span>
                        {p.note && <span className="block text-sm text-ink-muted">{p.note}</span>}
                      </p>
                    ))
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
