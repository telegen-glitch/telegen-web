import type { Condition, MedicalDoc, RelatedLink } from "../types";

/**
 * Erectile dysfunction (CLAUDE.md 7c). Written on 2026-10-07 from the source pack in
 * docs/sources/erectile-dysfunction.md (EAU Guidelines on Sexual and Reproductive Health;
 * EMA product information for sildenafil and tadalafil). Discreet tone, no performance or
 * size language, no medicine names in headings, hero or calls to action (section 9.4).
 */
const base = "/disfunctie-erectila";

const disclaimer =
  "Informațiile de pe această pagină au scop educativ și nu înlocuiesc un consult medical. Nu începe, nu opri și nu combina medicamente fără recomandarea unui medic. Dacă ai durere în piept, sună la 112.";

const hub: RelatedLink = {
  href: base,
  label: "Disfuncția erectilă: privire de ansamblu",
  description: "Ce este, de ce apare și ce opțiuni există.",
};
const link = {
  cauze: {
    href: `${base}/cauze`,
    label: "Cauzele disfuncției erectile",
    description: "Vasculare, hormonale, psihologice și medicamentele.",
  },
  tratament: {
    href: `${base}/tratament`,
    label: "Tratamentul disfuncției erectile",
    description: "Stil de viață, tratament oral, consiliere.",
  },
  inima: {
    href: `${base}/sanatatea-inimii`,
    label: "Disfuncția erectilă și sănătatea inimii",
    description: "De ce merită verificată și inima.",
  },
  sildenafil: { href: "/tratamente/sildenafil", label: "Sildenafil: informații" },
  tadalafil: { href: "/tratamente/tadalafil", label: "Tadalafil: informații" },
} satisfies Record<string, RelatedLink>;

const dates = { publishedAt: "2026-10-07", updatedAt: "2026-10-07" } as const;

/** Urgent and in-person advice. Erection > 4 h and vision loss: Viagra SmPC; chest pain: owner brief. */
const urgentCallout = {
  type: "callout" as const,
  tone: "caution" as const,
  title: "Când ai nevoie de ajutor medical urgent",
  text: "Sună la 112 dacă ai durere sau apăsare în piept. Cere imediat ajutor medical dacă o erecție durează mai mult de 4 ore sau dacă îți pierzi brusc vederea în timp ce iei un tratament pentru erecție {{cite:ema-viagra}}. Problemele de erecție apărute după o lovitură sau o operație, o curbură nou apărută ori durerea penisului se evaluează la un medic urolog, în persoană {{cite:eau-srh}}.",
};

const nitrateCallout = {
  type: "callout" as const,
  tone: "caution" as const,
  title: "Nitrații și riociguatul: niciodată împreună cu tratamentul oral",
  text: "Tratamentul oral pentru disfuncția erectilă nu se ia niciodată împreună cu nitrații (folosiți pentru angină, inclusiv nitriții inhalați numiți „poppers”) sau cu riociguatul (folosit pentru hipertensiunea pulmonară) {{cite:ema-viagra}} {{cite:eau-srh}}. Dacă folosești oricare dintre ele, discută cu medicul care ți le-a prescris.",
};

const subpage = (
  doc: Omit<MedicalDoc, "kind" | "path" | "conditionSlug" | "status" | "publishedAt" | "updatedAt">,
): MedicalDoc => ({
  kind: "subpage",
  path: `${base}/${doc.slug}`,
  conditionSlug: "disfunctie-erectila",
  status: "published",
  ...dates,
  ...doc,
});

