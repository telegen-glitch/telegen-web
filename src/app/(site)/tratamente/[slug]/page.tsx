import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { content } from "@/content/source";
import { MedicalArticle } from "@/components/medical/MedicalArticle";
import { reviewContext } from "@/lib/medical";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return content.listTreatments().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tratamente/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = content.getTreatment(slug);
  if (!doc) return {};
  return pageMetadata({
    title: doc.metaTitle,
    description: doc.metaDescription,
    path: `/tratamente/${slug}`,
    indexable: reviewContext(doc).indexable,
    type: "article",
    defaultOgImage: false,
  });
}

export default async function TreatmentPage({ params }: PageProps<"/tratamente/[slug]">) {
  const { slug } = await params;
  const doc = content.getTreatment(slug);
  if (!doc) notFound();
  const path = `/tratamente/${slug}`;
  return (
    <MedicalArticle
      doc={doc}
      path={path}
      eyebrow="Despre tratament"
      crumbs={[
        { name: "Despre tratamente", href: "/tratamente" },
        { name: doc.title, href: path },
      ]}
    />
  );
}
