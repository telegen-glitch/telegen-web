"use client";

import Link from "next/link";
import { useState } from "react";
import { Arrow, buttonClasses } from "@/components/ui/Button";
import type { Billing, PlanId } from "../config/plans";
import type { ProposalView } from "../intake/proposal";
import { Card } from "./parts";

const lei = (n: number) => `${new Intl.NumberFormat("ro-RO").format(n)} lei`;

export function billingText(p: ProposalView, billing: Billing): string {
  const q = p.quotes[billing];
  if (billing === "quarterly") return `${lei(q.recurringAmount)} o dată la 3 luni`;
  return q.firstAmount === q.recurringAmount
    ? `${lei(q.recurringAmount)} pe lună`
    : `${lei(q.firstAmount)} prima lună, apoi ${lei(q.recurringAmount)} pe lună`;
}

/**
 * "Planul tău propus" (CLAUDE.md v5): the medicine, what it is for, when to
 * expect results, the main side effects, the price and what it includes. No
 * urgency, no timers, no "buy now".
 */
export function Proposal({
  proposal,
  onContinue,
}: {
  proposal: ProposalView;
  onContinue: (choice: { planId: PlanId; billing: Billing }) => void;
}) {
  const [planId, setPlanId] = useState<PlanId>(proposal.chosen?.planId ?? proposal.plans[0].id);
  const [billing, setBilling] = useState<Billing>(proposal.chosen?.billing ?? "monthly");

  return (
    <>
      <fieldset className="mt-8">
        <legend className="text-lg font-semibold text-navy-950">
          {proposal.plans.length > 1 ? "Alege planul" : "Planul propus"}
        </legend>
        <div className="mt-3 space-y-4">
          {proposal.plans.map((plan, i) => {
            const on = plan.id === planId;
            return (
              <Card key={plan.id} className={on ? "ring-2 ring-navy-950" : ""}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={on}
                    onChange={() => setPlanId(plan.id)}
                    className="mt-1.5 h-5 w-5 shrink-0 accent-navy-950"
                  />
                  <span>
                    {i === 0 && (
                      <span className="mb-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        Propus pentru tine
                      </span>
                    )}
                    <span className="block text-xl font-semibold text-navy-950">{plan.title}</span>
                  </span>
                </label>
                <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                  {plan.items.map((it) => (
                    <li key={it.name}>
                      <span className="font-semibold text-navy-950">{it.name}.</span> {it.detail}
                    </li>
                  ))}
                </ul>
                {on && (
                  <>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div>
                        <dt className="font-semibold text-navy-950">La ce ajută</dt>
                        <dd className="mt-1 text-ink-soft">{plan.purpose}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy-950">Când vezi rezultate</dt>
                        <dd className="mt-1 text-ink-soft">{plan.timeToResults}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy-950">Efecte adverse principale</dt>
                        <dd className="mt-1">
                          <ul className="list-disc space-y-1 pl-5 text-ink-soft">
                            {plan.sideEffects.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    </dl>
                    {plan.warning && (
                      <p
                        role="note"
                        className="mt-4 rounded-2xl border-l-4 border-amber-800/60 bg-amber-100/60 p-4 text-sm text-navy-950"
                      >
                        <span className="font-semibold">Important. </span>
                        {plan.warning}
                      </p>
                    )}
                    <ul className="mt-4 space-y-1.5 text-sm">
                      {plan.links.map((l) => (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            target="_blank"
                            rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="font-semibold text-blue-700 underline underline-offset-2"
                          >
                            {l.label}
                            <span className="sr-only"> (se deschide într-o filă nouă)</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-lg font-semibold text-navy-950">Cum plătești</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(["monthly", "quarterly"] as const).map((b) => (
            <label
              key={b}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-card)] ${billing === b ? "ring-2 ring-navy-950" : ""}`}
            >
              <input
                type="radio"
                name="billing"
                value={b}
                checked={billing === b}
                onChange={() => setBilling(b)}
                className="mt-1 h-5 w-5 shrink-0 accent-navy-950"
              />
              <span>
                <span className="block font-semibold text-navy-950">
                  {b === "monthly" ? "Lunar" : "La 3 luni"}
                </span>
                <span className="block text-sm text-ink-soft">{billingText(proposal, b)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Card className="mt-8 text-sm text-ink-soft">
        <p className="font-semibold text-navy-950">Prețul include</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {proposal.included.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className="mt-4">
          Plătești la final: suma doar se rezervă pe card și se încasează numai dacă medicul aprobă planul.
          Dacă nu primești rețetă, rezervarea se anulează integral. Poți pune planul pe pauză sau îl poți
          anula oricând, înainte de următoarea plată.
        </p>
      </Card>

      <p className="mt-6 font-semibold text-navy-950">
        Decizia finală aparține medicului. Dacă nu primești rețetă, nu plătești nimic.
      </p>

      <button
        type="button"
        className={buttonClasses("primary", "lg", "mt-8 w-full sm:w-auto")}
        onClick={() => onContinue({ planId, billing })}
      >
        Continuă <Arrow />
      </button>
    </>
  );
}
