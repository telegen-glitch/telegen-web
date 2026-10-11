"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { CHECKINS, type CheckinKind } from "../config/checkins";
import { answerCheckinAction } from "../intake/actions";
import { Card, ErrorText } from "./parts";

/** A due follow-up check-in. Answers go to the doctor on the case. */
export function CheckinForm({ checkinId, kind }: { checkinId: string; kind: CheckinKind }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const def = CHECKINS[kind];
  const required = def.questions.filter((q) => q.type !== "text");
  const ready = required.every((q) => answers[q.id]?.length);

  if (urgent)
    return (
      <Card className="mt-8">
        <p
          role="alert"
          className="rounded-2xl border-l-4 border-amber-800/60 bg-amber-100/60 p-4 font-semibold text-navy-950"
        >
          Mulțumim. Medicul tău a primit răspunsurile. Dacă ai gânduri de a-ți face rău sau te simți în
          pericol acum, sună la 112. Dacă ai efecte adverse care te îngrijorează, oprește-te și scrie-i
          medicului în mesaje sau mergi la un medic în persoană.
        </p>
      </Card>
    );

  return (
    <Card className="mt-8">
      <p className="text-lg font-semibold text-navy-950">{def.title}</p>
      <form
        className="mt-4 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            setError(null);
            const res = await answerCheckinAction(checkinId, answers);
            if (!res.ok) return setError("Răspunde la toate întrebările.");
            if (res.urgent) setUrgent(true);
            else router.refresh();
          });
        }}
      >
        {def.questions.map((q) => (
          <fieldset key={q.id}>
            <legend className="font-medium text-navy-950">{q.title}</legend>
            {q.type === "text" ? (
              <textarea
                aria-label={q.title}
                rows={3}
                maxLength={q.maxLength}
                value={answers[q.id]?.[0] ?? ""}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [q.id]: e.target.value.trim() ? [e.target.value] : [] }))
                }
                className="mt-2 block w-full rounded-2xl border border-line bg-white p-3 text-base text-navy-950 focus:border-navy-950"
              />
            ) : (
              <div className="mt-2 space-y-2">
                {q.options.map((o) => (
                  <label
                    key={o.value}
                    className="flex min-h-11 cursor-pointer items-center gap-3 text-ink-soft"
                  >
                    <input
                      type="radio"
                      name={`${checkinId}-${q.id}`}
                      checked={answers[q.id]?.[0] === o.value}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: [o.value] }))}
                      className="h-5 w-5 accent-navy-950"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        ))}
        <button type="submit" disabled={!ready || pending} className={buttonClasses("primary", "md")}>
          Trimite medicului
        </button>
        {error && <ErrorText>{error}</ErrorText>}
      </form>
    </Card>
  );
}
