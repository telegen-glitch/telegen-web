"use client";

import { useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import type { Billing, PlanId } from "../config/plans";
import type { ProposalView } from "../intake/proposal";
import { checkoutAction, fakeAuthorizeAction } from "../intake/actions";
import { Card, ERROR_TEXT, ErrorText } from "./parts";
import { billingText } from "./Proposal";

const lei = (n: number) => `${new Intl.NumberFormat("ro-RO").format(n)} lei`;

/**
 * The card is authorised, not charged (CLAUDE.md v5): Stripe's hosted page holds
 * the amount until the doctor decides. Locally the fake provider stands in.
 */
export function Checkout({
  proposal,
  choice,
  onAuthorized,
}: {
  proposal: ProposalView;
  choice: { planId: PlanId; billing: Billing };
  onAuthorized: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const plan = proposal.plans.find((p) => p.id === choice.planId)!;
  const first = proposal.quotes[choice.billing].firstAmount;

  return (
    <>
      <Card className="mt-8">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Plan</dt>
            <dd className="text-right font-semibold text-navy-950">{plan.title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Plată</dt>
            <dd className="text-right text-navy-950">{billingText(proposal, choice.billing)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-line-soft pt-3">
            <dt className="font-semibold text-navy-950">Se rezervă acum</dt>
            <dd className="text-right text-lg font-semibold text-navy-950">{lei(first)}</dd>
          </div>
        </dl>
      </Card>
      <p className="mt-6 text-lead font-semibold text-navy-950">
        Suma este doar rezervată pe card până la decizia medicului.
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
        <li>Dacă medicul aprobă planul, suma se încasează și pregătim livrarea.</li>
        <li>Dacă medicul ajustează planul, îți cerem acordul înainte de încasare.</li>
        <li>Dacă nu primești rețetă, rezervarea se anulează integral și nu plătești nimic.</li>
      </ul>
      {proposal.provider === "fake" && (
        <p className="mt-4 rounded-xl bg-mist p-3 text-sm text-ink-soft">
          Mediu de test: nu se folosește niciun card și nu se plătește nimic.
        </p>
      )}
      {proposal.provider === "stripe" && (
        <p className="mt-4 text-sm text-ink-muted">
          Datele cardului le introduci pe pagina securizată Stripe, nu la Telegen.
        </p>
      )}
      <button
        type="button"
        disabled={pending || !proposal.provider}
        className={buttonClasses("primary", "lg", "mt-8 w-full sm:w-auto")}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await checkoutAction(proposal.caseId, choice.planId, choice.billing);
            if (!res.ok) return setError(ERROR_TEXT[res.error]);
            if (res.redirectUrl) {
              window.location.assign(res.redirectUrl);
              return;
            }
            const auth = await fakeAuthorizeAction(res.paymentId);
            if (auth.ok) onAuthorized();
            else setError(ERROR_TEXT[auth.error]);
          })
        }
      >
        {pending ? "Se pregătește…" : `Rezervă ${lei(first)} pe card`}
      </button>
      <div aria-live="polite">{error && <ErrorText>{error}</ErrorText>}</div>
    </>
  );
}
