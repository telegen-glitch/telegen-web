import type { MedicalDoc, RelatedLink } from "../types";

/**
 * Acne medicine information (CLAUDE.md 7c.B), written on 2026-10-07 from the source pack
 * (docs/sources/acne.md, docs/sources/romania-prescription-status.md). Neutral and educational
 * only: no doses, no efficacy percentages, no call to action, no purchase language (section 9.4).
 *
 * Merged pages (logged in docs/STATUS.md): topical tretinoin is covered on the adapalen page
 * (topical retinoids), topical clindamycin on the benzoyl peroxide page (it is used only in
 * combination, and the confirmed Romanian product is the clindamycin + benzoyl peroxide gel).
 * `prescriptionStatus` is set only where a Romanian product was confirmed.
 */

const hub: RelatedLink = {
  href: "/acnee",
  label: "Acneea: privire de ansamblu",
  description: "Ce este, cine o face și cum se tratează.",
};
const tratament: RelatedLink = {
  href: "/acnee/tratament",
  label: "Tratamentul acneei, pas cu pas",
  description: "Toate treptele de tratament, după ghidul european.",
};
const tipuri: RelatedLink = { href: "/acnee/tipuri", label: "Tipurile de acnee" };
const retinoizi: RelatedLink = { href: "/tratamente/adapalen", label: "Adapalen și tretinoin: informații" };
const bpo: RelatedLink = { href: "/tratamente/peroxid-de-benzoil", label: "Peroxid de benzoil: informații" };
const antibiotice: RelatedLink = {
  href: "/tratamente/doxiciclina-limeciclina",
  label: "Doxiciclină și limeciclină: informații",
};
const isotretinoin: RelatedLink = { href: "/tratamente/isotretinoin", label: "Isotretinoin: informații" };

const dates = { publishedAt: "2026-10-07", updatedAt: "2026-10-07" } as const;

const limits = (name: string) =>
  `Pagina are scop exclusiv informativ și nu reprezintă o recomandare sau promovare a unui medicament. Nu conține doze. Citește prospectul și discută cu un medic sau farmacist înainte să folosești ${name}.`;

const medicine = (
  doc: Omit<MedicalDoc, "kind" | "graphRole" | "conditionSlug" | "status" | "publishedAt" | "updatedAt">,
): MedicalDoc => ({
  kind: "treatment",
  graphRole: "treatment",
  conditionSlug: "acnee",
  status: "published",
  ...dates,
  ...doc,
});

