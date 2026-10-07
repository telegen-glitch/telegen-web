/**
 * Prices per condition (§v4.E6). Owner decision: empty by default. The pricing
 * block renders only when flags.pricing is on AND the condition has a price.
 * Never add placeholder prices.
 */
export interface Price {
  /** Amount in RON, VAT included. */
  amount: number;
  /** What the price covers, e.g. "Evaluare și plan de tratament". */
  label: string;
  /** Optional note, e.g. what is not included (medicines). */
  note?: string;
}

export const prices: Record<string, Price[]> = {};

export function pricesFor(conditionSlug: string): Price[] {
  return prices[conditionSlug] ?? [];
}
