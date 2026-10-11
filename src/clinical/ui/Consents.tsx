"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { CONSENTS, type ConsentKind } from "../config/consents";
import { recordConsentsAction } from "../intake/actions";
import { Card, ERROR_TEXT, ErrorText } from "./parts";

/** Four separate consents, none pre-ticked. Nothing is saved before all four are given. */
export function Consents({ onDone, submitLabel }: { onDone: () => void; submitLabel: string }) {
  const [given, setGiven] = useState<ConsentKind[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const all = CONSENTS.every((c) => given.includes(c.kind));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!all) return;
        start(async () => {
          setError(null);
          const res = await recordConsentsAction(given);
          if (res.ok) onDone();
          else setError(ERROR_TEXT[res.error]);
        });
      }}
    >
      <Card className="mt-8 space-y-5">
        {CONSENTS.map((c) => {
          const id = `acord-${c.kind}`;
          return (
            <div key={c.kind} className="flex items-start gap-3">
              <input
                id={id}
                type="checkbox"
                checked={given.includes(c.kind)}
                onChange={(e) =>
                  setGiven((g) => (e.target.checked ? [...g, c.kind] : g.filter((k) => k !== c.kind)))
                }
                className="mt-1 h-5 w-5 shrink-0 accent-navy-950"
              />
              <label htmlFor={id} className="text-sm text-ink-soft">
                {c.text}
                {c.link && (
                  <>
                    {" "}
                    <Link
                      href={c.link.href}
                      target="_blank"
                      className="text-blue-700 underline underline-offset-2"
                    >
                      {c.link.label}
                      <span className="sr-only"> (se deschide într-o filă nouă)</span>
                    </Link>
                  </>
                )}
              </label>
            </div>
          );
        })}
      </Card>
      <button
        type="submit"
        disabled={!all || pending}
        className={buttonClasses("primary", "lg", "mt-8 w-full sm:w-auto")}
      >
        {pending ? "Se salvează…" : submitLabel}
      </button>
      <div aria-live="polite">{error && <ErrorText>{error}</ErrorText>}</div>
    </form>
  );
}
