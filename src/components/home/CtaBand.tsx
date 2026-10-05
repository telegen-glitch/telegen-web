import { Arrow, ButtonLink } from "@/components/ui/Button";
import { evaluationCta } from "@/lib/nav";

/** Condition-led closing call to action. Never mentions a medicine. */
export function CtaBand({
  title = "Află ce se întâmplă cu părul tău",
  text = "Evaluarea dermatologică online durează câteva minute. Până la lansarea serviciului, răspunsurile nu sunt trimise și nici salvate.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="bg-navy-950 text-white">
      <div className="container-page grid gap-8 py-16 md:grid-cols-[1.4fr_1fr] md:items-end md:py-24">
        <div>
          <h2 className="text-display-2 text-white">{title}</h2>
          <p className="mt-4 max-w-xl text-white/75">{text}</p>
        </div>
        <div className="md:justify-self-end">
          <ButtonLink href={evaluationCta.href} variant="inverse" className="w-full md:w-auto">
            {evaluationCta.longLabel} <Arrow />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
