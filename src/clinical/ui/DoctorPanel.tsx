"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import type { PlanDefinition } from "../config/plans";
import type { DoctorCaseView } from "../doctor/workflow";
import { adjustAction, approveAction, askAction, declineAction, takeCaseAction } from "../staff-actions";
import { Card, ErrorText, inputClasses } from "./parts";

const ERRORS: Record<string, string> = {
  invalid: "Completează toate câmpurile (indicațiile pentru fiecare produs, motivul și mesajul).",
  locked: "Cazul s-a schimbat între timp. Reîncarcă pagina.",
  closed:
    "Suma rezervată nu a putut fi încasată (rezervarea a expirat sau plata nu este disponibilă). Anunță administratorul.",
};

type Mode = "approve" | "adjust" | "decline" | "ask";

function Instructions({
  plan,
  value,
  onChange,
}: {
  plan: PlanDefinition;
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  return (
    <div className="space-y-3">
      {plan.items.map((it, i) => (
        <div key={it.name}>
          <label htmlFor={`indicatii-${i}`} className="block text-sm font-medium text-navy-950">
            Indicații: {it.name}
          </label>
          <input
            id={`indicatii-${i}`}
            value={value[it.name] ?? ""}
            onChange={(e) => onChange({ ...value, [it.name]: e.target.value })}
            placeholder="doza, frecvența, durata"
            className={inputClasses}
          />
        </div>
      ))}
    </div>
  );
}

/** The doctor's decision: approve, adjust, decline or ask (the SLA pauses while waiting for the patient). */
export function DoctorPanel({ view, reasons }: { view: DoctorCaseView; reasons: Record<string, string> }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("approve");
  const [instructions, setInstructions] = useState<Record<string, string>>({});
  const [altPlan, setAltPlan] = useState<string>(view.alternatives[0]?.id ?? "");
  const [reason, setReason] = useState("needs_in_person");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setError(null);
      const res = await fn();
      if (res.ok) router.refresh();
      else setError(ERRORS[res.error ?? ""] ?? "Acțiunea nu a reușit. Încearcă din nou.");
    });

  if (view.status === "submitted" && !view.mine)
    return (
      <Card className="mt-8">
        <p className="text-ink-soft">
          Când preiei cazul, pacientul îți vede numele, specialitatea și codul de parafă.
        </p>
        <button
          type="button"
          disabled={pending}
          className={buttonClasses("primary", "md", "mt-4")}
          onClick={() => run(() => takeCaseAction(view.id))}
        >
          Preiau cazul
        </button>
        {error && <ErrorText>{error}</ErrorText>}
      </Card>
    );

  if (!view.mine || view.status !== "in_review") return null;
  const alt = view.alternatives.find((p) => p.id === altPlan);

  return (
    <Card className="mt-8">
      <fieldset>
        <legend className="text-lg font-semibold text-navy-950">Decizia ta</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["approve", "Aprob planul"],
              ["adjust", "Ajustez planul"],
              ["decline", "Nu recomand tratament online"],
              ["ask", "Am o întrebare"],
            ] as const
          ).map(([m, label]) => (
            <label
              key={m}
              className={`cursor-pointer rounded-pill border px-4 py-2 text-sm font-semibold ${mode === m ? "border-navy-950 bg-navy-950 text-white" : "border-line text-navy-950"}`}
            >
              <input
                type="radio"
                name="decizie"
                className="sr-only"
                checked={mode === m}
                onChange={() => setMode(m)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 space-y-4">
        {mode === "approve" && view.plan && (
          <>
            <p className="text-sm text-ink-soft">
              Rețeta pentru <span className="font-semibold text-navy-950">{view.plan.title}</span>. La
              aprobare se încasează suma rezervată și comanda ajunge la farmacie.
            </p>
            <Instructions plan={view.plan} value={instructions} onChange={setInstructions} />
          </>
        )}
        {mode === "adjust" && (
          <>
            <label htmlFor="plan-ajustat" className="block text-sm font-medium text-navy-950">
              Planul propus de tine
            </label>
            <select
              id="plan-ajustat"
              value={altPlan}
              onChange={(e) => setAltPlan(e.target.value)}
              className={inputClasses}
            >
              {view.alternatives.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            {alt && <Instructions plan={alt} value={instructions} onChange={setInstructions} />}
            <p className="text-sm text-ink-soft">Pacientul acceptă planul ajustat înainte de încasare.</p>
          </>
        )}
        {mode === "decline" && (
          <>
            <label htmlFor="motiv" className="block text-sm font-medium text-navy-950">
              Motivul (îl vede pacientul)
            </label>
            <select
              id="motiv"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputClasses}
            >
              {Object.entries(reasons).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <p className="text-sm text-ink-soft">Rezervarea de pe card se anulează integral.</p>
          </>
        )}
        {mode !== "approve" && (
          <div>
            <label htmlFor="mesaj-decizie" className="block text-sm font-medium text-navy-950">
              {mode === "decline"
                ? "Mesaj pentru pacient: explicația și unde să meargă în persoană"
                : mode === "ask"
                  ? "Întrebarea ta (termenul se oprește până răspunde pacientul)"
                  : "Mesaj pentru pacient: de ce ai ajustat planul"}
            </label>
            <textarea
              id="mesaj-decizie"
              rows={4}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5 block w-full rounded-2xl border border-line bg-white p-3 text-base text-navy-950 focus:border-navy-950"
            />
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={pending}
        className={buttonClasses("primary", "md", "mt-6")}
        onClick={() =>
          run(() =>
            mode === "approve"
              ? approveAction(view.id, instructions)
              : mode === "adjust"
                ? adjustAction(view.id, altPlan, instructions, message)
                : mode === "decline"
                  ? declineAction(view.id, reason, message)
                  : askAction(view.id, message),
          )
        }
      >
        {pending
          ? "Se trimite…"
          : mode === "approve"
            ? "Aprob și emit rețeta"
            : mode === "adjust"
              ? "Trimite planul ajustat"
              : mode === "decline"
                ? "Trimite decizia"
                : "Trimite întrebarea"}
      </button>
      {error && <ErrorText>{error}</ErrorText>}
    </Card>
  );
}
