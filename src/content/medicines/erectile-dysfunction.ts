import type { MedicalDoc, RelatedLink } from "../types";

/**
 * Erectile dysfunction medicine information (CLAUDE.md 7c.B), written on 2026-10-07 from the
 * source pack (docs/sources/erectile-dysfunction.md, docs/sources/romania-prescription-status.md).
 * Neutral and educational only: no doses, no efficacy percentages (pending the lawyer's answer,
 * docs/legal-review-needed.md), no call to action, no purchase language (section 9.4).
 */

const hub: RelatedLink = {
  href: "/disfunctie-erectila",
  label: "Disfuncția erectilă: privire de ansamblu",
  description: "Ce este, de ce apare și ce opțiuni există.",
};
const tratament: RelatedLink = {
  href: "/disfunctie-erectila/tratament",
  label: "Tratamentul disfuncției erectile",
  description: "Stil de viață, tratament oral, consiliere.",
};
const inima: RelatedLink = {
  href: "/disfunctie-erectila/sanatatea-inimii",
  label: "Disfuncția erectilă și sănătatea inimii",
};
const cauze: RelatedLink = { href: "/disfunctie-erectila/cauze", label: "Cauzele disfuncției erectile" };

const dates = { publishedAt: "2026-10-07", updatedAt: "2026-10-07" } as const;

const nitrateCallout = {
  type: "callout" as const,
  tone: "caution" as const,
  title: "Niciodată împreună cu nitrații sau cu riociguatul",
  text: "Nu se ia niciodată împreună cu nitrații (medicamente pentru angină, inclusiv nitriții inhalați numiți „poppers”) sau cu riociguatul (pentru hipertensiunea pulmonară) {{cite:ema-viagra}} {{cite:eau-srh}}.",
};

const urgentCallout = {
  type: "callout" as const,
  tone: "caution" as const,
  title: "Când ceri ajutor medical imediat",
  text: "Cere imediat ajutor medical dacă o erecție durează mai mult de 4 ore. Dacă îți pierzi brusc vederea, oprește tratamentul și mergi imediat la medic {{cite:ema-viagra}}. Dacă ai durere sau apăsare în piept, sună la 112.",
};

const medicine = (
  doc: Omit<MedicalDoc, "kind" | "graphRole" | "conditionSlug" | "status" | "publishedAt" | "updatedAt">,
): MedicalDoc => ({
  kind: "treatment",
  graphRole: "treatment",
  conditionSlug: "disfunctie-erectila",
  status: "published",
  ...dates,
  ...doc,
});