export const acneMedicines: MedicalDoc[] = [
  medicine({
    slug: "adapalen",
    drug: { activeIngredient: "adapalen" },
    title: "Adapalen și tretinoin",
    metaTitle: "Adapalen și tretinoin: retinoizi topici în acnee",
    metaDescription:
      "Informații neutre despre adapalen și tretinoin, retinoizi aplicați pe piele în acnee: când se folosesc, de ce e preferat adapalenul, sarcina, disponibilitate.",
    h1: "Adapalen și tretinoin: informații despre retinoizii topici",
    summary:
      "Adapalenul și tretinoinul sunt retinoizi topici, adică tratamente aplicate pe piele, folosite în acnee. Ghidul european preferă adapalenul, pentru că este mai bine tolerat, iar în acneea ușoară și moderată recomandă puternic combinația fixă adapalen + peroxid de benzoil {{cite:euroguiderm-acne-2025}}. Retinoizii topici nu se folosesc în sarcină {{cite:nhs-acne-treatment}}.",
    sections: [
      {
        id: "cand",
        heading: "Când se folosesc retinoizii topici",
        blocks: [
          {
            type: "p",
            text: "Ghidul european al dermatologilor include retinoizii topici în mai multe trepte de tratament {{cite:euroguiderm-acne-2025}}:",
          },
          {
            type: "list",
            items: [
              "în **acneea comedonală**, un retinoid topic (de preferat adapalenul) poate fi recomandat, alături de alte opțiuni aplicate pe piele;",
              "în **acneea papulo-pustuloasă ușoară până la moderată**, combinația fixă adapalen + peroxid de benzoil este una dintre opțiunile recomandate puternic; un retinoid topic singur sau combinația fixă clindamicină + tretinoin pot fi recomandate;",
              "în **formele mai severe**, adapalenul poate fi asociat unui antibiotic luat pe gură.",
            ],
          },
          {
            type: "p",
            text: "Treptele complete sunt descrise în [tratamentul acneei, pas cu pas](/acnee/tratament). Ce ți se potrivește stabilește medicul.",
          },
        ],
      },
      {
        id: "comparatie",
        heading: "Adapalen sau tretinoin?",
        blocks: [
          {
            type: "p",
            text: "Ghidul european recomandă ca adapalenul să fie ales în locul tretinoinului și al isotretinoinului aplicat pe piele, pentru că pielea îl tolerează mai bine {{cite:euroguiderm-acne-2025}}. Pentru comparație, acidul azelaic este și el mai bine tolerat decât tretinoinul {{cite:euroguiderm-acne-2025}}.",
          },
          {
            type: "p",
            text: "Tretinoinul apare în ghid mai ales în combinația fixă cu clindamicina. Această combinație a fost retrogradată la treapta „poate fi recomandat” din cauza îngrijorărilor legate de rezistența bacteriilor la antibiotice {{cite:euroguiderm-acne-2025}}.",
          },
        ],
      },
      {
        id: "precautii",
        heading: "Precauții: sarcina și diferența față de tratamentul pe gură",
        blocks: [
          {
            type: "p",
            text: "Retinoizii topici nu sunt potriviți în sarcină {{cite:nhs-acne-treatment}} și sunt contraindicați în timpul ei {{cite:ema-retinoids-2018}}. Dacă ești însărcinată sau plănuiești o sarcină, spune-i medicului înainte de orice tratament pentru acnee.",
          },
          {
            type: "p",
            text: "Spre deosebire de retinoizii luați pe gură, pentru retinoizii aplicați pe piele autoritatea europeană a medicamentului nu a considerat necesar un avertisment privind starea emoțională {{cite:ema-retinoids-2018}}. Despre tratamentul pe gură scriem pe pagina despre [isotretinoin](/tratamente/isotretinoin).",
          },
          {
            type: "callout",
            tone: "caution",
            title: "Când ai nevoie de consult în persoană",
            text: "Dacă ai noduli adânci și dureroși, dacă acneea îți lasă cicatrici sau dacă ești însărcinată, mergi la un medic dermatolog în persoană.",
          },
        ],
      },
      {
        id: "durata",
        heading: "În cât timp se vede efectul",
        blocks: [
          {
            type: "p",
            text: "Multe tratamente pentru acnee au nevoie de 2–3 luni ca să înceapă să funcționeze {{cite:nhs-acne-treatment}}. Primele săptămâni nu arată încă rezultatul; medicul judecă efectul la reevaluare.",
          },
        ],
      },
      {
        id: "romania",
        heading: "Ce este disponibil în România",
        blocks: [
          {
            type: "p",
            text: "Combinația fixă adapalen + peroxid de benzoil, sub formă de gel, se eliberează în România pe bază de prescripție medicală {{cite:anmdm-epiduo}}. Nu am putut confirma, la data actualizării, un medicament autorizat în România care să conțină doar adapalen sau doar tretinoin pentru aplicare pe piele. Medicul sau farmacistul îți poate spune ce este disponibil.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Pot folosi retinoizi topici în sarcină?",
        answer:
          "Nu. Retinoizii topici nu sunt potriviți în sarcină {{cite:nhs-acne-treatment}}. Dacă ești însărcinată, ghidul european ia în calcul alte opțiuni, cum sunt acidul azelaic sau peroxidul de benzoil {{cite:euroguiderm-acne-2025}}.",
      },
      {
        question: "De ce se preferă adapalenul?",
        answer:
          "Pentru că pielea îl tolerează mai bine decât tretinoinul și isotretinoinul aplicat pe piele {{cite:euroguiderm-acne-2025}}.",
      },
      {
        question: "Retinoizii topici au aceleași riscuri ca isotretinoinul luat pe gură?",
        answer:
          "Nu în totalitate. Ambele sunt contraindicate în sarcină, dar pentru retinoizii aplicați pe piele nu a fost considerat necesar un avertisment privind starea emoțională {{cite:ema-retinoids-2018}}.",
      },
      {
        question: "Cât durează până fac efect?",
        answer:
          "Multe tratamente pentru acnee au nevoie de 2–3 luni ca să înceapă să funcționeze {{cite:nhs-acne-treatment}}.",
      },
    ],
    sourceIds: ["euroguiderm-acne-2025", "nhs-acne-treatment", "ema-retinoids-2018", "anmdm-epiduo"],
    limitations: limits("un retinoid topic"),
    related: [hub, tratament, bpo, isotretinoin, tipuri],
  }),
  medicine({
    slug: "peroxid-de-benzoil",
    drug: { activeIngredient: "peroxid de benzoil" },
    title: "Peroxid de benzoil",
    metaTitle: "Peroxid de benzoil și clindamicină în acnee",
    metaDescription:
      "Informații neutre despre peroxidul de benzoil în acnee și despre clindamicina topică, folosită doar în combinație: când se folosesc, siguranță, efecte adverse.",
    h1: "Peroxid de benzoil: informații despre tratament",
    summary:
      "Peroxidul de benzoil este un tratament aplicat pe piele, folosit în acnee singur sau în combinații fixe cu adapalen ori cu clindamicină; ghidul european recomandă puternic aceste combinații în acneea ușoară și moderată {{cite:euroguiderm-acne-2025}}. Poate usca și irita pielea și decolorează părul și textilele {{cite:nhs-acne-treatment}}. Clindamicina topică se folosește doar în combinație.",
    sections: [
      {
        id: "cand",
        heading: "Când se folosește peroxidul de benzoil",
        blocks: [
          {
            type: "p",
            text: "În ghidul european, peroxidul de benzoil apare în mai multe trepte {{cite:euroguiderm-acne-2025}}:",
          },
          {
            type: "list",
            items: [
              "în **acneea comedonală**, poate fi recomandat, alături de un retinoid topic sau de acidul azelaic;",
              "în **acneea papulo-pustuloasă ușoară până la moderată**, combinațiile fixe adapalen + peroxid de benzoil și peroxid de benzoil + clindamicină sunt recomandate puternic; peroxidul de benzoil singur poate fi recomandat;",
              "în **formele severe**, combinația adapalen + peroxid de benzoil poate fi asociată unui antibiotic luat pe gură.",
            ],
          },
          {
            type: "p",
            text: "În sarcină, peroxidul de benzoil, eventual cu clindamicină sau eritromicină, se numără printre opțiunile care pot fi luate în considerare {{cite:euroguiderm-acne-2025}}. Decizia o iei împreună cu medicul.",
          },
        ],
      },
      {
        id: "clindamicina",
        heading: "Clindamicina topică: de ce doar în combinație",
        blocks: [
          {
            type: "p",
            text: "Clindamicina este un antibiotic. Ghidul european nu recomandă, în general, antibioticele aplicate pe piele ca tratament unic {{cite:euroguiderm-acne-2025}}. Clindamicina apare în ghid în combinații fixe: cu peroxid de benzoil (recomandată puternic în acneea ușoară și moderată) și cu tretinoin (retrogradată la „poate fi recomandat” din cauza riscului de rezistență la antibiotice) {{cite:euroguiderm-acne-2025}}.",
          },
          {
            type: "p",
            text: "Cura cu un antibiotic aplicat pe piele durează de obicei 6–8 săptămâni, după care se oprește, ca să limiteze rezistența bacteriilor {{cite:nhs-acne-treatment}}.",
          },
        ],
      },
      {
        id: "siguranta",
        heading: "Este sigur peroxidul de benzoil?",
        blocks: [
          {
            type: "p",
            text: "A existat o îngrijorare privind o posibilă legătură între peroxidul de benzoil, benzen și leucemie. Ghidul european arată că două studii mari susțin siguranța folosirii obișnuite a peroxidului de benzoil {{cite:euroguiderm-acne-2025}}.",
          },
        ],
      },
      {
        id: "efecte-adverse",
        heading: "Ce efecte adverse poate avea",
        blocks: [
          {
            type: "list",
            items: [
              "piele uscată și senzație de piele întinsă {{cite:nhs-acne-treatment}};",
              "senzație de arsură, mâncărime sau înțepătură {{cite:nhs-acne-treatment}};",
              "decolorarea părului, a hainelor, a prosoapelor și a lenjeriei de pat {{cite:nhs-acne-treatment}};",
              "sensibilitate mai mare la soare {{cite:nhs-acne-treatment}}.",
            ],
          },
          {
            type: "p",
            text: "Câteva sfaturi practice: lasă produsul să se usuce înainte să atingi textilele, folosește prosoape și fețe de pernă de care nu-ți pare rău și protejează-te de soare. Dacă iritația te împiedică să continui, spune-i medicului.",
          },
          {
            type: "callout",
            tone: "caution",
            title: "Când ai nevoie de consult în persoană",
            text: "Dacă ai noduli adânci și dureroși, dacă acneea îți lasă cicatrici sau dacă iritația este puternică și nu trece, mergi la un medic dermatolog în persoană.",
          },
        ],
      },
      {
        id: "romania",
        heading: "Ce este disponibil în România",
        blocks: [
          {
            type: "p",
            text: "Combinațiile fixe sub formă de gel, peroxid de benzoil + clindamicină {{cite:anmdm-duac}} și adapalen + peroxid de benzoil {{cite:anmdm-epiduo}}, se eliberează în România pe bază de prescripție medicală.",
          },
          {
            type: "p",
            text: "Multe produse cu peroxid de benzoil din farmacii sunt cosmetice, nu medicamente autorizate. Nu am putut confirma, la data actualizării, un medicament autorizat în România care să conțină doar peroxid de benzoil sau doar clindamicină pentru aplicare pe piele. Medicul sau farmacistul îți poate spune ce este disponibil și ce diferență este între un medicament și un cosmetic.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "De ce mi s-au decolorat prosopul și fața de pernă?",
        answer:
          "Peroxidul de benzoil decolorează părul și textilele {{cite:nhs-acne-treatment}}. Lasă produsul să se usuce bine și folosește textile de care nu-ți pare rău.",
      },
      {
        question: "Pot folosi clindamicina singură pe piele?",
        answer:
          "Nu este recomandat. Antibioticele aplicate pe piele nu se recomandă, în general, ca tratament unic, ci în combinații fixe, de exemplu cu peroxid de benzoil {{cite:euroguiderm-acne-2025}}.",
      },
      {
        question: "Peroxidul de benzoil este sigur?",
        answer:
          "Două studii mari despre o posibilă legătură cu benzenul și leucemia susțin siguranța folosirii obișnuite {{cite:euroguiderm-acne-2025}}. Poate însă irita și usca pielea {{cite:nhs-acne-treatment}}.",
      },
      {
        question: "Pot folosi peroxid de benzoil în sarcină?",
        answer:
          "Ghidul european îl include printre opțiunile care pot fi luate în considerare în sarcină {{cite:euroguiderm-acne-2025}}. Decizia o iei împreună cu medicul.",
      },
      {
        question: "În cât timp se vede efectul?",
        answer:
          "Multe tratamente pentru acnee au nevoie de 2–3 luni ca să înceapă să funcționeze {{cite:nhs-acne-treatment}}.",
      },
    ],
    sourceIds: ["euroguiderm-acne-2025", "nhs-acne-treatment", "anmdm-duac", "anmdm-epiduo"],
    limitations: limits("peroxid de benzoil sau clindamicină"),
    related: [hub, tratament, retinoizi, antibiotice, tipuri],
  }),
  medicine({
    slug: "doxiciclina-limeciclina",
    drug: { activeIngredient: "doxiciclină", prescriptionStatus: "PrescriptionOnly" },
    title: "Doxiciclină și limeciclină",
    metaTitle: "Doxiciclină și limeciclină în acnee",
    metaDescription:
      "Informații neutre despre antibioticele orale doxiciclină și limeciclină în acnee: când se folosesc, de ce cel mult trei luni, cu ce se asociază, efecte adverse.",
    h1: "Doxiciclină și limeciclină: informații despre tratament",
    summary:
      "Doxiciclina și limeciclina sunt antibiotice luate pe gură, preferate de ghidul european în acnee față de minociclină și tetraciclină {{cite:euroguiderm-acne-2025}}. Se folosesc doar împreună cu un tratament aplicat pe piele și, de regulă, cel mult trei luni {{cite:euroguiderm-acne-2025}}. În România, doxiciclina se eliberează pe bază de prescripție medicală {{cite:mediately-doxiciclina}}.",
    sections: [
      {
        id: "cand",
        heading: "Când se folosesc în acnee",
        blocks: [
          {
            type: "p",
            text: "În ghidul european, un antibiotic luat pe gură apare doar în combinație cu un tratament aplicat pe piele {{cite:euroguiderm-acne-2025}}:",
          },
          {
            type: "list",
            items: [
              "în **acneea papulo-pustuloasă ușoară până la moderată**, ca alternativă, asociat cu adapalen;",
              "în **acneea papulo-pustuloasă severă sau nodulară moderată**, asociat cu adapalen, trifaroten, acid azelaic sau combinația adapalen + peroxid de benzoil;",
              "în **acneea nodulară severă sau conglobată**, asociat cu acid azelaic sau cu combinația adapalen + peroxid de benzoil.",
            ],
          },
          {
            type: "p",
            text: "Când acneea cuprinde și spatele sau pieptul, ghidul favorizează folosirea mai devreme a unui tratament pe gură {{cite:euroguiderm-acne-2025}}. Treptele complete sunt în [tratamentul acneei, pas cu pas](/acnee/tratament).",
          },
        ],
      },
      {
        id: "de-ce",
        heading: "De ce doxiciclina sau limeciclina",
        blocks: [
          {
            type: "p",
            text: "Ghidul european recomandă doxiciclina și limeciclina în locul minociclinei și al tetraciclinei. Minociclina are efecte adverse mai grave: reacții de hipersensibilitate, probleme de ficat și un sindrom asemănător lupusului {{cite:euroguiderm-acne-2025}}.",
          },
        ],
      },
      {
        id: "durata",
        heading: "De ce cel mult trei luni",
        blocks: [
          {
            type: "p",
            text: "Ca să limiteze rezistența bacteriilor la antibiotice, ghidul european recomandă ca antibioticele pe gură să fie folosite în acnee cel mult trei luni. O durată mai lungă este o excepție, când tratamentele locale nu ajung, iar isotretinoinul sau tratamentul hormonal nu sunt potrivite {{cite:euroguiderm-acne-2025}}.",
          },
          {
            type: "p",
            text: "Unele surse descriu cure mai lungi. Pe acest site urmăm ghidul european, care limitează durata la trei luni {{cite:euroguiderm-acne-2025}}.",
          },
        ],
      },
      {
        id: "efecte-adverse",
        heading: "Efecte adverse și precauții",
        blocks: [
          {
            type: "p",
            text: "Doxiciclina poate produce fotosensibilitate, adică piele care se arde mai ușor la soare. Riscul depinde de doză și de expunerea la soare. Limeciclina are o fototoxicitate mai mică {{cite:euroguiderm-acne-2025}}. Cât timp iei tratamentul, protejează-te de soare.",
          },
          {
            type: "p",
            text: "Spune-i medicului dacă ești însărcinată sau alăptezi: în sarcină, ghidul european ia în calcul alte opțiuni {{cite:euroguiderm-acne-2025}}. Spune-i și ce alte medicamente sau suplimente iei.",
          },
          {
            type: "callout",
            tone: "caution",
            title: "Când ai nevoie de consult în persoană",
            text: "Dacă apare o erupție neobișnuită sau o arsură solară puternică în timpul tratamentului, ori dacă acneea are noduli adânci sau lasă cicatrici, mergi la medic în persoană.",
          },
        ],
      },
      {
        id: "romania",
        heading: "Ce este disponibil în România",
        blocks: [
          {
            type: "p",
            text: "Doxiciclina se eliberează în România pe bază de prescripție medicală {{cite:mediately-doxiciclina}}. Pentru limeciclină nu am putut confirma, la data actualizării, un medicament autorizat în România; medicul îți spune ce opțiuni sunt disponibile.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "De ce se folosesc antibioticele doar trei luni în acnee?",
        answer:
          "Pentru a limita rezistența bacteriilor. Ghidul european recomandă cel mult trei luni, cu excepții rare {{cite:euroguiderm-acne-2025}}.",
      },
      {
        question: "Pot lua antibioticul fără un tratament aplicat pe piele?",
        answer:
          "Nu este recomandat. În ghidul european, antibioticele pe gură apar doar în combinație cu un tratament aplicat pe piele {{cite:euroguiderm-acne-2025}}.",
      },
      {
        question: "Pot sta la soare cât timp iau doxiciclină?",
        answer:
          "Doxiciclina poate face pielea mai sensibilă la soare, în funcție de doză și de expunere {{cite:euroguiderm-acne-2025}}. Protejează-te de soare pe toată durata tratamentului.",
      },
      {
        question: "Care e diferența dintre doxiciclină și limeciclină?",
        answer:
          "Ambele sunt preferate de ghidul european în acnee; limeciclina are o fototoxicitate mai mică decât doxiciclina {{cite:euroguiderm-acne-2025}}. Alegerea o face medicul.",
      },
    ],
    sourceIds: ["euroguiderm-acne-2025", "mediately-doxiciclina"],
    limitations: limits("un antibiotic"),
    related: [hub, tratament, retinoizi, bpo, isotretinoin],
  }),
  medicine({
    slug: "isotretinoin",
    drug: { activeIngredient: "isotretinoin", prescriptionStatus: "PrescriptionOnly" },
    title: "Isotretinoin",
    metaTitle: "Isotretinoin: ce trebuie să știi",
    metaDescription:
      "Informații despre isotretinoinul oral în acneea severă: când se folosește, programul de prevenire a sarcinii, starea emoțională. Telegen nu îl prescrie.",
    h1: "Isotretinoin: informații despre tratament",
    summary:
      "Isotretinoinul oral este tratamentul recomandat puternic de ghidul european pentru formele severe de acnee și are cea mai mare eficacitate dintre opțiuni {{cite:euroguiderm-acne-2025}}. Se folosește sub supraveghere atentă, cu un program obligatoriu de prevenire a sarcinii la femeile care pot rămâne însărcinate {{cite:ema-retinoids-2018}}. Telegen nu prescrie isotretinoin.",
    sections: [
      {
        id: "cand",
        heading: "Când se folosește isotretinoinul",
        blocks: [
          {
            type: "p",
            text: "Ghidul european recomandă puternic isotretinoinul oral în acneea papulo-pustuloasă severă sau nodulară moderată și în acneea nodulară severă sau conglobată {{cite:euroguiderm-acne-2025}}. Dintre toate opțiunile pentru acnee, are cea mai mare eficacitate {{cite:euroguiderm-acne-2025}}.",
          },
          {
            type: "p",
            text: "Despre aceste forme scriem în pagina despre [tipurile de acnee](/acnee/tipuri).",
          },
        ],
      },
      {
        id: "telegen",
        heading: "De ce Telegen nu prescrie isotretinoin",
        blocks: [
          {
            type: "p",
            text: "Isotretinoinul cere o urmărire atentă și un program obligatoriu de prevenire a sarcinii {{cite:ema-retinoids-2018}}. În Marea Britanie, de exemplu, poate fi prescris doar de un medic specialist {{cite:nhs-acne-treatment}}. În România se eliberează pe bază de prescripție medicală {{cite:anmdm-isotretinoin}}.",
          },
          {
            type: "p",
            text: "Telegen nu prescrie isotretinoin. Dacă medicul consideră, după evaluare, că acneea ta are nevoie de el, te îndrumă către un medic dermatolog în persoană, care îl poate prescrie și urmări.",
          },
        ],
      },
      {
        id: "sarcina",
        heading: "Programul de prevenire a sarcinii",
        blocks: [
          {
            type: "p",
            text: "În 2018, la nivel european, s-a decis că retinoizii luați pe gură (isotretinoin, acitretin, alitretinoin) trebuie folosiți de femeile care pot avea copii doar în condițiile unui program de prevenire a sarcinii {{cite:ema-retinoids-2018}}. Programul cere:",
          },
          {
            type: "list",
            items: [
              "cel puțin o metodă eficientă de contracepție în timpul tratamentului și după el;",
              "teste de sarcină înainte, în timpul și după tratament;",
              "un formular prin care pacienta confirmă că a primit informațiile;",
              "un card de reamintire pentru pacientă {{cite:ema-retinoids-2018}}.",
            ],
          },
          {
            type: "callout",
            tone: "caution",
            title: "Dacă bănuiești o sarcină",
            text: "Dacă iei isotretinoin și bănuiești că ești însărcinată, anunță imediat medicul care ți l-a prescris {{cite:ema-retinoids-2018}}.",
          },
        ],
      },
      {
        id: "dispozitie",
        heading: "Isotretinoinul și starea emoțională",
        blocks: [
          {
            type: "p",
            text: "Datele disponibile nu au putut stabili dacă riscul de probleme psihice se datorează retinoizilor. Ca măsură de precauție, în informațiile retinoizilor luați pe gură a fost adăugat un avertisment despre posibila depresie, anxietate și schimbări ale dispoziției {{cite:ema-retinoids-2018}}.",
          },
          {
            type: "callout",
            tone: "caution",
            title: "Când ceri ajutor imediat",
            text: "Dacă în timpul tratamentului observi tristețe persistentă, anxietate, schimbări ale dispoziției sau gânduri de a-ți face rău, spune imediat medicului {{cite:ema-retinoids-2018}}. Dacă ești în pericol imediat, sună la 112.",
          },
        ],
      },
      {
        id: "topici",
        heading: "Diferența față de retinoizii aplicați pe piele",
        blocks: [
          {
            type: "p",
            text: "Retinoizii aplicați pe piele, cum este adapalenul, sunt și ei contraindicați în sarcină, dar pentru ei nu a fost considerat necesar avertismentul privind starea emoțională {{cite:ema-retinoids-2018}}. Detalii pe pagina despre [adapalen și tretinoin](/tratamente/adapalen).",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Pot primi isotretinoin prin Telegen?",
        answer:
          "Nu. Isotretinoinul se folosește sub urmărire atentă, cu program obligatoriu de prevenire a sarcinii {{cite:ema-retinoids-2018}}. Dacă ai nevoie de el, medicul te îndrumă către un dermatolog în persoană.",
      },
      {
        question: "Cui se aplică programul de prevenire a sarcinii?",
        answer:
          "Femeilor care pot rămâne însărcinate și iau un retinoid pe gură, cum este isotretinoinul {{cite:ema-retinoids-2018}}.",
      },
      {
        question: "Isotretinoinul provoacă depresie?",
        answer:
          "Datele nu au putut stabili dacă riscul se datorează retinoizilor. Ca precauție, informațiile medicamentului avertizează despre posibila depresie, anxietate și schimbări ale dispoziției {{cite:ema-retinoids-2018}}. Orice schimbare trebuie spusă medicului.",
      },
      {
        question: "Retinoizii aplicați pe piele au aceleași riscuri?",
        answer:
          "Nu în totalitate. Sunt și ei contraindicați în sarcină, dar nu au nevoie de avertismentul privind starea emoțională {{cite:ema-retinoids-2018}}.",
      },
    ],
    sourceIds: ["euroguiderm-acne-2025", "ema-retinoids-2018", "nhs-acne-treatment", "anmdm-isotretinoin"],
    limitations:
      "Pagina are scop exclusiv informativ și nu reprezintă o recomandare sau promovare a unui medicament. Telegen nu prescrie isotretinoin. Nu conține doze. Isotretinoinul se folosește doar sub supravegherea medicului, conform prospectului.",
    related: [hub, tratament, tipuri, retinoizi, antibiotice],
  }),
];
