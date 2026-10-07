import Link from "next/link";
import { content } from "@/content/source";
import type { Condition } from "@/content/types";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ClosingCta } from "@/components/home/ClosingCta";
import { HowWeHelp } from "@/components/home/HowWeHelp";
import { SectionHeading } from "@/components/home/SectionHeading";
import { StepStrip } from "@/components/home/StepStrip";
import { TeamSection } from "@/components/home/TeamSection";
import { neutralMockup } from "@/components/home/PhoneMockup";
import { SinglePanel } from "@/components/home/panels/ConditionPanels";
import { PanelIllustration } from "@/components/home/panels/Illustrations";
import { PanelBody } from "@/components/home/panels/PanelBody";
import { decidingDoctor } from "@/content/clinicians";
import { SectionView } from "@/components/medical/Blocks";
import { FaqList } from "@/components/medical/Faq";
import { Pricing } from "@/components/medical/Pricing";
import { RelatedLinks } from "@/components/medical/RelatedLinks";
import { ReviewMeta } from "@/components/medical/ReviewMeta";
import { SourceList } from "@/components/medical/SourceList";
import { Timeline } from "@/components/medical/Timeline";
import { StartButton } from "@/components/topic/StartButton";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { reviewContext, sourceOrderFor } from "@/lib/medical";
import { renderRichText } from "@/lib/rich-text";
import { faqJsonLd, medicalPageJsonLd } from "@/lib/seo";

