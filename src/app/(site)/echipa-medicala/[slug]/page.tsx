import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { content } from "@/content/source";
import { PageHeader } from "@/components/layout/PageHeader";
import { JsonLd } from "@/components/ui/JsonLd";
import { TemporaryNote } from "@/components/ui/Temporary";
import { renderRichText } from "@/lib/rich-text";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return content.listClinicians().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/echipa-medicala/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = content.getClinician(slug);
  if (!c) return {};
  return pageMetadata({
    title: c.temporary ? c.name : `${c.name}, ${c.credential}`,
    description: `${c.role}. Profil profesional în echipa medicală Telegen.`,
    path: `/echipa-medicala/${slug}`,
    indexable: !c.temporary,
  });
}

/** Clinician / reviewer template. Person schema only for a real, confirmed clinician. */
export default async function ClinicianPage({ params }: PageProps<"/echipa-medicala/[slug]">) {
  const { slug } = await params;
  const c = content.getClinician(slug);
  if (!c) notFound();
  const path = `/echipa-medicala/${slug}`;

  const reviewed = [
    ...content.listConditions().map((x) => x.doc),
    ...content.listGuides(),
    ...content.listTreatments(),
  ].filter((d) => d.review?.reviewerSlug === slug);

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Echipa medicală", href: "/echipa-medicala" },
          { name: c.name, href: path },
        ]}
        eyebrow={c.role}
        title={c.name}
        lead={c.credential}
      >
        {c.temporary && (
          <div className="mt-6">
            <TemporaryNote>
              Profil de rol. Persoana și datele profesionale se confirmă înainte de lansare.
            </TemporaryNote>
          </div>
        )}
      </PageHeader>
      <div className="container-page grid gap-12 py-14 md:py-20 lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-20">
        <div className="prose-telegen">
          {c.bio.map((p) => (
            <p key={p}>{renderRichText(p)}</p>
          ))}
        </div>
        <dl className="h-fit divide-y divide-line-soft rounded-card bg-paper p-6 text-sm md:p-7">
          <div className="pb-3">
            <dt className="text-ink-muted">Specialitate și grad</dt>
            <dd className="mt-0.5 font-medium text-navy-950">{c.credential ?? "Se confirmă"}</dd>
          </div>
          <div className="py-3">
            <dt className="text-ink-muted">Cod de parafă / CMR</dt>
            <dd className="mt-0.5 font-medium text-navy-950">{c.registration ?? "Se confirmă"}</dd>
          </div>
          <div className="pt-3">
            <dt className="text-ink-muted">Pagini revizuite</dt>
            <dd className="mt-0.5 font-medium text-navy-950">
              {reviewed.length > 0 ? reviewed.map((d) => d.title).join(", ") : "Niciuna încă"}
            </dd>
          </div>
        </dl>
      </div>
      {!c.temporary && c.credential && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: c.name,
            url: absoluteUrl(path),
            jobTitle: c.credential,
            worksFor: { "@id": `${absoluteUrl("/")}#organizatie` },
          }}
        />
      )}
    </>
  );
}
