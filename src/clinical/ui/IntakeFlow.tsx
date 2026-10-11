"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { clearPendingTopic, peekPendingTopic } from "@/components/topic/pendingTopic";
import { Arrow, buttonClasses } from "@/components/ui/Button";
import { MissingMark } from "@/components/ui/MissingMark";
import { getEvaluation } from "@/content/evaluations";
import type { Answers, HardStop, Question } from "@/content/evaluations/types";
import { stopFor, summaryNotes, visibleQuestions } from "@/lib/evaluation";
import type { PhotoSlot } from "../config/conditions";
import { saveAnswerAction, startCaseAction } from "../intake/actions";
import { Consents } from "./Consents";
import { BackButton, Card, ERROR_TEXT, ErrorText, Progress, Screen } from "./parts";
import { PhotoStep, type SavedPhoto } from "./PhotoStep";
import { SignIn } from "./SignIn";

/**
 * The evaluation (CLAUDE.md v5 P1). Before an account and consent exist, answers
 * live only in this component's memory: no URL changes, cookies, Web Storage or
 * requests. Once the patient has an account and has given the four consents,
 * the answers are saved server-side and every later change is saved as it is
 * made. The condition and the answers never appear in a URL.
 */
type Stage =
  | { kind: "topic" }
  | { kind: "intro" }
  | { kind: "question"; index: number }
  | { kind: "stop"; stop: HardStop }
  | { kind: "summary" }
  | { kind: "account" }
  | { kind: "consents" }
  | { kind: "photos" }
  | { kind: "done" };

export interface FlowTopic {
  slug: string;
  name: string;
  href?: string;
  /** Who decides, e.g. "Un medic dermatolog" (never a name). */
  decider: string;
  photoSlots: PhotoSlot[];
}

export interface FlowDraft {
  caseId: string;
  condition: string;
  answers: Answers;
  photos: { id: string; slot: PhotoSlot }[];
}

