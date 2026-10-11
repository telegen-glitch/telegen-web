import "server-only";
import type { Billing, PlanId } from "./plans";

/**
 * The partner pharmacy's share of each plan payment, in lei, paid out by Stripe
 * Connect after capture (CLAUDE.md v5). Owner + pharmacy decision: EMPTY until
 * agreed. While a purchasable plan has no split, production takes no real
 * payments (src/clinical/launch.ts); previews run test checkouts without a split.
 */
export const PHARMACY_SPLIT: Partial<Record<PlanId, Partial<Record<Billing, number>>>> = {};

export function splitFor(planId: PlanId, billing: Billing): number | null {
  const amount = PHARMACY_SPLIT[planId]?.[billing];
  return typeof amount === "number" && amount > 0 ? amount : null;
}
