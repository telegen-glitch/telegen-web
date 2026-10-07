import type { Condition, MedicalDoc, RelatedLink } from "../types";

/**
 * Acne (CLAUDE.md 7c). Written on 2026-10-07 from the source pack in docs/sources/acne.md
 * (EuroGuiDerm 2025 as the primary guideline; NHS and DermNet for practical information).
 * Claims the pack does not support are left out. Medicine names never appear in headings,
 * the hero or calls to action (section 9.4).
 */
const base = "/acnee";

const disclaimer =
  "Informațiile de pe această pagină au scop educativ și nu înlocuiesc un diagnostic pus de medic. Nu începe și nu opri un tratament fără recomandarea unui medic. Dacă ai noduli dureroși, cicatrici sau te simți rău, mergi la un medic dermatolog în persoană.";

const hub: RelatedLink = {
  href: base,
  label: "Acneea: privire de ansamblu",
  description: "Ce este, cine o face și cum se tratează.",
};
const link = {
  tipuri: {
    href: `${base}/tipuri`,
    label: "Tipurile de acnee",
    description: "Cum se judecă forma și severitatea.",
  },
  cauze: {
    href: `${base}/cauze`,
    label: "Cauzele acneei",
    description: "Sebumul, porii, bacteriile și inflamația.",
  },
  tratament: {
    href: `${base}/tratament`,
    label: "Tratamentul acneei, pas cu pas",
    description: "De la geluri la tratament pe gură.",
  },
  cicatrici: {
    href: `${base}/cicatrici`,
    label: "Cicatricile de acnee",
    description: "De ce apar și cum le previi.",
  },
  retinoizi: { href: "/tratamente/adapalen", label: "Adapalen și tretinoin: informații" },
  bpo: { href: "/tratamente/peroxid-de-benzoil", label: "Peroxid de benzoil: informații" },
  antibiotice: {
    href: "/tratamente/doxiciclina-limeciclina",
    label: "Doxiciclină și limeciclină: informații",
  },
  isotretinoin: { href: "/tratamente/isotretinoin", label: "Isotretinoin: informații" },
} satisfies Record<string, RelatedLink>;

const dates = { publishedAt: "2026-10-07", updatedAt: "2026-10-07" } as const;

const inPersonCallout = {
  type: "callout" as const,
  tone: "caution" as const,
  title: "Când ai nevoie de consult în persoană",
  text: "Mergi la un medic dermatolog în persoană dacă ai umflături mari, adânci și dureroase (noduli), dacă acneea îți lasă cicatrici, dacă s-a întins mult pe spate sau pe piept, dacă ești însărcinată sau plănuiești o sarcină, dacă acneea îți afectează mult starea emoțională, dacă ai febră ori te simți rău odată cu acneea sau dacă ai făcut brusc o acnee severă la vârstă adultă.",
};

const subpage = (
  doc: Omit<MedicalDoc, "kind" | "path" | "conditionSlug" | "status" | "publishedAt" | "updatedAt">,
): MedicalDoc => ({
  kind: "subpage",
  path: `${base}/${doc.slug}`,
  conditionSlug: "acnee",
  status: "published",
  ...dates,
  ...doc,
});

