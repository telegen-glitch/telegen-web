import { EvaluationFlow } from "@/components/evaluation/EvaluationFlow";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Evaluare dermatologică online pentru căderea părului",
  description:
    "Răspunde la câteva întrebări despre căderea părului. În pre-lansare, răspunsurile nu sunt trimise și nici salvate.",
  path: "/evaluare",
});

export default function EvaluationPage() {
  return (
    <div className="container-page py-10 md:py-16">
      <EvaluationFlow />
    </div>
  );
}
