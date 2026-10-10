"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { getEvaluation } from "@/content/evaluations";
import type { Answers, HardStop } from "@/content/evaluations/types";
import { clearPendingTopic, peekPendingTopic } from "@/components/topic/pendingTopic";
import { Arrow, buttonClasses } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { stopFor, summaryNotes, visibleQuestions } from "@/lib/evaluation";
import { isServiceOpen } from "@/lib/flags";
import { subscribeToLaunch } from "@/lib/notify/actions";
import { NOTIFY_CONSENT_TEXT } from "@/lib/notify/consent";
import { prelaunchCopy } from "@/lib/prelaunch-copy";
import { MissingMark } from "@/components/ui/MissingMark";

/**
 * Privacy contract (section 7b): answers exist only in this component's state.
 * No URL changes, no cookies, no Web Storage, no network requests, no logging.
 * Closing or reloading the page discards them. The hand-over to the clinical
 * app (v4.7) sends the chosen condition only, by POST, never the answers: the
 * app asks the medical questions again after consent
 * (docs/clinical-app-architecture.md, "Hand-over from telegen.ro").
 */
type Stage =
  | { kind: "topic" }
  | { kind: "intro" }
  | { kind: "question"; index: number }
  | { kind: "stop"; stop: HardStop }
  | { kind: "summary" }
  | { kind: "done" };

export interface FlowTopic {
  slug: string;
  name: string;
  /** Published condition page, if any. */
  href?: string;
  /** Who decides, e.g. "Un medic dermatolog" (never a name). */
  decider?: string;
}

