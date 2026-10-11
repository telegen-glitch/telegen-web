"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { answerAdjustmentAction } from "../intake/actions";
import { ERROR_TEXT, ErrorText } from "./parts";

/** The patient accepts the doctor's adjusted plan (only then is the amount charged) or says no (nothing is). */
export function AdjustmentAnswer({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const answer = (accept: boolean) =>
    start(async () => {
      setError(null);
      const res = await answerAdjustmentAction(caseId, accept);
      if (res.ok) router.refresh();
      else setError(ERROR_TEXT[res.error]);
    });
  return (
    <div className="mt-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={pending}
          className={buttonClasses("primary", "md")}
          onClick={() => answer(true)}
        >
          Accept planul ajustat
        </button>
        <button
          type="button"
          disabled={pending}
          className={buttonClasses("secondary", "md")}
          onClick={() => answer(false)}
        >
          Nu accept, anulez
        </button>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
