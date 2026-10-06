import { content } from "@/content/source";
import { evaluations } from "@/content/evaluations";
import { EvaluationFlow } from "@/components/evaluation/EvaluationFlow";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Evaluare medicală online: căderea părului, acnee, disfuncție erectilă",
  description:
    "Răspunde la câteva întrebări despre căderea părului, acnee sau disfuncția erectilă. În pre-lansare, răspunsurile nu sunt trimise și nici salvate.",
  path: "/evaluare",
});

export default function EvaluationPage() {
  return (
    <EvaluationFlow
      topics={evaluations.map((e) => ({
        slug: e.topic,
        name: e.name,
        href: content.getCondition(e.topic)?.basePath,
      }))}
      upcoming={[]}
    />
  );
}
