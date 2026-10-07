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
