import "server-only";
import type { Billing } from "./plans";

/**
 * Owner pricing, v5 brief (2026-10-11), in lei with VAT. Hair loss: 320 lei a
 * month, or 870 lei every 3 months. First monthly order A/B test: half of the
 * patients pay 320 lei (A), half 199 lei (B) for the first month; the variant is
 * assigned on the server and stored, never chosen by the browser. The public
 * prices in src/lib/launch-config.ts must match (tests/unit/proposal.test.ts).
 */
export type Variant = "A" | "B";

interface Offer {
  recurring: number;
  intervalMonths: 1 | 3;
  first: Record<Variant, number>;
}

export const PRICING: Record<string, Record<Billing, Offer>> = {
  "caderea-parului": {
    monthly: { recurring: 320, intervalMonths: 1, first: { A: 320, B: 199 } },
    quarterly: { recurring: 870, intervalMonths: 3, first: { A: 870, B: 870 } },
  },
};

export interface Quote {
  billing: Billing;
  intervalMonths: 1 | 3;
  firstAmount: number;
  recurringAmount: number;
}

export function quote(condition: string, billing: Billing, variant: Variant): Quote | null {
  const offer = PRICING[condition]?.[billing];
  if (!offer) return null;
  return {
    billing,
    intervalMonths: offer.intervalMonths,
    firstAmount: offer.first[variant],
    recurringAmount: offer.recurring,
  };
}

/** What every plan price includes. */
export const INCLUDED = [
  "tratamentul pentru perioada plătită, eliberat de o farmacie parteneră",
  "analiza evaluării de către un medic Telegen",
  "mesaje gratuite cu medicul, oricând ai întrebări",
  "livrare gratuită și discretă, într-un colet fără numele afecțiunii",
];
