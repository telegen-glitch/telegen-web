import "server-only";
import type { Answers } from "@/content/evaluations/types";

/**
 * Treatment plans a patient can be proposed (CLAUDE.md v5). Medicine names and
 * prices appear ONLY in the signed-in proposal and checkout (lawyer's
 * confirmation, docs/legal-review-needed.md #25), so this file is server-only:
 * it never reaches a public page or a public JavaScript file. Every statement
 * repeats the sourced medicine pages (/tratamente/...); doses and the minoxidil
 * concentration are left to the doctor, never invented here.
 */
export type PlanId = "hair-fin-min" | "hair-min";
export type Billing = "monthly" | "quarterly";

export interface PlanDefinition {
  id: PlanId;
  condition: string;
  title: string;
  items: { name: string; detail: string }[];
  purpose: string;
  timeToResults: string;
  sideEffects: string[];
  /** A warning shown prominently (EMA 2025 for finasteride). */
  warning?: string;
  links: { href: string; label: string }[];
}

const minoxidil = {
  name: "Minoxidil, soluție pentru scalp",
  detail: "Se aplică pe scalp. Concentrația și modul de aplicare le stabilește medicul.",
};
const minoxidilEffects = [
  "mâncărime, iritație și descuamare a scalpului, cele mai frecvente efecte adverse;",
  "o cădere temporară mai accentuată în primele săptămâni de utilizare;",
  "creșterea nedorită a părului pe față, dacă soluția ajunge pe piele în afara scalpului;",
  "rar, amețeală sau palpitații: spune-i medicului.",
];
const officialMinoxidil = {
  href: "https://anm.ro/_/_AMB/AMB_9951_11.05.17.pdf",
  label: "Informații oficiale (ANMDM): minoxidil soluție cutanată",
};

export const PLANS: Record<PlanId, PlanDefinition> = {
  "hair-fin-min": {
    id: "hair-fin-min",
    condition: "caderea-parului",
    title: "Finasteridă 1 mg și minoxidil pentru scalp",
    items: [
      {
        name: "Finasteridă 1 mg, comprimate",
        detail: "Pe cale orală, eliberată doar pe rețetă. Doza o stabilește medicul.",
      },
      minoxidil,
    ],
    purpose:
      "Încetinește căderea părului și poate crește numărul de fire în zonele afectate. Ghidul european recomandă ambele substanțe în alopecia androgenetică la bărbați.",
    timeToResults:
      "Efectul se vede în luni, nu în săptămâni: se evaluează după câteva luni de tratament constant. Dacă tratamentul se oprește, beneficiul se pierde treptat.",
    sideEffects: [
      "finasteridă: efecte sexuale (scăderea libidoului, dificultăți de erecție, tulburări de ejaculare);",
      "finasteridă: modificări ale dispoziției, inclusiv depresie și gânduri suicidare;",
      "finasteridă: sensibilitate sau mărire a sânilor; scade valoarea PSA din analize;",
      ...minoxidilEffects.map((e) => `minoxidil: ${e}`),
    ],
    warning:
      "Agenția Europeană a Medicamentului a confirmat în 2025 gândurile suicidare ca efect advers al finasteridei. Dacă observi schimbări ale dispoziției, stare depresivă sau gânduri de a-ți face rău, spune imediat medicului. Dacă ești în pericol imediat, sună la 112. Femeile însărcinate sau care pot rămâne însărcinate nu trebuie să atingă comprimatele sparte sau zdrobite.",
    links: [
      { href: "/tratamente/finasterida", label: "Finasteridă: cum acționează și efecte adverse" },
      { href: "/tratamente/minoxidil", label: "Minoxidil: cum acționează și efecte adverse" },
      {
        href: "https://mediately.co/ro/drugs/Ez4G3iOXanSjjTU4BXw0boiIRWx/propecia-1-mg-compr-film",
        label: "Informații oficiale (date ANMDM): finasteridă 1 mg",
      },
      officialMinoxidil,
    ],
  },
  "hair-min": {
    id: "hair-min",
    condition: "caderea-parului",
    title: "Minoxidil pentru scalp",
    items: [minoxidil],
    purpose:
      "Prelungește faza de creștere a firului și poate crește densitatea părului. Ghidul european îl recomandă în alopecia androgenetică, la bărbați și la femei.",
    timeToResults:
      "Efectul se evaluează după câteva luni de aplicare constantă, nu după câteva săptămâni. Dacă aplicarea se oprește, câștigul se pierde treptat.",
    sideEffects: minoxidilEffects,
    links: [
      { href: "/tratamente/minoxidil", label: "Minoxidil: cum acționează și efecte adverse" },
      officialMinoxidil,
    ],
  },
};

/**
 * Which plans may be proposed, the recommended one first. Finasteride is never
 * proposed unless the patient is a man; with a history of mood problems the
 * proposal starts from minoxidil alone. The doctor decides either way.
 */
export function eligiblePlans(condition: string, answers: Answers): PlanId[] {
  if (condition !== "caderea-parului") return [];
  const man = answers.sex?.[0] === "m";
  if (!man) return ["hair-min"];
  const mood = answers.mood?.[0];
  return mood && mood !== "no" ? ["hair-min", "hair-fin-min"] : ["hair-fin-min", "hair-min"];
}
