/**
 * The service promise, worded once (CLAUDE.md v5 SITE ALIGNMENT). Every public
 * page that describes how Telegen works uses these texts, and the clinical flow
 * keeps them (docs/promise-map.md lists where each one is used and what enforces
 * it). No medicine names, no prices here: public price blocks say "Plan pentru …".
 */
/** The doctor's decision time, in hours: the public promise and the clinical SLA (src/clinical/config/service.ts). */
export const SLA_HOURS = 24;

export interface PromiseStep {
  id: "evaluare" | "plan" | "plata" | "medic" | "fara-reteta" | "livrare" | "urmarire";
  title: string;
  text: string;
}

export const PROMISE_STEPS: PromiseStep[] = [
  {
    id: "evaluare",
    title: "Evaluare gratuită",
    text: "Răspunzi online la câteva întrebări, de pe telefon, în câteva minute. Evaluarea nu costă nimic.",
  },
  {
    id: "plan",
    title: "Planul propus și prețul",
    text: "Îți creezi contul și vezi planul propus pentru tine și prețul, înainte să plătești ceva.",
  },
  {
    id: "plata",
    title: "Plătești la final, suma doar se rezervă",
    text: "La final, suma doar se rezervă pe card. Se încasează numai dacă medicul aprobă planul.",
  },
  {
    id: "medic",
    title: `Medic în ${SLA_HOURS} de ore`,
    text: `Un medic Telegen îți analizează evaluarea în cel mult ${SLA_HOURS} de ore. Când o preia, îi vezi numele, specialitatea și codul de parafă.`,
  },
  {
    id: "fara-reteta",
    title: "Fără rețetă, fără plată",
    text: "Dacă medicul nu îți prescrie tratamentul, rezervarea se anulează integral și afli de ce și unde să mergi în persoană.",
  },
  {
    id: "livrare",
    title: "Livrare gratuită și discretă",
    text: "O farmacie parteneră îți trimite tratamentul acasă, într-un colet fără numele afecțiunii sau al tratamentului.",
  },
  {
    id: "urmarire",
    title: "Mesaje gratuite, pauză sau anulare oricând",
    text: "Îi scrii medicului oricând, gratuit. Pui planul pe pauză sau îl anulezi din cont, oricând, înainte de următoarea plată.",
  },
];

export const promiseStep = (id: PromiseStep["id"]) => PROMISE_STEPS.find((s) => s.id === id)!;

/** The promise in two sentences, for call-to-action blocks next to a start button. */
export const PROMISE_SHORT = `Evaluarea este gratuită și durează câteva minute. Vezi planul propus și prețul înainte să plătești; suma doar se rezervă pe card și se încasează numai dacă medicul aprobă planul, în cel mult ${SLA_HOURS} de ore.`;
