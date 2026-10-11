/**
 * Evaluation (questionnaire) definitions. Content data: wording is reviewed
 * like any medical copy. Answers stay in the browser until the patient has an
 * account and has given explicit consent; then they are stored server-side only
 * (CLAUDE.md v5). The server validates every answer against these definitions.
 */
export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  title: string;
  help?: string;
  /** "text": a short free answer for the doctor (no options). */
  type: "single" | "multi" | "text";
  options: Option[];
  /** Text questions: maximum length in characters. */
  maxLength?: number;
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
  /** Stored with every case, so a doctor reads answers against the wording the patient saw. */
  version: string;
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
