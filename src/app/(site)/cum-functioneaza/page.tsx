import { ClosingCta } from "@/components/home/ClosingCta";
import { HowWeHelp } from "@/components/home/HowWeHelp";
import { neutralMockup } from "@/components/home/PhoneMockup";
import { content } from "@/content/source";
import { SectionHeading } from "@/components/home/SectionHeading";
import { StepStrip } from "@/components/home/StepStrip";
import { PageHeader } from "@/components/layout/PageHeader";
import { StartButton } from "@/components/topic/StartButton";
import { PriceSummary } from "@/components/medical/PriceSummary";
import { staticPageMetadata } from "@/lib/page-meta";

export const metadata = staticPageMetadata("/cum-functioneaza");

export default function HowItWorks() {
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
              "Reevaluări periodice; pentru piele și păr, cu fotografii comparabile.",
              "Întrebări despre efecte adverse oricând, în aplicația clinică.",
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

      <ClosingCta />
    </>
  );
}