export const edMedicines: MedicalDoc[] = [
  medicine({
    slug: "sildenafil",
    drug: { activeIngredient: "sildenafil", prescriptionStatus: "PrescriptionOnly" },
    title: "Sildenafil",
    metaTitle: "Sildenafil: cum acționează și precauții",
    metaDescription:
      "Informații neutre despre sildenafil în disfuncția erectilă: cum acționează, cine nu trebuie să îl ia (nitrați, riociguat), interacțiuni și efecte adverse.",
    h1: "Sildenafil: informații despre tratament",
    summary:
      "Sildenafilul este un medicament oral din clasa inhibitorilor PDE5, folosit în disfuncția erectilă și eliberat doar pe bază de prescripție medicală {{cite:ema-viagra}} {{cite:anmdm-sildenafil}}. Ajută sângele să ajungă în penis doar în prezența excitației sexuale. Nu se ia niciodată împreună cu nitrații sau cu riociguatul, iar înainte de tratament medicul ține cont de starea inimii {{cite:ema-viagra}}.",
    sections: [
      {
        id: "cum-actioneaza",
        heading: "Cum acționează sildenafilul",
        blocks: [
          {
            type: "p",
            text: "Sildenafilul blochează enzima fosfodiesterază de tip 5 (PDE5), care descompune o substanță numită GMPc. Astfel, în timpul excitației sexuale, sângele poate ajunge mai ușor în penis. Fără excitație sexuală, medicamentul nu produce o erecție {{cite:ema-viagra}}.",
          },
          {
            type: "p",
            text: "Ghidul european al urologilor recomandă inhibitorii PDE5 ca primă linie de tratament în disfuncția erectilă, alături de schimbările de stil de viață {{cite:eau-srh}}. Locul lor printre celelalte opțiuni este explicat în [tratamentul disfuncției erectile](/disfunctie-erectila/tratament).",
          },
        ],
      },
      {
        id: "cum-se-foloseste",
        heading: "Cum se folosește",
        blocks: [
          {
            type: "p",
            text: "Sildenafilul se ia la nevoie, cu aproximativ o oră înainte de activitatea sexuală, și nu mai des de o dată pe zi {{cite:ema-viagra}}. Începe să acționeze în 30–60 de minute, iar efectul durează până la 12 ore {{cite:eau-srh}}. Sucul de grepfrut poate crește ușor concentrația lui în sânge {{cite:ema-viagra}}.",
          },
          {
            type: "p",
            text: "Doza o stabilește medicul, după evaluare. În România, sildenafilul se eliberează doar pe bază de prescripție medicală {{cite:anmdm-sildenafil}}. Nu este destinat persoanelor sub 18 ani {{cite:ema-viagra}}.",
          },
        ],
      },
      {
        id: "contraindicatii",
        heading: "Cine nu trebuie să ia sildenafil",
        blocks: [
          nitrateCallout,
          {
            type: "p",
            text: "Sildenafilul nu se folosește nici în aceste situații {{cite:ema-viagra}}:",
          },
          {
            type: "list",
            items: [
              "boli de inimă severe, angină instabilă sau insuficiență cardiacă severă;",
              "un accident vascular cerebral sau un infarct recent;",
              "tensiune arterială foarte mică (sub 90/50 mmHg);",
              "boală severă de ficat;",
              "o pierdere bruscă a vederii în trecut, din cauza circulației slabe la nervul optic (NAION);",
              "unele boli ereditare ale retinei, cum este retinita pigmentară.",
            ],
          },
          {
            type: "p",
            text: "Înainte de orice tratament pentru disfuncția erectilă, medicul trebuie să țină cont de starea inimii {{cite:ema-viagra}}. De ce contează afli în [disfuncția erectilă și sănătatea inimii](/disfunctie-erectila/sanatatea-inimii).",
          },
        ],
      },
      {
        id: "interactiuni",
        heading: "Ce interacțiuni contează",
        blocks: [
          {
            type: "p",
            text: "Pe lângă nitrați și riociguat, informațiile de produs cer prudență la asocierea cu alfa-blocantele (folosite pentru prostată sau tensiune), pentru că la unele persoane pot apărea scăderi ale tensiunii cu simptome {{cite:ema-viagra}}. Spune-i medicului toate medicamentele și suplimentele pe care le iei.",
          },
        ],
      },
      {
        id: "efecte-adverse",
        heading: "Ce efecte adverse poate avea sildenafilul",
        blocks: [
          {
            type: "p",
            text: "Efectele adverse frecvente sunt {{cite:ema-viagra}}:",
          },
          {
            type: "list",
            items: [
              "durere de cap;",
              "înroșirea feței și senzație de căldură;",
              "indigestie;",
              "tulburări de vedere;",
              "nas înfundat;",
              "amețeală și greață.",
            ],
          },
          urgentCallout,
        ],
      },
    ],
    faqs: [
      {
        question: "Sildenafilul funcționează fără excitație sexuală?",
        answer:
          "Nu. Sildenafilul ajută sângele să ajungă în penis doar în prezența excitației sexuale {{cite:ema-viagra}}.",
      },
      {
        question: "Cât durează efectul sildenafilului?",
        answer:
          "Începe să acționeze în 30–60 de minute, iar efectul durează până la 12 ore {{cite:eau-srh}}.",
      },
      {
        question: "Pot lua sildenafil dacă iau medicamente pentru inimă?",
        answer:
          "Depinde de medicamente și de boală. Cu nitrații nu se ia niciodată, iar în bolile de inimă severe nu se folosește {{cite:ema-viagra}}. Medicul trebuie să țină cont de starea inimii înainte de tratament {{cite:ema-viagra}}.",
      },
      {
        question: "Ce fac dacă o erecție nu trece?",
        answer: "Dacă o erecție durează mai mult de 4 ore, cere imediat ajutor medical {{cite:ema-viagra}}.",
      },
      {
        question: "Sildenafilul crește riscul de infarct?",
        answer:
          "Niciun studiu randomizat sau deschis nu a arătat o creștere a frecvenței infarctului la pacienții care iau inhibitori PDE5 {{cite:eau-srh}}. Medicul evaluează totuși starea inimii înainte de tratament {{cite:ema-viagra}}.",
      },
    ],
    sourceIds: ["ema-viagra", "anmdm-sildenafil", "eau-srh"],
    limitations:
      "Pagina are scop exclusiv informativ și nu reprezintă o recomandare sau promovare a unui medicament. Nu conține doze. Sildenafilul se eliberează doar pe bază de prescripție medicală; citește prospectul și discută cu medicul.",
    related: [
      hub,
      tratament,
      inima,
      { href: "/tratamente/tadalafil", label: "Tadalafil: informații" },
      cauze,
    ],
  }),
  medicine({
    slug: "tadalafil",
    drug: { activeIngredient: "tadalafil", prescriptionStatus: "PrescriptionOnly" },
    title: "Tadalafil",
    metaTitle: "Tadalafil: cum acționează și precauții",
    metaDescription:
      "Informații neutre despre tadalafil în disfuncția erectilă: cum acționează, cât durează efectul, cine nu trebuie să îl ia (nitrați, riociguat), efecte adverse.",
    h1: "Tadalafil: informații despre tratament",
    summary:
      "Tadalafilul este un medicament oral din clasa inhibitorilor PDE5, folosit în disfuncția erectilă și în simptomele măririi benigne a prostatei; se eliberează doar pe bază de prescripție medicală {{cite:ema-cialis}} {{cite:anmdm-tadalafil}}. Efectul său durează până la 36 de ore {{cite:eau-srh}}. Nu se ia niciodată împreună cu nitrații sau cu riociguatul {{cite:ema-cialis}}.",
    sections: [
      {
        id: "cum-actioneaza",
        heading: "Cum acționează tadalafilul",
        blocks: [
          {
            type: "p",
            text: "Ca toți inhibitorii PDE5, tadalafilul ajută sângele să ajungă în penis în timpul excitației sexuale. Fără excitație sexuală, nu produce o erecție {{cite:ema-cialis}}.",
          },
          {
            type: "p",
            text: "Este folosit și pentru simptomele măririi benigne a prostatei {{cite:ema-cialis}}. În disfuncția erectilă, ghidul european recomandă inhibitorii PDE5 ca primă linie de tratament, alături de schimbările de stil de viață {{cite:eau-srh}}.",
          },
        ],
      },
      {
        id: "cum-se-foloseste",
        heading: "Cum se folosește",
        blocks: [
          {
            type: "p",
            text: "Tadalafilul se poate folosi în două feluri, la recomandarea medicului {{cite:ema-cialis}}:",
          },
          {
            type: "list",
            items: [
              "**la nevoie**, cu cel puțin 30 de minute înainte de activitatea sexuală;",
              "**zilnic, într-o doză mică**, pentru bărbații cu activitate sexuală frecventă (de cel puțin două ori pe săptămână).",
            ],
          },
          {
            type: "p",
            text: "Începe să acționeze în aproximativ 30 de minute, cu efect maxim după circa 2 ore, iar efectul durează până la 36 de ore {{cite:eau-srh}}. Doza o stabilește medicul. În România, tadalafilul se eliberează doar pe bază de prescripție medicală {{cite:anmdm-tadalafil}}.",
          },
        ],
      },
      {
        id: "contraindicatii",
        heading: "Cine nu trebuie să ia tadalafil",
        blocks: [
          nitrateCallout,
          {
            type: "p",
            text: "Tadalafilul nu se folosește nici după un infarct în ultimele trei luni, după un accident vascular cerebral în ultimele șase luni sau în bolile cardiovasculare necontrolate {{cite:ema-cialis}}. Bărbații cu boli de inimă severe sau instabile au nevoie mai întâi de o evaluare cardiologică {{cite:eau-srh}}.",
          },
          {
            type: "p",
            text: "De ce contează inima afli în [disfuncția erectilă și sănătatea inimii](/disfunctie-erectila/sanatatea-inimii).",
          },
        ],
      },
      {
        id: "efecte-adverse",
        heading: "Ce efecte adverse poate avea tadalafilul",
        blocks: [
          {
            type: "p",
            text: "Efectele adverse frecvente sunt durerea de cap, indigestia, durerile de spate și durerile musculare; ele apar mai des la doze mai mari {{cite:ema-cialis}}. Ca la toți inhibitorii PDE5, pot apărea și înroșirea feței și nasul înfundat {{cite:eau-srh}}.",
          },
          {
            type: "p",
            text: "Pentru medicamentele din această clasă, informațiile de produs cer ajutor medical imediat dacă o erecție durează mai mult de 4 ore și oprirea tratamentului dacă vederea se pierde brusc {{cite:ema-viagra}}.",
          },
          urgentCallout,
        ],
      },
    ],
    faqs: [
      {
        question: "Care e diferența dintre tadalafil și sildenafil?",
        answer:
          "Mai ales durata efectului: până la 36 de ore pentru tadalafil și până la 12 ore pentru sildenafil {{cite:eau-srh}}. Tadalafilul se poate folosi și zilnic, într-o doză mică {{cite:ema-cialis}}. Alegerea o face medicul.",
      },
      {
        question: "Tadalafilul funcționează fără excitație sexuală?",
        answer:
          "Nu. Ca toți inhibitorii PDE5, are nevoie de excitație sexuală ca să acționeze {{cite:ema-cialis}}.",
      },
      {
        question: "De ce se folosește tadalafilul și pentru prostată?",
        answer:
          "Tadalafilul este autorizat și pentru simptomele măririi benigne a prostatei {{cite:ema-cialis}}. Medicul evaluează dacă ai nevoie de el pentru una sau pentru ambele probleme.",
      },
      {
        question: "Pot lua tadalafil după un infarct?",
        answer:
          "Nu în primele trei luni după un infarct sau în primele șase luni după un accident vascular cerebral {{cite:ema-cialis}}. După aceea, decizia se ia după o evaluare a inimii {{cite:eau-srh}}.",
      },
    ],
    sourceIds: ["ema-cialis", "anmdm-tadalafil", "eau-srh", "ema-viagra"],
    limitations:
      "Pagina are scop exclusiv informativ și nu reprezintă o recomandare sau promovare a unui medicament. Nu conține doze. Tadalafilul se eliberează doar pe bază de prescripție medicală; citește prospectul și discută cu medicul.",
    related: [
      hub,
      tratament,
      inima,
      { href: "/tratamente/sildenafil", label: "Sildenafil: informații" },
      cauze,
    ],
  }),
];
