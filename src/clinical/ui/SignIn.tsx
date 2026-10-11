"use client";

import { useId, useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { sendCodeAction, verifyCodeAction } from "../intake/actions";
import { Card, ERROR_TEXT, ErrorText, inputClasses } from "./parts";

/** E-mail one-time code sign-in. No password; the code is valid for a short time. */
export function SignIn({
  onSignedIn,
  devCode = null,
  submitLabel = "Confirmă codul",
}: {
  onSignedIn: (account: { email: string; consented: boolean }) => void;
  /** The fixed code of the local test sign-in (never on Vercel). */
  devCode?: string | null;
  submitLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const emailId = useId();
  const codeId = useId();

  const send = () =>
    start(async () => {
      setError(null);
      const res = await sendCodeAction(email);
      if (res.ok) setSent(true);
      else setError(res.error === "invalid" ? "Verifică adresa de e-mail." : ERROR_TEXT[res.error]);
    });

  const verify = () =>
    start(async () => {
      setError(null);
      const res = await verifyCodeAction(email, code);
      if (res.ok) onSignedIn({ email: res.email, consented: res.consented });
      else
        setError(
          res.error === "invalid"
            ? "Codul nu este corect sau a expirat. Verifică e-mailul și încearcă din nou."
            : ERROR_TEXT[res.error],
        );
    });

  return (
    <Card className="mt-8">
      {!sent ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor={emailId} className="block text-sm font-medium text-navy-950">
            Adresa de e-mail
          </label>
          <input
            id={emailId}
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
            placeholder="nume@exemplu.ro"
          />
          <button
            type="submit"
            disabled={pending}
            className={buttonClasses("primary", "lg", "mt-5 w-full sm:w-auto")}
          >
            {pending ? "Se trimite…" : "Trimite codul"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
        >
          <p className="text-sm text-ink-soft">
            Ți-am trimis un cod de 6 cifre la <span className="font-semibold text-navy-950">{email}</span>.
            Verifică și dosarul de spam.
          </p>
          {devCode && (
            <p className="mt-3 rounded-xl bg-mist p-3 text-sm text-ink-soft">
              Mediu de test: codul este <span className="font-semibold text-navy-950">{devCode}</span>.
            </p>
          )}
          <label htmlFor={codeId} className="mt-4 block text-sm font-medium text-navy-950">
            Codul primit
          </label>
          <input
            id={codeId}
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`${inputClasses} tracking-[0.3em]`}
          />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={pending}
              className={buttonClasses("primary", "lg", "w-full sm:w-auto")}
            >
              {pending ? "Se verifică…" : submitLabel}
            </button>
            <button
              type="button"
              className="min-h-11 text-sm font-semibold text-blue-700 underline underline-offset-2"
              onClick={() => {
                setSent(false);
                setCode("");
                setError(null);
              }}
            >
              Schimbă adresa sau trimite din nou
            </button>
          </div>
        </form>
      )}
      <div aria-live="polite">{error && <ErrorText>{error}</ErrorText>}</div>
    </Card>
  );
}