/** Condition hub page, rendered at the condition's top-level URL (/caderea-parului, /acnee…). */
export function ConditionView({ condition }: { condition: Condition }) {
  const { doc, timeline } = condition;
  const path = condition.basePath;
  const order = sourceOrderFor(doc, condition);
  const { reviewer, reviewedAt } = reviewContext(doc);
  const mockup = condition.presentation.mockup ?? neutralMockup([condition.name]);

  return (
    <>
      <article>
        {/* Hero */}
        <header className="bg-mist">
          <div className="container-page pt-5 pb-12 md:pt-7 lg:pb-20">
            <Breadcrumbs
              items={[
                { name: "Afecțiuni", href: "/afectiuni" },
                { name: condition.name, href: path },
              ]}
            />
            <div className="mt-8 grid items-center gap-10 md:mt-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
              <div>
                <p className="text-eyebrow text-blue-700">{condition.medicalName}</p>
                <h1 className="mt-3 text-display-1">
                  {doc.h1} <span className="accent">{condition.presentation.heroAccent}</span>
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-ink">
                  {renderRichText(doc.summary, order)}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <StartButton className="w-full sm:w-auto" />
                  <ButtonLink href="#ce-este" variant="secondary" className="w-full sm:w-auto">
                    Citește mai întâi
                  </ButtonLink>
                </div>
              </div>
              <SinglePanel
                art={<PanelIllustration kind={condition.panel.illustration} />}
                label="Cum te evaluăm"
              >
                <PanelBody
                  variant="hub"
                  slug={condition.slug}
                  name={condition.name}
                  lead={condition.panel.lead}
                  analyses={condition.panel.analyses}
                  decider={decidingDoctor(condition.slug)}
                  href={condition.basePath}
                />
              </SinglePanel>
            </div>
          </div>
        </header>

        <StepStrip />

        {/* Intent-specific subpages (types, causes, treatment...) */}
        {content.listSubpages(condition.slug).length > 0 && (
          <nav aria-labelledby="subpagini" className="container-page pt-12">
            <h2 id="subpagini" className="text-display-3">
              {condition.name}, <span className="accent">pe rând</span>
            </h2>
            <ul data-reveal-group className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {content.listSubpages(condition.slug).map((d) => (
                <li key={d.slug} data-reveal>
                  <Link
                    href={d.path ?? `${condition.basePath}/${d.slug}`}
                    className="group flex h-full min-h-24 flex-col justify-between rounded-card bg-mist p-5 transition-colors hover:bg-mist-deep"
                  >
                    <span className="font-semibold text-navy-950">{d.title}</span>
                    <Arrow className="mt-3 text-blue-700 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="container-page pt-8">
          <ReviewMeta doc={doc} reviewer={reviewer} reviewedAt={reviewedAt} />
        </div>

        {/* Education integrated with the service */}
        <div className="container-page grid gap-12 section-y lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-20">
          <div className="prose-telegen [&>section:first-child>h2]:mt-0">
            {doc.sections.map((s) => (
              <SectionView key={s.id} section={s} sourceOrder={order} />
            ))}
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-card-lg bg-navy-950 p-8 text-white">
              <p className="text-2xl leading-tight font-semibold tracking-tight">
                {condition.presentation.asideTitle}{" "}
                <span className="accent text-blue-200">{condition.presentation.asideAccent}</span>
              </p>
              <p className="mt-3 text-sm text-white/70">
                Evaluarea durează câteva minute. Răspunsurile nu sunt salvate.
              </p>
              <StartButton variant="inverse" size="md" className="mt-6 w-full" />
            </div>
          </aside>
        </div>

        {/* Treatment approaches (neutral, by category) */}
        {condition.approaches && (
          <section aria-labelledby="optiuni" className="bg-mist section-y">
            <div className="container-page">
              <SectionHeading
                id="optiuni"
                eyebrow="Opțiuni"
                title="Ce se poate face"
                accent="și cine decide."
                text="Ghidurile clinice descriu mai multe abordări. Ce ți se potrivește stabilește medicul, după evaluare."
              />
              <ul data-reveal-group className="mt-10 grid gap-4 md:grid-cols-3">
                {condition.approaches.map((a) => (
                  <li key={a.title} data-reveal className="flex flex-col rounded-card-lg bg-white p-7">
                    <h3 className="text-xl font-semibold tracking-tight text-navy-950">{a.title}</h3>
                    <p className="mt-2 flex-1 text-ink-soft">{a.text}</p>
                    <Link
                      href={a.href}
                      className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
                    >
                      {a.linkLabel} <Arrow />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Month-by-month expectations */}
        {timeline && (
          <section id="asteptari" aria-labelledby="asteptari-titlu" className="scroll-mt-24 section-y">
            <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
              <div>
                <SectionHeading
                  id="asteptari-titlu"
                  eyebrow="Așteptări realiste"
                  title="La ce să te aștepți,"
                  accent="lună de lună."
                />
                <p className="mt-5 text-ink-soft">{renderRichText(timeline.intro, order)}</p>
              </div>
              <div data-reveal>
                <Timeline steps={timeline.steps} sourceOrder={order} />
              </div>
            </div>
          </section>
        )}

        <Pricing conditionSlug={condition.slug} />

        {/* How care works */}
        <section aria-labelledby="cum-ajutam" className="border-t border-line-soft section-y">
          <div className="container-page">
            <SectionHeading
              id="cum-ajutam"
              eyebrow="Cum te ajutăm"
              title="Patru pași,"
              accent="un singur medic responsabil."
            />
            <div className="mt-12 lg:mt-4">
              <HowWeHelp mockup={mockup} />
            </div>
          </div>
        </section>

        <TeamSection />

        {/* FAQ, limitations, sources, related */}
        <div className="border-t border-line-soft">
          <div className="container-page grid gap-12 section-y lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-20">
            <div className="min-w-0">
              <section aria-labelledby="intrebari" className="scroll-mt-24">
                <h2 id="intrebari" className="mb-8 text-display-2">
                  Întrebări <span className="accent">frecvente</span>
                </h2>
                <FaqList faqs={doc.faqs} sourceOrder={order} />
              </section>
              <aside aria-label="Limite" className="mt-10 rounded-card bg-mist p-5 text-sm text-ink-soft">
                <p className="font-semibold text-navy-950">Limitele acestei pagini</p>
                <p className="mt-1">{doc.limitations}</p>
              </aside>
              <SourceList sources={content.getSources(order)} />
            </div>
            <div>
              <RelatedLinks links={doc.related} heading="Află mai mult" className="lg:sticky lg:top-28" />
            </div>
          </div>
        </div>
      </article>

      <ClosingCta />

      <JsonLd data={medicalPageJsonLd(doc, path, condition.medicalName, reviewedAt)} />
      <JsonLd data={faqJsonLd(doc.faqs)} />
    </>
  );
}
