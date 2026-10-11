"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { decideRenewalAction } from "../staff-actions";
import { Card, ErrorText } from "./parts";

/** The periodic re-review: continue (same prescription, next review later) or stop the plan. */
export function RenewalPanel({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const decide = (decision: "continue" | "stop") =>
    start(async () => {
      setError(null);
      const res = await decideRenewalAction(caseId, decision, message);
      if (res.ok) router.refresh();
      else
        setError(
          decision === "stop" ? "Scrie pacientului de ce oprești tratamentul." : "Decizia nu a fost salvată.",
        );
    });
  return (
    <Card className="mt-8">
      <p className="text-lg font-semibold text-navy-950">Reevaluarea pentru continuare</p>
      <p className="mt-1 text-sm text-ink-soft">
        Plățile pacientului sunt oprite până decizi. Continuarea emite aceeași rețetă și programează
        următoarea reevaluare.
      </p>
      <label htmlFor="mesaj-reevaluare" className="mt-4 block text-sm font-medium text-navy-950">
        Mesaj pentru pacient (obligatoriu dacă oprești)
      </label>
      <textarea
        id="mesaj-reevaluare"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="mt-1.5 block w-full rounded-2xl border border-line bg-white p-3 text-base text-navy-950 focus:border-navy-950"
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={pending}
          className={buttonClasses("primary", "md")}
          onClick={() => decide("continue")}
        >
          Aprob continuarea
        </button>
        <button
          type="button"
          disabled={pending}
          className={buttonClasses("secondary", "md")}
          onClick={() => decide("stop")}
        >
          Opresc tratamentul
        </button>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </Card>
  );
}
