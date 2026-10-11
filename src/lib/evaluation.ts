import type { Answers, EvaluationDefinition, HardStop, Question } from "@/content/evaluations/types";

/** Questions visible for the current answers (conditional questions honour showIf). */
export function visibleQuestions(def: EvaluationDefinition, answers: Answers): Question[] {
  return def.questions.filter(
    (q) => !q.showIf || (answers[q.showIf.question] ?? []).some((v) => q.showIf!.anyOf.includes(v)),
  );
}

/** The hard stop triggered by this question's answer, if any. */
export function stopFor(
  def: EvaluationDefinition,
  question: Question,
  values: string[],
): HardStop | undefined {
  if (!question.stop || !values.some((v) => question.stop!.anyOf.includes(v))) return undefined;
  return def.stops.find((s) => s.id === question.stop!.stopId);
}

export function summaryNotes(def: EvaluationDefinition, answers: Answers) {
  return def.notes.filter((n) =>
    n.when.some((w) => (answers[w.question] ?? []).some((v) => w.anyOf.includes(v))),
  );
}

export interface ValidatedAnswers {
  /** Only answers to visible questions, with valid values, in question order. */
  answers: Answers;
  /** The first hard stop the answers trigger: the evaluation ends there. */
  stop?: HardStop;
  /** Questions with an invalid answer (dropped from `answers`). */
  invalid: string[];
  /** Visible questions still unanswered (ignored once a stop is reached). */
  missing: string[];
  /** Every visible question answered validly and no stop. */
  complete: boolean;
}

// Control characters other than tab and newline never belong in a free answer.
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

/**
 * Server-side validation of answers sent by the browser (CLAUDE.md v5): the same
 * rules the flow applies on screen, re-checked against the definition so a
 * tampered request can neither skip a hard stop nor store anything else.
 */
export function validateAnswers(def: EvaluationDefinition, raw: unknown): ValidatedAnswers {
  const input = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const answers: Answers = {};
  const invalid: string[] = [];
  const missing: string[] = [];
  let stop: HardStop | undefined;

  for (const q of def.questions) {
    if (q.showIf && !(answers[q.showIf.question] ?? []).some((v) => q.showIf!.anyOf.includes(v))) continue;
    const value = input[q.id];
    if (value === undefined) {
      missing.push(q.id);
      continue;
    }
    const clean = cleanAnswer(q, value);
    if (!clean) {
      invalid.push(q.id);
      continue;
    }
    answers[q.id] = clean;
    stop = stopFor(def, q, clean);
    if (stop) break;
  }
  return {
    answers,
    stop,
    invalid,
    missing: stop ? [] : missing,
    complete: !stop && invalid.length === 0 && missing.length === 0,
  };
}

/** One answer, normalised, or null when it does not fit the question. */
export function cleanAnswer(q: Question, value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) return null;
  const values = value as string[];
  if (q.type === "text") {
    if (values.length !== 1) return null;
    const text = values[0].replace(CONTROL, "").trim();
    return text.length > 0 && text.length <= (q.maxLength ?? 500) ? [text] : null;
  }
  const allowed = new Set(q.options.map((o) => o.value));
  if (values.length === 0 || new Set(values).size !== values.length) return null;
  if (!values.every((v) => allowed.has(v))) return null;
  if (q.type === "single") return values.length === 1 ? values : null;
  if (values.length > 1 && values.some((v) => q.exclusive?.includes(v))) return null;
  return values;
}
