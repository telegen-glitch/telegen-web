import type { MedicalDoc } from "./types";

/**
 * Treatment-information pages. Neutral, educational only (section 9.4):
 * no CTA, price or purchase language next to a medicine name. The page-level
 * call to action is condition-led and rendered in a separate block.
 */

const conditionLink = {
  href: "/afectiuni/caderea-parului",
  label: "Căderea părului: privire de ansamblu",
  description: "Ce este alopecia androgenetică și ce opțiuni există.",
};

export const treatments: MedicalDoc[] = [
  {
    kind: "treatment",
    slug: "minoxidil",
    graphRole: "treatment",
    conditionSlug: "caderea-parului",
    title: "Minoxidil",
    metaTitle: "Minoxidil pentru căderea părului: cum acționează, efecte adverse",
    metaDescription:
      "Informații neutre despre minoxidilul topic în alopecia androgenetică: cum acționează, ce arată studiile, efecte adverse, limite și întrebări de pus medicului.",
    h1: "Minoxidil: informații despre tratament",
    summary:
      "Minoxidilul topic este una dintre substanțele recomandate de ghidul european pentru alopecia androgenetică, atât la bărbați, cât și la femei {{cite:kanti-2018}}. Se aplică pe scalp, prelungește faza de creștere a firului și acționează doar cât timp este folosit.",
    sections: [
      {
        id: "cum-actioneaza",
        heading: "Cum acționează",
        blocks: [
          {
            type: "p",
            text: "Minoxidilul a fost folosit inițial, sub formă de tablete, pentru tensiunea arterială. Efectul asupra părului a fost observat ca efect secundar. Aplicat pe scalp, prelungește faza de creștere a firelor și poate mări diametrul celor miniaturizate. Mecanismul exact nu este pe deplin lămurit {{cite:statpearls-aga}}.",
          },
          {
            type: "p",
            text: "Nu acționează asupra cauzei hormonale a alopeciei androgenetice, ci asupra foliculului. De aceea, medicul îl poate recomanda singur sau în asociere cu alte tratamente.",
          },
        ],
      },
      {
        id: "dovezi",
        heading: "Ce arată studiile",
        blocks: [
          {
            type: "p",
            text: "Într-un studiu clinic randomizat, controlat cu placebo, desfășurat pe 48 de săptămâni la bărbați cu alopecie androgenetică, soluția de minoxidil 5% a dus la o creștere mai mare a numărului de fire în zona tratată decât soluția de 2% și decât placebo {{cite:olsen-2002}}. Ghidul european S3 îl recomandă la bărbați și la femei {{cite:kanti-2018}}.",
          },
          {
            type: "p",
            text: "Răspunsul diferă de la o persoană la alta. La unii oameni căderea se oprește, la alții densitatea crește, iar la o parte efectul este modest.",
          },
        ],
      },
      {
        id: "efecte-adverse",
        heading: "Efecte adverse posibile",
        blocks: [
          {
            type: "list",
            items: [
              "iritație, mâncărime sau descuamare a scalpului, uneori din cauza excipienților soluției;",
              "o cădere temporară mai accentuată în primele săptămâni de utilizare {{cite:statpearls-aga}};",
              "creșterea nedorită a părului pe față, mai ales la femei, dacă soluția ajunge pe piele în afara scalpului;",
              "rar, amețeală sau palpitații; acestea trebuie raportate medicului.",
            ],
          },
          {
            type: "p",
            text: "Nu este recomandat în sarcină sau alăptare. Spune medicului dacă ai probleme cardiovasculare.",
          },
        ],
      },
      {
        id: "limite",
        heading: "Limite",
        blocks: [
          {
            type: "list",
            items: [
              "Efectul se evaluează după câteva luni de aplicare constantă, nu după câteva săptămâni {{cite:kanti-2018}}.",
              "Dacă aplicarea se oprește, câștigul se pierde treptat în lunile următoare.",
              "Nu înlocuiește evaluarea: căderea părului poate avea alte cauze, care cer alt tratament.",
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Minoxidilul se poate folosi și de femei?",
        answer:
          "Da, minoxidilul topic este recomandat de ghidul european și la femei cu alopecie androgenetică {{cite:kanti-2018}}. Concentrația și modul de aplicare le stabilește medicul.",
      },
      {
        question: "Ce întrebări să pun medicului?",
        answer:
          "Întreabă cât timp trebuie folosit înainte de o evaluare, cum se aplică, ce faci dacă apare iritație și cum se combină cu alte tratamente pe care le folosești.",
      },
    ],
    sourceIds: ["kanti-2018", "olsen-2002", "statpearls-aga"],
    limitations:
      "Pagina are scop exclusiv informativ și nu reprezintă o recomandare de tratament. Citește prospectul și discută cu un medic sau farmacist înainte de utilizare.",
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
    related: [
      conditionLink,
      { href: "/tratamente/finasterida", label: "Finasteridă: informații" },
      {
        href: "/ghiduri/caderea-parului-intrebari-frecvente",
        label: "Întrebări frecvente despre căderea părului",
      },
      {
        href: "/ghiduri/semnele-alopeciei-androgenetice",
        label: "Semnele alopeciei androgenetice",
      },
    ],
    status: "published",
  },
  {
    kind: "treatment",
    slug: "finasterida",
    graphRole: "treatment",
    conditionSlug: "caderea-parului",
    title: "Finasteridă",
    metaTitle: "Finasterida în alopecia androgenetică: mecanism, efecte adverse, limite",
    metaDescription:
      "Informații neutre despre finasteridă în alopecia androgenetică la bărbați: cum acționează, ce arată studiile, efecte adverse și contraindicații. Medicament eliberat pe bază de rețetă.",
    h1: "Finasteridă: informații despre tratament",
    summary:
      "Finasterida este un medicament oral, eliberat doar pe bază de rețetă, care scade transformarea testosteronului în dihidrotestosteron (DHT). Ghidul european o recomandă pentru alopecia androgenetică la bărbați {{cite:kanti-2018}}. Are efecte adverse cunoscute, iar decizia aparține medicului.",
    sections: [
      {
        id: "cum-actioneaza",
        heading: "Cum acționează",
        blocks: [
          {
            type: "p",
            text: "Finasterida blochează enzima 5-alfa-reductază de tip II, care transformă testosteronul în DHT. Cu mai puțin DHT, foliculii sensibili se miniaturizează mai lent, iar unii își pot recăpăta parțial grosimea {{cite:statpearls-aga}}.",
          },
        ],
      },
      {
        id: "dovezi",
        heading: "Ce arată studiile",
        blocks: [
          {
            type: "p",
            text: "În studii clinice randomizate, controlate cu placebo, la bărbați cu alopecie androgenetică, finasterida a încetinit progresia căderii și a crescut numărul de fire în zona evaluată, comparativ cu placebo {{cite:kaufman-1998}}. Pe această bază, ghidul european S3 o recomandă la bărbați {{cite:kanti-2018}}.",
          },
          {
            type: "p",
            text: "Efectul apare în luni, iar dacă tratamentul se oprește, beneficiul se pierde treptat.",
          },
        ],
      },
      {
        id: "efecte-adverse",
        heading: "Efecte adverse și precauții",
        blocks: [
          {
            type: "list",
            items: [
              "efecte sexuale: scăderea libidoului, dificultăți de erecție, tulburări de ejaculare;",
              "modificări ale dispoziției, inclusiv depresie; în 2025, Agenția Europeană a Medicamentului a confirmat ideația suicidară ca posibil efect advers și a cerut avertizări în prospect {{cite:ema-finasteride-2025}};",
              "sensibilitate sau mărire a sânilor;",
              "scade valoarea PSA din analize; spune medicului că o iei dacă faci acest test.",
            ],
          },
          {
            type: "callout",
            tone: "caution",
            title: "Important",
            text: "Finasterida nu se folosește la femeile însărcinate sau care pot rămâne însărcinate, pentru că poate afecta dezvoltarea unui făt de sex masculin. Comprimatele sparte sau zdrobite nu trebuie atinse de acestea. Orice schimbare a dispoziției sau gânduri negative trebuie semnalate imediat medicului.",
          },
        ],
      },
      {
        id: "limite",
        heading: "Limite",
        blocks: [
          {
            type: "list",
            items: [
              "Se eliberează doar pe bază de rețetă, după evaluarea medicului.",
              "Este studiată și recomandată pentru bărbați; la femei, opțiunile sunt diferite {{cite:kanti-2018}}.",
              "Nu este potrivită pentru toată lumea: istoricul medical, celelalte medicamente și preferințele tale contează.",
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Efectele adverse dispar dacă opresc tratamentul?",
        answer:
          "La majoritatea oamenilor, efectele adverse dispar după oprire. Au fost raportate și cazuri în care acestea au persistat. Discută cu medicul înainte de a începe și anunță-l imediat dacă apar.",
      },
      {
        question: "Ce întrebări să pun medicului?",
        answer:
          "Întreabă care sunt alternativele, cum vei fi urmărit, ce faci dacă apar efecte adverse și cum influențează tratamentul analizele de sânge sau planurile de a avea copii.",
      },
    ],
    sourceIds: ["kanti-2018", "kaufman-1998", "statpearls-aga", "ema-finasteride-2025"],
    limitations:
      "Pagina are scop exclusiv informativ și nu reprezintă o recomandare sau promovare a unui medicament. Finasterida se eliberează doar pe bază de prescripție medicală.",
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
    related: [
      conditionLink,
      { href: "/tratamente/minoxidil", label: "Minoxidil: informații" },
      { href: "/ghiduri/cauzele-caderii-parului", label: "Cauzele căderii părului" },
      {
        href: "/ghiduri/caderea-parului-intrebari-frecvente",
        label: "Întrebări frecvente despre căderea părului",
      },
    ],
    status: "published",
  },
];

export function getTreatment(slug: string): MedicalDoc | undefined {
  return treatments.find((t) => t.slug === slug && t.status === "published");
}
