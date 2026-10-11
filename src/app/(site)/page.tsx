import Link from "next/link";
import { content } from "@/content/source";
import type { Faq } from "@/content/types";
import { ConditionCards } from "@/components/home/ConditionCards";
import { PressLogos, ReviewsCarousel } from "@/components/home/FlaggedSections";
import { Hero } from "@/components/home/Hero";
import { panelViews } from "@/components/home/panels/panelViews";
import { HowWeHelp } from "@/components/home/HowWeHelp";
import { neutralMockup } from "@/components/home/PhoneMockup";
import { SectionHeading } from "@/components/home/SectionHeading";
import { StepStrip } from "@/components/home/StepStrip";
import { TeamSection } from "@/components/home/TeamSection";
import { FaqList } from "@/components/medical/Faq";
import { StartButton } from "@/components/topic/StartButton";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { publishedConditionList } from "@/lib/positioning";
import { prelaunchCopy } from "@/lib/prelaunch-copy";
import { priceAnswer } from "@/lib/price-text";
import { promiseFaqs } from "@/lib/promise-faqs";
import { purchasableConditionNames } from "@/lib/purchasable-names";
import { isPrelaunch } from "@/lib/site";
import { staticPageMetadata } from "@/lib/page-meta";
import { faqJsonLd } from "@/lib/seo";

export const metadata = staticPageMetadata("/");

const lower = (names: string[]) => names.join(", ").toLowerCase();

const homeFaqs = (conditions: { slug: string; name: string }[]): Faq[] => {
  const open = purchasableConditionNames();
  return [
    {
      question: "Ce afecțiuni evaluați?",
      answer: open.length
        ? `Evaluarea online este deschisă acum pentru ${lower(open)}. Pentru ${publishedConditionList()} găsești pe site ghiduri medicale cu surse citate.`
        : `Pentru ${publishedConditionList()} găsești pe site ghiduri medicale cu surse citate.`,
    },
    ...(isPrelaunch() ? [prelaunchCopy.homeFaq] : []),
    ...(open.length ? promiseFaqs(priceAnswer(conditions)) : []),
    {
      question: "Primesc tratament fără să vorbesc cu un medic?",
      answer:
        "Nu. Orice tratament pornește de la decizia unui medic, care îți analizează evaluarea și îți poate scrie în cont. Dacă situația ta are nevoie de un consult în persoană, îți spune direct.",
    },
    {
      question: "Ce se întâmplă cu datele mele de sănătate?",
      answer:
        "Răspunsurile la evaluare se păstrează doar după ce îți creezi contul și îți dai acordul explicit, separat pentru fiecare scop. Le stocăm pe servere din Uniunea Europeană, criptate, și le vede doar medicul care îți analizează evaluarea. Nu apar niciodată în adrese de pagini, statistici sau e-mailuri. Detalii în [politica de confidențialitate](/politica-de-confidentialitate).",
    },
  ];
};

export default function HomePage() {
  const conditions = content.listConditions();
  const faqs = homeFaqs(conditions);
  const open = purchasableConditionNames();
  const heroText = open.length
    ? `Evaluare gratuită pentru ${lower(open)}, de pe telefon. Vezi planul propus și prețul înainte să plătești, iar suma se încasează doar dacă medicul aprobă planul.`
    : `Ghiduri medicale clare despre ${publishedConditionList()}, scrise pe baza ghidurilor clinice europene și cu surse citate.`;

  return (
    <>
      <Hero
        eyebrow="Clinică online pentru bărbați"
        title="Sănătatea ta, tratată discret."
        accent="Cu un medic alături."
        text={heroText}
        chips={conditions.map((c) => ({ label: c.name, slug: c.slug, href: c.basePath }))}
        panels={panelViews(conditions)}
      />

      <StepStrip />

      <PressLogos logos={[]} />

      {/* Value section with the start / how-it-works pair */}
      <section aria-labelledby="valoare" className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-20">
          <SectionHeading
            id="valoare"
            eyebrow="De ce Telegen"
            title="Îngrijire medicală adevărată,"
            accent="fără așteptare la cabinet."
            text="Nu vindem produse la întâmplare. Pornim de la ce ți se întâmplă, un medic decide ce are sens pentru tine și rămânem alături cât durează tratamentul."
          >
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <StartButton className="w-full sm:w-auto" />
              <ButtonLink href="/cum-functioneaza" variant="secondary" className="w-full sm:w-auto">
                Cum funcționează
              </ButtonLink>
            </div>
          </SectionHeading>
          <ul data-reveal-group className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              [
                "Medicul potrivit",
                "Medici cu drept de liberă practică în România și specialitatea potrivită afecțiunii.",
              ],
              ["Explicat clar", "Știi ce ai, ce opțiuni există și la ce să te aștepți."],
              [
                "Datele tale, protejate",
                "Răspunsurile tale se păstrează criptat, în Uniunea Europeană, doar cu acordul tău.",
              ],
            ].map(([t, d]) => (
              <li key={t} data-reveal className="rounded-card bg-mist p-6">
                <p className="font-semibold text-navy-950">{t}</p>
                <p className="mt-1 text-ink-soft">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Condition cards */}
      <section aria-labelledby="afectiuni" className="bg-mist section-y">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading id="afectiuni" eyebrow="Afecțiuni" title="Cu ce" accent="te putem ajuta" />
            <Link
              href="/afectiuni"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-navy-950 hover:underline"
            >
              Toate afecțiunile <Arrow />
            </Link>
          </div>
          <div className="mt-10">
            <ConditionCards
              items={conditions.map((c) => ({
                slug: c.slug,
                name: c.name,
                teaser: c.teaser,
                href: c.basePath,
              }))}
            />
          </div>
        </div>
      </section>

      {/* How we help: 4 steps with phone mockups */}
      <section aria-labelledby="cum-ajutam" className="section-y">
        <div className="container-page">
          <SectionHeading
            id="cum-ajutam"
            eyebrow="Cum te ajutăm"
            title="De la prima întrebare"
            accent="la rezultate pe termen lung."
          />
          <div className="mt-12 lg:mt-4">
            <HowWeHelp mockup={neutralMockup(conditions.map((c) => c.name))} />
          </div>
        </div>
      </section>

      <TeamSection />

      <ReviewsCarousel reviews={[]} />

      {/* FAQ with a link to the knowledge base */}
      <section aria-labelledby="intrebari" className="border-t border-line-soft section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <SectionHeading id="intrebari" eyebrow="Întrebări" title="Întrebări" accent="frecvente">
            <Link
              href="/ghiduri"
              className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-navy-950 hover:underline"
            >
              Vezi toate ghidurile <Arrow />
            </Link>
          </SectionHeading>
          <div data-reveal>
            <FaqList faqs={faqs} />
          </div>
        </div>
      </section>

      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
