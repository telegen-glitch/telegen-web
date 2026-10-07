import { draftDoc } from "./drafts";
import type { MedicalDoc } from "./types";

/**
 * Treatment-information pages. Neutral, educational only (section 9.4):
 * no CTA, price or purchase language next to a medicine name. The page-level
 * call to action is condition-led and rendered in a separate block.
 */

const conditionLink = {
  href: "/caderea-parului",
  label: "Căderea părului: privire de ansamblu",
  description: "Ce este alopecia androgenetică și ce opțiuni există.",
};

export const treatments: MedicalDoc[] = [
  {
    kind: "treatment",
    slug: "minoxidil",
    drug: { activeIngredient: "minoxidil", prescriptionStatus: "OTC" },
    graphRole: "treatment",
    conditionSlug: "caderea-parului",
    title: "Minoxidil",
    metaTitle: "Minoxidil: cum acționează și efecte adverse",
    metaDescription:
      "Informații neutre despre minoxidilul topic în alopecia androgenetică: cum acționează, ce arată studiile, efecte adverse, limite și întrebări de pus medicului.",
    h1: "Minoxidil: informații despre tratament",
    summary:
      "Minoxidilul topic este una dintre substanțele recomandate de ghidul european pentru alopecia androgenetică, atât la bărbați, cât și la femei {{cite:kanti-2018}}. Se aplică pe scalp, prelungește faza de creștere a firului și acționează doar cât timp este folosit. Efectul se evaluează după câteva luni de aplicare constantă, nu după câteva săptămâni {{cite:kanti-2018}}.",
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
              "mâncărime, iritație și descuamare a scalpului, cele mai frecvente efecte adverse {{cite:statpearls-aga}};",
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
              "În România, soluția de minoxidil pentru uz cutanat se eliberează fără prescripție medicală {{cite:anmdm-alopexy}}. Asta nu înseamnă că se potrivește oricui: discută cu medicul sau cu farmacistul înainte să o folosești.",
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
    sourceIds: ["kanti-2018", "olsen-2002", "statpearls-aga", "anmdm-alopexy"],
    limitations:
      "Pagina are scop exclusiv informativ și nu reprezintă o recomandare de tratament. Citește prospectul și discută cu un medic sau farmacist înainte de utilizare.",
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-07",
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
    drug: { activeIngredient: "finasteridă", prescriptionStatus: "PrescriptionOnly" },
    graphRole: "treatment",
    conditionSlug: "caderea-parului",
    title: "Finasteridă",
    metaTitle: "Finasterida: cum acționează și efecte adverse",
    metaDescription:
      "Informații neutre despre finasteridă în alopecia androgenetică la bărbați: cum acționează, ce arată studiile, efecte adverse. Se eliberează pe rețetă.",
    h1: "Finasteridă: informații despre tratament",
    summary:
      "Finasterida este un medicament oral, eliberat doar pe bază de rețetă, care scade transformarea testosteronului în dihidrotestosteron (DHT). Față de placebo, încetinește progresia căderii și poate crește numărul de fire {{cite:kaufman-1998}}. Ghidul european o recomandă pentru alopecia androgenetică la bărbați {{cite:kanti-2018}}. Are efecte adverse cunoscute, iar decizia aparține medicului.",
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
              "modificări ale dispoziției, inclusiv depresie și gânduri suicidare (vezi mai jos decizia europeană din 2025) {{cite:ema-finasteride-2025}};",
              "sensibilitate sau mărire a sânilor;",
              "scade valoarea PSA din analize; spune medicului că o iei dacă faci acest test.",
            ],
          },
          {
            type: "callout",
            tone: "caution",
            title: "Important",
            text: "Finasterida nu se folosește la femeile însărcinate sau care pot rămâne însărcinate, pentru că poate afecta dezvoltarea unui făt de sex masculin {{cite:statpearls-aga}}. Comprimatele sparte sau zdrobite nu trebuie atinse de acestea.",
          },
        ],
      },
      {
        id: "decizia-ema-2025",
        heading: "Ce a decis Agenția Europeană a Medicamentului în 2025",
        blocks: [
          {
            type: "p",
            text: "Agenția Europeană a Medicamentului a reevaluat medicamentele cu finasteridă și dutasteridă într-o procedură începută la 3 octombrie 2024. Concluzia, devenită decizie a Comisiei Europene la 22 august 2025, confirmă gândurile suicidare ca efect advers al finasteridei, atât în doza de 1 mg, cât și în cea de 5 mg, cu o frecvență necunoscută {{cite:ema-finasteride-2025}}.",
          },
          {
            type: "p",
            text: "Ambalajul finasteridei de 1 mg conține acum un card pentru pacient. Dacă observi schimbări ale dispoziției, stare depresivă sau gânduri suicidare, cere imediat sfatul unui medic {{cite:ema-finasteride-2025}}.",
          },
          {
            type: "callout",
            tone: "caution",
            title: "Nu aștepta următoarea programare",
            text: "Orice schimbare a dispoziției, tristețe persistentă sau gânduri de a-ți face rău trebuie spuse imediat unui medic {{cite:ema-finasteride-2025}}. Dacă ești în pericol imediat, sună la 112.",
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
              "În România se eliberează doar pe bază de prescripție medicală {{cite:mediately-propecia}}, după evaluarea medicului.",
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
    sourceIds: ["kanti-2018", "kaufman-1998", "statpearls-aga", "ema-finasteride-2025", "mediately-propecia"],
    limitations:
      "Pagina are scop exclusiv informativ și nu reprezintă o recomandare sau promovare a unui medicament. Finasterida se eliberează doar pe bază de prescripție medicală.",
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-07",
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

/**
 * Medicine information for acne and erectile dysfunction (CLAUDE.md 7c.B).
 * Drafts until written from the EMA / ANMDM product information and guidelines.
 */
const medicine = (
  slug: string,
  conditionSlug: string,
  title: string,
  metaTitle: string,
  description: string,
) =>
  draftDoc({
    kind: "treatment",
    slug,
    conditionSlug,
    graphRole: "treatment",
    title,
    metaTitle,
    metaDescription: description,
    h1: `${title}: informații despre tratament`,
  });

treatments.push(
  medicine(
    "peroxid-de-benzoil",
    "acnee",
    "Peroxid de benzoil",
    "Peroxid de benzoil: cum acționează",
    "Informații neutre despre peroxidul de benzoil în acnee: cum acționează, cum se aplică, iritația pielii, decolorarea textilelor și precauții.",
  ),
  medicine(
    "adapalen",
    "acnee",
    "Adapalen",
    "Adapalen: cum acționează și efecte adverse",
    "Informații neutre despre adapalen, un retinoid topic folosit în acnee: cum acționează, cum se folosește, efecte adverse și precauții în sarcină.",
  ),
  medicine(
    "tretinoin",
    "acnee",
    "Tretinoin",
    "Tretinoin: cum acționează și efecte adverse",
    "Informații neutre despre tretinoinul topic în acnee: cum acționează, cum se folosește, iritația pielii, protecția solară și precauții în sarcină.",
  ),
  medicine(
    "clindamicina-topica",
    "acnee",
    "Clindamicină topică",
    "Clindamicină topică în acnee",
    "Informații neutre despre clindamicina topică în acnee: de ce se folosește doar în combinație și cum se evită rezistența bacteriană.",
  ),
  medicine(
    "doxiciclina-limeciclina",
    "acnee",
    "Doxiciclină și limeciclină",
    "Doxiciclină și limeciclină în acnee",
    "Informații neutre despre antibioticele orale doxiciclină și limeciclină în acnee: cât durează, cu ce se asociază, efecte adverse.",
  ),
  medicine(
    "isotretinoin",
    "acnee",
    "Isotretinoin",
    "Isotretinoin: ce trebuie să știi",
    "Informații despre isotretinoin în acneea severă: prescris doar sub supravegherea dermatologului, programul de prevenire a sarcinii, efecte adverse.",
  ),
  medicine(
    "sildenafil",
    "disfunctie-erectila",
    "Sildenafil",
    "Sildenafil: cum acționează și precauții",
    "Informații neutre despre sildenafil în disfuncția erectilă: cum acționează, contraindicații (nitrați), interacțiuni, efecte adverse.",
  ),
  medicine(
    "tadalafil",
    "disfunctie-erectila",
    "Tadalafil",
    "Tadalafil: cum acționează și precauții",
    "Informații neutre despre tadalafil în disfuncția erectilă: cum acționează, durata efectului, contraindicații, efecte adverse.",
  ),
);

export function getTreatment(slug: string): MedicalDoc | undefined {
  return treatments.find((t) => t.slug === slug && t.status === "published");
}
