import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { content } from "@/content/source";
import { MedicalArticle } from "@/components/medical/MedicalArticle";
import { docMetadata } from "@/lib/condition-meta";

export const dynamicParams = false;

const topLevel = () => content.listConditions().filter((c) => /^\/[a-z-]+$/.test(c.basePath));

export function generateStaticParams() {
  return topLevel().flatMap((c) =>
    content.listSubpages(c.slug).map((d) => ({ condition: c.basePath.slice(1), sub: d.slug })),
  );
}

function find(segment: string, sub: string) {
  const condition = topLevel().find((c) => c.basePath === `/${segment}`);
  const doc = condition ? content.getSubpage(condition.slug, sub) : undefined;
  return condition && doc ? { condition, doc } : undefined;
}

export async function generateMetadata({ params }: PageProps<"/[condition]/[sub]">): Promise<Metadata> {
  const { condition, sub } = await params;
  const found = find(condition, sub);
  return found ? docMetadata(found.doc) : {};
}

export default async function ConditionSubpage({ params }: PageProps<"/[condition]/[sub]">) {
  const { condition: segment, sub } = await params;
  const found = find(segment, sub);
  if (!found) notFound();
  const { condition, doc } = found;
  return (
    <MedicalArticle
      doc={doc}
      path={doc.path ?? `${condition.basePath}/${doc.slug}`}
      eyebrow={condition.name}
      crumbs={[
        { name: condition.name, href: condition.basePath },
        { name: doc.title, href: doc.path ?? `${condition.basePath}/${doc.slug}` },
      ]}
    />
  );
}
