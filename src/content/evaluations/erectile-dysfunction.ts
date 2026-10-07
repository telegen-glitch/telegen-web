import { adultQuestion, minorStop } from "./shared";
import type { EvaluationDefinition, HardStop, Question } from "./types";

/**
 * ED evaluation. Safety screens are mandatory, one per screen (CLAUDE.md 7c.D).
 * Any positive answer, and "not sure" on medication questions, ends on a hard
 * stop recommending in-person care. Wording is original: no validated
 * questionnaire (e.g. IIEF-5) is reproduced (see docs/legal-review-needed.md).
 */
const yesNoUnsure = [
  { value: "no", label: "Nu" },
  { value: "yes", label: "Da" },
  { value: "unsure", label: "Nu sunt sigur" },
];
const yesNo = [
  { value: "no", label: "Nu" },
  { value: "yes", label: "Da" },
];

const safety: Question[] = [
  {
    id: "nitrates",
    title: "Folosești nitrați sau riociguat?",
    help: "Nitrații se folosesc pentru angină: nitroglicerină sub limbă, spray sau plasturi, ori tablete cu mononitrat sau dinitrat de izosorbid. Include și nitriții inhalați recreațional („poppers”). Riociguatul se folosește pentru hipertensiunea pulmonară.",
    type: "single",
    options: yesNoUnsure,
    stop: { anyOf: ["yes", "unsure"], stopId: "nitrates" },
  },
  {
    id: "cardiac-event",
    title: "Ai avut un infarct sau un accident vascular cerebral în ultimele 12 luni?",
    type: "single",
    options: yesNo,
    stop: { anyOf: ["yes"], stopId: "cardiac-event" },
  },
  {
    id: "chest-pain",
    title: "Ai durere sau apăsare în piept, ori respiri foarte greu, la efort fizic?",
    help: "De exemplu când urci două etaje pe scări sau mergi repede.",
    type: "single",
    options: yesNo,
    stop: { anyOf: ["yes"], stopId: "chest-pain" },
  },
  {
    id: "blood-pressure",
    title: "Ai tensiunea arterială mare și netratată sau greu de controlat, ori tensiune foarte mică?",
    type: "single",
    options: yesNoUnsure,
    stop: { anyOf: ["yes"], stopId: "blood-pressure" },
  },
  {
    id: "liver-kidney",
    title: "Ai o boală severă de ficat sau de rinichi?",
    help: "De exemplu ciroză, insuficiență hepatică, insuficiență renală sau dializă.",
    type: "single",
    options: yesNo,
    stop: { anyOf: ["yes"], stopId: "liver-kidney" },
  },
  {
    id: "alpha-blockers",
    title: "Iei alfa-blocante?",
    help: "Se folosesc pentru prostată sau tensiune: de exemplu tamsulosin, alfuzosin, doxazosin sau terazosin.",
    type: "single",
    options: yesNoUnsure,
    stop: { anyOf: ["yes", "unsure"], stopId: "alpha-blockers" },
  },
];

const stops: HardStop[] = [
  minorStop,
  {
    id: "nitrates",
    title: "Ai nevoie de un consult în persoană",
    text: "Unele tratamente pentru disfuncția erectilă nu se pot asocia cu nitrații sau cu riociguatul, iar combinația poate scădea periculos tensiunea arterială. Discută cu medicul tău cardiolog sau de familie înainte de orice tratament. Dacă nu știi exact ce medicamente iei, ia lista lor la consult.",
  },
  {
    id: "cardiac-event",
    title: "Ai nevoie de un consult în persoană",
    text: "După un infarct sau un accident vascular cerebral, evaluarea disfuncției erectile și a oricărui tratament trebuie făcută de medicul care îți urmărește inima. Programează un consult la cardiolog sau la medicul de familie.",
  },
  {
    id: "chest-pain",
    title: "Durerea în piept la efort trebuie evaluată în persoană",
    text: "Durerea sau apăsarea în piept la efort poate fi un semn de boală a inimii și trebuie verificată de un medic înainte de orice tratament pentru disfuncția erectilă. Programează un consult la medicul de familie sau la cardiolog.",
    urgent: true,
  },
  {
    id: "blood-pressure",
    title: "Tensiunea trebuie controlată mai întâi",
    text: "Tensiunea arterială netratată, greu de controlat sau foarte mică trebuie evaluată de medicul de familie sau de cardiolog înainte de orice tratament pentru disfuncția erectilă.",
  },
  {
    id: "liver-kidney",
    title: "Ai nevoie de un consult în persoană",
    text: "În bolile severe de ficat sau de rinichi, alegerea și doza oricărui tratament trebuie stabilite de medicul care te urmărește. Programează un consult la medicul de familie sau la specialist.",
  },
  {
    id: "alpha-blockers",
    title: "Ai nevoie de un consult în persoană",
    text: "Asocierea alfa-blocantelor cu unele tratamente pentru disfuncția erectilă poate scădea tensiunea arterială. Medicul care ți-a prescris alfa-blocantul trebuie să decidă dacă și cum poți începe alt tratament.",
  },
  {
    id: "injury",
    title: "Ai nevoie de un consult în persoană",
    text: "Problemele de erecție apărute brusc după o lovitură, o operație sau un accident trebuie evaluate de un medic urolog.",
  },
  {
    id: "curvature",
    title: "Curbura sau durerea penisului se evaluează în persoană",
    text: "O curbură nou apărută, o îngroșare sau durerea în timpul erecției trebuie examinate de un medic urolog.",
  },
];

