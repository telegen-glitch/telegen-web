import { PageHeader } from "@/components/layout/PageHeader";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TemporaryNote } from "@/components/ui/Temporary";
import { CtaBand } from "@/components/home/CtaBand";
import { careSteps } from "@/components/home/Steps";
import { evaluationCta } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cum funcționează evaluarea dermatologică online",
  description:
    "Pas cu pas: evaluarea online, analiza făcută de un medic dermatolog, planul de tratament și urmărirea. Ce primești, ce nu facem și cum îți protejăm datele.",
  path: "/cum-functioneaza",
});

const details = [
  [
    "Ce îți cerem",
    "Întrebări despre ce observi, de când, istoricul medical și tratamentele încercate. La lansare, vei trimite și fotografii ale scalpului, într-o aplicație clinică securizată.",
  ],
  [
    "Ce face medicul",
    "Citește tot, îți poate pune întrebări suplimentare și stabilește dacă tratamentul la distanță e potrivit. Dacă nu e, îți explică de ce și ce consult îți trebuie.",
  ],
  [
    "Ce primești",
    "Un plan explicat în cuvinte simple: ce ai, ce opțiuni există, beneficii, efecte adverse posibile și ce urmează. Decizia finală o iei împreună cu medicul.",
  ],
] as const;

export default function HowItWorks() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Cum funcționează", href: "/cum-functioneaza" }]}
        eyebrow="Cum funcționează"
        title="Îngrijire dermatologică, explicată de la început"
        lead="Știi dinainte ce se întâmplă la fiecare pas, cine decide și ce faci dacă ai întrebări."
      >
        <ButtonLink href={evaluationCta.href} className="mt-8 w-full sm:w-auto">
          {evaluationCta.label} <Arrow />
        </ButtonLink>
      </PageHeader>

      <section aria-labelledby="pasii" className="container-page py-16 md:py-24">
        <h2 id="pasii" className="sr-only">
          Pașii
        </h2>
        <ol className="space-y-px overflow-hidden rounded-card bg-line">
          {careSteps.map((s, i) => (
            <li
              key={s.title}
              className="grid gap-4 bg-white p-7 md:grid-cols-[6rem_1fr_1.3fr] md:gap-10 md:p-10"
            >
              <span className="font-serif text-5xl leading-none text-blue-700" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="text-display-3">
                <span className="sr-only">Pasul {i + 1}: </span>
                {s.title}
              </h3>
              <div className="text-ink-soft">
                <p>{s.text}</p>
                <p className="mt-3">{details[i][1]}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="urmarire" className="bg-paper">
        <div className="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>După evaluare</Eyebrow>
            <h2 id="urmarire" className="mt-3 text-display-2">
              Urmărirea face parte din tratament
            </h2>
            <p className="mt-5 text-ink-soft">
              Afecțiunile de lungă durată, cum este alopecia androgenetică, se judecă în luni. De aceea,
              planul include reevaluări la intervale stabilite de medic, nu doar o recomandare inițială.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              "Reevaluări periodice, cu fotografii comparabile.",
              "Întrebări despre efecte adverse oricând, în aplicația clinică.",
              "Planul se ajustează sau se oprește când medicul consideră necesar.",
              "Dacă apare ceva neobișnuit, îți recomandăm un consult în persoană.",
            ].map((t) => (
              <li key={t} className="flex gap-3 rounded-xl bg-white p-5">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="ce-nu-facem">
        <div className="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 id="ce-nu-facem" className="text-display-2">
              Ce nu facem
            </h2>
          </div>
          <ul className="prose-telegen">
            <li>Nu vindem tratamente fără evaluarea unui medic.</li>
            <li>Nu tratăm urgențe. În caz de urgență, sună la 112.</li>
            <li>Nu promitem rezultate. Răspunsul la tratament diferă de la o persoană la alta.</li>
            <li>Nu înlocuim medicul de familie sau consultul în persoană când acesta este necesar.</li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="preturi-info" className="border-t border-line-soft">
        <div className="container-page grid gap-6 py-14 md:py-20 lg:grid-cols-2 lg:gap-20">
          <h2 id="preturi-info" className="text-display-3">
            Cât costă
          </h2>
          <div>
            <p className="text-ink-soft">Prețurile vor fi afișate clar pe site înainte de lansare.</p>
            <div className="mt-4">
              <TemporaryNote>Structura de prețuri este în curs de stabilire.</TemporaryNote>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
