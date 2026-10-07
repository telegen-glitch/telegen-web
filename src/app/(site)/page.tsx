import Link from "next/link";
import { content } from "@/content/source";
import type { Faq } from "@/content/types";
import { ConditionCards } from "@/components/home/ConditionCards";
import { PressLogos, ReviewsCarousel } from "@/components/home/FlaggedSections";
import { Hero } from "@/components/home/Hero";
import { HowWeHelp } from "@/components/home/HowWeHelp";
import { SectionHeading } from "@/components/home/SectionHeading";
import { StepStrip } from "@/components/home/StepStrip";
import { TeamSection } from "@/components/home/TeamSection";
import { FaqList } from "@/components/medical/Faq";
import { StartButton } from "@/components/topic/StartButton";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { publishedConditionList } from "@/lib/positioning";
import { staticPageMetadata } from "@/lib/page-meta";
import { faqJsonLd } from "@/lib/seo";

export const metadata = staticPageMetadata("/");

const homeFaqs: Faq[] = [
  {
    question: "Telegen funcționează deja?",
    answer:
      "Nu încă. Site-ul este în pre-lansare: poți citi ghidurile și poți parcurge evaluarea ca să vezi cum arată, dar răspunsurile nu sunt trimise nimănui. Te putem anunța când serviciul medical se deschide.",
  },
  {
    question: "Cine îmi va analiza evaluarea?",
    answer:
      "Un medic cu drept de liberă practică în România și cu specialitatea potrivită afecțiunii tale. Înainte de consult afli numele medicului și codul lui de parafă.",
  },
  {
    question: "Primesc tratament fără să vorbesc cu un medic?",
    answer:
      "Nu. Orice recomandare de tratament pornește de la evaluarea unui medic. Dacă situația ta are nevoie de un consult în persoană, îți spunem direct.",
  },
  {
    question: "Ce se întâmplă cu datele mele de sănătate?",
    answer:
      "În pre-lansare, răspunsurile la evaluare rămân doar în pagina deschisă și dispar când o închizi. La lansare, datele medicale vor fi gestionate într-o aplicație clinică separată, cu acordul tău explicit și găzduire în Uniunea Europeană. Detalii în [politica de confidențialitate](/politica-de-confidentialitate).",
  },
  {
    question: "Cât costă?",
    answer:
      "Prețurile vor fi afișate clar pe site înainte de lansare, pentru fiecare tip de evaluare și de urmărire.",
  },
];

export default function HomePage() {
  const conditions = content.listConditions();
  const upcoming = content.listUpcomingTopics();

  return (
    <>
      <Hero
        eyebrow="Clinică online pentru bărbați"
        title="Sănătatea ta, tratată discret."
        accent="Cu un medic alături."
        text={`Evaluare online pentru ${publishedConditionList()}, un plan stabilit de medic și urmărire pe termen lung. De pe telefon, fără drumuri la cabinet.`}
        chips={[
          ...conditions.map((c) => ({ label: c.name, href: c.basePath })),
          ...upcoming.map((t) => ({ label: t.name })),
        ]}
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
              ["Datele tale, protejate", "Datele medicale nu ajung pe acest site."],
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
              items={[
                ...conditions.map((c) => ({
                  slug: c.slug,
                  name: c.name,
                  teaser: c.teaser,
                  href: c.basePath,
                })),
                ...upcoming.map((t) => ({
                  slug: t.slug,
                  name: t.name,
                  teaser: "Pregătim protocolul clinic și ghidurile medicale.",
                })),
                {
                  slug: "altele",
                  name: "Alte afecțiuni",
                  teaser: "Adăugăm o afecțiune doar după ce protocolul e revizuit de medici.",
                },
              ]}
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
            <HowWeHelp />
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
            <FaqList faqs={homeFaqs} />
          </div>
        </div>
      </section>

      <JsonLd data={faqJsonLd(homeFaqs)} />
    </>
  );
}