export const erectileDysfunctionEvaluation: EvaluationDefinition = {
  topic: "disfunctie-erectila",
  name: "Disfuncție erectilă",
  label: "Evaluare medicală online, discretă",
  introTitle: "Disfuncția erectilă:",
  introAccent: "câteva întrebări, discret.",
  questions: [
    adultQuestion("minor"),
    {
      id: "duration",
      title: "De cât timp ai dificultăți cu erecția?",
      type: "single",
      options: [
        { value: "lt3m", label: "De mai puțin de 3 luni" },
        { value: "3-12m", label: "De 3–12 luni" },
        { value: "gt1y", label: "De mai mult de un an" },
      ],
    },
    {
      id: "onset",
      title: "Cum au apărut dificultățile?",
      type: "single",
      options: [
        { value: "gradual", label: "Treptat" },
        { value: "sudden", label: "Brusc, fără un motiv clar" },
        { value: "injury", label: "După o lovitură, o operație sau un accident" },
      ],
      stop: { anyOf: ["injury"], stopId: "injury" },
    },
    {
      id: "situations",
      title: "Când apar dificultățile?",
      type: "single",
      options: [
        { value: "always", label: "Aproape de fiecare dată" },
        { value: "sometimes", label: "Doar uneori sau în anumite situații" },
        { value: "unsure", label: "Nu sunt sigur" },
      ],
    },
    {
      id: "morning",
      title: "Mai ai erecții dimineața sau spontan?",
      type: "single",
      options: [
        { value: "yes", label: "Da, ca de obicei" },
        { value: "less", label: "Mai rar decât înainte" },
        { value: "no", label: "Nu" },
      ],
    },
    {
      id: "curvature",
      title: "Ai observat o curbură nouă, o îngroșare sau durere la erecție?",
      type: "single",
      options: yesNo,
      stop: { anyOf: ["yes"], stopId: "curvature" },
    },
    ...safety,
    {
      id: "conditions",
      title: "Ai vreuna dintre aceste afecțiuni?",
      help: "Poți alege mai multe variante.",
      type: "multi",
      exclusive: ["none"],
      options: [
        { value: "diabetes", label: "Diabet" },
        { value: "cholesterol", label: "Colesterol mare" },
        { value: "hypertension", label: "Tensiune mare, tratată" },
        { value: "depression", label: "Depresie sau anxietate" },
        { value: "none", label: "Niciuna" },
      ],
    },
    {
      id: "other-medicines",
      title: "Iei alte medicamente în mod regulat?",
      help: "Detaliile le vei putea da medicului în aplicația clinică.",
      type: "single",
      options: yesNoUnsure,
    },
  ],
  stops,
  notes: [
    {
      when: [{ question: "conditions", anyOf: ["diabetes", "cholesterol", "hypertension"] }],
      tone: "info",
      text: "Diabetul, colesterolul mare și tensiunea mare pot fi legate de problemele de erecție. Medicul va ține cont de ele și îți poate recomanda și un control al inimii.",
    },
  ],
};
