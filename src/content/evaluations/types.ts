/**
 * Evaluation (questionnaire) definitions. Content data: wording is reviewed
 * like any medical copy. Answers never leave the browser's memory (CLAUDE.md 7b).
 */
export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  title: string;
  help?: string;
  type: "single" | "multi";
  options: Option[];
  /** Multi-select: options that clear all others when chosen. */
  exclusive?: string[];
  /** Shown only when another answer matches. */
  showIf?: { question: string; anyOf: string[] };
  /** Choosing any of these values ends the evaluation on a hard-stop screen (no continue). */
  stop?: { anyOf: string[]; stopId: string };
}

export interface HardStop {
  id: string;
  title: string;
  text: string;
  /** Shown as an emergency line (call 112) above the text. */
  urgent?: boolean;
}

export interface SummaryNote {
  /** Shown when any listed answer is present. */
  when: { question: string; anyOf: string[] }[];
  tone: "caution" | "info";
  text: string;
}

export interface EvaluationDefinition {
  /** Matches the condition slug. */
  topic: string;
  name: string;
  /** Shown under the name in the topic picker. */
  label: string;
  introTitle: string;
  introAccent: string;
  questions: Question[];
  stops: HardStop[];
  notes: SummaryNote[];
}

export type Answers = Record<string, string[]>;