const tipuri = subpage({
  slug: "tipuri",
  graphRole: "types",
  title: "Tipurile de acnee",
  metaTitle: "Tipuri de acnee și cum le recunoști",
  metaDescription:
    "Cum recunoști tipurile de acnee și de ce contează pentru tratament: comedonală, papulo-pustuloasă, nodulară sau conglobată și acneea la vârsta adultă.",
  h1: "Tipurile de acnee",
  summary:
    "Ghidul european împarte acneea în patru forme: comedonală; papulo-pustuloasă ușoară până la moderată; papulo-pustuloasă severă sau nodulară moderată; nodulară severă sau conglobată {{cite:euroguiderm-acne-2025}}. Forma se stabilește după tipul leziunilor, adâncimea lor și cicatrici. Ea decide tratamentul: cu cât acneea este mai severă, cu atât crește rolul tratamentului pe gură.",
  sections: [
    {
      id: "leziuni",
      heading: "Cum arată leziunile de acnee",
      blocks: [
        {
          type: "p",
          text: "Acneea este o boală polimorfă: pe aceeași piele pot apărea în același timp mai multe tipuri de leziuni {{cite:euroguiderm-acne-2025}}. Medicii le numesc astfel {{cite:dermnet-acne}}:",
        },
        {
          type: "list",
          items: [
            "**comedoane deschise**, adică punctele negre;",
            "**comedoane închise**, adică punctele albe;",
            "**papule**, coșuri roșii, ridicate, fără puroi;",
            "**pustule**, coșuri cu puroi;",
            "**noduli** și **pseudochisturi**, umflături mari, adânci, adesea dureroase.",
          ],
        },
        {
          type: "p",
          text: "După ce leziunile se vindecă pot rămâne cicatrici, pete roșii sau pete pigmentate {{cite:dermnet-acne}}. Despre ele scriem pe pagina despre [cicatricile de acnee](/acnee/cicatrici).",
        },
      ],
    },
    {
      id: "comedonala",
      heading: "Ce este acneea comedonală",
      blocks: [
        {
          type: "p",
          text: "În acneea comedonală predomină leziunile neinflamate: puncte negre și puncte albe, fără coșuri roșii semnificative {{cite:euroguiderm-acne-2025}}. Este forma cea mai ușoară. Ghidul european nu recomandă aici tratamente pe gură, ci doar tratamente aplicate pe piele, descrise în [tratamentul acneei, pas cu pas](/acnee/tratament).",
        },
      ],
    },
    {
      id: "papulo-pustuloasa",
      heading: "Ce este acneea papulo-pustuloasă",
      blocks: [
        {
          type: "p",
          text: "Când apar coșuri roșii (papule) și coșuri cu puroi (pustule), acneea devine inflamatorie. Ghidul european o împarte în două trepte: ușoară până la moderată și severă. Forma severă este grupată, pentru alegerea tratamentului, cu acneea nodulară moderată {{cite:euroguiderm-acne-2025}}.",
        },
        {
          type: "p",
          text: "Diferența dintre trepte contează: în forma ușoară și moderată, tratamentul de bază este aplicat pe piele, iar în cea severă ghidul recomandă de la început un tratament pe gură {{cite:euroguiderm-acne-2025}}.",
        },
      ],
    },
    {
      id: "nodulara",
      heading: "Ce este acneea nodulară și conglobată",
      blocks: [
        {
          type: "p",
          text: "Acneea nodulară severă și acneea conglobată sunt formele cele mai grave. Au noduli adânci, mai mari de 5 mm, distrug țesutul pielii și lasă cicatrici {{cite:euroguiderm-acne-2025}}. Pentru ele, ghidul european recomandă puternic un tratament pe gură care se folosește sub supravegherea medicului specialist, prezentat pe pagina despre [isotretinoin](/tratamente/isotretinoin).",
        },
        {
          type: "p",
          text: "În limbajul obișnuit, aceste forme sunt numite adesea „acnee chistică”. Telegen nu le tratează la distanță: ele au nevoie de examinarea unui medic dermatolog în persoană.",
        },
      ],
    },
    {
      id: "adulti",
      heading: "Acneea la vârsta adultă",
      blocks: [
        {
          type: "p",
          text: "Acneea nu ține doar de adolescență. La o parte importantă dintre oameni continuă și după această vârstă {{cite:euroguiderm-acne-2025}}, iar boala afectează ambele sexe și toate rasele {{cite:dermnet-acne}}.",
        },
        {
          type: "p",
          text: "La femei, ghidul european include și opțiuni hormonale de tratament {{cite:euroguiderm-acne-2025}}. O acnee severă apărută brusc la vârsta adultă trebuie văzută de un medic dermatolog în persoană.",
        },
      ],
    },
    {
      id: "severitate",
      heading: "Cum se judecă severitatea acneei",
      blocks: [
        {
          type: "p",
          text: "Severitatea se judecă după tipul leziunilor (neinflamate sau inflamate), după prezența nodulilor și a cicatricilor și după cât de mult s-a întins acneea. Când acneea cuprinde și spatele sau pieptul, ghidul european favorizează folosirea mai devreme a unui tratament pe gură {{cite:euroguiderm-acne-2025}}.",
        },
        {
          type: "p",
          text: "Contează și felul în care te afectează. Acneea poate aduce jenă, retragere socială, anxietate, furie sau depresie {{cite:dermnet-acne}}. Spune-i medicului dacă te afectează, chiar dacă leziunile par puține.",
        },
        inPersonCallout,
      ],
    },
  ],
  faqs: [
    {
      question: "Pot avea mai multe tipuri de acnee în același timp?",
      answer:
        "Da. Acneea este polimorfă: aceeași persoană poate avea simultan puncte negre, puncte albe, papule și pustule {{cite:euroguiderm-acne-2025}}. Medicul încadrează forma după leziunile care predomină și după cele mai severe.",
    },
    {
      question: "Acneea chistică este același lucru cu acneea nodulară?",
      answer:
        "„Acnee chistică” este o denumire uzuală pentru formele cu leziuni mari și adânci. Ghidul european le descrie ca acnee nodulară sau conglobată {{cite:euroguiderm-acne-2025}}, iar leziunile care seamănă cu chisturile se numesc pseudochisturi {{cite:dermnet-acne}}.",
    },
    {
      question: "Acneea de pe spate se tratează la fel ca cea de pe față?",
      answer:
        "Principiile sunt aceleași, dar o acnee întinsă pe spate sau pe piept favorizează folosirea mai devreme a unui tratament pe gură {{cite:euroguiderm-acne-2025}}. Medicul decide după întinderea și severitatea ei.",
    },
    {
      question: "Petele rămase după coșuri sunt cicatrici?",
      answer:
        "Nu neapărat. După leziuni pot rămâne pete roșii sau pete pigmentate, diferite de cicatrici {{cite:dermnet-acne}}. Petele pigmentate care rămân după ce acneea s-a liniștit îi îngrijorează pe mulți oameni {{cite:dermnet-acne-scars}}; discută-le cu medicul.",
    },
  ],
  sourceIds: ["euroguiderm-acne-2025", "dermnet-acne", "dermnet-acne-scars"],
  limitations: disclaimer,
  related: [hub, link.cauze, link.tratament, link.cicatrici, link.isotretinoin],
});

