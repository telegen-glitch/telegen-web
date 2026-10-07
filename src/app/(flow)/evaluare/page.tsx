import { content } from "@/content/source";
import { evaluations } from "@/content/evaluations";
import { EvaluationFlow } from "@/components/evaluation/EvaluationFlow";
import { staticPageMetadata } from "@/lib/page-meta";

export const metadata = staticPageMetadata("/evaluare");

export default function EvaluationPage() {
  return (
    <EvaluationFlow
      topics={evaluations.map((e) => ({
        slug: e.topic,
        name: e.name,
        href: content.getCondition(e.topic)?.basePath,
      }))}
    />
  );
}
