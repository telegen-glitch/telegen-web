import { adultQuestion, minorStop } from "./shared";
import type { EvaluationDefinition } from "./types";

/**
 * Acne evaluation. No photo upload (CLAUDE.md 7b). Wording checked against the source pack
 * (docs/sources/acne.md, 2026-10-07). Red flags from 7c.C end on a
 * hard stop recommending an in-person consult: nodular or scarring acne, fever
 * with severe acne, sudden severe adult-onset acne, current isotretinoin
 * (specialist-supervised), pregnancy or breastfeeding.
 */
export const acneEvaluation: EvaluationDefinition = {
  topic: "acnee",
  name: "Acnee",
  label: "Evaluare dermatologică online",
  introTitle: "Acneea:",
  introAccent: "câteva întrebări.",
  questions: [
    adultQuestion("minor"),
    {
      id: "sex",
      title: "Ce sex ți-a fost atribuit la naștere?",
      help: "Unele cauze și opțiuni de tratament diferă între bărbați și femei.",
      type: "single",
      options: [
        { value: "m", label: "Masculin" },
        { value: "f", label: "Feminin" },
        { value: "na", label: "Prefer să nu răspund" },
      ],
    },
    {
      id: "pregnancy",
      title: "Ești însărcinată, alăptezi sau plănuiești o sarcină în următoarele luni?",
      type: "single",
      showIf: { question: "sex", anyOf: ["f"] },
      options: [
        { value: "no", label: "Nu" },
        { value: "yes", label: "Da" },
      ],
      stop: { anyOf: ["yes"], stopId: "pregnancy" },
    },
    {
      id: "areas",
      title: "Unde apare acneea?",
      help: "Poți alege mai multe variante.",
      type: "multi",
      options: [
        { value: "face", label: "Pe față" },
        { value: "back", label: "Pe spate" },
        { value: "chest", label: "Pe piept" },
        { value: "other", label: "În altă zonă" },
      ],
    },
    {
      id: "lesions",
      title: "Cum arată, în cea mai mare parte?",
      help: "Poți alege mai multe variante.",
      type: "multi",
      options: [
        { value: "comedones", label: "Puncte negre sau albe, mici" },
        { value: "papules", label: "Coșuri roșii sau cu puroi" },
        { value: "nodules", label: "Umflături mari, adânci și dureroase" },
      ],
      stop: { anyOf: ["nodules"], stopId: "nodular" },
    },
    {
      id: "scars",
      title: "Îți lasă acneea cicatrici?",
      help: "Adâncituri sau urme în relief care nu dispar în câteva luni.",
      type: "single",
      options: [
        { value: "no", label: "Nu" },
        { value: "yes", label: "Da" },
        { value: "unsure", label: "Nu sunt sigur" },
      ],
      stop: { anyOf: ["yes"], stopId: "scarring" },
    },
    {
      id: "onset",
      title: "Cum a apărut acneea?",
      type: "single",
      options: [
        { value: "teen", label: "În adolescență și a continuat" },
        { value: "adult-gradual", label: "Treptat, la vârstă adultă" },
        { value: "adult-sudden", label: "Brusc și sever, la vârstă adultă" },
      ],
      stop: { anyOf: ["adult-sudden"], stopId: "sudden-adult" },
    },
    {
      id: "systemic",
      title: "Odată cu acneea, ai febră, dureri de articulații sau te simți rău în general?",
      type: "single",
      options: [
        { value: "no", label: "Nu" },
        { value: "yes", label: "Da" },
      ],
      stop: { anyOf: ["yes"], stopId: "systemic" },
    },
    {
      id: "duration",
      title: "De cât timp ai acnee?",
      type: "single",
      options: [
        { value: "lt3m", label: "De mai puțin de 3 luni" },
        { value: "3-12m", label: "De 3–12 luni" },
        { value: "gt1y", label: "De mai mult de un an" },
      ],
    },
    {
      id: "tried",
      title: "Ce ai încercat până acum?",
      help: "Poți alege mai multe variante.",
      type: "multi",
      exclusive: ["none"],
      options: [
        { value: "otc", label: "Produse fără prescripție" },
        { value: "topical-rx", label: "Creme sau geluri pe rețetă" },
        { value: "oral-antibiotic", label: "Antibiotice luate pe gură" },
        { value: "hormonal", label: "Tratament hormonal" },
        { value: "none", label: "Nimic încă" },
      ],
    },
    {
      id: "isotretinoin",
      title: "Ai luat vreodată isotretinoin?",
      help: "Un tratament pe gură pentru acneea severă, folosit sub supravegherea medicului specialist.",
      type: "single",
      options: [
        { value: "never", label: "Nu" },
        { value: "past", label: "Da, în trecut" },
        { value: "current", label: "Da, iau acum" },
      ],
      stop: { anyOf: ["current"], stopId: "isotretinoin-current" },
    },
    {
      id: "medicines",
      title: "Iei alte medicamente în mod regulat?",
      help: "Inclusiv anticoncepționale sau suplimente. Detaliile le vei putea da medicului în aplicația clinică.",
      type: "single",
      options: [
        { value: "no", label: "Nu" },
        { value: "yes", label: "Da" },
        { value: "unsure", label: "Nu sunt sigur" },
      ],
    },
  ],
  stops: [
    minorStop,
    {
      id: "pregnancy",
      title: "Ai nevoie de un consult în persoană",
      text: "În sarcină, în alăptare sau când plănuiești o sarcină, multe tratamente pentru acnee nu sunt potrivite. Discută cu medicul dermatolog sau cu medicul care îți urmărește sarcina.",
    },
    {
      id: "nodular",
      title: "Acneea nodulară se evaluează în persoană",
      text: "Umflăturile mari, adânci și dureroase pot lăsa cicatrici și au nevoie de examinarea unui medic dermatolog, care poate recomanda tratamente disponibile doar sub supraveghere de specialitate.",
    },
    {
      id: "scarring",
      title: "Acneea care lasă cicatrici se evaluează în persoană",
      text: "Când acneea lasă cicatrici, tratamentul trebuie stabilit de un medic dermatolog după un examen clinic, ca să limiteze cicatrici noi.",
    },
    {
      id: "sudden-adult",
      title: "Ai nevoie de un consult în persoană",
      text: "Acneea apărută brusc și sever la vârstă adultă trebuie văzută de un medic dermatolog în persoană, care stabilește de unde vine și ce investigații sunt necesare.",
    },
    {
      id: "systemic",
      title: "Mergi la un medic cât mai curând",
      text: "Acneea severă însoțită de febră, dureri de articulații sau stare generală proastă trebuie evaluată de un medic în aceeași zi. Dacă te simți foarte rău, sună la 112.",
      urgent: true,
    },
    {
      id: "isotretinoin-current",
      title: "Continuă cu medicul care te urmărește",
      text: "Tratamentul cu isotretinoin se face sub supravegherea medicului dermatolog care l-a prescris. Pentru orice întrebare, adresează-te lui.",
    },
  ],
  notes: [
    {
      when: [{ question: "areas", anyOf: ["back", "chest"] }],
      tone: "info",
      text: "Când acneea se întinde pe spate sau pe piept, medicul poate lua în calcul mai devreme un tratament pe gură. Va discuta opțiunile cu tine.",
    },
    {
      when: [{ question: "scars", anyOf: ["unsure"] }],
      tone: "info",
      text: "Dacă nu ești sigur dacă acneea lasă cicatrici, spune-i medicului: ele schimbă alegerea tratamentului.",
    },
  ],
};
