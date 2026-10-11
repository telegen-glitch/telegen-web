"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { deleteAccountAction, withdrawConsentAction } from "../intake/actions";
import { Card, ErrorText, inputClasses } from "./parts";

/** Export, consent withdrawal and deletion: the patient's GDPR rights, from the phone. */
export function DataRights() {
  const router = useRouter();
  const [step, setStep] = useState<"none" | "withdraw" | "delete">("none");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const id = useId();
  if (done)
    return (
      <Card className="mt-4">
        <p role="status" className="text-navy-950">
          {done}
        </p>
      </Card>
    );
  return (
    <Card className="mt-4 space-y-4 text-sm">
      <p>
        <a
          href="/api/clinical/export"
          download
          className="font-semibold text-blue-700 underline underline-offset-2"
        >
          Descarcă toate datele tale (fișier JSON)
        </a>
      </p>
      {step === "withdraw" ? (
        <div>
          <p className="text-ink-soft">
            Dacă îți retragi acordul pentru datele de sănătate, oprim evaluările deschise (rezervările de pe
            card se anulează) și planurile active. Datele deja prelucrate se păstrează cât cere legea pentru
            dosarele medicale.
          </p>
          <button
            type="button"
            disabled={pending}
            className={buttonClasses("secondary", "md", "mt-3")}
            onClick={() =>
              start(async () => {
                const res = await withdrawConsentAction();
                if (res.ok) {
                  setDone("Acordul a fost retras. Evaluările și planurile deschise au fost oprite.");
                  router.refresh();
                } else setError("Nu a reușit. Încearcă din nou.");
              })
            }
          >
            Retrag acordul
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="font-semibold text-blue-700 underline underline-offset-2"
          onClick={() => setStep("withdraw")}
        >
          Retrage acordul pentru datele de sănătate
        </button>
      )}
      {step === "delete" ? (
        <div>
          <p className="text-ink-soft">
            Dacă nu ai încă o decizie a medicului sau o plată, ștergem acum contul și toate datele, inclusiv
            fotografiile. Altfel oprim tot și ștergem ce legea permite; dosarul medical se păstrează cât cere
            legea.
          </p>
          <label htmlFor={id} className="mt-3 block font-medium text-navy-950">
            Scrie ȘTERGE ca să confirmi
          </label>
          <input
            id={id}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClasses}
          />
          <button
            type="button"
            disabled={pending || confirm.trim() !== "ȘTERGE"}
            className={buttonClasses("secondary", "md", "mt-3")}
            onClick={() =>
              start(async () => {
                const res = await deleteAccountAction(confirm.trim());
                if (!res.ok) return setError("Nu a reușit. Încearcă din nou.");
                // A full deletion ends the session and redirects to /cont/sters.
                setDone(
                  "Am oprit tot și am înregistrat cererea de ștergere. Îți scriem când este rezolvată.",
                );
                router.refresh();
              })
            }
          >
            Șterge contul
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="font-semibold text-blue-700 underline underline-offset-2"
          onClick={() => setStep("delete")}
        >
          Șterge contul și datele
        </button>
      )}
      {error && <ErrorText>{error}</ErrorText>}
    </Card>
  );
}
