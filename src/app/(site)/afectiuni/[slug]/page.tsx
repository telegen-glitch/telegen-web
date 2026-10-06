import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { content } from "@/content/source";
import { ConditionView } from "@/components/medical/ConditionView";
import { conditionMetadata } from "@/lib/condition-meta";

export const dynamicParams = false;

/** Conditions whose hub lives under /afectiuni (hair loss). */
const underAfectiuni = () => content.listConditions().filter((c) => c.basePath.startsWith("/afectiuni/"));

export function generateStaticParams() {
  return underAfectiuni().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/afectiuni/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const condition = underAfectiuni().find((c) => c.slug === slug);
  return condition ? conditionMetadata(condition) : {};
}

export default async function ConditionPage({ params }: PageProps<"/afectiuni/[slug]">) {
  const { slug } = await params;
  const condition = underAfectiuni().find((c) => c.slug === slug);
  if (!condition) notFound();
  return <ConditionView condition={condition} />;
}
