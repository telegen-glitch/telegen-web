import { isEnabled } from "@/lib/flags";
import { pricesFor } from "@/lib/pricing";

const ron = new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON", maximumFractionDigits: 0 });

/**
 * Pricing block, after the education on condition pages. Renders only when the
 * pricing flag is on and the condition has prices (§v4.E6). Never names a
 * medicine (§9.4).
 */
export function Pricing({ conditionSlug }: { conditionSlug: string }) {
  const items = pricesFor(conditionSlug);
  if (!isEnabled("pricing") || items.length === 0) return null;
  return (
    <section aria-labelledby="preturi" className="border-t border-line-soft section-y">
      <div className="container-page">
        <h2 id="preturi" className="text-display-2">
          Prețuri <span className="accent">transparente</span>
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.label} className="rounded-card-lg bg-mist p-7">
              <p className="font-semibold text-navy-950">{p.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-navy-950">
                {ron.format(p.amount)}
              </p>
              {p.note && <p className="mt-2 text-sm text-ink-muted">{p.note}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
