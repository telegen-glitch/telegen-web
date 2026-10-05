/**
 * Hair-loss pre-assessment questions. Plain language, one per screen.
 * Answers live only in React state (see EvaluationFlow).
 */
export interface Option {
  value: string;
  label: string;
  hint?: string;
}

export interface Question {
  id: string;
  title: string;
  help?: string;
  type: "single" | "multi";
  options: Option[];
  /** Multi-select: options that clear all others when chosen. */
  exclusive?: string[];
}

export const questions: Question[] = [
  {
    id: "sex",
    title: "Ce sex ți-a fost atribuit la naștere?",
    help: "Tiparul căderii părului și opțiunile de tratament diferă între bărbați și femei.",
    type: "single",
    options: [
      { value: "m", label: "Masculin" },
      { value: "f", label: "Feminin" },
      { value: "na", label: "Prefer să nu răspund" },
    ],
  },
  {
    id: "age",
    title: "Câți ani ai?",
    type: "single",
    options: [
      { value: "u18", label: "Sub 18 ani" },
      { value: "18-24", label: "18–24 de ani" },
      { value: "25-34", label: "25–34 de ani" },
      { value: "35-44", label: "35–44 de ani" },
      { value: "45-54", label: "45–54 de ani" },
      { value: "55+", label: "55 de ani sau peste" },
    ],
  },
  {
    id: "duration",
    title: "De cât timp observi că îți cade sau se subțiază părul?",
    type: "single",
    options: [
      { value: "lt6m", label: "De mai puțin de 6 luni" },
      { value: "6-12m", label: "De 6–12 luni" },
      { value: "1-3y", label: "De 1–3 ani" },
      { value: "gt3y", label: "De mai mult de 3 ani" },
    ],
  },
  {
    id: "areas",
    title: "Unde observi cel mai mult schimbarea?",
    help: "Poți alege mai multe variante.",
    type: "multi",
    options: [
      { value: "temples", label: "La tâmple sau la linia frunții" },
      { value: "crown", label: "Pe creștet" },
      { value: "part", label: "Pe cărare, care pare mai lată" },
      { value: "diffuse", label: "Pe tot scalpul, uniform" },
      { value: "patches", label: "În pete rotunde, fără păr" },
    ],
  },
  {
    id: "onset",
    title: "Cum a apărut?",
    type: "single",
    options: [
      { value: "gradual", label: "Treptat, în luni sau ani" },
      { value: "sudden", label: "Brusc, în câteva săptămâni" },
      { value: "unsure", label: "Nu sunt sigur" },
    ],
  },
  {
    id: "scalp",
    title: "Ai și alte simptome pe scalp?",
    help: "Poți alege mai multe variante.",
    type: "multi",
    exclusive: ["none"],
    options: [
      { value: "itch", label: "Mâncărime" },
      { value: "redness", label: "Roșeață, cruste sau descuamare" },
      { value: "pain", label: "Durere sau usturime" },
      { value: "none", label: "Niciunul" },
    ],
  },
  {
    id: "family",
    title: "Are cineva din familia apropiată cădere a părului?",
    help: "Părinți, frați, bunici sau unchi.",
    type: "single",
    options: [
      { value: "yes", label: "Da" },
      { value: "no", label: "Nu" },
      { value: "unsure", label: "Nu știu" },
    ],
  },
  {
    id: "tried",
    title: "Ai încercat deja ceva pentru căderea părului?",
    type: "single",
    options: [
      { value: "no", label: "Nu, nimic" },
      { value: "otc", label: "Da, produse fără prescripție" },
      { value: "doctor", label: "Da, un tratament recomandat de un medic" },
    ],
  },
  {
    id: "health",
    title: "Ai o afecțiune sau iei un tratament de care ar trebui să știe medicul?",
    help: "De exemplu probleme ale tiroidei, anemie, o sarcină sau medicamente zilnice. Detaliile le vei putea da medicului în aplicația clinică.",
    type: "single",
    options: [
      { value: "no", label: "Nu" },
      { value: "yes", label: "Da" },
      { value: "unsure", label: "Nu sunt sigur" },
    ],
  },
  {
    id: "goal",
    title: "Ce îți dorești cel mai mult?",
    type: "single",
    options: [
      { value: "understand", label: "Să înțeleg ce se întâmplă" },
      { value: "stop", label: "Să opresc căderea" },
      { value: "regrow", label: "Să am din nou păr mai des" },
      { value: "unsure", label: "Nu știu încă" },
    ],
  },
];

export type Answers = Record<string, string[]>;

/** Non-diagnostic notes shown on the summary screen. */
export function summaryNotes(a: Answers): { tone: "caution" | "info"; text: string }[] {
  const notes: { tone: "caution" | "info"; text: string }[] = [];
  const has = (q: string, v: string) => a[q]?.includes(v) ?? false;
  if (has("age", "u18")) {
    notes.push({
      tone: "info",
      text: "Serviciul Telegen va fi disponibil doar pentru persoane de cel puțin 18 ani. Pentru căderea părului la copii și adolescenți, mergi împreună cu un părinte la un medic dermatolog.",
    });
  }
  if (has("areas", "patches") || has("onset", "sudden") || has("scalp", "redness") || has("scalp", "pain")) {
    notes.push({
      tone: "caution",
      text: "Unele dintre răspunsurile tale (pete fără păr, apariție bruscă, roșeață sau durere pe scalp) pot avea alte cauze decât alopecia androgenetică. Îți recomandăm un consult în persoană la un medic dermatolog.",
    });
  }
  return notes;
}
