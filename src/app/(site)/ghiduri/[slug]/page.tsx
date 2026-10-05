import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { content } from "@/content/source";
import { MedicalArticle } from "@/components/medical/MedicalArticle";
import { reviewContext } from "@/lib/medical";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return content.listGuides().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ghiduri/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = content.getGuide(slug);
  if (!doc) return {};
  return pageMetadata({
    title: doc.metaTitle,
    description: doc.metaDescription,
    path: `/ghiduri/${slug}`,
    indexable: reviewContext(doc).indexable,
    type: "article",
  });
}

export default async function GuidePage({ params }: PageProps<"/ghiduri/[slug]">) {
  const { slug } = await params;
  const doc = content.getGuide(slug);
  if (!doc) notFound();
  const path = `/ghiduri/${slug}`;
  return (
    <MedicalArticle
      doc={doc}
      path={path}
      eyebrow="Ghid"
      crumbs={[
        { name: "Ghiduri", href: "/ghiduri" },
        { name: doc.title, href: path },
      ]}
    />
  );
}
