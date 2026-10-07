import type { Condition } from "../types";

export const hairLoss: Condition = {
  slug: "caderea-parului",
  basePath: "/caderea-parului",
  name: "Căderea părului",
  shortName: "Căderea părului",
  teaser:
    "Alopecia androgenetică: subțierea treptată a părului la tâmple, creștet sau pe cărare. Se poate evalua și trata.",
  medicalName: "Alopecie androgenetică",
  inSentence: "căderea părului",
  presentation: {
    heroAccent: "evaluată de un dermatolog.",
    asideTitle: "Nu știi dacă e alopecie androgenetică?",
    asideAccent: "Un dermatolog îți poate spune.",
    evaluationLabel: "Evaluare dermatologică online",
  },
  status: "published",
  guideSlugs: [
    "semnele-alopeciei-androgenetice",
    "cauzele-caderii-parului",
    "caderea-parului-intrebari-frecvente",
  ],
  treatmentSlugs: ["minoxidil", "finasterida"],
  approaches: [
    {
      title: "Tratament topic",
      text: "Se aplică pe scalp și prelungește faza de creștere a firului.",
      href: "/tratamente/minoxidil",
      linkLabel: "Informații despre tratamentul topic",
    },
    {
      title: "Tratament oral",
      text: "Reduce efectul hormonal asupra foliculului. Se eliberează doar pe rețetă, după evaluarea medicului.",
      href: "/tratamente/finasterida",
      linkLabel: "Informații despre tratamentul oral",
    },
    {
      title: "Consult în persoană",
      text: "Când semnele nu se potrivesc cu alopecia androgenetică, medicul îți recomandă un examen clinic.",
      href: "/ghiduri/cauzele-caderii-parului",
      linkLabel: "Alte cauze ale căderii părului",
    },
  ],
  doc: {
    kind: "condition",
    slug: "caderea-parului",
    path: "/caderea-parului",
    // Every term below appears verbatim on the page (tested).
    entity: {
      alternateName: ["alopecie androgenetică"],
      signOrSymptom: [
        "linia frunții se retrage",
        "părul se subțiază difuz pe creștet",
        "cărarea pare tot mai lată",
      ],
      riskFactor: ["predispoziția genetică", "dihidrotestosteron (DHT)"],
      possibleTreatment: ["Tratament topic", "Tratament oral"],
    },
    graphRole: "condition",
    conditionSlug: "caderea-parului",
    title: "Căderea părului",
    metaTitle: "Căderea părului: cauze, semne și tratament",
    metaDescription:
      "Ce este alopecia androgenetică, cum o recunoști, ce opțiuni de tratament există și la ce să te aștepți lună de lună. Evaluare dermatologică online.",
    h1: "Căderea părului",
    summary:
      "Cea mai frecventă formă de cădere a părului, la bărbați și la femei, este alopecia androgenetică: firele devin treptat mai subțiri, mai ales la tâmple, pe creștet sau de-a lungul cărării. Nu se oprește de la sine, dar progresia poate fi încetinită, iar în multe cazuri densitatea se îmbunătățește cu un tratament ales de medic și urmat constant {{cite:kanti-2018}}.",
    sections: [
      {
        id: "ce-este",
        heading: "Ce este alopecia androgenetică",
        blocks: [
          {
            type: "p",
            text: "Fiecare fir de păr crește dintr-un folicul care trece prin cicluri: o fază lungă de creștere, o scurtă tranziție și o fază de repaus, după care firul cade și ciclul reîncepe. În alopecia androgenetică, foliculii din anumite zone ale scalpului sunt sensibili la dihidrotestosteron (DHT), un hormon derivat din testosteron. Cu fiecare ciclu, faza de creștere se scurtează, iar foliculul se micșorează. Rezultatul: fire mai fine, mai scurte și mai deschise la culoare, până când unele nu mai ies deloc la suprafață {{cite:statpearls-aga}}.",
          },
          {
            type: "p",
            text: "Procesul se numește miniaturizare și este treptat. De aceea mulți oameni observă mai întâi că se vede scalpul în lumină puternică sau că părul pare mai puțin bogat, nu neapărat că le cade mai mult păr decât de obicei.",
          },
        ],
      },
      {
        id: "semne",
        heading: "Cum se manifestă",
        blocks: [
          {
            type: "p",
            text: "Tiparul diferă între bărbați și femei. Descrierea de mai jos e un punct de plecare; detaliile sunt în ghidul despre [semnele alopeciei androgenetice](/ghiduri/semnele-alopeciei-androgenetice).",
          },
          {
            type: "list",
            items: [
              "**La bărbați:** linia frunții se retrage la tâmple, părul se rărește pe creștet, iar cele două zone se pot uni în timp. Medicii folosesc scala Hamilton–Norwood pentru a descrie stadiul {{cite:hamilton-1951}} {{cite:norwood-1975}}.",
              "**La femei:** linia frunții rămâne de obicei la locul ei, iar părul se subțiază difuz pe creștet; cărarea pare tot mai lată. Pentru descriere se folosește scala Ludwig {{cite:ludwig-1977}}.",
            ],
          },
          {
            type: "callout",
            tone: "caution",
            title: "Semne care cer un consult în persoană",
            text: "Pete rotunde fără păr apărute brusc, roșeață, cruste, durere sau usturime pe scalp, ori căderea părului însoțită de alte simptome (oboseală marcată, scădere în greutate, menstruații neregulate) pot avea alte cauze decât alopecia androgenetică. În aceste situații, mergi la un medic dermatolog pentru un examen clinic.",
          },
        ],
      },
      {
        id: "cauze",
        heading: "De ce apare",
        blocks: [
          {
            type: "p",
            text: "Alopecia androgenetică ține de predispoziția genetică și de felul în care foliculii reacționează la hormonii androgeni. Nu este provocată de spălatul frecvent, de purtarea șepcii sau de produsele de styling. Alte tipuri de cădere a părului au însă cauze diferite: o boală cu febră, o naștere, o perioadă de stres intens, deficitul de fier sau problemele tiroidiene pot declanșa o cădere difuză, de obicei temporară. Le explicăm pe rând în ghidul despre [cauzele căderii părului](/ghiduri/cauzele-caderii-parului).",
          },
        ],
      },
      {
        id: "tratament",
        heading: "Opțiuni de tratament",
        blocks: [
          {
            type: "p",
            text: "Ghidul european bazat pe dovezi pentru alopecia androgenetică descrie tratamente topice și orale cu eficacitate demonstrată în studii clinice, alături de opțiuni procedurale {{cite:kanti-2018}}. Alegerea depinde de sex, vârstă, stadiu, istoricul medical și preferințele tale, iar unele dintre ele se eliberează doar pe bază de rețetă.",
          },
          {
            type: "p",
            text: "Pe site prezentăm substanțele active doar informativ, cu beneficiile, limitele și efectele adverse cunoscute: [tratamentul topic cu minoxidil](/tratamente/minoxidil) și [finasterida](/tratamente/finasterida). Ce ți se potrivește stabilește medicul, după evaluare.",
          },
          {
            type: "p",
            text: "Orice tratament funcționează doar cât timp este folosit. Dacă este oprit, efectul se pierde treptat, iar căderea își reia evoluția naturală.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Căderea părului se poate opri complet?",
        answer:
          "Alopecia androgenetică este o afecțiune de durată, nu una care se vindecă. Cu tratament urmat constant, progresia se poate încetini sau opri, iar la o parte dintre oameni densitatea crește. Rezultatul diferă de la persoană la persoană și nu poate fi garantat.",
      },
      {
        question: "La cât timp se văd primele rezultate?",
        answer:
          "Părul crește lent, așa că schimbările se evaluează în luni, nu în săptămâni. Ghidurile recomandă o evaluare a efectului după câteva luni de tratament constant {{cite:kanti-2018}}. Mai jos găsești la ce să te aștepți, lună de lună.",
      },
      {
        question: "Am nevoie de analize de sânge?",
        answer:
          "Nu întotdeauna. Dacă tiparul este tipic pentru alopecia androgenetică, diagnosticul se pune de obicei clinic. Medicul poate recomanda analize (de exemplu fier, feritină sau hormoni tiroidieni) când căderea este difuză, a apărut brusc sau există alte simptome.",
      },
      {
        question: "Evaluarea online înlocuiește consultul la cabinet?",
        answer:
          "Pentru tiparele tipice, o evaluare la distanță bine structurată, cu fotografii clare, poate fi suficientă. Dacă medicul vede semne care cer un examen clinic, îți va recomanda un consult în persoană.",
      },
      {
        question: "Femeile pot avea alopecie androgenetică?",
        answer:
          "Da. La femei, alopecia androgenetică apare de obicei ca o subțiere difuză pe creștet, cu linia frunții păstrată. Opțiunile de tratament diferă față de bărbați, mai ales la vârsta fertilă.",
      },
    ],
    sourceIds: ["kanti-2018", "statpearls-aga", "hamilton-1951", "norwood-1975", "ludwig-1977"],
    limitations:
      "Informațiile de pe această pagină au scop educativ și nu înlocuiesc un diagnostic pus de medic. Nu începe și nu opri un tratament fără recomandarea unui medic.",
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
    related: [
      {
        href: "/ghiduri/semnele-alopeciei-androgenetice",
        label: "Semnele alopeciei androgenetice",
        description: "Cum arată tiparul la bărbați și la femei.",
      },
      {
        href: "/ghiduri/cauzele-caderii-parului",
        label: "Cauzele căderii părului",
        description: "Genetică, hormoni și alte cauze, posibil temporare.",
      },
      {
        href: "/ghiduri/caderea-parului-intrebari-frecvente",
        label: "Întrebări frecvente",
        description: "Când e normal și când merită o evaluare.",
      },
      {
        href: "/tratamente/minoxidil",
        label: "Minoxidil: informații",
        description: "Cum acționează, efecte adverse, limite.",
      },
      {
        href: "/tratamente/finasterida",
        label: "Finasteridă: informații",
        description: "Cum acționează, efecte adverse, limite.",
      },
    ],
    status: "published",
  },
  timeline: {
    heading: "La ce să te aștepți, lună de lună",
    intro:
      "Părul crește încet, așa că orice tratament se judecă în luni. Etapele de mai jos descriu evoluția obișnuită; ritmul diferă de la o persoană la alta și niciun rezultat nu este garantat {{cite:kanti-2018}}.",
    sourceIds: ["kanti-2018", "statpearls-aga"],
    steps: [
      {
        period: "Ziua 1",
        title: "Evaluarea",
        text: "Răspunzi la întrebări și trimiți fotografii ale scalpului. Medicul dermatolog le analizează, îți poate cere detalii și decide dacă tratamentul la distanță e potrivit sau dacă ai nevoie de un consult în persoană.",
      },
      {
        period: "Lunile 1–2",
        title: "Începutul",
        text: "La începutul tratamentului topic poate apărea o cădere temporară mai accentuată, pe măsură ce firele aflate în repaus sunt înlocuite {{cite:statpearls-aga}}. Este un fenomen cunoscut; discută cu medicul dacă te îngrijorează.",
      },
      {
        period: "Lunile 3–4",
        title: "Stabilizarea",
        text: "Căderea tinde să se liniștească. Schimbările de densitate sunt încă greu de văzut cu ochiul liber; fotografiile făcute în aceleași condiții de lumină ajută la comparație.",
      },
      {
        period: "Luna 6",
        title: "Prima evaluare a rezultatului",
        text: "Este momentul potrivit pentru a judeca efectul. Medicul compară fotografiile și decide împreună cu tine dacă continuați, ajustați sau schimbați planul {{cite:kanti-2018}}.",
      },
      {
        period: "Luna 12 și după",
        title: "Menținerea",
        text: "Rezultatul se vede mai clar după un an. Tratamentul continuă pentru a menține efectul, cu reevaluări periodice.",
      },
    ],
  },
};
