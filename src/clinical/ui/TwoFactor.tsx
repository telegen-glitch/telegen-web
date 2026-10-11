"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { mfaEnrollAction, mfaVerifyAction } from "../staff-actions";
import { Card, ErrorText, inputClasses } from "./parts";

/** Mandatory two-factor sign-in for doctors and admins (authenticator app, TOTP). */
export function TwoFactor({ enrolled, devCode = null }: { enrolled: boolean; devCode?: string | null }) {
  const router = useRouter();
  const [setup, setSetup] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const codeId = useId();

  if (!enrolled && !setup)
    return (
      <Card className="mt-8">
        <p className="text-ink-soft">
          Pentru acces la datele pacienților ai nevoie de o aplicație de autentificare (de exemplu Google
          Authenticator sau Microsoft Authenticator) pe telefon.
        </p>
        <button
          type="button"
          disabled={pending}
          className={buttonClasses("primary", "md", "mt-5")}
          onClick={() =>
            start(async () => {
              const res = await mfaEnrollAction();
              if (res.ok) setSetup(res);
              else setError("Nu am putut porni configurarea. Încearcă din nou.");
            })
          }
        >
          Configurează autentificarea în doi pași
        </button>
        {error && <ErrorText>{error}</ErrorText>}
      </Card>
    );

  return (
    <Card className="mt-8">
      {setup && (
        <>
          <p className="text-sm text-ink-soft">
            Scanează codul cu aplicația de autentificare sau introdu cheia manual, apoi scrie codul de 6 cifre
            afișat.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- generated QR code, never cached */}
          <img
            src={setup.qr}
            alt="Cod QR pentru aplicația de autentificare"
            className="mt-4 h-44 w-44 rounded-xl bg-white"
          />
          <p className="mt-3 text-sm break-all text-ink-soft">
            Cheie: <span className="font-mono text-navy-950">{setup.secret}</span>
          </p>
        </>
      )}
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            setError(null);
            const res = await mfaVerifyAction(setup?.factorId ?? null, code);
            if (res.ok) router.refresh();
            else setError("Codul nu este corect. Verifică ora telefonului și încearcă din nou.");
          });
        }}
      >
        <label htmlFor={codeId} className="block text-sm font-medium text-navy-950">
          Codul din aplicația de autentificare
        </label>
        {devCode && (
          <p className="mt-2 rounded-xl bg-mist p-3 text-sm text-ink-soft">
            Mediu de test: codul este {devCode}.
          </p>
        )}
        <input
          id={codeId}
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`${inputClasses} tracking-[0.3em]`}
        />
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses("primary", "lg", "mt-5 w-full sm:w-auto")}
        >
          {pending ? "Se verifică…" : "Confirmă"}
        </button>
        {error && <ErrorText>{error}</ErrorText>}
      </form>
    </Card>
  );
}
