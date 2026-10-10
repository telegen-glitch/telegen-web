import { launchConfig, pricesFor, showOwnerMarkers, type LaunchConfig } from "./launch-config";

const lei = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 });

/** "149 lei" */
export const formatLei = (amount: number) => `${lei.format(amount)} lei`;

/**
 * The price answer for an FAQ, from launch-config only: one sentence per
 * published condition. A condition without a price gets an owner-only marker on
 * previews and is left out in production. Null when there is nothing to say.
 */
export function priceAnswer(
  conditions: { slug: string; name: string }[],
  config: LaunchConfig = launchConfig,
  markers: boolean = showOwnerMarkers(),
): string | null {
  const parts = conditions.flatMap((c) => {
    const items = pricesFor(c.slug, config);
    if (items.length === 0) return markers ? [`{{lipsește:prețul pentru ${c.name.toLowerCase()}}}`] : [];
    const list = items
      .map((p) => `${p.label.charAt(0).toLowerCase()}${p.label.slice(1)}, ${formatLei(p.amount)}`)
      .join("; ");
    return [`**${c.name}:** ${list}.`];
  });
  return parts.length > 0 ? parts.join(" ") : null;
}
