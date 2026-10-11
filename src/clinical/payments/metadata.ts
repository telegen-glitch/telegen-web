/**
 * Stripe metadata is visible in the Stripe dashboard and in webhooks, so it
 * carries opaque ids only: never the condition, the plan or a medicine name.
 */
export type PaymentPurpose = "first_order" | "renewal";

export function stripeMetadata(input: { caseId: string; purpose: PaymentPurpose }): Record<string, string> {
  if (!/^[0-9a-f-]{36}$/.test(input.caseId)) throw new Error("caseId must be a uuid");
  return { case_id: input.caseId, purpose: input.purpose };
}

/** What appears on the card statement: the brand only. */
export const STATEMENT_DESCRIPTOR = "TELEGEN";
