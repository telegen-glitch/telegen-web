import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { content } from "@/content/source";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { JsonLd } from "@/components/ui/JsonLd";
import { TemporaryNote } from "@/components/ui/Temporary";
import { CtaBand } from "@/components/home/CtaBand";
import { Steps } from "@/components/home/Steps";
import { SectionView } from "@/components/medical/Blocks";
import { FaqList } from "@/components/medical/Faq";
import { Pricing } from "@/components/medical/Pricing";
import { RelatedLinks } from "@/components/medical/RelatedLinks";
import { ReviewMeta } from "@/components/medical/ReviewMeta";
import { SourceList } from "@/components/medical/SourceList";
import { Timeline } from "@/components/medical/Timeline";
import { evaluationCta } from "@/lib/nav";
import { reviewContext, sourceOrderFor } from "@/lib/medical";
import { renderRichText } from "@/lib/rich-text";
import { faqJsonLd, medicalPageJsonLd, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return content.listConditions().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/afectiuni/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const condition = content.getCondition(slug);
  if (!condition) return {};
  return pageMetadata({
    title: condition.doc.metaTitle,
    description: condition.doc.metaDescription,
    path: `/afectiuni/${slug}`,
    indexable: reviewContext(condition.doc).indexable,
    type: "article",
  });
}

