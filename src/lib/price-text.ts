import { launchConfig, pricesFor, type LaunchConfig } from "./launch-config";

const lei = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 });

/** "149 lei" */
export const formatLei = (amount: number) => `${lei.format(amount)} lei`;

/**
 * The price answer for an FAQ, from launch-config only: one sentence per
 * condition that has a price. A condition without one cannot be bought and is
 * left out (CLAUDE.md v5). Labels never name a medicine. Null when nothing is priced.
 */
export function priceAnswer(
  conditions: { slug: string; name: string }[],
  config: LaunchConfig = launchConfig,
): string | null {
  const parts = conditions.flatMap((c) => {
    const items = pricesFor(c.slug, config);
    if (items.length === 0) return [];
    const list = items
      .map((p) => `${p.label.charAt(0).toLowerCase()}${p.label.slice(1)}, ${formatLei(p.amount)}`)
      .join("; ");
    return [`**${c.name}:** ${list}.`];
  });
  return parts.length > 0 ? parts.join(" ") : null;
}