export function EvaluationFlow({
  topics,
  clinicalAppUrl = null,
  ownerMarkers = false,
}: {
  topics: FlowTopic[];
  /** Hand-over target (CLINICAL_APP_URL), resolved on the server. */
  clinicalAppUrl?: string | null;
  /** Owner-only "[lipsește: …]" markers (previews only), resolved on the server. */
  ownerMarkers?: boolean;
}) {
  // A topic chosen in the topic picker skips the topic screen (in-memory hand-over only).
  const [topic, setTopic] = useState<string | null>(() => {
    const pending = peekPendingTopic();
    return pending && getEvaluation(pending) ? pending : null;
  });
  const [stage, setStage] = useState<Stage>(() => (topic ? { kind: "intro" } : { kind: "topic" }));
  const [answers, setAnswers] = useState<Answers>({});
  const [returnToSummary, setReturnToSummary] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => clearPendingTopic(), []);

  // Move focus to the new screen's heading so screen readers announce it.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [stage]);

  const def = topic ? getEvaluation(topic) : undefined;
  const readMoreHref = topics.find((t) => t.slug === topic)?.href;
  const decider = topics.find((t) => t.slug === topic)?.decider ?? "Un medic";
  const go = (s: Stage) => setStage(s);

  const reset = () => {
    setAnswers({});
    setReturnToSummary(false);
    setTopic(null);
    go({ kind: "topic" });
  };

  if (stage.kind === "topic" || !def) {
    return (
      <Screen>
        <p className="text-eyebrow text-blue-700">Evaluare online</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-display-2 outline-none">
          Pentru ce vrei <span className="accent">o evaluare?</span>
        </h1>
        <ul className="mt-8 space-y-2.5">
          {topics.map((t) => (
            <li key={t.slug}>
              <button
                type="button"
                onClick={() => {
                  setTopic(t.slug);
                  setAnswers({});
                  go({ kind: "intro" });
                }}
                className="flex min-h-18 w-full items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 text-left shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <span className="text-lg font-semibold text-navy-950">{t.name}</span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-navy-950 text-white">
                  <Arrow />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Screen>
    );
  }

  const questions = visibleQuestions(def, answers);
  const total = questions.length;

  const next = (index: number, nextAnswers: Answers) => {
    const list = visibleQuestions(def, nextAnswers);
    const current = questions[index];
    const pos = list.findIndex((q) => q.id === current.id);
    if (returnToSummary || pos + 1 >= list.length) {
      setReturnToSummary(false);
      go({ kind: "summary" });
    } else {
      go({ kind: "question", index: pos + 1 });
    }
  };

  if (stage.kind === "intro") {
    return (
      <Screen>
        <BackButton onClick={() => go({ kind: "topic" })} />
        <h1 ref={headingRef} tabIndex={-1} className="mt-6 text-display-2 outline-none">
          {def.introTitle} <span className="accent">{def.introAccent}</span>
        </h1>
        <p className="mt-4 text-lead">
          Câteva minute, o întrebare pe ecran. La final vezi un rezumat al răspunsurilor tale.
        </p>
        <div className="mt-6 rounded-card bg-white p-5 text-sm text-ink-soft shadow-[var(--shadow-card)]">
          <p className="font-semibold text-navy-950">Înainte să începi</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            {!isServiceOpen(def.topic) && <li>{prelaunchCopy.evaluationIntroNote}</li>}
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

    const commit = (values: string[]) => {
      const nextAnswers = { ...answers, [q.id]: values };
      setAnswers(nextAnswers);
      const stop = stopFor(def, q, values);
      if (stop) {
        setReturnToSummary(false);
        go({ kind: "stop", stop });
        return;
      }
      next(stage.index, nextAnswers);
    };

    const choose = (value: string) => {
      if (q.type === "single") {
        commit([value]);
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
      <>
        <Progress current={stage.index + 1} total={total} />
        <Screen>
          <BackButton
            onClick={() =>
              stage.index === 0 ? go({ kind: "intro" }) : go({ kind: "question", index: stage.index - 1 })
            }
          />
          <fieldset key={q.id} className="flow-step mt-6">
            <legend className="contents">
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="text-[1.75rem] leading-tight font-semibold tracking-tight text-navy-950 outline-none md:text-[2.25rem]"
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
                      className={`flex min-h-15 w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left text-base font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.99] ${
                        on
                          ? "border-navy-950 bg-navy-950 text-white"
                          : "border-transparent bg-white text-navy-950 shadow-[var(--shadow-card)] hover:border-navy-950/30"
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
          {q.type === "multi" && (
            <button
              type="button"
              className={buttonClasses("primary", "lg", "mt-8 w-full sm:w-auto")}
              disabled={selected.length === 0}
              onClick={() => commit(selected)}
            >
              Continuă <Arrow />
            </button>
          )}
        </Screen>
      </>
    );
  }

  if (stage.kind === "stop") {
    // Hard stop: no way to continue the evaluation (CLAUDE.md 7c.D).
    return (
      <Screen>
        <div role="alert">
          <p className="text-eyebrow text-amber-800">Recomandare</p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-display-2 outline-none">
            {stage.stop.title}
          </h1>
          {stage.stop.urgent && (
            <p className="mt-5 rounded-2xl border-l-4 border-amber-800/60 bg-amber-100/60 p-4 font-semibold text-navy-950">
              Dacă ai acum durere în piept, lipsă de aer sau te simți foarte rău, sună la 112.
            </p>
          )}
          <p className="mt-5 text-lead">{stage.stop.text}</p>
        </div>
        <p className="mt-5 text-sm text-ink-muted">
          Evaluarea online se oprește aici, pentru siguranța ta. Răspunsurile nu au fost trimise și nu au fost
          salvate.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {readMoreHref && (
            <Link href={readMoreHref} className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
              Citește despre {def.name.toLowerCase()}
            </Link>
          )}
          <button
            type="button"
            className={buttonClasses("secondary", "lg", "w-full sm:w-auto")}
            onClick={reset}
          >
            Închide evaluarea
          </button>
        </div>
      </Screen>
    );
  }

  if (stage.kind === "summary") {
    const notes = summaryNotes(def, answers);
    return (
      <>
        <Progress current={total} total={total} label="Rezumat" />
        <Screen wide>
          <h1 ref={headingRef} tabIndex={-1} className="text-display-2 outline-none">
            Rezumatul <span className="accent">răspunsurilor</span>
          </h1>
          <p className="mt-3 text-ink-soft">Verifică răspunsurile. Le poți modifica înainte să continui.</p>

          {notes.map((n) => (
            <p
              key={n.text}
              role="note"
              className={`mt-6 rounded-2xl border-l-4 p-4 text-sm ${n.tone === "caution" ? "border-amber-800/60 bg-amber-100/60" : "border-blue-600 bg-blue-50"}`}
            >
              {n.text}
            </p>
          ))}

          <dl className="mt-6 divide-y divide-line-soft rounded-card bg-white px-5 shadow-[var(--shadow-card)]">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="grid gap-1 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-6"
              >
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
                // A question that became visible after an edit must be answered first.
                const missing = questions.findIndex((q) => !answers[q.id]?.length);
                if (missing >= 0) {
                  setReturnToSummary(true);
                  go({ kind: "question", index: missing });
                  return;
                }
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
      </>
    );
  }

  if (isServiceOpen(def.topic)) {
    return (
      <Screen>
        <p className="text-eyebrow text-blue-700">Evaluare completă</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-display-2 outline-none">
          Ultimul pas: <span className="accent">consultul cu medicul.</span>
        </h1>
        <p className="mt-4 text-lead">
          Continui în aplicația clinică Telegen, separată de acest site, unde datele tale medicale sunt
          protejate.
        </p>
        <ol className="mt-8 space-y-4">
          {[
            [
              "Contul și acordul tău",
              "Îți creezi contul și îți dai acordul explicit pentru prelucrarea datelor medicale.",
            ],
            [
              "Răspunsurile, în aplicație",
              "Răspunzi acolo la întrebările medicale. Răspunsurile de pe această pagină nu se transmit și dispar când o închizi.",
            ],
            [
              "Analiza medicului",
              `${decider} îți analizează evaluarea și îți poate pune întrebări. Afli numele lui și codul de parafă.`,
            ],
            [
              "Planul și urmărirea",
              "Primești un plan clar: ce recomandă medicul, la ce să te aștepți și când urmează reevaluarea.",
            ],
          ].map(([title, text], i) => (
            <li key={title} className="flex gap-4 rounded-card bg-white p-5 shadow-[var(--shadow-card)]">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-950 text-sm font-semibold text-white"
              >
                {i + 1}
              </span>
              <span>
                <span className="block font-semibold text-navy-950">{title}</span>
                <span className="mt-1 block text-sm text-ink-soft">{text}</span>
              </span>
            </li>
          ))}
        </ol>
        {clinicalAppUrl ? (
          // POST, so the condition never appears in a URL, a log line or a referrer.
          <form
            method="post"
            action={clinicalAppUrl}
            className="mt-8"
            onSubmit={() => track("evaluation_handoff")}
          >
            <input type="hidden" name="condition" value={def.topic} />
            <input type="hidden" name="v" value="1" />
            <button type="submit" className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
              Continuă către consult <Arrow />
            </button>
          </form>
        ) : (
          ownerMarkers && (
            <p className="mt-8">
              <MissingMark what="CLINICAL_APP_URL (adresa aplicației clinice)" />
            </p>
          )
        )}
        <button type="button" className={buttonClasses("quiet", "md", "mt-4")} onClick={reset}>
          Șterge răspunsurile și ia-o de la capăt
        </button>
      </Screen>
    );
  }

  return (
    <Screen>
      <h1 ref={headingRef} tabIndex={-1} className="text-display-2 outline-none">
        {prelaunchCopy.endTitle} <span className="accent">{prelaunchCopy.endAccent}</span>
      </h1>
      <p className="mt-4 text-lead">{prelaunchCopy.endText}</p>
      {readMoreHref && (
        <p className="mt-4 text-ink-soft">
          Între timp, poți citi despre{" "}
          <Link href={readMoreHref} className="text-blue-700 underline underline-offset-2">
            {def.name.toLowerCase()}
          </Link>{" "}
          {prelaunchCopy.endReadMoreSuffix}
        </p>
      )}
      <NotifyForm />
      <button type="button" className={buttonClasses("quiet", "md", "mt-6")} onClick={reset}>
        Șterge răspunsurile și ia-o de la capăt
      </button>
    </Screen>
  );
}

function Screen({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto w-full px-5 py-10 md:py-16 ${wide ? "max-w-3xl" : "max-w-xl"}`}>{children}</div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-pill px-2 text-sm font-semibold text-ink-soft hover:text-navy-950"
    >
      <Arrow className="rotate-180" /> Înapoi
    </button>
  );
}

function Progress({ current, total, label }: { current: number; total: number; label?: string }) {
  return (
    <div className="sticky top-0 z-10 border-b border-line-soft bg-white">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-5 py-3">
        <div
          role="progressbar"
          aria-label="Progresul evaluării"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={current}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-soft"
        >
          <div
            className="h-full rounded-full bg-navy-950 transition-[width] duration-500 ease-calm"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
        <p className="shrink-0 text-sm font-medium text-ink-muted tabular-nums" aria-live="polite">
          {label ?? `Întrebarea ${current} din ${total}`}
        </p>
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
        {prelaunchCopy.notifyOk}
      </p>
    );
  }

  return (
    <form action={action} className="mt-8 rounded-card bg-white p-5 shadow-[var(--shadow-card)] md:p-6">
      <h2 className="text-lg font-semibold text-navy-950">{prelaunchCopy.notifyHeading}</h2>
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
        {pending ? "Se trimite…" : prelaunchCopy.notifyButton}
      </button>
      <div aria-live="polite">
        {result?.status === "disabled" && (
          <p className="mt-4 rounded-xl bg-mist p-4 text-sm text-ink-soft">{prelaunchCopy.notifyDisabled}</p>
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
