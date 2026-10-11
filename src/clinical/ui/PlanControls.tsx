"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import type { PlanView } from "../subscriptions";
import { changePlanAction } from "../intake/actions";
import { Card, ERROR_TEXT, ErrorText } from "./parts";

const date = new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" });
const STATUS: Record<PlanView["status"], string> = {
  active: "Activ",
  paused: "Pe pauză: nu plătești nimic până îl reiei",
  canceled: "Anulat: nu mai plătești nimic",
  renewal_review: "Reevaluare la medic: plățile sunt oprite până decide",
};

/** The patient's plan: next payment, pause or cancel any time (no questions asked). */
export function PlanControls({ caseId, plan }: { caseId: string; plan: PlanView }) {
  const router = useRouter();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const act = (action: "pause" | "resume" | "cancel") =>
    start(async () => {
      setError(null);
      const res = await changePlanAction(caseId, action);
      if (res.ok) {
        setConfirmCancel(false);
        router.refresh();
      } else setError(ERROR_TEXT[res.error]);
    });
  return (
    <Card className="mt-8">
      <p className="text-sm text-ink-muted">Planul tău</p>
      <p className="mt-1 font-semibold text-navy-950">{STATUS[plan.status]}</p>
      {plan.status === "active" && plan.nextChargeAt && (
        <p className="mt-1 text-sm text-ink-soft">
          Următoarea plată: {plan.amount} lei, pe {date.format(new Date(plan.nextChargeAt))}
          {plan.intervalMonths === 3 ? " (pentru 3 luni)" : ""}. Primești un e-mail cu 3 zile înainte.
        </p>
      )}
      {plan.renewalReviewAt && plan.status !== "canceled" && (
        <p className="mt-1 text-sm text-ink-soft">
          Medicul reevaluează tratamentul pe {date.format(new Date(plan.renewalReviewAt))}.
        </p>
      )}
      {plan.status !== "canceled" && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          {plan.status === "active" && (
            <button
              type="button"
              disabled={pending}
              className={buttonClasses("secondary", "md")}
              onClick={() => act("pause")}
            >
              Pune pe pauză
            </button>
          )}
          {plan.status === "paused" && (
            <button
              type="button"
              disabled={pending}
              className={buttonClasses("primary", "md")}
              onClick={() => act("resume")}
            >
              Reia planul
            </button>
          )}
          {!confirmCancel ? (
            <button
              type="button"
              disabled={pending}
              className={buttonClasses("quiet", "md")}
              onClick={() => setConfirmCancel(true)}
            >
              Anulează planul
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              className={buttonClasses("secondary", "md")}
              onClick={() => act("cancel")}
            >
              Da, anulez: fără alte plăți
            </button>
          )}
        </div>
      )}
      {error && <ErrorText>{error}</ErrorText>}
    </Card>
  );
}
