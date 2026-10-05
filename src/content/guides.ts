import type { MedicalDoc } from "./types";

const conditionLink = {
  href: "/afectiuni/caderea-parului",
  label: "Căderea părului: privire de ansamblu",
  description: "Ce este alopecia androgenetică și cum se tratează.",
};

const disclaimer =
  "Acest ghid are scop educativ și nu înlocuiește un diagnostic pus de medic. Dacă ai simptome care te îngrijorează, adresează-te unui medic dermatolog.";

export const guides: MedicalDoc[] = [
  {
    kind: "guide",
    slug: "semnele-alopeciei-androgenetice",
    graphRole: "symptoms",
    conditionSlug: "caderea-parului",
    title: "Semnele alopeciei androgenetice",
    metaTitle: "Semnele alopeciei androgenetice la bărbați și femei",
    metaDescription:
      "Cum recunoști alopecia androgenetică: retragerea liniei frunții, rărirea pe creștet, cărarea mai lată. Ce semne indică alte cauze.",
    h1: "Semnele alopeciei androgenetice",
    summary:
      "Alopecia androgenetică se recunoaște după tipar, nu după cantitatea de păr care cade. La bărbați, părul se retrage la tâmple și se rărește pe creștet; la femei, se subțiază difuz pe creștet, iar cărarea pare tot mai lată. Firele din zonele afectate devin mai fine și mai scurte {{cite:statpearls-aga}}.",
    sections: [
      {
        id: "miniaturizare",
        heading: "Primul semn: firele devin mai fine",
        blocks: [
          {
            type: "p",
            text: "În alopecia androgenetică, foliculii afectați produc fire tot mai subțiri de la un ciclu la altul. Înainte ca zona să pară rară, părul își pierde volumul: coada e mai subțire, scalpul se vede prin păr în lumina de sus, iar firele de pe creștet sunt vizibil mai fine decât cele de la ceafă {{cite:statpearls-aga}}.",
          },
          {
            type: "p",
            text: "Zona de la ceafă și din jurul urechilor este de obicei protejată, pentru că foliculii de acolo sunt mai puțin sensibili la hormonii androgeni. Diferența de densitate dintre ceafă și creștet este unul dintre indiciile pe care le caută medicul.",
          },
        ],
      },
      {
        id: "barbati",
        heading: "Tiparul la bărbați",
        blocks: [
          {
            type: "p",
            text: "La bărbați, tiparul a fost descris încă din 1951 și rafinat ulterior în scala Hamilton–Norwood, folosită și astăzi pentru a nota stadiul {{cite:hamilton-1951}} {{cite:norwood-1975}}. Pe scurt:",
          },
          {
            type: "list",
            items: [
              "**Tâmplele** se retrag și linia frunții capătă forma literei M.",
              "**Creștetul** se rărește într-o zonă rotundă, uneori observată prima dată în fotografii sau în oglinda de la frizer.",
              "**În stadiile avansate,** cele două zone se unesc, iar părul rămâne mai ales pe laterale și la ceafă.",
            ],
          },
          {
            type: "p",
            text: "Ritmul diferă mult de la un om la altul. Unii bărbați observă primele semne înainte de 25 de ani, alții mult mai târziu.",
          },
        ],
      },
      {
        id: "femei",
        heading: "Tiparul la femei",
        blocks: [
          {
            type: "p",
            text: "La femei, linia frunții rămâne de obicei neschimbată. Părul se subțiază difuz pe creștet, iar cărarea de pe mijloc devine tot mai lată, ceea ce scala Ludwig descrie în trei grade {{cite:ludwig-1977}}. Uneori, subțierea devine mai vizibilă după menopauză.",
          },
          {
            type: "p",
            text: "Pentru că și alte cauze (deficitul de fier, problemele tiroidiene sau căderea apărută după o naștere) produc o rărire difuză, la femei medicul pune mai des întrebări suplimentare și poate recomanda analize.",
          },
        ],
      },
      {
        id: "alte-cauze",
        heading: "Semne care sugerează altă cauză",
        blocks: [
          {
            type: "p",
            text: "Unele semne nu se potrivesc cu alopecia androgenetică și trebuie văzute de un medic în persoană:",
          },
          {
            type: "list",
            items: [
              "pete rotunde, bine delimitate, fără păr, apărute în câteva săptămâni;",
              "cădere bruscă, în smocuri, pe tot scalpul;",
              "roșeață, cruste, descuamare, durere sau usturime pe scalp;",
              "fire rupte la mică distanță de scalp;",
              "căderea părului însoțită de alte simptome: oboseală marcată, scădere în greutate, menstruații neregulate, acnee sau păr în exces pe față și corp.",
            ],
          },
          {
            type: "p",
            text: "Despre cauzele posibile ale acestor situații scriem în ghidul despre [cauzele căderii părului](/ghiduri/cauzele-caderii-parului).",
          },
        ],
      },
      {
        id: "urmarire",
        heading: "Cum îți urmărești singur evoluția",
        blocks: [
          {
            type: "p",
            text: "Fotografiile făcute regulat sunt cel mai bun instrument, pentru că schimbările sunt lente și greu de observat zi de zi.",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Fă fotografii o dată pe lună, în același loc și cu aceeași lumină.",
              "Fotografiază fruntea (din față), creștetul (de sus) și cărarea, cu părul uscat și pieptănat la fel.",
              "Notează orice schimbare importantă: o boală, o naștere, o perioadă de stres, o dietă strictă, un medicament nou.",
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Dacă găsesc mult păr pe pernă, înseamnă că am alopecie androgenetică?",
        answer:
          "Nu neapărat. Pierderea zilnică a unor fire face parte din ciclul normal al părului. Alopecia androgenetică se recunoaște mai ales după tipar și după subțierea firelor, nu după numărul de fire căzute.",
      },
      {
        question: "Pot avea alopecie androgenetică dacă nimeni din familie nu are?",
        answer:
          "Da. Predispoziția se moștenește de la ambii părinți, iar tiparul poate fi diferit de la o generație la alta. Lipsa cazurilor în familie nu exclude diagnosticul.",
      },
    ],
    sourceIds: ["statpearls-aga", "hamilton-1951", "norwood-1975", "ludwig-1977"],
    limitations: disclaimer,
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
    related: [
      conditionLink,
      {
        href: "/ghiduri/cauzele-caderii-parului",
        label: "Cauzele căderii părului",
        description: "De ce apare și ce alte cauze există.",
      },
      {
        href: "/ghiduri/caderea-parului-intrebari-frecvente",
        label: "Întrebări frecvente",
        description: "Când merită o evaluare.",
      },
      {
        href: "/tratamente/minoxidil",
        label: "Minoxidil: informații",
      },
    ],
    status: "published",
  },
  {
    kind: "guide",
    slug: "cauzele-caderii-parului",
    graphRole: "causes",
    conditionSlug: "caderea-parului",
    title: "Cauzele căderii părului",
    metaTitle: "Cauzele căderii părului: genetică, hormoni și alte cauze",
    metaDescription:
      "De ce cade părul: alopecia androgenetică, căderea după boală, naștere sau stres, deficitul de fier, problemele tiroidiene și afecțiunile scalpului.",
    h1: "Cauzele căderii părului",
    summary:
      "Cea mai frecventă cauză este alopecia androgenetică, determinată de predispoziția genetică și de sensibilitatea foliculilor la hormonii androgeni {{cite:statpearls-aga}}. Căderea poate avea însă și alte cauze, multe temporare: o boală cu febră, o naștere, stresul intens, deficitul de fier sau o problemă a tiroidei. Diferența contează, pentru că tratamentul diferă.",
    sections: [
      {
        id: "androgenetica",
        heading: "Alopecia androgenetică: genetică și hormoni",
        blocks: [
          {
            type: "p",
            text: "Foliculii din zona frunții și a creștetului pot fi, prin moștenire genetică, sensibili la dihidrotestosteron (DHT). Sub acțiunea lui, faza de creștere a firului se scurtează de la un ciclu la altul, iar foliculul se micșorează. Procesul este lent și progresiv, ceea ce explică de ce căderea se observă de-a lungul anilor {{cite:statpearls-aga}}.",
          },
          {
            type: "p",
            text: "Nivelul hormonilor din sânge este de cele mai multe ori normal. Ce diferă este sensibilitatea foliculilor, iar aceasta ține în mare parte de genetică. De aceea, tratamentele urmăresc fie să reducă efectul DHT asupra foliculului, fie să prelungească faza de creștere {{cite:kanti-2018}}.",
          },
        ],
      },
      {
        id: "temporare",
        heading: "Căderea temporară după un factor declanșator",
        blocks: [
          {
            type: "p",
            text: "Un șoc pentru organism poate trimite simultan multe fire în faza de repaus. Ele cad împreună, de obicei la câteva luni după eveniment, așa că legătura nu e întotdeauna evidentă. Medicii numesc această situație efluviu telogen. Cauze frecvente:",
          },
          {
            type: "list",
            items: [
              "o boală cu febră mare sau o intervenție chirurgicală;",
              "nașterea și lunile de după;",
              "o perioadă de stres intens;",
              "o dietă foarte restrictivă sau o scădere rapidă în greutate;",
              "începerea sau oprirea unor medicamente.",
            ],
          },
          {
            type: "p",
            text: "Căderea este difuză, pe tot scalpul, iar după îndepărtarea cauzei părul crește de obicei la loc în lunile următoare. Uneori, un efluviu telogen scoate la iveală o alopecie androgenetică existentă, iar cele două se suprapun.",
          },
        ],
      },
      {
        id: "medicale",
        heading: "Cauze medicale care trebuie verificate",
        blocks: [
          {
            type: "list",
            items: [
              "**Deficitul de fier** și feritina scăzută, mai frecvente la femeile cu menstruații abundente.",
              "**Afecțiunile tiroidiene**, atât funcția scăzută, cât și cea crescută.",
              "**Dezechilibrele hormonale**, de exemplu sindromul ovarelor polichistice, care pot asocia acnee, păr în exces și menstruații neregulate.",
              "**Alopecia areata**, o afecțiune autoimună care produce pete rotunde fără păr.",
              "**Afecțiunile scalpului**, cum ar fi infecțiile fungice sau formele de alopecie cu cicatrice, care pot da roșeață, cruste sau durere.",
            ],
          },
          {
            type: "callout",
            tone: "caution",
            title: "Când să mergi la medic în persoană",
            text: "Dacă ai pete fără păr apărute brusc, roșeață, cruste sau durere pe scalp, ori alte simptome generale, programează un consult la un medic dermatolog. Aceste situații au nevoie de examen clinic și, uneori, de analize.",
          },
        ],
      },
      {
        id: "mituri",
        heading: "Ce nu provoacă alopecia androgenetică",
        blocks: [
          {
            type: "p",
            text: "Spălatul frecvent, purtarea șepcii, uscătorul de păr sau gelul nu provoacă alopecie androgenetică. Coafurile care trag constant de păr (cozi strânse, împletituri) pot însă produce o altă formă de cădere, prin tracțiune, mai ales la tâmple.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Stresul poate provoca alopecie androgenetică?",
        answer:
          "Stresul intens poate declanșa o cădere temporară (efluviu telogen), dar nu provoacă alopecia androgenetică. Poate face însă vizibilă mai devreme o subțiere care exista deja.",
      },
      {
        question: "Vitaminele pot opri căderea părului?",
        answer:
          "Suplimentele ajută când există un deficit real, de exemplu de fier. Fără deficit, nu există dovezi solide că ar opri alopecia androgenetică {{cite:kanti-2018}}.",
      },
    ],
    sourceIds: ["statpearls-aga", "kanti-2018"],
    limitations: disclaimer,
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
    related: [
      conditionLink,
      {
        href: "/ghiduri/semnele-alopeciei-androgenetice",
        label: "Semnele alopeciei androgenetice",
        description: "Cum arată tiparul la bărbați și la femei.",
      },
      {
        href: "/ghiduri/caderea-parului-intrebari-frecvente",
        label: "Întrebări frecvente",
      },
      {
        href: "/tratamente/finasterida",
        label: "Finasteridă: informații",
      },
    ],
    status: "published",
  },
  {
    kind: "guide",
    slug: "caderea-parului-intrebari-frecvente",
    graphRole: "questions",
    conditionSlug: "caderea-parului",
    title: "Căderea părului: întrebări frecvente",
    metaTitle: "Căderea părului: întrebări frecvente și când să ceri o evaluare",
    metaDescription:
      "Răspunsuri clare la întrebările frecvente despre căderea părului: când e normal, când e alopecie androgenetică, cât durează tratamentul, ce se întâmplă dacă îl oprești.",
    h1: "Căderea părului: întrebări frecvente",
    summary:
      "Pierderea zilnică a unor fire de păr este normală. Merită o evaluare dacă observi că părul se subțiază la tâmple, pe creștet sau pe cărare, dacă căderea durează de mai multe luni sau dacă apare brusc, în pete ori cu simptome pe scalp {{cite:statpearls-aga}}.",
    sections: [
      {
        id: "normal",
        heading: "Când este normal să cadă părul",
        blocks: [
          {
            type: "p",
            text: "Fiecare fir are o durată de viață limitată. După ani de creștere, intră în repaus și cade, iar în locul lui începe să crească altul. De aceea, câteva fire pe perie sau în cadă sunt normale. Unele perioade, de exemplu sfârșitul verii sau lunile de după o boală, aduc temporar o cădere mai vizibilă.",
          },
          {
            type: "p",
            text: "Ce nu este normal este subțierea care se adâncește în timp, într-un anumit tipar. Acesta este semnul [alopeciei androgenetice](/afectiuni/caderea-parului).",
          },
        ],
      },
      {
        id: "cand-evaluare",
        heading: "Când merită o evaluare",
        blocks: [
          {
            type: "list",
            items: [
              "linia frunții s-a retras sau creștetul s-a rărit vizibil în ultimul an;",
              "cărarea a devenit mai lată ori coada mai subțire;",
              "căderea crescută durează de mai mult de câteva luni;",
              "ai o rudă apropiată cu cădere a părului și observi primele semne.",
            ],
          },
          {
            type: "p",
            text: "Cu cât începi mai devreme, cu atât rămân mai mulți foliculi activi, iar tratamentele urmăresc tocmai păstrarea lor {{cite:kanti-2018}}.",
          },
        ],
      },
      {
        id: "tratament-durata",
        heading: "Cât durează tratamentul",
        blocks: [
          {
            type: "p",
            text: "Alopecia androgenetică este o afecțiune de durată, iar tratamentele acționează cât timp sunt folosite. Primul bilanț se face de obicei după aproximativ șase luni de utilizare constantă, iar dacă tratamentul funcționează, el continuă pentru menținere {{cite:kanti-2018}}. Pe pagina despre [căderea părului](/afectiuni/caderea-parului#asteptari) găsești la ce să te aștepți lună de lună.",
          },
          {
            type: "p",
            text: "Dacă tratamentul este oprit, firele câștigate se pierd treptat în lunile următoare, iar căderea își reia cursul natural.",
          },
        ],
      },
      {
        id: "siguranta",
        heading: "Tratamentele sunt sigure?",
        blocks: [
          {
            type: "p",
            text: "Tratamentele recomandate în ghiduri au fost studiate pe termen lung, dar, ca orice medicament, pot avea efecte adverse. Le prezentăm onest pe paginile despre [minoxidil](/tratamente/minoxidil) și [finasteridă](/tratamente/finasterida). Medicul ține cont de istoricul tău medical, de celelalte medicamente pe care le iei și, la femei, de planurile de sarcină.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Tunsul scurt sau rasul îngroașă părul?",
        answer:
          "Nu. Tunsul nu schimbă grosimea sau numărul firelor care cresc din folicul. Părul scurt poate doar să facă rărirea mai puțin vizibilă.",
      },
      {
        question: "Transplantul de păr înlocuiește tratamentul?",
        answer:
          "Nu complet. Transplantul mută foliculi din zonele protejate în cele rărite, dar nu oprește căderea în restul zonelor. De aceea, mulți medici recomandă tratament și înainte, și după transplant.",
      },
      {
        question: "Pot folosi un tratament găsit online fără consult?",
        answer:
          "Nu este recomandat. Unele tratamente se eliberează doar pe bază de rețetă, au contraindicații și efecte adverse, iar căderea poate avea alte cauze care cer altă abordare. Un medic poate stabili ce ți se potrivește.",
      },
    ],
    sourceIds: ["statpearls-aga", "kanti-2018"],
    limitations: disclaimer,
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
    related: [
      conditionLink,
      {
        href: "/ghiduri/semnele-alopeciei-androgenetice",
        label: "Semnele alopeciei androgenetice",
      },
      {
        href: "/ghiduri/cauzele-caderii-parului",
        label: "Cauzele căderii părului",
      },
      {
        href: "/tratamente/minoxidil",
        label: "Minoxidil: informații",
      },
      {
        href: "/tratamente/finasterida",
        label: "Finasteridă: informații",
      },
    ],
    status: "published",
  },
];

export function getGuide(slug: string): MedicalDoc | undefined {
  return guides.find((g) => g.slug === slug && g.status === "published");
}