const cauze = subpage({
  slug: "cauze",
  graphRole: "causes",
  title: "Cauzele acneei",
  metaTitle: "Cauzele acneei: de ce apar coșurile",
  metaDescription:
    "De ce apare acneea: sebumul în exces, porii blocați, dezechilibrul bacteriilor de pe piele și inflamația. Ce spun dovezile despre alimentație.",
  h1: "Cauzele acneei",
  summary:
    "Acneea apare din combinația a patru factori: producția crescută de sebum, modificarea felului în care se reînnoiesc celulele din porul pielii, dezechilibrul bacteriilor de pe piele, mai ales Cutibacterium acnes, și eliberarea de substanțe care întrețin inflamația {{cite:euroguiderm-acne-2025}}. Pentru alimentație, dovezile sunt limitate: nu există o dietă specială dovedită pentru acnee.",
  sections: [
    {
      id: "patru-factori",
      heading: "De ce apare acneea",
      blocks: [
        {
          type: "p",
          text: "Acneea pornește din foliculul pilosebaceu, porul în care se deschid firul de păr și glanda sebacee. Ghidul european descrie patru factori principali care acționează împreună {{cite:euroguiderm-acne-2025}}:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "**producția crescută de sebum**, grăsimea naturală a pielii;",
            "**cheratinizarea foliculară modificată**: celulele care căptușesc porul se reînnoiesc și se elimină altfel, iar porul se poate bloca;",
            "**dezechilibrul microbiomului pielii**, adică al bacteriilor care trăiesc normal pe piele;",
            "**eliberarea de mediatori ai inflamației**, substanțe care produc roșeața și umflarea.",
          ],
        },
        {
          type: "p",
          text: "Tratamentele acționează asupra unuia sau mai multora dintre acești factori. De aceea, în multe forme de acnee se folosesc combinații, descrise în [tratamentul acneei, pas cu pas](/acnee/tratament).",
        },
      ],
    },
    {
      id: "bacterii",
      heading: "Ce rol au bacteriile de pe piele",
      blocks: [
        {
          type: "p",
          text: "Bacteria Cutibacterium acnes trăiește normal pe piele. În acnee, echilibrul se schimbă: crește ponderea unui anumit tip al acestei bacterii (filotipul IA1), iar diversitatea bacteriilor de pe piele scade {{cite:euroguiderm-acne-2025}}.",
        },
        {
          type: "p",
          text: "Bacteriile sunt însă doar unul dintre cei patru factori. De aceea, ghidul european nu recomandă antibioticele singure: atunci când sunt necesare, ele se asociază cu un tratament aplicat pe piele și se folosesc pe o perioadă limitată {{cite:euroguiderm-acne-2025}}.",
        },
      ],
    },
    {
      id: "inflamatie",
      heading: "De ce se inflamează coșurile",
      blocks: [
        {
          type: "p",
          text: "Pe lângă leziunile neinflamate (punctele negre și albe), acneea are și leziuni inflamate: papule, pustule și, în formele severe, noduli adânci. La apariția lor contribuie mediatorii inflamației eliberați în piele {{cite:euroguiderm-acne-2025}}. Cu cât inflamația durează mai mult, cu atât crește riscul de cicatrici {{cite:euroguiderm-acne-2025}}.",
        },
        {
          type: "p",
          text: "Despre formele de acnee și despre cum se judecă severitatea scriem în pagina despre [tipurile de acnee](/acnee/tipuri).",
        },
      ],
    },
    {
      id: "alimentatie",
      heading: "Ce legătură are alimentația cu acneea",
      blocks: [
        {
          type: "p",
          text: "Ghidul european spune că, în prezent, nu există suficiente dovezi pentru o dietă specială în tratamentul acneei, dincolo de recomandarea unei alimentații echilibrate {{cite:euroguiderm-acne-2025}}.",
        },
        {
          type: "p",
          text: "Studiile au găsit o asociere între acnee mai severă și alimentația cu încărcătură glicemică mare (de exemplu multe dulciuri și produse rafinate) sau consumul de lactate {{cite:euroguiderm-acne-2025}}. O asociere nu înseamnă că aceste alimente provoacă acneea; nu are rost să elimini singur grupe întregi de alimente fără sfatul unui medic.",
        },
      ],
    },
    {
      id: "stoarcere",
      heading: "Ce poate lăsa urme: stoarcerea și fumatul",
      blocks: [
        {
          type: "p",
          text: "Stoarcerea sau ciupirea coșurilor și fumatul pot crește riscul de cicatrici {{cite:dermnet-acne-scars}}. Cicatricile de acnee sunt de obicei permanente {{cite:dermnet-acne-scars}}, așa că merită să lași leziunile în pace și să tratezi acneea din timp.",
        },
        inPersonCallout,
      ],
    },
  ],
  faqs: [
    {
      question: "Laptele și dulciurile provoacă acnee?",
      answer:
        "Nu este dovedit. Alimentația cu încărcătură glicemică mare și lactatele sunt asociate cu o acnee mai severă, dar asocierea nu arată că ele o provoacă, iar ghidul european nu recomandă o dietă specială, ci doar o alimentație echilibrată {{cite:euroguiderm-acne-2025}}.",
    },
    {
      question: "Acneea poate apărea și după 25 de ani?",
      answer:
        "Da. La o parte importantă dintre oameni, acneea continuă după adolescență {{cite:euroguiderm-acne-2025}}, iar ea apare și la adulți {{cite:dermnet-acne}}. O acnee severă apărută brusc la vârsta adultă trebuie văzută de un medic dermatolog în persoană.",
    },
    {
      question: "Dacă stoarcem coșurile, trec mai repede?",
      answer:
        "Nu e o idee bună: stoarcerea poate crește riscul de cicatrici {{cite:dermnet-acne-scars}}, iar cicatricile rămân de obicei toată viața.",
    },
    {
      question: "Dacă bacteriile sunt implicate, antibioticele rezolvă acneea?",
      answer:
        "Bacteriile sunt doar unul dintre cei patru factori ai acneei. De aceea, antibioticele se folosesc doar în combinație cu un tratament aplicat pe piele și pe o durată limitată, de regulă cel mult trei luni pentru cele luate pe gură {{cite:euroguiderm-acne-2025}}.",
    },
  ],
  sourceIds: ["euroguiderm-acne-2025", "dermnet-acne-scars", "dermnet-acne"],
  limitations: disclaimer,
  related: [hub, link.tipuri, link.tratament, link.cicatrici, link.antibiotice],
});

