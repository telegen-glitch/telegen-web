import Link from "next/link";
import { content } from "@/content/source";
import type { Faq } from "@/content/types";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { JsonLd } from "@/components/ui/JsonLd";
import { TemporaryNote } from "@/components/ui/Temporary";
import { CtaBand } from "@/components/home/CtaBand";
import { GrowthCycle } from "@/components/home/GrowthCycle";
import { Steps } from "@/components/home/Steps";
import { FaqList } from "@/components/medical/Faq";
import { evaluationCta } from "@/lib/nav";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Telegen — dermatologie online. Căderea părului, evaluată de medici",
  description:
    "Clinică dermatologică online din România. Evaluare făcută de un medic dermatolog, tratament explicat clar și urmărire în timp. Începem cu căderea părului.",
  path: "/",
  absoluteTitle: true,
});

const homeFaqs: Faq[] = [
  {
    question: "Telegen funcționează deja?",
    answer:
      "Nu încă. Site-ul este în pre-lansare: poți citi ghidurile și poți parcurge evaluarea ca să vezi cum arată, dar răspunsurile nu sunt trimise nimănui. Te putem anunța când serviciul medical se deschide.",
  },
  {
    question: "Cine îmi va analiza evaluarea?",
    answer:
      "Un medic dermatolog cu drept de liberă practică în România. Înainte de lansare, medicii vor fi prezentați pe site cu nume, grad profesional și cod de parafă.",
  },
  {
    question: "Primesc tratament fără să vorbesc cu un medic?",
    answer:
      "Nu. Orice recomandare de tratament pornește de la evaluarea unui medic. Dacă situația ta are nevoie de un consult în persoană, îți spunem direct.",
  },
  {
    question: "Ce se întâmplă cu datele mele de sănătate?",
    answer:
      "În pre-lansare, răspunsurile la evaluare rămân doar în pagina deschisă și dispar când o închizi. La lansare, datele medicale vor fi gestionate într-o aplicație clinică separată, cu acordul tău explicit și găzduire în Uniunea Europeană. Detalii în [politica de confidențialitate](/politica-de-confidentialitate).",
  },
  {
    question: "Cât costă?",
    answer:
      "Prețurile vor fi afișate clar pe site înainte de lansare, pentru fiecare tip de evaluare și de urmărire.",
  },
];