export function IntakeFlow({
  topics,
  account: initialAccount,
  draft,
  authReady,
  devCode,
  ownerMarkers,
}: {
  topics: FlowTopic[];
  account: { email: string; consented: boolean } | null;
  draft: FlowDraft | null;
  authReady: boolean;
  devCode: string | null;
  ownerMarkers: boolean;
}) {
  const [topic, setTopic] = useState<string | null>(() => {
    const pending = peekPendingTopic();
    return pending && topics.some((t) => t.slug === pending) ? pending : null;
  });
  const [stage, setStage] = useState<Stage>(() => (topic ? { kind: "intro" } : { kind: "topic" }));
  const [answers, setAnswers] = useState<Answers>({});
  const [account, setAccount] = useState(initialAccount);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [returnToSummary, setReturnToSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => clearPendingTopic(), []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [stage]);

  const def = topic ? getEvaluation(topic) : undefined;
  const current = topics.find((t) => t.slug === topic);
  const autosave = caseId !== null;
  const go = (s: Stage) => {
    setError(null);
    setStage(s);
  };

  const reset = () => {
    setAnswers({});
    setCaseId(null);
    setPhotos([]);
    setReturnToSummary(false);
    setTopic(null);
    go({ kind: "topic" });
  };

  const resume = (d: FlowDraft) => {
    const dd = getEvaluation(d.condition);
    if (!dd) return;
    setTopic(d.condition);
    setAnswers(d.answers);
    setCaseId(d.caseId);
    setPhotos(d.photos);
    const list = visibleQuestions(dd, d.answers);
    const missing = list.findIndex((q) => !d.answers[q.id]?.length);
    go(missing >= 0 ? { kind: "question", index: missing } : { kind: "summary" });
  };

  /** After the summary: save (if needed), then photos, then the end. */
  const afterSaved = (id: string) => {
    setCaseId(id);
    go((current?.photoSlots.length ?? 0) > 0 ? { kind: "photos" } : { kind: "done" });
  };

  const save = () =>
    startTransition(async () => {
      if (!def) return;
      const res = await startCaseAction(def.topic, answers);
      if (!res.ok) {
        if (res.error === "signed_out") {
          setAccount(null);
          go({ kind: "account" });
        } else if (res.error === "consent") go({ kind: "consents" });
        else setError(ERROR_TEXT[res.error]);
        return;
      }
      const stop = res.stopId ? def.stops.find((s) => s.id === res.stopId) : undefined;
      if (stop) go({ kind: "stop", stop });
      else afterSaved(res.caseId);
    });

  const continueFromSummary = () => {
    if (autosave && caseId) return afterSaved(caseId);
    if (!account) return go({ kind: "account" });
    if (!account.consented) return go({ kind: "consents" });
    save();
  };

  if (stage.kind === "topic" || !def || !current) {
    const draftTopic = draft ? topics.find((t) => t.slug === draft.condition) : undefined;
    return (
      <Screen>
        <p className="text-eyebrow text-blue-700">Evaluare online</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-display-2 outline-none">
          Pentru ce vrei <span className="accent">o evaluare?</span>
        </h1>
        {draft && draftTopic && (
          <Card className="mt-8">
            <p className="font-semibold text-navy-950">
              Ai o evaluare începută: {draftTopic.name.toLowerCase()}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Răspunsurile tale sunt salvate în cont. Continui de unde ai rămas.
            </p>
            <button
              type="button"
              className={buttonClasses("primary", "md", "mt-4")}
              onClick={() => resume(draft)}
            >
              Continuă evaluarea <Arrow />
            </button>
          </Card>
        )}
        {topics.length === 0 && (
          <p className="mt-8 text-lead">Evaluarea online nu este disponibilă în acest moment.</p>
        )}
        <ul className="mt-8 space-y-2.5">
          {topics.map((t) => (
            <li key={t.slug}>
              <button
                type="button"
                onClick={() => {
                  setTopic(t.slug);
                  setAnswers({});
                  setCaseId(null);
                  setPhotos([]);
                  go({ kind: "intro" });
                }}
                className="flex min-h-18 w-full items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 text-left shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <span className="text-lg font-semibold text-navy-950">
                  {t.name}
                  {draft?.condition === t.slug && <span className="sr-only"> (o evaluare nouă)</span>}
                </span>
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
    const pos = list.findIndex((q) => q.id === questions[index].id);
    if (returnToSummary || pos + 1 >= list.length) {
      setReturnToSummary(false);
      go({ kind: "summary" });
    } else go({ kind: "question", index: pos + 1 });
  };

  if (stage.kind === "intro") {
    const signedInAndConsented = account?.consented;
    return (
      <Screen>
        <BackButton onClick={() => go({ kind: "topic" })} />
        <h1 ref={headingRef} tabIndex={-1} className="mt-6 text-display-2 outline-none">
          {def.introTitle} <span className="accent">{def.introAccent}</span>
        </h1>
        <p className="mt-4 text-lead">
          Câteva minute, o întrebare pe ecran. La final vezi un rezumat al răspunsurilor tale.
        </p>
        <Card className="mt-6 text-sm text-ink-soft">
          <p className="font-semibold text-navy-950">Înainte să începi</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Evaluarea este gratuită.</li>
            {signedInAndConsented ? (
              <li>Ești în cont: răspunsurile se salvează pe măsură ce răspunzi.</li>
            ) : (
              <li>
                Răspunsurile se păstrează doar după ce îți creezi contul și îți dai acordul. Până atunci rămân
                doar pe această pagină.
              </li>
            )}
            <li>Evaluarea nu pune un diagnostic. În caz de urgență, sună la 112.</li>
          </ul>
        </Card>
        <button
          type="button"
          disabled={pending}
          className={buttonClasses("primary", "lg", "mt-8 w-full sm:w-auto")}
          onClick={() => {
            if (!signedInAndConsented) return go({ kind: "question", index: 0 });
            // Signed in with consent: open the case now and save every answer as it is given.
            startTransition(async () => {
              const res = await startCaseAction(def.topic, {});
              if (res.ok) {
                setCaseId(res.caseId);
                setAnswers({});
                go({ kind: "question", index: 0 });
              } else if (res.error === "signed_out" || res.error === "consent") {
                setAccount(null);
                go({ kind: "question", index: 0 });
              } else setError(ERROR_TEXT[res.error]);
            });
          }}
        >
          Începe <Arrow />
        </button>
        <div aria-live="polite">{error && <ErrorText>{error}</ErrorText>}</div>
      </Screen>
    );
  }

  if (stage.kind === "question") {
    const q = questions[Math.min(stage.index, questions.length - 1)];
    const selected = answers[q.id] ?? [];

    const commit = (values: string[]) => {
      const nextAnswers = { ...answers, [q.id]: values };
      const stop = stopFor(def, q, values);
      const advance = () => {
        setAnswers(nextAnswers);
        if (stop) {
          setReturnToSummary(false);
          go({ kind: "stop", stop });
        } else next(stage.index, nextAnswers);
      };
      if (!caseId) return advance();
      startTransition(async () => {
        const res = await saveAnswerAction(caseId, q.id, values);
        if (res.ok) advance();
        else
          setError(
            res.error === "signed_out"
              ? ERROR_TEXT.signed_out
              : "Nu am putut salva răspunsul. Încearcă din nou.",
          );
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
          <QuestionView
            key={q.id}
            question={q}
            selected={selected}
            busy={pending}
            headingRef={headingRef}
            onChange={(values) => setAnswers((a) => ({ ...a, [q.id]: values }))}
            onCommit={commit}
          />
          {autosave && (
            <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
              {pending ? "Se salvează…" : "Răspunsurile se salvează în contul tău."}
            </p>
          )}
          <div aria-live="polite">{error && <ErrorText>{error}</ErrorText>}</div>
        </Screen>
      </>
    );
  }

  if (stage.kind === "stop") {
    // Hard stop: no way to continue, no account, no payment (CLAUDE.md 7c.D, v5).
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
          Evaluarea online se oprește aici, pentru siguranța ta, și nu plătești nimic.{" "}
          {autosave ? "Răspunsurile rămân doar în contul tău." : "Răspunsurile nu au fost salvate."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {current.href && (
            <Link href={current.href} className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
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
                <dd className="font-medium break-words text-navy-950">
                  {answerText(q, answers[q.id]) || "—"}
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
              disabled={pending}
              className={buttonClasses("primary", "lg", "w-full sm:w-auto")}
              onClick={() => {
                const missing = questions.findIndex((q) => !answers[q.id]?.length);
                if (missing >= 0) {
                  setReturnToSummary(true);
                  go({ kind: "question", index: missing });
                  return;
                }
                continueFromSummary();
              }}
            >
              {pending ? "Se salvează…" : "Continuă"} <Arrow />
            </button>
            {!autosave && (
              <button
                type="button"
                className={buttonClasses("secondary", "lg", "w-full sm:w-auto")}
                onClick={reset}
              >
                Șterge răspunsurile
              </button>
            )}
          </div>
          <div aria-live="polite">{error && <ErrorText>{error}</ErrorText>}</div>
        </Screen>
      </>
    );
  }

  if (stage.kind === "account") {
    return (
      <Screen>
        <BackButton onClick={() => go({ kind: "summary" })} />
        <h1 ref={headingRef} tabIndex={-1} className="mt-6 text-display-2 outline-none">
          Contul tău, <span className="accent">fără parolă.</span>
        </h1>
        <p className="mt-4 text-lead">
          Ca medicul să îți poată analiza evaluarea, ai nevoie de un cont. Îți trimitem un cod de 6 cifre pe
          e-mail. Răspunsurile se salvează abia după ce îți dai acordul, la pasul următor.
        </p>
        {pending && (
          <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
            Se salvează…
          </p>
        )}
        <div aria-live="polite">{error && <ErrorText>{error}</ErrorText>}</div>
        {authReady ? (
          <SignIn
            devCode={devCode}
            onSignedIn={(a) => {
              setAccount(a);
              if (a.consented) save();
              else go({ kind: "consents" });
            }}
          />
        ) : ownerMarkers ? (
          <p className="mt-8">
            <MissingMark what="Supabase (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL)" />
          </p>
        ) : (
          <p className="mt-8 text-ink-soft">{ERROR_TEXT.closed}</p>
        )}
      </Screen>
    );
  }

  if (stage.kind === "consents") {
    return (
      <Screen>
        <h1 ref={headingRef} tabIndex={-1} className="text-display-2 outline-none">
          Acordul tău, <span className="accent">înainte să salvăm.</span>
        </h1>
        <p className="mt-4 text-lead">
          Bifează fiecare acord separat. Le păstrăm cu data și versiunea textului și le poți retrage oricând
          din cont.
        </p>
        <Consents
          submitLabel="Salvează evaluarea"
          onDone={() => {
            setAccount((a) => (a ? { ...a, consented: true } : a));
            save();
          }}
        />
        <div aria-live="polite">{error && <ErrorText>{error}</ErrorText>}</div>
      </Screen>
    );
  }

  if (stage.kind === "photos" && caseId) {
    return (
      <Screen>
        <h1 ref={headingRef} tabIndex={-1} className="text-display-2 outline-none">
          Fotografiile <span className="accent">pentru medic.</span>
        </h1>
        <p className="mt-4 text-lead">
          Medicul are nevoie de{" "}
          {current.photoSlots.length === 1 ? "o fotografie" : `${current.photoSlots.length} fotografii`} ca să
          vadă zona. Le vede doar medicul care îți analizează evaluarea.
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          Înainte de trimitere, telefonul micșorează fotografiile și șterge datele ascunse din ele, cum ar fi
          locul în care au fost făcute.
        </p>
        <PhotoStep
          caseId={caseId}
          slots={current.photoSlots}
          saved={photos}
          onSaved={(p) => setPhotos((list) => [...list.filter((x) => x.slot !== p.slot), p])}
          onDone={() => go({ kind: "done" })}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <p className="text-eyebrow text-blue-700">Evaluare salvată</p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-display-2 outline-none">
        Evaluarea ta <span className="accent">este în cont.</span>
      </h1>
      <p className="mt-4 text-lead">
        Am salvat răspunsurile{current.photoSlots.length ? " și fotografiile" : ""} în contul tău.{" "}
        {current.decider} le analizează după ce confirmi planul.
      </p>
      <Link href="/cont" className={buttonClasses("primary", "lg", "mt-8 w-full sm:w-auto")}>
        Mergi la cont <Arrow />
      </Link>
    </Screen>
  );
}

function answerText(q: Question, values: string[] | undefined): string {
  if (!values?.length) return "";
  if (q.type === "text") return values[0];
  return values.map((v) => q.options.find((o) => o.value === v)?.label).join(", ");
}

function QuestionView({
  question: q,
  selected,
  busy,
  headingRef,
  onChange,
  onCommit,
}: {
  question: Question;
  selected: string[];
  busy: boolean;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onChange: (values: string[]) => void;
  onCommit: (values: string[]) => void;
}) {
  const [text, setText] = useState(q.type === "text" ? (selected[0] ?? "") : "");
  const choose = (value: string) => {
    if (busy) return;
    if (q.type === "single") return onCommit([value]);
    if (selected.includes(value)) return onChange(selected.filter((v) => v !== value));
    if (q.exclusive?.includes(value)) return onChange([value]);
    onChange([...selected.filter((v) => !q.exclusive?.includes(v)), value]);
  };
  const heading = (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="text-[1.75rem] leading-tight font-semibold tracking-tight text-navy-950 outline-none md:text-[2.25rem]"
    >
      {q.title}
    </h1>
  );

  if (q.type === "text") {
    const max = q.maxLength ?? 500;
    return (
      <form
        className="flow-step mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) onCommit([text.trim()]);
        }}
      >
        <label htmlFor={`raspuns-${q.id}`} className="block">
          {heading}
        </label>
        {q.help && <p className="mt-3 text-ink-soft">{q.help}</p>}
        <textarea
          id={`raspuns-${q.id}`}
          value={text}
          maxLength={max}
          rows={5}
          onChange={(e) => setText(e.target.value)}
          className="mt-6 block w-full rounded-2xl border border-line bg-white p-4 text-base text-navy-950 focus:border-navy-950"
        />
        <p className="mt-2 text-right text-xs text-ink-muted tabular-nums">
          {text.length} / {max}
        </p>
        <button
          type="submit"
          disabled={!text.trim() || busy}
          className={buttonClasses("primary", "lg", "mt-6 w-full sm:w-auto")}
        >
          Continuă <Arrow />
        </button>
      </form>
    );
  }

  return (
    <>
      <fieldset className="flow-step mt-6">
        <legend className="contents">{heading}</legend>
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
          disabled={selected.length === 0 || busy}
          onClick={() => onCommit(selected)}
        >
          Continuă <Arrow />
        </button>
      )}
    </>
  );
}
