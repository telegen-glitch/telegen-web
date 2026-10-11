import { ClosingCta } from "@/components/home/ClosingCta";
import { HowWeHelp } from "@/components/home/HowWeHelp";
import { neutralMockup } from "@/components/home/PhoneMockup";
import { content } from "@/content/source";
import { SectionHeading } from "@/components/home/SectionHeading";
import { StepStrip } from "@/components/home/StepStrip";
import { PageHeader } from "@/components/layout/PageHeader";
import { StartButton } from "@/components/topic/StartButton";
import { PriceSummary } from "@/components/medical/PriceSummary";
import { FaqList } from "@/components/medical/Faq";
import { JsonLd } from "@/components/ui/JsonLd";
import { staticPageMetadata } from "@/lib/page-meta";
import { priceAnswer } from "@/lib/price-text";
import { PROMISE_STEPS } from "@/lib/promise";
import { promiseFaqs } from "@/lib/promise-faqs";
import { purchasableConditionNames } from "@/lib/purchasable-names";
import { faqJsonLd } from "@/lib/seo";

export const metadata = staticPageMetadata("/cum-functioneaza");

export default function HowItWorks() {
  const conditions = content.listConditions();
  const open = purchasableConditionNames();
  const faqs = open.length ? promiseFaqs(priceAnswer(conditions)) : [];
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Cum funcționează", href: "/cum-functioneaza" }]}
        eyebrow="Cum funcționează"
        title="Îngrijire medicală,"
        accent="explicată de la început."
        lead="Știi dinainte ce se întâmplă la fiecare pas, cine decide și ce faci dacă ai întrebări."
      >
        <StartButton className="mt-8 w-full sm:w-auto" />
      </PageHeader>

      <StepStrip />

      <section aria-labelledby="pasii" className="section-y">
        <div className="container-page">
          <SectionHeading id="pasii" eyebrow="Pas cu pas" title="Ce se întâmplă" accent="la fiecare pas." />
          <div className="mt-12 lg:mt-4">
            <HowWeHelp mockup={neutralMockup(content.listConditions().map((c) => c.name))} />
          </div>
        </div>
      </section>

      {open.length > 0 && (
        <section aria-labelledby="promisiune" className="border-t border-line-soft section-y">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
            <SectionHeading
              id="promisiune"
              eyebrow="Plată și livrare"
              title="Plătești doar"
              accent="dacă medicul aprobă."
              text={`Pentru ${open.join(", ").toLowerCase()}, așa arată drumul de la evaluare la tratament.`}
            />
            <ol data-reveal-group className="space-y-3" data-testid="promise-steps">
              {PROMISE_STEPS.map((step, i) => (
                <li key={step.id} data-reveal className="flex gap-4 rounded-card bg-mist p-5">
                  <span aria-hidden="true" className="font-semibold text-blue-700 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block font-semibold text-navy-950">{step.title}</span>
                    <span className="mt-1 block text-ink-soft">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section aria-labelledby="urmarire" className="bg-mist section-y">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-20">
          <SectionHeading
            id="urmarire"
            eyebrow="După evaluare"
            title="Urmărirea face parte"
            accent="din tratament."
            text="Căderea părului și acneea se judecă în luni, iar la disfuncția erectilă contează și sănătatea inimii. De aceea, planul include reevaluări la intervale stabilite de medic."
          />
          <ul data-reveal-group className="space-y-3">
            {[
              "Reevaluări periodice: câteva întrebări scurte și, unde ajută, fotografii noi, făcute la fel ca primele.",
              "Întrebări despre efecte adverse oricând, prin mesaje în contul tău.",
              "Planul se ajustează sau se oprește când medicul consideră necesar.",
              "Dacă apare ceva neobișnuit, îți recomandăm un consult în persoană.",
            ].map((t) => (
              <li key={t} data-reveal className="flex gap-3 rounded-card bg-white p-5">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="ce-nu-facem" className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-20">
          <SectionHeading id="ce-nu-facem" title="Ce" accent="nu facem." />
          <ul className="prose-telegen" data-reveal>
            <li>Nu vindem tratamente fără evaluarea unui medic.</li>
            <li>Nu tratăm urgențe. În caz de urgență, sună la 112.</li>
            <li>Nu promitem rezultate. Răspunsul la tratament diferă de la o persoană la alta.</li>
            <li>Nu înlocuim medicul de familie sau consultul în persoană când acesta este necesar.</li>
          </ul>
        </div>
      </section>

      <PriceSummary conditions={content.listConditions()} />

      {faqs.length > 0 && (
        <section aria-labelledby="intrebari" className="border-t border-line-soft section-y">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
            <SectionHeading id="intrebari" eyebrow="Întrebări" title="Întrebări" accent="frecvente" />
            <div data-reveal>
              <FaqList faqs={faqs} />
            </div>
          </div>
          <JsonLd data={faqJsonLd(faqs)} />
        </section>
      )}

      <ClosingCta />
    </>
  );
}