export default function HomePage() {
  const conditions = content.listConditions();
  const hairLoss = content.getCondition("caderea-parului");
  const guides = content.listGuides("caderea-parului");
  const treatments = content.listTreatments("caderea-parului");

  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden">
        <div className="container-page grid items-center gap-10 pt-10 pb-14 md:pt-16 md:pb-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pt-20 lg:pb-24">
          <div>
            <Eyebrow>Dermatologie online</Eyebrow>
            <h1 className="mt-4 max-w-[14ch] text-display-1">
              Căderea părului, evaluată de un medic dermatolog
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink-soft">
              Răspunzi online la câteva întrebări, un medic dermatolog îți analizează situația și, dacă e
              potrivit, primești un plan de tratament și urmărire. Fără drumuri, fără recomandări generice.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href={evaluationCta.href} className="w-full sm:w-auto">
                {evaluationCta.label} <Arrow />
              </ButtonLink>
              <ButtonLink href="/cum-functioneaza" variant="secondary" className="w-full sm:w-auto">
                Cum funcționează
              </ButtonLink>
            </div>
            <ul className="mt-8 grid gap-2.5 text-sm text-ink-soft sm:grid-cols-3 sm:gap-4">
              {[
                "Pornim de la diagnostic, nu de la un produs",
                "Informații medicale cu surse citate",
                "Datele de sănătate nu sunt salvate pe acest site",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="mt-1 h-4 w-4 shrink-0 text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="m3 8.5 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full rounded-[1.75rem] bg-paper px-6 py-8 md:mx-auto md:max-w-lg md:px-10 md:py-12 lg:max-w-none">
            <GrowthCycle />
          </div>
        </div>
      </section>

      {/* Conditions (condition-led) */}
      <section aria-labelledby="ce-tratam" className="border-t border-line-soft">
        <div className="container-page py-16 md:py-24">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Eyebrow>Afecțiuni</Eyebrow>
              <h2 id="ce-tratam" className="mt-3 text-display-2">
                Cu ce te putem ajuta
              </h2>
            </div>
            <Link
              href="/afectiuni"
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy-950 hover:underline"
            >
              Toate afecțiunile <Arrow />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[2fr_1fr]">
            {conditions.map((c) => (
              <Link
                key={c.slug}
                href={`/afectiuni/${c.slug}`}
                className="group grid gap-8 rounded-card bg-navy-950 p-7 text-white transition-colors hover:bg-navy-900 md:grid-cols-[1fr_auto] md:items-end md:p-10"
              >
                <div>
                  <p className="text-eyebrow text-white/60">Disponibil la lansare</p>
                  <h3 className="mt-3 font-serif text-[2rem] leading-tight text-white md:text-[2.5rem]">
                    {c.name}
                  </h3>
                  <p className="mt-3 max-w-lg text-white/75">{c.teaser}</p>
                </div>
                <span className="inline-flex min-h-11 items-center gap-2 font-semibold">
                  Află mai multe <Arrow className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
            <div className="rounded-card border border-dashed border-line p-7 md:p-10">
              <p className="text-eyebrow text-ink-muted">În pregătire</p>
              <h3 className="mt-3 font-serif text-2xl text-navy-950">Alte afecțiuni dermatologice</h3>
              <p className="mt-3 text-ink-soft">
                Adăugăm o afecțiune nouă doar după ce protocolul clinic și conținutul sunt revizuite de
                medici.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works: short 3-step explainer near the top */}
      <section aria-labelledby="cum-functioneaza" className="bg-paper">
        <div className="container-page py-16 md:py-24">
          <div className="max-w-2xl">
            <Eyebrow>Cum funcționează</Eyebrow>
            <h2 id="cum-functioneaza" className="mt-3 text-display-2">
              Trei pași, un singur medic care răspunde de plan
            </h2>
          </div>
          <div className="mt-10">
            <Steps tone="paper" />
          </div>
          <div className="mt-8">
            <ButtonLink href="/cum-functioneaza" variant="quiet">
              Ce se întâmplă la fiecare pas <Arrow />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Education integrated with the service */}
      {hairLoss && (
        <section aria-labelledby="educatie">
          <div className="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <div>
              <Eyebrow>Înțelege ce se întâmplă</Eyebrow>
              <h2 id="educatie" className="mt-3 text-display-2">
                Căderea părului, explicată pe înțelesul tău
              </h2>
              <p className="mt-5 max-w-lg text-ink-soft">
                Cea mai frecventă formă, alopecia androgenetică, apare treptat și urmează un tipar. Cu cât o
                înțelegi mai devreme, cu atât ai mai multe opțiuni.
              </p>
              <ButtonLink href={`/afectiuni/${hairLoss.slug}`} variant="secondary" className="mt-8">
                Despre căderea părului
              </ButtonLink>
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {[...guides, ...treatments].map((d) => {
                const href = d.kind === "guide" ? `/ghiduri/${d.slug}` : `/tratamente/${d.slug}`;
                return (
                  <li key={d.slug}>
                    <Link href={href} className="group flex min-h-16 items-center justify-between gap-6 py-5">
                      <span>
                        <span className="block text-eyebrow text-ink-muted">
                          {d.kind === "guide" ? "Ghid" : "Despre tratament"}
                        </span>
                        <span className="mt-1 block font-serif text-xl text-navy-950 group-hover:underline md:text-2xl">
                          {d.title}
                        </span>
                      </span>
                      <Arrow className="text-blue-700 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Expectations teaser */}
      {hairLoss?.timeline && (
        <section aria-labelledby="asteptari-home" className="bg-paper">
          <div className="container-page py-16 md:py-24">
            <div className="max-w-2xl">
              <Eyebrow>Așteptări realiste</Eyebrow>
              <h2 id="asteptari-home" className="mt-3 text-display-2">
                Rezultatele se judecă în luni, nu în zile
              </h2>
              <p className="mt-5 text-ink-soft">
                Părul crește încet. Îți spunem de la început ce poți observa și când, ca să nu renunți prea
                devreme și să nu ai așteptări nerealiste.
              </p>
            </div>
            <ol className="mt-10 grid gap-px overflow-hidden rounded-card bg-line md:grid-cols-4">
              {hairLoss.timeline.steps.slice(1).map((s) => (
                <li key={s.period} className="bg-white p-6 md:p-7">
                  <p className="text-eyebrow text-blue-700">{s.period}</p>
                  <p className="mt-3 text-lg font-semibold text-navy-950">{s.title}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <ButtonLink href={`/afectiuni/${hairLoss.slug}#asteptari`} variant="quiet">
                Vezi etapele în detaliu <Arrow />
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* Clinical standards and team */}
      <section aria-labelledby="standarde">
        <div className="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <Eyebrow>Standarde clinice</Eyebrow>
            <h2 id="standarde" className="mt-3 text-display-2">
              Medicina vine înaintea vânzării
            </h2>
            <p className="mt-5 max-w-md text-ink-soft">
              Regulile după care lucrăm sunt publice. Le poți citi integral, împreună cu felul în care alegem
              și verificăm medicii.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/standarde-clinice" variant="secondary">
                Standardele noastre
              </ButtonLink>
              <ButtonLink href="/echipa-medicala" variant="quiet">
                Echipa medicală <Arrow />
              </ButtonLink>
            </div>
          </div>
          <div>
            <ol className="divide-y divide-line border-y border-line">
              {[
                [
                  "Medici cu drept de liberă practică",
                  "Fiecare evaluare este analizată de un medic dermatolog înscris în Colegiul Medicilor din România.",
                ],
                [
                  "Tratament doar când este indicat",
                  "Dacă tratamentul la distanță nu e potrivit, îți spunem și îți explicăm ce consult îți trebuie.",
                ],
                [
                  "Informații cu surse",
                  "Ce scriem despre afecțiuni și tratamente se bazează pe ghiduri și studii citate pe fiecare pagină.",
                ],
                [
                  "Datele de sănătate, separat",
                  "Datele medicale nu ajung pe acest site. La lansare, ele vor fi gestionate într-o aplicație clinică separată.",
                ],
              ].map(([title, text], i) => (
                <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-2 py-6">
                  <span className="font-serif text-xl text-blue-700" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-950">{title}</h3>
                    <p className="mt-1.5 text-ink-soft">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6">
              <TemporaryNote>Echipa medicală se publică nominal înainte de lansare.</TemporaryNote>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="intrebari-home" className="border-t border-line-soft">
        <div className="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <Eyebrow>Întrebări</Eyebrow>
            <h2 id="intrebari-home" className="mt-3 text-display-2">
              Întrebări frecvente
            </h2>
          </div>
          <FaqList faqs={homeFaqs} />
        </div>
      </section>

      <CtaBand />
      <JsonLd data={faqJsonLd(homeFaqs)} />
    </>
  );
}
