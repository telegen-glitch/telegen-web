"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { subscribeToLaunch } from "@/app/evaluare/actions";
import { Arrow, buttonClasses } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { NOTIFY_CONSENT_TEXT } from "@/lib/notify/consent";
import { type Answers, questions, summaryNotes } from "./questions";

/**
 * Privacy contract (section 7b): answers exist only in this component's state.
 * No URL changes, no cookies, no Web Storage, no network requests, no logging.
 * Closing or reloading the page discards them.
 */
type Stage = { kind: "intro" } | { kind: "question"; index: number } | { kind: "summary" } | { kind: "done" };

export function EvaluationFlow() {
  const [stage, setStage] = useState<Stage>({ kind: "intro" });
  const [answers, setAnswers] = useState<Answers>({});
  const [returnToSummary, setReturnToSummary] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  // Move focus to the new screen's heading so screen readers announce it.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [stage]);

  const go = (s: Stage) => setStage(s);
  const total = questions.length;

  const next = (index: number) => {
    if (returnToSummary || index + 1 >= total) {
      setReturnToSummary(false);
      go({ kind: "summary" });
    } else {
      go({ kind: "question", index: index + 1 });
    }
  };

  const reset = () => {
    setAnswers({});
    setReturnToSummary(false);
    go({ kind: "intro" });
  };

  if (stage.kind === "intro") {
    return (
      <Screen>
        <h1 ref={headingRef} tabIndex={-1} className="text-display-2 outline-none">
          Evaluare pentru căderea părului
        </h1>
        <p className="mt-4 text-lg leading-8 text-ink-soft">
          {total} întrebări scurte, câteva minute. La final vezi un rezumat al răspunsurilor tale.
        </p>
        <div className="mt-6 rounded-card border border-line bg-paper p-5 text-sm text-ink-soft">
          <p className="font-semibold text-navy-950">Înainte să începi</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Serviciul medical nu este încă deschis. Acum poți vedea cum arată evaluarea.</li>
            <li>Răspunsurile nu sunt trimise și nu sunt salvate. Dispar când închizi pagina.</li>
            <li>Evaluarea nu pune un diagnostic. În caz de urgență, sună la 112.</li>
          </ul>
        </div>
        <button
          type="button"
          className={buttonClasses("primary", "lg", "mt-8 w-full sm:w-auto")}
          onClick={() => {
            track("evaluation_started");
            go({ kind: "question", index: 0 });
          }}
        >
          Începe <Arrow />
        </button>
      </Screen>
    );
  }

  if (stage.kind === "question") {
    const q = questions[stage.index];
    const selected = answers[q.id] ?? [];

    const choose = (value: string) => {
      if (q.type === "single") {
        setAnswers((a) => ({ ...a, [q.id]: [value] }));
        next(stage.index);
        return;
      }
      setAnswers((a) => {
        const current = a[q.id] ?? [];
        if (current.includes(value)) return { ...a, [q.id]: current.filter((v) => v !== value) };
        if (q.exclusive?.includes(value)) return { ...a, [q.id]: [value] };
        return { ...a, [q.id]: [...current.filter((v) => !q.exclusive?.includes(v)), value] };
      });
    };

    return (
      <Screen>
        <Progress current={stage.index + 1} total={total} />
        <fieldset className="mt-8">
          <legend className="contents">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-serif text-[1.75rem] leading-tight text-navy-950 outline-none md:text-[2.25rem]"
            >
              {q.title}
            </h1>
          </legend>
          {q.help && <p className="mt-3 text-ink-soft">{q.help}</p>}
          <ul className="mt-6 space-y-2.5">
            {q.options.map((o) => {
              const on = selected.includes(o.value);
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => choose(o.value)}
                    className={`flex min-h-14 w-full items-center justify-between gap-4 rounded-xl border px-5 py-3.5 text-left text-base font-medium transition-colors ${
                      on
                        ? "border-navy-950 bg-navy-950 text-white"
                        : "border-line bg-white text-navy-950 hover:border-navy-950"
                    }`}
                  >
                    {o.label}
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 shrink-0 items-center justify-center border ${q.type === "multi" ? "rounded-md" : "rounded-full"} ${
                        on ? "border-white bg-white text-navy-950" : "border-line"
                      }`}
                    >
                      {on && (
                        <svg
                          viewBox="0 0 16 16"
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            className={buttonClasses("quiet", "md")}
            onClick={() =>
              stage.index === 0 ? go({ kind: "intro" }) : go({ kind: "question", index: stage.index - 1 })
            }
          >
            ← Înapoi
          </button>
          {q.type === "multi" && (
            <button
              type="button"
              className={buttonClasses("primary", "md")}
              disabled={selected.length === 0}
              onClick={() => next(stage.index)}
            >
              Continuă <Arrow />
            </button>
          )}
        </div>
      </Screen>
    );
  }

  if (stage.kind === "summary") {
    const notes = summaryNotes(answers);
    return (
      <Screen wide>
        <Progress current={total} total={total} label="Rezumat" />
        <h1 ref={headingRef} tabIndex={-1} className="mt-8 text-display-2 outline-none">
          Rezumatul răspunsurilor
        </h1>
        <p className="mt-3 text-ink-soft">Verifică răspunsurile. Le poți modifica înainte să continui.</p>

        {notes.map((n) => (
          <p
            key={n.text}
            role="note"
            className={`mt-6 rounded-xl border-l-4 p-4 text-sm ${n.tone === "caution" ? "border-amber-800/60 bg-amber-100/50" : "border-blue-600 bg-blue-50"}`}
          >
            {n.text}
          </p>
        ))}

        <dl className="mt-6 divide-y divide-line border-y border-line">
          {questions.map((q, i) => (
            <div key={q.id} className="grid gap-1 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-6">
              <dt className="text-sm text-ink-muted">{q.title}</dt>
              <dd className="font-medium text-navy-950">
                {(answers[q.id] ?? []).map((v) => q.options.find((o) => o.value === v)?.label).join(", ") ||
                  "—"}
              </dd>
              <dd>
                <button
                  type="button"
                  aria-label={`Modifică răspunsul: ${q.title}`}
                  className="min-h-11 text-sm font-semibold text-blue-700 underline underline-offset-2"
                  onClick={() => {
                    setReturnToSummary(true);
                    go({ kind: "question", index: i });
                  }}
                >
                  Modifică
                </button>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className={buttonClasses("primary", "lg", "w-full sm:w-auto")}
            onClick={() => {
              track("evaluation_completed");
              go({ kind: "done" });
            }}
          >
            Continuă <Arrow />
          </button>
          <button
            type="button"
            className={buttonClasses("secondary", "lg", "w-full sm:w-auto")}
            onClick={reset}
          >
            Șterge răspunsurile
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <h1 ref={headingRef} tabIndex={-1} className="text-display-2 outline-none">
        Serviciul nu este încă deschis
      </h1>
      <p className="mt-4 text-lg leading-8 text-ink-soft">
        Mulțumim că ai parcurs evaluarea. Telegen este în pre-lansare, așa că răspunsurile tale nu au fost
        trimise unui medic și nu au fost salvate. Când închizi pagina, ele dispar.
      </p>
      <p className="mt-4 text-ink-soft">
        Între timp, poți citi despre{" "}
        <Link href="/afectiuni/caderea-parului" className="text-blue-700 underline underline-offset-2">
          căderea părului
        </Link>{" "}
        sau te putem anunța când pornim.
      </p>
      <NotifyForm />
      <button type="button" className={buttonClasses("quiet", "md", "mt-6")} onClick={reset}>
        Șterge răspunsurile și ia-o de la capăt
      </button>
    </Screen>
  );
}

function Screen({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return <div className={`mx-auto w-full ${wide ? "max-w-3xl" : "max-w-xl"}`}>{children}</div>;
}

function Progress({ current, total, label }: { current: number; total: number; label?: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-ink-muted" aria-live="polite">
        {label ?? `Întrebarea ${current} din ${total}`}
      </p>
      <div
        role="progressbar"
        aria-label="Progresul evaluării"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        className="mt-2 h-1 overflow-hidden rounded-full bg-line-soft"
      >
        <div
          className="h-full rounded-full bg-navy-950 transition-[width] duration-300 ease-calm"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

/** Email + consent only. Never receives evaluation answers. */
function NotifyForm() {
  const [result, action, pending] = useActionState(subscribeToLaunch, null);
  const emailId = useId();
  const consentId = useId();

  useEffect(() => track("notify_form_viewed"), []);

  if (result?.status === "ok") {
    return (
      <p role="status" className="mt-8 rounded-card bg-blue-50 p-5 text-navy-950">
        Gata. Îți scriem când serviciul se deschide.
      </p>
    );
  }

  return (
    <form action={action} className="mt-8 rounded-card border border-line p-5 md:p-6">
      <h2 className="text-lg font-semibold text-navy-950">Anunță-mă la lansare</h2>
      <label htmlFor={emailId} className="mt-4 block text-sm font-medium text-navy-950">
        Adresa de e-mail
      </label>
      <input
        id={emailId}
        name="email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        className="mt-1.5 block min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-navy-950 placeholder:text-ink-muted focus:border-navy-950"
        placeholder="nume@exemplu.ro"
      />
      <div className="mt-4 flex items-start gap-3">
        <input
          id={consentId}
          name="consent"
          type="checkbox"
          required
          className="mt-1 h-5 w-5 shrink-0 accent-navy-950"
        />
        <label htmlFor={consentId} className="text-sm text-ink-soft">
          {NOTIFY_CONSENT_TEXT}{" "}
          <Link href="/politica-de-confidentialitate" className="text-blue-700 underline underline-offset-2">
            Confidențialitate
          </Link>
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses("primary", "md", "mt-5 w-full sm:w-auto")}
      >
        {pending ? "Se trimite…" : "Anunță-mă"}
      </button>
      <div aria-live="polite">
        {result?.status === "disabled" && (
          <p className="mt-4 rounded-xl bg-paper p-4 text-sm text-ink-soft">
            Înscrierea pentru anunț nu este încă activă, așa că adresa ta nu a fost salvată. Revino curând.
          </p>
        )}
        {result?.status === "invalid" && (
          <p className="mt-4 text-sm text-amber-800">Verifică adresa de e-mail și bifează acordul.</p>
        )}
        {result?.status === "error" && (
          <p className="mt-4 text-sm text-amber-800">
            Nu am reușit să salvăm adresa. Încearcă din nou mai târziu.
          </p>
        )}
      </div>
    </form>
  );
}