const tratament = subpage({
  slug: "tratament",
  graphRole: "treatment",
  title: "Tratamentul acneei",
  metaTitle: "Tratamentul acneei, pas cu pas",
  metaDescription:
    "Cum se tratează acneea pas cu pas, după ghidul european: tratamente aplicate pe piele, combinații, tratament pe gură și când e nevoie de dermatolog.",
  h1: "Tratamentul acneei, pas cu pas",
  summary:
    "Tratamentul acneei se alege în trepte, după formă și severitate. Formele ușoare se tratează de obicei cu geluri sau creme, singure ori în combinații fixe; formele severe pot avea nevoie de tratament pe gură, unele doar sub supravegherea specialistului {{cite:euroguiderm-acne-2025}}. Multe tratamente au nevoie de 2–3 luni ca să înceapă să funcționeze {{cite:nhs-acne-treatment}}.",
  sections: [
    {
      id: "trepte",
      heading: "Cum se alege tratamentul acneei",
      blocks: [
        {
          type: "p",
          text: "Ghidul european își formulează recomandările în trei trepte de tărie: „recomandat puternic”, „poate fi recomandat” și „poate fi luat în considerare”. Pe scurt, pentru fiecare formă de acnee {{cite:euroguiderm-acne-2025}}:",
        },
        {
          type: "list",
          items: [
            "**Acneea comedonală:** niciun tratament nu are recomandare puternică. Pot fi recomandate un retinoid topic (de preferat adapalenul), acidul azelaic sau peroxidul de benzoil.",
            "**Acneea papulo-pustuloasă ușoară până la moderată:** sunt recomandate puternic combinațiile fixe adapalen + peroxid de benzoil sau peroxid de benzoil + clindamicină. Alternative: acid azelaic, peroxid de benzoil, un retinoid topic, combinația fixă clindamicină + tretinoin sau un antibiotic pe gură asociat cu adapalen.",
            "**Acneea papulo-pustuloasă severă sau nodulară moderată:** este recomandat puternic isotretinoinul oral. Alternativă: un antibiotic pe gură asociat cu un tratament aplicat pe piele.",
            "**Acneea nodulară severă sau conglobată:** este recomandat puternic isotretinoinul oral. Alternativă: un antibiotic pe gură asociat cu acid azelaic sau cu combinația adapalen + peroxid de benzoil.",
          ],
        },
        {
          type: "p",
          text: "Despre fiecare substanță găsești informații neutre pe paginile despre [adapalen și tretinoin](/tratamente/adapalen), [peroxid de benzoil](/tratamente/peroxid-de-benzoil), [doxiciclină și limeciclină](/tratamente/doxiciclina-limeciclina) și [isotretinoin](/tratamente/isotretinoin). Ce ți se potrivește stabilește medicul, după evaluare.",
        },
      ],
    },
    {
      id: "local",
      heading: "Tratamentele aplicate pe piele",
      blocks: [
        {
          type: "p",
          text: "Dintre retinoizii topici, ghidul european preferă adapalenul în locul tretinoinului și al isotretinoinului topic, pentru că este mai bine tolerat. Acidul azelaic este, de asemenea, mai bine tolerat decât peroxidul de benzoil și tretinoinul {{cite:euroguiderm-acne-2025}}.",
        },
        {
          type: "p",
          text: "Pentru peroxidul de benzoil, două studii mari despre o posibilă legătură cu benzenul și leucemia susțin siguranța folosirii obișnuite {{cite:euroguiderm-acne-2025}}. În primele săptămâni, tratamentele locale pot usca pielea și pot produce arsură, mâncărime sau înțepături; peroxidul de benzoil decolorează părul și textilele și crește sensibilitatea la soare {{cite:nhs-acne-treatment}}.",
        },
      ],
    },
    {
      id: "oral",
      heading: "Când se ajunge la tratament pe gură",
      blocks: [
        {
          type: "p",
          text: "Ghidul european include antibioticele pe gură doar în combinație cu un tratament aplicat pe piele, niciodată singure. Dintre ele, doxiciclina și limeciclina sunt preferate minociclinei și tetraciclinei, pentru că minociclina are efecte adverse mai grave {{cite:euroguiderm-acne-2025}}.",
        },
        {
          type: "p",
          text: "Pentru formele severe, isotretinoinul oral are cea mai mare eficacitate dintre opțiuni {{cite:euroguiderm-acne-2025}}. Se folosește doar cu un program obligatoriu de prevenire a sarcinii la femeile care pot rămâne însărcinate {{cite:ema-retinoids-2018}} și sub supravegherea medicului specialist. Telegen nu prescrie isotretinoin: dacă medicul consideră că ai nevoie de el, te îndrumă către un medic dermatolog, în persoană.",
        },
      ],
    },
    {
      id: "antibiotice",
      heading: "De ce se limitează antibioticele",
      blocks: [
        {
          type: "p",
          text: "Folosirea îndelungată a antibioticelor favorizează rezistența bacteriilor. De aceea, ghidul european recomandă ca antibioticele pe gură să fie folosite în acnee cel mult trei luni; mai mult doar ca excepție, când tratamentele locale nu ajung, iar isotretinoinul sau tratamentul hormonal nu sunt potrivite {{cite:euroguiderm-acne-2025}}.",
        },
        {
          type: "p",
          text: "Antibioticele aplicate pe piele nu se recomandă singure {{cite:euroguiderm-acne-2025}}. Când fac parte dintr-o combinație, cura obișnuită durează 6–8 săptămâni, după care se oprește, tot ca să limiteze rezistența {{cite:nhs-acne-treatment}}.",
        },
      ],
    },
    {
      id: "femei",
      heading: "Opțiuni de tratament pentru femei",
      blocks: [
        {
          type: "p",
          text: "La femei, ghidul european include și opțiuni hormonale: contraceptive hormonale (în formele mai severe, cele cu efect antiandrogenic) sau spironolactona, folosită în afara indicației aprobate {{cite:euroguiderm-acne-2025}}. Pilula contraceptivă combinată poate avea nevoie de până la un an pentru efectul complet {{cite:nhs-acne-treatment}}.",
        },
        {
          type: "p",
          text: "În sarcină, retinoizii topici nu sunt potriviți {{cite:nhs-acne-treatment}}. Opțiunile care pot fi luate în considerare sunt acidul azelaic și peroxidul de benzoil aplicate pe piele, eventual cu clindamicină sau eritromicină, iar pe gură zincul sau azitromicina {{cite:euroguiderm-acne-2025}}. Orice tratament în sarcină se decide împreună cu medicul.",
        },
      ],
    },
    {
      id: "rabdare",
      heading: "Cât durează până funcționează tratamentul",
      blocks: [
        {
          type: "p",
          text: "Multe tratamente pentru acnee au nevoie de 2–3 luni ca să înceapă să funcționeze {{cite:nhs-acne-treatment}}. Primele săptămâni pot aduce mai degrabă iritație decât îmbunătățire, așa că merită să folosești tratamentul cum ți-a fost recomandat și să-i spui medicului dacă nu îl tolerezi, în loc să-l oprești singur.",
        },
        inPersonCallout,
      ],
    },
  ],
  faqs: [
    {
      question: "Care este cel mai eficient tratament pentru acnee?",
      answer:
        "Depinde de formă. În acneea ușoară și moderată, ghidul european recomandă puternic combinațiile fixe aplicate pe piele; în formele severe, isotretinoinul oral are cea mai mare eficacitate {{cite:euroguiderm-acne-2025}}, dar se folosește doar sub supraveghere de specialitate, cu program de prevenire a sarcinii {{cite:ema-retinoids-2018}}.",
    },
    {
      question: "Pot lua un antibiotic singur pentru acnee?",
      answer:
        "Nu este recomandat. În ghidul european, antibioticele pe gură apar doar în combinație cu un tratament aplicat pe piele și, de regulă, cel mult trei luni, iar antibioticele aplicate pe piele nu se recomandă singure {{cite:euroguiderm-acne-2025}}.",
    },
    {
      question: "De ce mă ustură pielea la începutul tratamentului?",
      answer:
        "Tratamentele locale pot usca pielea și pot produce arsură, mâncărime sau înțepături, mai ales la început {{cite:nhs-acne-treatment}}. Spune-i medicului dacă iritația te împiedică să continui; uneori se schimbă modul de aplicare sau produsul.",
    },
    {
      question: "Ce tratamente pentru acnee se pot folosi în sarcină?",
      answer:
        "Retinoizii nu sunt potriviți în sarcină {{cite:nhs-acne-treatment}}. Pot fi luate în considerare acidul azelaic și peroxidul de benzoil aplicate pe piele, eventual cu clindamicină sau eritromicină, ori zincul sau azitromicina pe gură {{cite:euroguiderm-acne-2025}}. Decizia o iei împreună cu medicul.",
    },
    {
      question: "Telegen prescrie isotretinoin?",
      answer:
        "Nu. Isotretinoinul se folosește sub supraveghere de specialitate și cu un program obligatoriu de prevenire a sarcinii la femeile care pot rămâne însărcinate {{cite:ema-retinoids-2018}}. Dacă medicul consideră că ai nevoie de el, te îndrumă către un medic dermatolog în persoană.",
    },
  ],
  sourceIds: ["euroguiderm-acne-2025", "nhs-acne-treatment", "ema-retinoids-2018"],
  limitations: disclaimer,
  related: [hub, link.tipuri, link.retinoizi, link.bpo, link.antibiotice, link.isotretinoin],
});

