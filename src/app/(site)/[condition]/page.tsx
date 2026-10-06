import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { content } from "@/content/source";
import { ConditionView } from "@/components/medical/ConditionView";
import { conditionMetadata } from "@/lib/condition-meta";

export const dynamicParams = false;

/** Published conditions whose hub is a top-level URL (e.g. /acnee, /disfunctie-erectila). */
const topLevel = () => content.listConditions().filter((c) => /^\/[a-z-]+$/.test(c.basePath));

export function generateStaticParams() {
  return topLevel().map((c) => ({ condition: c.basePath.slice(1) }));
}

export async function generateMetadata({ params }: PageProps<"/[condition]">): Promise<Metadata> {
  const { condition: segment } = await params;
  const condition = topLevel().find((c) => c.basePath === `/${segment}`);
  return condition ? conditionMetadata(condition) : {};
}

export default async function ConditionHubPage({ params }: PageProps<"/[condition]">) {
  const { condition: segment } = await params;
  const condition = topLevel().find((c) => c.basePath === `/${segment}`);
  if (!condition) notFound();
  return <ConditionView condition={condition} />;
}