const cauze = subpage({
  slug: "cauze",
  graphRole: "causes",
  title: "Cauzele disfuncției erectile",
  metaTitle: "Cauzele disfuncției erectile",
  metaDescription:
    "De ce apare disfuncția erectilă: cauze vasculare, metabolice, hormonale, neurologice, psihologice, efectul unor medicamente și al stilului de viață.",
  h1: "Cauzele disfuncției erectile",
  summary:
    "Disfuncția erectilă poate avea cauze vasculare, neurologice, anatomice, hormonale, legate de medicamente sau psihologice, iar de multe ori mai multe se combină {{cite:eau-srh}}. Printre factorii de risc se numără vârsta, diabetul, tensiunea mare, colesterolul mare, fumatul, obezitatea și lipsa mișcării {{cite:eau-srh}}. Mulți dintre ei pot fi tratați sau schimbați.",
  sections: [
    {
      id: "categorii",
      heading: "De ce apare disfuncția erectilă",
      blocks: [
        {
          type: "p",
          text: "Erecția depinde de vasele de sânge, de nervi, de hormoni și de starea psihică. Ghidul european al urologilor grupează cauzele disfuncției erectile în vasculare, neurologice, anatomice, hormonale, legate de medicamente și psihologice; la același om pot exista mai multe deodată {{cite:eau-srh}}.",
        },
        {
          type: "p",
          text: "De aceea, medicul nu caută o singură explicație, ci pune întrebări despre sănătatea generală, medicamente, obiceiuri și context. Despre felul în care se face evaluarea scriem în [pagina despre disfuncția erectilă](/disfunctie-erectila).",
        },
      ],
    },
    {
      id: "vasculare",
      heading: "Cauzele vasculare și metabolice",
      blocks: [
        {
          type: "p",
          text: "Multe dintre cauze țin de vasele de sânge și de metabolism. Ghidul european enumeră printre factorii de risc {{cite:eau-srh}}:",
        },
        {
          type: "list",
          items: [
            "diabetul;",
            "colesterolul și grăsimile din sânge crescute (dislipidemia);",
            "hipertensiunea arterială;",
            "bolile cardiovasculare;",
            "obezitatea și sindromul metabolic;",
            "fumatul și lipsa mișcării.",
          ],
        },
        {
          type: "p",
          text: "Legătura cu vasele de sânge explică de ce disfuncția erectilă poate fi un semn timpuriu al unei boli de inimă {{cite:eau-srh}}. Scriem despre asta în [disfuncția erectilă și sănătatea inimii](/disfunctie-erectila/sanatatea-inimii).",
        },
      ],
    },
    {
      id: "hormonale",
      heading: "Cauzele hormonale",
      blocks: [
        {
          type: "p",
          text: "Cauzele hormonale sunt una dintre categoriile descrise de ghid. De aceea, în evaluarea inițială, medicul poate cere dimineața, pe nemâncate, testosteronul total. La unii pacienți se adaugă alte analize hormonale, cum sunt prolactina sau LH {{cite:eau-srh}}.",
        },
      ],
    },
    {
      id: "neurologice",
      heading: "Cauzele neurologice și anatomice",
      blocks: [
        {
          type: "p",
          text: "Erecția are nevoie și de nervi sănătoși și de o structură normală a penisului. Ghidul recomandă evaluare de specialitate în câteva situații: disfuncția erectilă prezentă de la început, bărbații tineri cu un traumatism al zonei pelvine sau perineale și deformările penisului, cum sunt boala Peyronie sau curbura congenitală {{cite:eau-srh}}.",
        },
        {
          type: "callout",
          tone: "caution",
          title: "Când ai nevoie de consult în persoană",
          text: "Problemele de erecție apărute brusc după o lovitură, o operație sau un accident, o curbură nou apărută, o îngroșare sau durerea în timpul erecției se evaluează la un medic urolog, în persoană {{cite:eau-srh}}.",
        },
      ],
    },
    {
      id: "medicamente",
      heading: "Ce medicamente pot afecta erecția",
      blocks: [
        {
          type: "p",
          text: "Unele medicamente pot contribui la disfuncția erectilă. Ghidul european menționează {{cite:eau-srh}}:",
        },
        {
          type: "list",
          items: [
            "unele medicamente pentru tensiune, cum sunt diureticele tiazidice și betablocantele;",
            "unele antidepresive (din grupele ISRS și triciclice) și antipsihoticele;",
            "medicamentele antiandrogene: analogii și antagoniștii GnRH și inhibitorii de 5-alfa-reductază.",
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "Nu opri singur un medicament",
          text: "Dacă bănuiești că un medicament îți afectează erecția, nu îl opri și nu schimba doza fără să vorbești cu medicul care ți l-a prescris. El poate evalua dacă medicamentul are legătură cu problema și ce se poate face.",
        },
      ],
    },
    {
      id: "substante",
      heading: "Alcoolul, fumatul și drogurile",
      blocks: [
        {
          type: "p",
          text: "Fumatul este un factor de risc recunoscut {{cite:eau-srh}}. Printre substanțele care pot provoca disfuncție erectilă, ghidul enumeră consumul excesiv de alcool, heroina, cocaina, marijuana, metadona, drogurile sintetice și steroizii anabolizanți {{cite:eau-srh}}.",
        },
      ],
    },
    {
      id: "psihologice",
      heading: "Cauzele psihologice",
      blocks: [
        {
          type: "p",
          text: "Cauzele psihologice sunt una dintre categoriile principale, iar depresia și tulburările de anxietate sunt factori de risc {{cite:eau-srh}}. Ele se pot suprapune cu o cauză fizică. Ghidul recomandă puternic consilierea psihosexuală, singură sau împreună cu tratamentul medical {{cite:eau-srh}}; detaliile sunt în [tratamentul disfuncției erectile](/disfunctie-erectila/tratament).",
        },
      ],
    },
    {
      id: "alte-afectiuni",
      heading: "Alte afecțiuni asociate",
      blocks: [
        {
          type: "p",
          text: "Ghidul mai enumeră printre factorii de risc boala cronică de rinichi, bronhopneumopatia obstructivă cronică (BPOC), tulburările de somn și infecția cu COVID-19 {{cite:eau-srh}}. Spune-i medicului despre toate afecțiunile tale, chiar dacă nu par legate de erecție.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Disfuncția erectilă poate fi doar psihologică?",
      answer:
        "Cauzele psihologice sunt una dintre categoriile principale, dar de multe ori se combină cu cauze fizice {{cite:eau-srh}}. Medicul pune întrebări despre ambele, inclusiv despre erecțiile de dimineață {{cite:eau-srh}}.",
    },
    {
      question: "Pot opri medicamentul pentru tensiune dacă bănuiesc că el e cauza?",
      answer:
        "Nu fără medic. Unele medicamente pentru tensiune pot contribui la disfuncția erectilă {{cite:eau-srh}}, dar tensiunea netratată este și ea un factor de risc {{cite:eau-srh}}. Discută cu medicul care ți l-a prescris.",
    },
    {
      question: "Contează vârsta?",
      answer:
        "Da. Într-un studiu din Köln, la bărbați între 30 și 80 de ani, frecvența disfuncției erectile a crescut abrupt cu vârsta, de la 2,3% la 53,4% {{cite:eau-srh}}. Disfuncția erectilă apare însă și la bărbați tineri.",
    },
    {
      question: "Fumatul și alcoolul influențează erecția?",
      answer:
        "Da. Fumatul este un factor de risc, iar consumul excesiv de alcool se numără printre substanțele care pot provoca disfuncție erectilă {{cite:eau-srh}}.",
    },
  ],
  sourceIds: ["eau-srh"],
  limitations: disclaimer,
  related: [hub, link.inima, link.tratament, link.sildenafil, link.tadalafil],
});

const tratament = subpage({
  slug: "tratament",
  graphRole: "treatment",
  title: "Tratamentul disfuncției erectile",
  metaTitle: "Tratamentul disfuncției erectile",
  metaDescription:
    "Opțiunile de tratament pentru disfuncția erectilă: stil de viață, tratament oral cu inhibitori PDE5, consiliere psihosexuală și opțiuni de specialitate.",
  h1: "Tratamentul disfuncției erectile",
  summary:
    "Tratamentul începe cu schimbarea stilului de viață și cu tratarea factorilor de risc, înaintea sau odată cu alte tratamente {{cite:eau-srh}}. Prima linie medicamentoasă este o clasă de medicamente orale, inhibitorii PDE5. Consilierea psihosexuală ajută singură sau împreună cu tratamentul, iar opțiunile de specialitate rămân pentru cazurile în care acestea nu sunt potrivite {{cite:eau-srh}}.",
  sections: [
    {
      id: "stil-de-viata",
      heading: "Ce poți schimba în stilul de viață",
      blocks: [
        {
          type: "p",
          text: "Ghidul european recomandă puternic ca schimbările stilului de viață și tratarea factorilor de risc să înceapă înaintea sau odată cu orice tratament pentru disfuncția erectilă {{cite:eau-srh}}. Activitatea fizică, mai ales efortul aerob, scăderea în greutate și tratarea factorilor de risc cardiovascular pot îmbunătăți funcția sexuală {{cite:eau-srh}}.",
        },
        {
          type: "p",
          text: "Aceleași schimbări protejează și inima. De ce contează legătura dintre cele două afli în [disfuncția erectilă și sănătatea inimii](/disfunctie-erectila/sanatatea-inimii).",
        },
      ],
    },
    {
      id: "oral",
      heading: "Cum funcționează tratamentul oral",
      blocks: [
        {
          type: "p",
          text: "Ghidul european recomandă puternic inhibitorii de fosfodiesterază de tip 5 (inhibitorii PDE5) ca primă linie de tratament {{cite:eau-srh}}. Ei blochează o enzimă care descompune o substanță numită GMPc și ajută astfel sângele să ajungă în penis. Funcționează doar în prezența excitației sexuale {{cite:ema-viagra}}.",
        },
        {
          type: "p",
          text: "Medicamentele din această clasă diferă prin cât de repede încep să acționeze și cât durează efectul {{cite:eau-srh}}:",
        },
        {
          type: "list",
          items: [
            "**sildenafil:** începe să acționeze în 30–60 de minute; efectul durează până la 12 ore;",
            "**tadalafil:** începe să acționeze în aproximativ 30 de minute, cu efect maxim după circa 2 ore; efectul durează până la 36 de ore;",
            "**vardenafil:** începe să acționeze în aproximativ 30 de minute;",
            "**avanafil:** începe să acționeze în 15–30 de minute.",
          ],
        },
        {
          type: "p",
          text: "Efectele adverse frecvente sunt durerea de cap, înroșirea feței, indigestia și nasul înfundat; cu tadalafil apar și dureri de spate și musculare {{cite:eau-srh}}. Informații neutre despre fiecare găsești pe paginile despre [sildenafil](/tratamente/sildenafil) și [tadalafil](/tratamente/tadalafil). Doza și alegerea le stabilește medicul.",
        },
      ],
    },
    {
      id: "contraindicatii",
      heading: "Cine nu poate lua tratament oral",
      blocks: [
        {
          type: "p",
          text: "Înainte de orice tratament pentru disfuncția erectilă, medicul trebuie să țină cont de starea inimii {{cite:ema-viagra}}. Bărbații cu boli de inimă severe sau instabile, pentru care activitatea sexuală ar fi un risc important, au nevoie mai întâi de o evaluare cardiologică {{cite:eau-srh}}. Tratamentul oral nu se folosește, de exemplu, după un infarct recent sau un accident vascular cerebral recent, în angina instabilă, în insuficiența cardiacă severă sau când tensiunea este foarte mică {{cite:ema-viagra}} {{cite:ema-cialis}}.",
        },
        nitrateCallout,
      ],
    },
    {
      id: "psihosexual",
      heading: "Ce rol are consilierea psihosexuală",
      blocks: [
        {
          type: "p",
          text: "Ghidul recomandă puternic terapia psihosexuală: terapie cognitiv-comportamentală, exerciții de abilități sexuale, terapie de cuplu și educație psihosexuală. Combinarea terapiei cognitiv-comportamentale cu tratamentul medical este descrisă ca abordarea cea mai bună {{cite:eau-srh}}.",
        },
        {
          type: "p",
          text: "Recomandarea consilierii nu înseamnă că problema este „doar în minte”: ghidul o descrie ca parte a celei mai bune abordări, alături de tratamentul medical, nu în locul lui {{cite:eau-srh}}.",
        },
      ],
    },
    {
      id: "specialitate",
      heading: "Ce opțiuni există dacă tratamentul oral nu este potrivit",
      blocks: [
        {
          type: "p",
          text: "Când tratamentul oral nu este potrivit sau nu ajută, un medic urolog poate discuta alte opțiuni {{cite:eau-srh}}:",
        },
        {
          type: "list",
          items: [
            "dispozitivele de vid;",
            "injecțiile în corpii cavernoși, de exemplu cu alprostadil;",
            "terapia cu unde de șoc de intensitate joasă, cu beneficiu modest în formele ușoare de cauză vasculară;",
            "proteza peniană, dacă celelalte tratamente nu au funcționat sau dacă pacientul o preferă.",
          ],
        },
        {
          type: "p",
          text: "Acestea sunt opțiuni de specialitate, alese și urmărite de urolog. Telegen nu le oferă.",
        },
        urgentCallout,
      ],
    },
  ],
  faqs: [
    {
      question: "Tratamentul oral funcționează fără excitație sexuală?",
      answer:
        "Nu. Inhibitorii PDE5 ajută sângele să ajungă în penis doar în prezența excitației sexuale {{cite:ema-viagra}}.",
    },
    {
      question: "Cât durează efectul tratamentului oral?",
      answer:
        "Depinde de medicament: până la 12 ore pentru sildenafil și până la 36 de ore pentru tadalafil {{cite:eau-srh}}. Alegerea o face medicul, după evaluare.",
    },
    {
      question: "Tratamentul oral crește riscul de infarct?",
      answer:
        "Niciun studiu randomizat sau deschis nu a arătat o creștere a frecvenței infarctului la pacienții care iau inhibitori PDE5 {{cite:eau-srh}}. Medicul trebuie totuși să țină cont de starea inimii înainte de tratament {{cite:ema-viagra}}.",
    },
    {
      question: "Pot lua tratament oral dacă folosesc „poppers”?",
      answer:
        "Nu. Nitriții inhalați („poppers”) fac parte din nitrați, iar tratamentul oral pentru disfuncția erectilă nu se combină niciodată cu nitrații {{cite:eau-srh}} {{cite:ema-viagra}}.",
    },
    {
      question: "Există tratamente naturale pentru disfuncția erectilă?",
      answer:
        "Schimbările de stil de viață (mișcarea, scăderea în greutate, tratarea factorilor de risc) sunt recomandate de ghid și pot îmbunătăți funcția sexuală {{cite:eau-srh}}. Înainte să iei orice supliment, întreabă medicul, mai ales dacă iei și alte medicamente.",
    },
  ],
  sourceIds: ["eau-srh", "ema-viagra", "ema-cialis"],
  limitations: disclaimer,
  related: [hub, link.cauze, link.inima, link.sildenafil, link.tadalafil],
});

const inima = subpage({
  slug: "sanatatea-inimii",
  graphRole: "heart",
  title: "Disfuncția erectilă și sănătatea inimii",
  metaTitle: "Disfuncția erectilă și sănătatea inimii",
  metaDescription:
    "De ce problemele de erecție pot semnala o boală a inimii sau a vaselor de sânge, ce controale poate recomanda medicul și de ce contează nitrații.",
  h1: "Disfuncția erectilă și sănătatea inimii",
  summary:
    "Disfuncția erectilă crește semnificativ riscul de boli cardiovasculare, boală coronariană, accident vascular cerebral și fibrilație atrială {{cite:eau-srh}}. Ghidul european o consideră un precursor al bolilor cardiovasculare: riscul este mai mare când disfuncția este mai severă, durează de mai mult timp sau apare la bărbați sub 50 de ani {{cite:eau-srh}}. Merită verificată și inima.",
  sections: [
    {
      id: "legatura",
      heading: "De ce poate semnala disfuncția erectilă o boală de inimă",
      blocks: [
        {
          type: "p",
          text: "Erecția depinde de vase de sânge sănătoase. Ghidul european arată că disfuncția erectilă crește semnificativ riscul de boli cardiovasculare, de boală coronariană, de accident vascular cerebral și de fibrilație atrială, precum și mortalitatea cardiovasculară și cea generală {{cite:eau-srh}}.",
        },
        {
          type: "p",
          text: "De aceea, ghidul spune că disfuncția erectilă trebuie privită ca un precursor al bolilor cardiovasculare: cu cât este mai severă și durează de mai mult timp, cu atât riscul este mai mare {{cite:eau-srh}}. Ghidul nu stabilește un interval anume între apariția disfuncției erectile și o problemă de inimă. Important este că riscul există și că verificarea se face acum.",
        },
      ],
    },
    {
      id: "tineri",
      heading: "Bărbații tineri au și ei un risc mai mare?",
      blocks: [
        {
          type: "p",
          text: "Da. Bărbații tineri cu disfuncție erectilă, mai ales cei sub 50 de ani, au un risc cardiovascular mai mare {{cite:eau-srh}}. La o vârstă tânără, disfuncția erectilă merită deci discutată și din perspectiva inimii, nu doar a stresului.",
        },
      ],
    },
    {
      id: "controale",
      heading: "Ce controale poate recomanda medicul",
      blocks: [
        {
          type: "p",
          text: "Ghidul european recomandă puternic, la fiecare pacient, un istoric medical și sexual complet, un examen fizic țintit și câteva analize {{cite:eau-srh}}:",
        },
        {
          type: "list",
          items: [
            "tensiunea arterială, pulsul, greutatea și circumferința taliei;",
            "glicemia à jeun sau hemoglobina glicată (HbA1c), dacă nu au fost făcute în ultimele 12 luni;",
            "profilul lipidic (colesterolul și trigliceridele);",
            "testosteronul total, recoltat dimineața, pe nemâncate.",
          ],
        },
        {
          type: "p",
          text: "Riscul cardiovascular se poate estima cu un scor care ține cont de vârstă, sex, etnie, colesterol, tensiune și fumat. Când riscul este la limită sau intermediar, medicul poate lua în calcul și un scor de calciu coronarian {{cite:eau-srh}}.",
        },
      ],
    },
    {
      id: "siguranta",
      heading: "Este tratamentul oral sigur pentru inimă?",
      blocks: [
        {
          type: "p",
          text: "Niciun studiu randomizat sau deschis nu a arătat o creștere a frecvenței infarctului la pacienții care iau inhibitori PDE5 {{cite:eau-srh}}. Cu toate acestea, bărbații cu boli de inimă severe sau instabile au nevoie de o evaluare cardiologică înainte de orice tratament {{cite:eau-srh}}.",
        },
        {
          type: "p",
          text: "Informațiile de produs exclud tratamentul oral, de exemplu, după un infarct din ultimele 3 luni sau un accident vascular cerebral din ultimele 6 luni ori în bolile cardiovasculare necontrolate {{cite:ema-cialis}}, precum și în angina instabilă, în insuficiența cardiacă severă și când tensiunea este foarte mică {{cite:ema-viagra}}.",
        },
        nitrateCallout,
      ],
    },
    {
      id: "ce-poti-face",
      heading: "Ce poți face pentru inimă și pentru erecție",
      blocks: [
        {
          type: "p",
          text: "Mișcarea, mai ales efortul aerob, scăderea în greutate și tratarea factorilor de risc cardiovascular pot îmbunătăți funcția sexuală {{cite:eau-srh}}. Același lucru îl fac pentru inimă. Dacă fumezi, ai tensiune mare, diabet sau colesterol mare, discută cu medicul de familie un plan pentru fiecare.",
        },
        urgentCallout,
      ],
    },
  ],
  faqs: [
    {
      question: "Dacă am disfuncție erectilă, înseamnă că am o boală de inimă?",
      answer:
        "Nu neapărat. Înseamnă că riscul cardiovascular este mai mare și că merită verificat {{cite:eau-srh}}. Medicul îți poate recomanda analize și o evaluare a riscului.",
    },
    {
      question: "Cât timp trece de la disfuncția erectilă la o problemă de inimă?",
      answer:
        "Ghidul european nu stabilește un interval anume {{cite:eau-srh}}. Important este că disfuncția erectilă e un semnal de risc și că verificarea se face acum, nu mai târziu.",
    },
    {
      question: "Ce analize ar trebui să fac?",
      answer:
        "De obicei glicemia sau hemoglobina glicată, profilul lipidic și testosteronul total de dimineață, alături de măsurarea tensiunii {{cite:eau-srh}}. Medicul decide ce ți se potrivește.",
    },
    {
      question: "Pot lua tratament pentru erecție dacă am o boală de inimă?",
      answer:
        "Depinde de boală. Unele situații exclud tratamentul oral, de exemplu un infarct recent sau folosirea nitraților {{cite:ema-viagra}}, iar bolile severe sau instabile cer mai întâi o evaluare cardiologică {{cite:eau-srh}}.",
    },
  ],
  sourceIds: ["eau-srh", "ema-cialis", "ema-viagra"],
  limitations: disclaimer,
  related: [hub, link.cauze, link.tratament, link.sildenafil, link.tadalafil],
});

export const erectileDysfunction: Condition = {
  slug: "disfunctie-erectila",
  basePath: base,
  name: "Disfuncție erectilă",
  shortName: "Disfuncție erectilă",
  medicalName: "Disfuncție erectilă",
  teaser: "Dificultăți de erecție, evaluate discret de un medic, cu atenție la sănătatea inimii.",
  inSentence: "disfuncția erectilă",
  presentation: {
    heroAccent: "evaluată discret de un medic.",
    asideTitle: "Nu știi de unde vin dificultățile?",
    asideAccent: "Un medic te poate ajuta să afli.",
    evaluationLabel: "Evaluare medicală online",
    mockup: {
      question: "De cât timp ai dificultăți cu erecția?",
      options: ["De mai puțin de 3 luni", "De 3–12 luni", "De mai mult de un an"],
      goal: "Să aflăm cauza și să avem grijă și de inimă",
      checkIn: "După primele săptămâni",
      followUp: "Mulțumesc. Îți trimit și lista analizelor de verificat la medicul de familie.",
    },
  },
  status: "published",
  guideSlugs: [],
  treatmentSlugs: ["sildenafil", "tadalafil"],
  approaches: [
    {
      title: "Stil de viață și factori de risc",
      text: "Mișcarea, scăderea în greutate și tratarea factorilor de risc pentru inimă pot îmbunătăți erecția. Se recomandă înaintea sau odată cu orice tratament.",
      href: "/disfunctie-erectila/sanatatea-inimii",
      linkLabel: "Legătura cu sănătatea inimii",
    },
    {
      title: "Tratament oral",
      text: "Prima linie de tratament în ghidul european, după evaluarea medicului. Nu se combină niciodată cu nitrații.",
      href: "/disfunctie-erectila/tratament",
      linkLabel: "Cum funcționează tratamentul oral",
    },
    {
      title: "Sprijin psihosexual",
      text: "Consilierea și terapia cognitiv-comportamentală ajută singure sau împreună cu tratamentul medical.",
      href: "/disfunctie-erectila/cauze",
      linkLabel: "Cauzele, inclusiv cele psihologice",
    },
  ],
  doc: {
    kind: "condition",
    slug: "disfunctie-erectila",
    path: base,
    // Every term below appears verbatim on the page (tested).
    entity: {
      alternateName: ["impotență"],
      signOrSymptom: ["dificultatea de a obține o erecție", "dificultatea de a menține o erecție"],
      riskFactor: ["diabetul", "hipertensiunea arterială", "fumatul", "obezitatea", "lipsa mișcării"],
      possibleTreatment: ["Stil de viață și factori de risc", "Tratament oral", "Sprijin psihosexual"],
    },
    graphRole: "condition",
    conditionSlug: "disfunctie-erectila",
    title: "Disfuncție erectilă",
    metaTitle: "Disfuncția erectilă: cauze și tratament",
    metaDescription:
      "Ce este disfuncția erectilă, de ce apare, cum se tratează și de ce merită verificată și inima. Evaluare medicală online, discretă, de pe telefon.",
    h1: "Disfuncția erectilă",
    summary:
      "Disfuncția erectilă înseamnă dificultatea persistentă de a obține sau de a menține o erecție suficientă pentru o activitate sexuală satisfăcătoare {{cite:eau-srh}}. Este frecventă, mai ales după 40 de ani, și poate fi un semn timpuriu al unei boli de inimă sau a vaselor de sânge {{cite:eau-srh}}. Se poate evalua discret, iar opțiunile de tratament sunt mai multe.",
    sections: [
      {
        id: "ce-este",
        heading: "Ce este disfuncția erectilă",
        blocks: [
          {
            type: "p",
            text: "Disfuncția erectilă, numită uneori în limbaj obișnuit impotență, este incapacitatea persistentă de a obține și de a menține o erecție suficientă pentru o activitate sexuală satisfăcătoare {{cite:eau-srh}}. Concret, poate însemna:",
          },
          {
            type: "list",
            items: [
              "dificultatea de a obține o erecție;",
              "dificultatea de a menține o erecție până la finalul actului sexual;",
              "erecții mai puțin ferme decât înainte.",
            ],
          },
          {
            type: "p",
            text: "Cuvântul important este „persistentă”: dificultățile ocazionale nu înseamnă disfuncție erectilă {{cite:eau-srh}}. Când ele se repetă, merită discutate cu un medic, fără jenă: este o problemă medicală frecventă, cu mai multe opțiuni de tratament.",
          },
        ],
      },
      {
        id: "frecventa",
        heading: "Cât de frecventă este disfuncția erectilă",
        blocks: [
          {
            type: "p",
            text: "Disfuncția erectilă este frecventă. Câteva date din studiile citate de ghidul european {{cite:eau-srh}}:",
          },
          {
            type: "list",
            items: [
              "în studiul Massachusetts Male Aging Study, 52% dintre bărbații între 40 și 70 de ani din zona Boston aveau un anumit grad de disfuncție erectilă: minimă la 17,2%, moderată la 25,2% și completă la 9,6% {{cite:eau-srh}};",
              "într-un studiu din Köln, la bărbați între 30 și 80 de ani, frecvența a fost de 19,2%, cu o creștere abruptă cu vârsta, de la 2,3% la 53,4% {{cite:eau-srh}};",
              "într-un studiu din practica clinică, unul din patru pacienți avea sub 40 de ani, iar aproape jumătate dintre acești tineri aveau o formă severă {{cite:eau-srh}}.",
            ],
          },
          {
            type: "p",
            text: "Cifrele vin din populațiile studiate și nu descriu direct situația din România, dar arată clar că nu ești singurul.",
          },
        ],
      },
      {
        id: "cauze",
        heading: "De ce apare disfuncția erectilă",
        blocks: [
          {
            type: "p",
            text: "Cauzele pot fi vasculare, neurologice, anatomice, hormonale, legate de medicamente sau psihologice, iar de multe ori se combină {{cite:eau-srh}}. Printre factorii de risc se numără vârsta, diabetul, hipertensiunea arterială, colesterolul mare, bolile cardiovasculare, obezitatea, fumatul, lipsa mișcării, depresia și anxietatea {{cite:eau-srh}}.",
          },
          {
            type: "p",
            text: "Unele medicamente, alcoolul în exces și drogurile pot contribui și ele {{cite:eau-srh}}. Le explicăm pe rând în pagina despre [cauzele disfuncției erectile](/disfunctie-erectila/cauze).",
          },
        ],
      },
      {
        id: "inima",
        heading: "Ce legătură are disfuncția erectilă cu inima",
        blocks: [
          {
            type: "p",
            text: "Disfuncția erectilă crește semnificativ riscul de boli cardiovasculare, de boală coronariană și de accident vascular cerebral. Ghidul european o consideră un precursor al bolilor cardiovasculare, iar bărbații tineri, mai ales cei sub 50 de ani, au un risc mai mare {{cite:eau-srh}}.",
          },
          {
            type: "p",
            text: "De aceea, o evaluare bună privește și inima. Detaliile sunt în [disfuncția erectilă și sănătatea inimii](/disfunctie-erectila/sanatatea-inimii).",
          },
        ],
      },
      {
        id: "evaluare",
        heading: "Cum se evaluează disfuncția erectilă",
        blocks: [
          {
            type: "p",
            text: "Ghidul european recomandă puternic, la fiecare pacient, un istoric medical și sexual complet, un chestionar validat, un examen fizic țintit și analize: glicemie, profil lipidic și testosteron total {{cite:eau-srh}}.",
          },
          {
            type: "p",
            text: "Evaluarea Telegen începe cu întrebări despre dificultăți, sănătatea generală și medicamente, inclusiv întrebări de siguranță despre inimă. Pentru disfuncția erectilă nu se cer niciodată fotografii. Dacă medicul are nevoie de analize sau de un examen în persoană, îți spune.",
          },
        ],
      },
      {
        id: "tratament",
        heading: "Ce opțiuni de tratament există",
        blocks: [
          {
            type: "p",
            text: "Ghidul european recomandă puternic ca schimbările de stil de viață și tratarea factorilor de risc să înceapă înaintea sau odată cu orice tratament. Prima linie de tratament medicamentos este o clasă de medicamente orale, inhibitorii PDE5; consilierea psihosexuală este recomandată și ea, iar opțiunile de specialitate rămân pentru cazurile în care acestea nu sunt potrivite {{cite:eau-srh}}.",
          },
          {
            type: "p",
            text: "Pe site prezentăm medicamentele doar informativ: [sildenafil](/tratamente/sildenafil) și [tadalafil](/tratamente/tadalafil). Toate opțiunile sunt explicate în [tratamentul disfuncției erectile](/disfunctie-erectila/tratament).",
          },
          nitrateCallout,
        ],
      },
      {
        id: "urgent",
        heading: "Când ai nevoie de ajutor medical",
        blocks: [
          {
            type: "p",
            text: "Câteva situații nu se potrivesc unei evaluări la distanță. Ghidul recomandă evaluare de specialitate, de exemplu, pentru bărbații tineri cu un traumatism în zona pelvisului și pentru deformările penisului {{cite:eau-srh}}.",
          },
          urgentCallout,
        ],
      },
    ],
    faqs: [
      {
        question: "Disfuncția erectilă apare și la bărbații tineri?",
        answer:
          "Da. Într-un studiu din practica clinică, unul din patru pacienți avea sub 40 de ani {{cite:eau-srh}}. La bărbații sub 50 de ani, disfuncția erectilă este legată și de un risc cardiovascular mai mare, așa că merită evaluată {{cite:eau-srh}}.",
      },
      {
        question: "Problemele ocazionale de erecție înseamnă disfuncție erectilă?",
        answer:
          "Nu neapărat. Disfuncția erectilă înseamnă o dificultate persistentă {{cite:eau-srh}}. Dacă problemele se repetă sau te îngrijorează, discută cu un medic.",
      },
      {
        question: "Este disfuncția erectilă un semn de boală de inimă?",
        answer:
          "Poate fi. Ghidul european o consideră un precursor al bolilor cardiovasculare {{cite:eau-srh}}. Nu înseamnă că ai sigur o boală de inimă, dar riscul merită verificat.",
      },
      {
        question: "Pot opri singur un medicament care cred că îmi afectează erecția?",
        answer:
          "Nu. Unele medicamente pentru tensiune, antidepresive sau medicamente antiandrogene pot contribui la disfuncția erectilă {{cite:eau-srh}}, dar nu le opri și nu schimba doza fără medic. Discută cu medicul care ți le-a prescris.",
      },
      {
        question: "Evaluarea este discretă?",
        answer:
          "Da. Întrebările se completează pe telefon, iar răspunsurile din evaluarea de pe site nu se salvează nicăieri. Pentru disfuncția erectilă nu se cer fotografii.",
      },
    ],
    sourceIds: ["eau-srh", "ema-viagra"],
    limitations: disclaimer,
    ...dates,
    related: [link.cauze, link.tratament, link.inima, link.sildenafil, link.tadalafil],
    status: "published",
  },
  subpages: [cauze, tratament, inima],
};
