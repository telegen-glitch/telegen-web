import type { MedicalDoc } from "@/content/types";
import { content } from "@/content/source";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBand } from "@/components/home/CtaBand";
import { JsonLd } from "@/components/ui/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FaqList } from "./Faq";
import { SectionView } from "./Blocks";
import { RelatedLinks } from "./RelatedLinks";
import { ReviewMeta } from "./ReviewMeta";
import { SourceList } from "./SourceList";
import { renderRichText } from "@/lib/rich-text";
import { reviewContext, sourceOrderFor } from "@/lib/medical";
import { faqJsonLd, medicalPageJsonLd, type Crumb } from "@/lib/seo";

/**
 * Template for guides and treatment-information pages:
 * concise answer → explanation → FAQs → limitations → sources → related → next step.
 */
export function MedicalArticle({
  doc,
  path,
  eyebrow,
  crumbs,
}: {
  doc: MedicalDoc;
  path: string;
  eyebrow: string;
  crumbs: Crumb[];
}) {
  const order = sourceOrderFor(doc);
  const sources = content.getSources(order);
  const { reviewer, realReviewer } = reviewContext(doc);
  const condition = content.getCondition(doc.conditionSlug);

  return (
    <>
      <article>
        <header className="bg-paper">
          <div className="container-page pt-6 pb-10 md:pt-8 md:pb-14">
            <Breadcrumbs items={crumbs} />
            <div className="mt-8 max-w-3xl md:mt-12">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h1 className="mt-3 text-display-1">{doc.h1}</h1>
            </div>
          </div>
        </header>

        <div className="container-page pt-8 pb-16 md:pt-10 md:pb-24">
          <ReviewMeta doc={doc} reviewer={reviewer} />

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-16">
            <div className="min-w-0">
              <section aria-label="Pe scurt" className="rounded-card border border-line bg-white p-6 md:p-8">
                <p className="text-eyebrow text-ink-muted">Pe scurt</p>
                <p className="mt-3 text-lg leading-8 text-ink">{renderRichText(doc.summary, order)}</p>
              </section>

              <div className="prose-telegen mt-4">
                {doc.sections.map((s) => (
                  <SectionView key={s.id} section={s} sourceOrder={order} />
                ))}
              </div>

              {doc.faqs.length > 0 && (
                <section aria-labelledby="intrebari" className="mt-14">
                  <h2 id="intrebari" className="mb-4 font-serif text-2xl text-navy-950">
                    Întrebări frecvente
                  </h2>
                  <FaqList faqs={doc.faqs} sourceOrder={order} />
                </section>
              )}

              <aside aria-label="Limite" className="mt-10 rounded-xl bg-paper p-5 text-sm text-ink-soft">
                <p className="font-semibold text-navy-950">Limitele acestei pagini</p>
                <p className="mt-1">{doc.limitations}</p>
              </aside>

              <SourceList sources={sources} />
            </div>

            <div className="lg:pt-2">
              <div className="lg:sticky lg:top-28">
                <RelatedLinks links={doc.related} heading="Legături utile" className="" />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Treatment pages carry no call to action at all (section 9.4). */}
      {doc.kind !== "treatment" && (
        <CtaBand
          title="Vrei o părere medicală?"
          text="O evaluare dermatologică online pornește de la situația ta, nu de la un produs. Până la lansare, răspunsurile nu sunt trimise și nici salvate."
        />
      )}

      <JsonLd
        data={medicalPageJsonLd(
          doc,
          path,
          condition?.medicalName ?? doc.title,
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