const cicatrici = subpage({
  slug: "cicatrici",
  graphRole: "scars",
  title: "Cicatricile de acnee",
  metaTitle: "Cicatricile de acnee: prevenție și opțiuni",
  metaDescription:
    "De ce lasă acneea cicatrici, ce tipuri există, cum le previi tratând acneea la timp și ce proceduri discuți cu medicul dermatolog în persoană.",
  h1: "Cicatricile de acnee",
  summary:
    "Cicatricile de acnee sunt de obicei permanente, deși se pot ameliora în timp sau cu tratament {{cite:dermnet-acne-scars}}. Cea mai bună prevenție este tratarea acneei la timp: cu cât inflamația durează mai mult, cu atât crește riscul de cicatrici {{cite:euroguiderm-acne-2025}}. Procedurile pentru cicatrici se fac la medicul dermatolog, în persoană, după ce acneea activă a fost tratată.",
  sections: [
    {
      id: "de-ce",
      heading: "De ce lasă acneea cicatrici",
      blocks: [
        {
          type: "p",
          text: "Cicatricile sunt frecvente: ghidul european arată că apar la până la 95% dintre pacienții care ajung la un cabinet de dermatologie {{cite:euroguiderm-acne-2025}}. Riscul ține de durata inflamației: cu cât acneea inflamată durează mai mult și cu cât tratamentul începe mai târziu, cu atât crește probabilitatea unor cicatrici importante {{cite:euroguiderm-acne-2025}}.",
        },
        {
          type: "p",
          text: "Cicatricile apar mai des în acneea moderată și severă, iar fumatul și stoarcerea coșurilor pot crește riscul {{cite:dermnet-acne-scars}}. Ele pot afecta mult aspectul și starea emoțională, chiar și după ce acneea s-a liniștit {{cite:dermnet-acne}}.",
        },
      ],
    },
    {
      id: "tipuri",
      heading: "Ce tipuri de cicatrici de acnee există",
      blocks: [
        {
          type: "p",
          text: "Cele mai frecvente sunt cicatricile atrofice, adâncite, produse de pierderea de colagen. Mai rare sunt cicatricile hipertrofice și cheloidele, care ies în relief {{cite:euroguiderm-acne-2025}}. Cicatricile atrofice au mai multe forme {{cite:dermnet-acne-scars}}:",
        },
        {
          type: "list",
          items: [
            "**cicatrici „ice-pick”**, înguste și adânci, cele mai frecvente: 60–70% dintre cicatricile atrofice {{cite:dermnet-acne-scars}};",
            "**cicatrici „boxcar”**, mai largi, cu margini clare;",
            "**cicatrici „rolling”**, care dau pielii un aspect ondulat.",
          ],
        },
      ],
    },
    {
      id: "pete",
      heading: "Pete sau cicatrici: care e diferența",
      blocks: [
        {
          type: "p",
          text: "Nu tot ce rămâne după acnee este cicatrice. După leziuni pot rămâne și pete roșii sau pete pigmentate, maronii {{cite:dermnet-acne}}. Pigmentarea care persistă după ce acneea s-a liniștit îi îngrijorează pe mulți oameni {{cite:dermnet-acne-scars}}; medicul o deosebește de o cicatrice la examinare și îți spune ce opțiuni există.",
        },
      ],
    },
    {
      id: "preventie",
      heading: "Cum previi cicatricile de acnee",
      blocks: [
        {
          type: "p",
          text: "Tratamentul potrivit, început la timp, în faza activă a acneei, poate reduce frecvența și severitatea cicatricilor {{cite:dermnet-acne-scars}}. Ghidul european spune că prezența cicatricilor susține un tratament mai ferm, început devreme {{cite:euroguiderm-acne-2025}}.",
        },
        {
          type: "list",
          items: [
            "nu amâna tratamentul dacă acneea ta este inflamată sau lasă urme;",
            "nu stoarce și nu ciupi coșurile {{cite:dermnet-acne-scars}};",
            "dacă fumezi, renunțarea la fumat contează și pentru piele {{cite:dermnet-acne-scars}};",
            "dacă ai deja cicatrici, spune-i medicului: asta schimbă alegerea tratamentului {{cite:euroguiderm-acne-2025}}.",
          ],
        },
      ],
    },
    {
      id: "proceduri",
      heading: "Ce opțiuni există pentru cicatricile de acnee",
      blocks: [
        {
          type: "p",
          text: "Există mai multe proceduri pentru cicatrici: laser și alte metode de refacere a suprafeței pielii, peeling chimic, microneedling, substanțe de umplere, subciziune sau excizie. Acneea activă trebuie tratată înainte de a începe tratamentul cicatricilor {{cite:dermnet-acne-scars}}.",
        },
        {
          type: "p",
          text: "Aceste proceduri se fac la medicul dermatolog, în persoană. Telegen nu le oferă. Rolul evaluării online este să tratezi la timp acneea activă, ca să previi cicatrici noi.",
        },
        {
          type: "callout",
          tone: "caution",
          title: "Când ai nevoie de consult în persoană",
          text: "Dacă acneea îți lasă deja cicatrici, dacă ai noduli adânci și dureroși sau dacă vrei să tratezi cicatricile existente, programează un consult la un medic dermatolog. Ai nevoie de un examen clinic.",
        },
      ],
    },
    {
      id: "asteptari",
      heading: "La ce să te aștepți",
      blocks: [
        {
          type: "p",
          text: "Cicatricile de acnee sunt de obicei permanente, deși se pot ameliora spontan în timp sau cu tratament {{cite:dermnet-acne-scars}}. O așteptare realistă este îmbunătățirea aspectului, nu dispariția completă. Discută cu medicul dermatolog ce poate face fiecare procedură în cazul tău.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Cicatricile de acnee dispar de la sine?",
      answer:
        "De obicei nu. Cicatricile de acnee sunt în general permanente, deși se pot ameliora spontan în timp sau cu tratament {{cite:dermnet-acne-scars}}.",
    },
    {
      question: "Pot trata cicatricile cât timp am încă acnee activă?",
      answer:
        "Acneea activă trebuie tratată înainte de a începe tratamentul cicatricilor {{cite:dermnet-acne-scars}}. Tratarea ei la timp previne și apariția unor cicatrici noi.",
    },
    {
      question: "Care sunt cele mai frecvente cicatrici de acnee?",
      answer:
        "Cicatricile atrofice, adâncite, sunt mai frecvente decât cele în relief {{cite:euroguiderm-acne-2025}}. Dintre ele, cele mai frecvente sunt cicatricile „ice-pick”, înguste și adânci {{cite:dermnet-acne-scars}}.",
    },
    {
      question: "Telegen tratează cicatricile de acnee?",
      answer:
        "Nu. Procedurile pentru cicatrici se fac în persoană, la medicul dermatolog. Prin evaluarea Telegen poți trata acneea activă, ceea ce reduce riscul de cicatrici noi {{cite:dermnet-acne-scars}}.",
    },
  ],
  sourceIds: ["dermnet-acne-scars", "euroguiderm-acne-2025", "dermnet-acne"],
  limitations: disclaimer,
  related: [hub, link.tipuri, link.cauze, link.tratament, link.isotretinoin],
});

export const acne: Condition = {
  slug: "acnee",
  basePath: base,
  name: "Acnee",
  shortName: "Acnee",
  medicalName: "Acnee vulgară",
  teaser: "Puncte negre, coșuri și inflamație pe față, spate sau piept, evaluate de un medic dermatolog.",
  inSentence: "acneea",
  presentation: {
    heroAccent: "evaluată de un dermatolog.",
    asideTitle: "Nu știi ce formă de acnee ai?",
    asideAccent: "Un dermatolog îți poate spune.",
    evaluationLabel: "Evaluare dermatologică online",
    mockup: {
      question: "Cum arată, în cea mai mare parte?",
      options: ["Puncte negre sau albe", "Coșuri roșii sau cu puroi", "Pe față și pe spate", "Nu sunt sigur"],
      goal: "Să liniștim inflamația și să prevenim cicatricile",
      checkIn: "Luna 3",
      followUp: "Perfect. În luna 3 facem împreună prima reevaluare.",
    },
  },
  status: "published",
  guideSlugs: [],
  treatmentSlugs: ["adapalen", "peroxid-de-benzoil", "doxiciclina-limeciclina", "isotretinoin"],
  approaches: [
    {
      title: "Tratament local",
      text: "Geluri sau creme aplicate pe piele, singure sau în combinații fixe. Sunt baza tratamentului în acneea ușoară și moderată.",
      href: "/acnee/tratament",
      linkLabel: "Tratamentul acneei, pas cu pas",
    },
    {
      title: "Tratament oral",
      text: "Pentru formele mai severe sau întinse, ghidul european include tratamente pe gură, unele folosite doar sub supravegherea specialistului.",
      href: "/tratamente/doxiciclina-limeciclina",
      linkLabel: "Informații despre antibioticele orale",
    },
    {
      title: "Consult în persoană",
      text: "Nodulii adânci, cicatricile sau acneea apărută brusc și sever la vârstă adultă au nevoie de examinarea unui dermatolog la cabinet.",
      href: "/acnee/cicatrici",
      linkLabel: "Cicatricile de acnee",
    },
  ],
  doc: {
    kind: "condition",
    slug: "acnee",
    path: base,
    // Every term below appears verbatim on the page (tested).
    entity: {
      alternateName: ["acnee vulgară"],
      signOrSymptom: ["puncte negre", "puncte albe", "papule", "pustule", "noduli"],
      riskFactor: ["adolescența"],
      possibleTreatment: ["Tratament local", "Tratament oral"],
    },
    graphRole: "condition",
    conditionSlug: "acnee",
    title: "Acnee",
    metaTitle: "Acneea: cauze, tipuri și tratament",
    metaDescription:
      "Ce este acneea, ce tipuri există, ce o declanșează și cum se tratează în trepte, de la geluri la tratament pe gură. Evaluare dermatologică online.",
    h1: "Acneea",
    summary:
      "Acneea este o boală inflamatorie cronică a pielii, care apare mai ales pe față, cu puncte negre și albe, coșuri roșii, coșuri cu puroi sau noduli {{cite:euroguiderm-acne-2025}}. Este foarte frecventă în adolescență, dar poate continua și la vârsta adultă. Se tratează în trepte, iar tratamentul început la timp reduce riscul de cicatrici {{cite:dermnet-acne-scars}}.",
    sections: [
      {
        id: "ce-este",
        heading: "Ce este acneea",
        blocks: [
          {
            type: "p",
            text: "Acneea vulgară este o boală inflamatorie cronică a pielii, cu aspect variat. În 99% dintre cazuri apare pe față, dar poate cuprinde și spatele și pieptul {{cite:euroguiderm-acne-2025}}. Pe piele se văd, în proporții diferite:",
          },
          {
            type: "list",
            items: [
              "**puncte negre** și **puncte albe** (comedoane deschise și închise), leziuni neinflamate;",
              "**papule**, coșuri roșii, și **pustule**, coșuri cu puroi;",
              "**noduli**, umflături mari, adânci și adesea dureroase, în formele severe {{cite:euroguiderm-acne-2025}}.",
            ],
          },
          {
            type: "p",
            text: "Acneea apare din combinația a patru factori: sebum în exces, pori care se blochează, un dezechilibru al bacteriilor de pe piele și inflamație {{cite:euroguiderm-acne-2025}}. Îi explicăm pe rând în pagina despre [cauzele acneei](/acnee/cauze).",
          },
        ],
      },
      {
        id: "cine",
        heading: "Cine face acnee",
        blocks: [
          {
            type: "p",
            text: "Acneea este foarte frecventă. În țările industrializate occidentale, între 50% și 95% dintre adolescenți au acnee; dacă se exclud formele ușoare, proporția este de 20%–35% {{cite:euroguiderm-acne-2025}}. Adolescența este perioada în care apare cel mai des, dar la o parte importantă dintre oameni acneea continuă și după această vârstă {{cite:euroguiderm-acne-2025}}.",
          },
          {
            type: "p",
            text: "Acneea afectează ambele sexe și toate rasele {{cite:dermnet-acne}}. Nu este doar o problemă de aspect: poate aduce jenă, retragere socială, anxietate sau depresie, iar cicatricile pot afecta mult încrederea în sine {{cite:dermnet-acne}}.",
          },
        ],
      },
      {
        id: "tipuri",
        heading: "Ce tipuri de acnee există",
        blocks: [
          {
            type: "p",
            text: "Pentru alegerea tratamentului, ghidul european folosește patru forme {{cite:euroguiderm-acne-2025}}:",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "**acneea comedonală**, cu puncte negre și albe, fără inflamație importantă;",
              "**acneea papulo-pustuloasă ușoară până la moderată**;",
              "**acneea papulo-pustuloasă severă sau nodulară moderată**;",
              "**acneea nodulară severă sau conglobată**, cu noduli adânci de peste 5 mm și cicatrici.",
            ],
          },
          {
            type: "p",
            text: "Cum recunoști forma și cum se judecă severitatea afli în pagina despre [tipurile de acnee](/acnee/tipuri).",
          },
        ],
      },
      {
        id: "tratament",
        heading: "Cum se tratează acneea",
        blocks: [
          {
            type: "p",
            text: "Tratamentul se alege în trepte. În formele ușoare și moderate, baza o formează tratamentele aplicate pe piele, singure sau în combinații fixe; în formele severe, ghidul european recomandă un tratament pe gură {{cite:euroguiderm-acne-2025}}. Antibioticele se folosesc doar în combinație cu un tratament local și pe o durată limitată, ca să nu favorizeze rezistența bacteriilor {{cite:euroguiderm-acne-2025}}.",
          },
          {
            type: "p",
            text: "Pe site prezentăm substanțele active doar informativ: [adapalenul și tretinoinul](/tratamente/adapalen), [peroxidul de benzoil](/tratamente/peroxid-de-benzoil), [doxiciclina și limeciclina](/tratamente/doxiciclina-limeciclina) și [isotretinoinul](/tratamente/isotretinoin), pe care Telegen nu îl prescrie. Toate treptele sunt explicate în [tratamentul acneei, pas cu pas](/acnee/tratament).",
          },
          {
            type: "p",
            text: "Răbdarea contează: multe tratamente au nevoie de 2–3 luni ca să înceapă să funcționeze {{cite:nhs-acne-treatment}}.",
          },
        ],
      },
      {
        id: "cicatrici",
        heading: "De ce contează tratamentul la timp",
        blocks: [
          {
            type: "p",
            text: "Cu cât acneea inflamată durează mai mult, cu atât crește riscul de cicatrici, iar întârzierea tratamentului face mai probabile cicatricile importante {{cite:euroguiderm-acne-2025}}. Cicatricile de acnee sunt de obicei permanente {{cite:dermnet-acne-scars}}. Despre tipurile lor și despre prevenție scriem în pagina despre [cicatricile de acnee](/acnee/cicatrici).",
          },
        ],
      },
      {
        id: "consult",
        heading: "Când ai nevoie de consult în persoană",
        blocks: [
          {
            type: "p",
            text: "Unele situații nu se potrivesc unei evaluări la distanță. Formele cu noduli au nevoie de tratamente folosite sub supraveghere de specialitate {{cite:euroguiderm-acne-2025}}, cicatricile cer un tratament început devreme {{cite:euroguiderm-acne-2025}}, iar în sarcină retinoizii nu sunt potriviți {{cite:nhs-acne-treatment}}.",
          },
          inPersonCallout,
        ],
      },
    ],
    faqs: [
      {
        question: "Acneea trece de la sine?",
        answer:
          "Uneori se liniștește după adolescență, dar la o parte importantă dintre oameni continuă și la vârsta adultă {{cite:euroguiderm-acne-2025}}. Pentru că acneea inflamată netratată poate lăsa cicatrici permanente {{cite:dermnet-acne-scars}}, merită tratată la timp.",
      },
      {
        question: "Ce legătură are alimentația cu acneea?",
        answer:
          "Nu există suficiente dovezi pentru o dietă specială în acnee, dincolo de o alimentație echilibrată. Alimentația cu încărcătură glicemică mare și lactatele sunt asociate cu o acnee mai severă, dar asocierea nu dovedește că ele o provoacă {{cite:euroguiderm-acne-2025}}.",
      },
      {
        question: "În cât timp se vede efectul tratamentului?",
        answer:
          "Multe tratamente au nevoie de 2–3 luni ca să înceapă să funcționeze {{cite:nhs-acne-treatment}}. Mai jos găsești la ce să te aștepți, lună de lună.",
      },
      {
        question: "Antibioticele sunt o soluție pe termen lung?",
        answer:
          "Nu. Ghidul european recomandă antibioticele pe gură doar în combinație cu un tratament aplicat pe piele și, de regulă, cel mult trei luni, ca să limiteze rezistența bacteriilor {{cite:euroguiderm-acne-2025}}.",
      },
      {
        question: "Evaluarea online înlocuiește consultul la cabinet?",
        answer:
          "Pentru formele ușoare și moderate, o evaluare la distanță bine structurată poate fi suficientă. Nodulii adânci, cicatricile, acneea apărută brusc și sever la vârstă adultă sau acneea însoțită de febră cer un consult în persoană, iar medicul îți spune când e cazul.",
      },
    ],
    sourceIds: ["euroguiderm-acne-2025", "dermnet-acne", "nhs-acne-treatment", "dermnet-acne-scars"],
    limitations: disclaimer,
    ...dates,
    related: [
      link.tipuri,
      link.cauze,
      link.tratament,
      link.cicatrici,
      link.retinoizi,
      link.bpo,
      link.antibiotice,
      link.isotretinoin,
      {
        href: "/caderea-parului",
        label: "Căderea părului",
        description: "Altă afecțiune evaluată de dermatolog.",
      },
    ],
    status: "published",
  },
  timeline: {
    heading: "La ce să te aștepți, lună de lună",
    intro:
      "Pielea se schimbă încet, așa că tratamentul acneei se judecă în luni. Etapele de mai jos descriu evoluția obișnuită; ritmul diferă de la o persoană la alta, iar rezultatul nu poate fi garantat {{cite:nhs-acne-treatment}}.",
    sourceIds: ["nhs-acne-treatment", "euroguiderm-acne-2025"],
    steps: [
      {
        period: "Ziua 1",
        title: "Evaluarea",
        text: "Răspunzi la întrebări despre piele, despre tratamentele încercate și despre medicamentele pe care le iei. Medicul dermatolog decide dacă tratamentul la distanță e potrivit sau dacă ai nevoie de un consult în persoană.",
      },
      {
        period: "Primele săptămâni",
        title: "Adaptarea pielii",
        text: "Tratamentele locale pot usca pielea și pot produce arsură, mâncărime sau înțepături, mai ales la început, iar unele cresc sensibilitatea la soare {{cite:nhs-acne-treatment}}. Spune-i medicului dacă iritația te împiedică să continui.",
      },
      {
        period: "Lunile 2–3",
        title: "Primele schimbări",
        text: "Multe tratamente au nevoie de 2–3 luni ca să înceapă să funcționeze {{cite:nhs-acne-treatment}}. Un antibiotic aplicat pe piele, parte dintr-o combinație, se folosește de obicei 6–8 săptămâni, apoi se oprește {{cite:nhs-acne-treatment}}.",
      },
      {
        period: "Luna 3",
        title: "Reevaluarea",
        text: "Medicul judecă efectul și decide dacă planul continuă sau se schimbă. Dacă a fost nevoie de un antibiotic pe gură, ghidul european limitează durata lui la trei luni {{cite:euroguiderm-acne-2025}}.",
      },
      {
        period: "După primele luni",
        title: "Ajustarea în timp",
        text: "La o parte importantă dintre oameni, acneea continuă și după adolescență {{cite:euroguiderm-acne-2025}}. De aceea, planul se ajustează la reevaluări, împreună cu medicul.",
      },
    ],
  },
  subpages: [tipuri, cauze, tratament, cicatrici],
};