export default async function ConditionPage({ params }: PageProps<"/afectiuni/[slug]">) {
  const { slug } = await params;
  const condition = content.getCondition(slug);
  if (!condition) notFound();

  const { doc, timeline } = condition;
  const path = `/afectiuni/${slug}`;
  const order = sourceOrderFor(doc, condition);
  const { reviewer, realReviewer } = reviewContext(doc);
  const toc = [
    ...doc.sections.map((s) => ({ id: s.id, label: s.heading })),
    ...(timeline ? [{ id: "asteptari", label: "La ce să te aștepți" }] : []),
    { id: "intrebari", label: "Întrebări frecvente" },
    { id: "surse", label: "Surse" },
  ];

  return (
    <>
      <article>
        <header className="bg-paper">
          <div className="container-page pt-6 pb-12 md:pt-8 md:pb-16">
            <Breadcrumbs
              items={[
                { name: "Afecțiuni", href: "/afectiuni" },
                { name: condition.name, href: path },
              ]}
            />
            <div className="mt-8 grid gap-10 md:mt-12 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
              <div>
                <Eyebrow>{condition.medicalName}</Eyebrow>
                <h1 className="mt-3 text-display-1">{doc.h1}</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-ink">
                  {renderRichText(doc.summary, order)}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href={evaluationCta.href} className="w-full sm:w-auto">
                    <span className="sm:hidden">{evaluationCta.label}</span>
                    <span className="hidden sm:inline">{evaluationCta.longLabel}</span> <Arrow />
                  </ButtonLink>
                  <ButtonLink href="#ce-este" variant="secondary" className="w-full sm:w-auto">
                    Citește mai întâi
                  </ButtonLink>
                </div>
              </div>
              <nav aria-label="Pe această pagină" className="rounded-card bg-white p-6 md:p-7">
                <p className="text-eyebrow text-ink-muted">Pe această pagină</p>
                <ol className="mt-3 divide-y divide-line-soft">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a
                        href={`#${t.id}`}
                        className="flex min-h-11 items-center justify-between gap-4 py-2 text-sm font-medium text-navy-950 hover:text-blue-700"
                      >
                        {t.label}
                        <span aria-hidden="true" className="text-ink-muted">
                          ↓
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </header>

        <div className="container-page pt-8">
          <ReviewMeta doc={doc} reviewer={reviewer} />
        </div>

        {/* Short 3-step explainer near the top */}
        <section aria-labelledby="pasi" className="container-page py-14 md:py-20">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 id="pasi" className="max-w-xl text-display-2">
              Cum te ajutăm cu {condition.shortName.toLowerCase()}
            </h2>
            <Link
              href="/cum-functioneaza"
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy-950 hover:underline"
            >
              Cum funcționează <Arrow />
            </Link>
          </div>
          <div className="mt-8">
            <Steps />
          </div>
        </section>

        {/* Education */}
        <div className="border-t border-line-soft">
          <div className="container-page grid gap-12 py-14 md:py-20 lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-20">
            <div className="prose-telegen [&>section:first-child>h2]:mt-0">
              {doc.sections.map((s) => (
                <SectionView key={s.id} section={s} sourceOrder={order} />
              ))}
            </div>
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-card bg-paper p-7">
                <p className="font-serif text-2xl leading-snug text-navy-950">
                  Nu știi dacă e alopecie androgenetică?
                </p>
                <p className="mt-3 text-sm text-ink-soft">
                  Evaluarea online te ajută să pui în ordine ce observi. La lansare, un medic dermatolog o va
                  analiza.
                </p>
                <ButtonLink href={evaluationCta.href} size="md" className="mt-6 w-full">
                  {evaluationCta.label}
                </ButtonLink>
              </div>
            </aside>
          </div>
        </div>

        {/* Month-by-month expectations */}
        {timeline && (
          <section id="asteptari" aria-labelledby="asteptari-titlu" className="scroll-mt-24 bg-paper">
            <div className="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
              <div>
                <Eyebrow>Așteptări realiste</Eyebrow>
                <h2 id="asteptari-titlu" className="mt-3 text-display-2">
                  {timeline.heading}
                </h2>
                <p className="mt-5 text-ink-soft">{renderRichText(timeline.intro, order)}</p>
              </div>
              <Timeline steps={timeline.steps} sourceOrder={order} />
            </div>
          </section>
        )}

        <Pricing />

        {/* Clinical team */}
        <section aria-labelledby="echipa" className="border-t border-line-soft">
          <div className="container-page grid gap-8 py-16 md:py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
            <div>
              <Eyebrow>Echipa medicală</Eyebrow>
              <h2 id="echipa" className="mt-3 text-display-2">
                Cine îți analizează evaluarea
              </h2>
            </div>
            <div>
              <p className="max-w-2xl text-ink-soft">
                Evaluările pentru căderea părului sunt analizate de medici dermatologi cu drept de liberă
                practică în România. Medicul coordonator aprobă protocolul clinic și revizuiește conținutul
                acestei pagini.
              </p>
              <div className="mt-5">
                <TemporaryNote>
                  Numele și datele profesionale ale medicilor se publică înainte de lansare.
                </TemporaryNote>
              </div>
              <ButtonLink href="/echipa-medicala" variant="quiet" className="mt-4">
                Despre echipa medicală <Arrow />
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* FAQ, limitations, sources, related */}
        <div className="border-t border-line-soft">
          <div className="container-page grid gap-12 py-16 md:py-20 lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-20">
            <div className="min-w-0">
              <section aria-labelledby="intrebari" className="scroll-mt-24">
                <h2 id="intrebari" className="mb-6 text-display-3">
                  Întrebări frecvente
                </h2>
                <FaqList faqs={doc.faqs} sourceOrder={order} />
              </section>
              <aside aria-label="Limite" className="mt-10 rounded-xl bg-paper p-5 text-sm text-ink-soft">
                <p className="font-semibold text-navy-950">Limitele acestei pagini</p>
                <p className="mt-1">{doc.limitations}</p>
              </aside>
              <SourceList sources={content.getSources(order)} />
            </div>
            <div>
              <RelatedLinks links={doc.related} heading="Află mai mult" className="" />
            </div>
          </div>
        </div>
      </article>

      <CtaBand />

      <JsonLd
        data={medicalPageJsonLd(
          doc,
          path,
          condition.medicalName,
          realReviewer && doc.review
            ? {
                name: realReviewer.name,
                credential: realReviewer.credential ?? "",
                reviewedAt: doc.review.reviewedAt,
              }
            : undefined,
        )}
      />
      <JsonLd data={faqJsonLd(doc.faqs)} />
    </>
  );
}
