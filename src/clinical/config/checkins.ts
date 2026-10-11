/**
 * Follow-up questions after approval (CLAUDE.md v5): month 1, month 3 and the
 * renewal review. Client-safe (no medicine names, no prices). The doctor sees
 * the answers on the case; a "yes" to mood changes shows urgent advice at once
 * (EMA 2025 warning on mood changes) and alerts the doctor.
 */
import type { Question } from "@/content/evaluations/types";

export type CheckinKind = "month1" | "month3" | "renewal";

const tolerance: Question = {
  id: "tolerance",
  title: "Cum tolerezi tratamentul?",
  type: "single",
  options: [
    { value: "good", label: "Bine, fără probleme" },
    { value: "mild", label: "Am efecte adverse ușoare" },
    { value: "worrying", label: "Am efecte adverse care mă îngrijorează" },
    { value: "stopped", label: "Am oprit tratamentul" },
  ],
};
const mood: Question = {
  id: "mood",
  title: "Ai observat schimbări ale dispoziției, stare depresivă sau gânduri de a-ți face rău?",
  type: "single",
  options: [
    { value: "no", label: "Nu" },
    { value: "yes", label: "Da" },
  ],
};
const results: Question = {
  id: "results",
  title: "Ce observi până acum?",
  type: "single",
  options: [
    { value: "better", label: "Cade mai puțin părul sau pare mai des" },
    { value: "same", label: "Nu observ încă diferențe" },
    { value: "worse", label: "Cade mai mult" },
    { value: "unsure", label: "Nu știu" },
  ],
};
const note: Question = {
  id: "note",
  title: "Vrei să-i spui ceva medicului? (opțional)",
  type: "text",
  maxLength: 1000,
  options: [],
};
const continueQ: Question = {
  id: "continue",
  title: "Vrei să continui tratamentul?",
  type: "single",
  options: [
    { value: "yes", label: "Da" },
    { value: "unsure", label: "Nu sunt sigur, vreau să vorbesc cu medicul" },
    { value: "no", label: "Nu" },
  ],
};

export const CHECKINS: Record<CheckinKind, { title: string; questions: Question[] }> = {
  month1: { title: "Verificarea după prima lună", questions: [tolerance, mood, note] },
  month3: { title: "Verificarea după trei luni", questions: [tolerance, mood, results, note] },
  renewal: {
    title: "Reevaluarea pentru continuarea tratamentului",
    questions: [tolerance, mood, results, continueQ, note],
  },
};

/** Answers that need the doctor's attention now. */
export function urgentCheckin(answers: Record<string, string[]>): boolean {
  return answers.mood?.[0] === "yes" || answers.tolerance?.[0] === "worrying";
}
