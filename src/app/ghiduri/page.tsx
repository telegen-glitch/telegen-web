import Link from "next/link";
import { content } from "@/content/source";
import { PageHeader } from "@/components/layout/PageHeader";
import { Arrow } from "@/components/ui/Button";
import { CtaBand } from "@/components/home/CtaBand";
import { plainText } from "@/lib/rich-text";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Ghiduri despre căderea părului",
  description:
    "Ghiduri clare, cu surse, despre căderea părului: semnele alopeciei androgenetice, cauzele și răspunsuri la întrebările frecvente.",
  path: "/ghiduri",
});

const roleLabel = {
  symptoms: "Semne",
  causes: "Cauze",
  questions: "Întrebări",
  condition: "Afecțiune",
  treatment: "Tratament",
} as const;

export default function GuidesIndex() {
  const conditions = content.listConditions();
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Ghiduri", href: "/ghiduri" }]}
        eyebrow="Ghiduri"
        title="Ghiduri medicale, pe înțeles"
        lead="Scrise pornind de la ghiduri clinice și studii, cu sursele citate pe fiecare pagină. Fără promisiuni, fără senzațional."
      />
      <div className="container-page py-14 md:py-20">
        {conditions.map((c) => (
          <section key={c.slug} aria-labelledby={`ghiduri-${c.slug}`}>
            <h2 id={`ghiduri-${c.slug}`} className="text-display-3">
              {c.name}
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {content.listGuides(c.slug).map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/ghiduri/${g.slug}`}
                    className="group flex h-full flex-col rounded-card border border-line p-6 transition-colors hover:border-navy-950 md:p-7"
                  >
                    <span className="text-eyebrow text-blue-700">{roleLabel[g.graphRole]}</span>
                    <span className="mt-3 font-serif text-2xl leading-snug text-navy-950">{g.title}</span>
                    <span className="mt-3 line-clamp-3 text-sm text-ink-soft">{plainText(g.summary)}</span>
                    <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-sm font-semibold text-navy-950">
                      Citește ghidul{" "}
                      <Arrow className="text-blue-700 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-soft">
              Vezi și pagina despre{" "}
              <Link href={`/afectiuni/${c.slug}`} className="text-blue-700 underline underline-offset-2">
                {c.name.toLowerCase()}
              </Link>{" "}
              și{" "}
              <Link href="/tratamente" className="text-blue-700 underline underline-offset-2">
                informațiile despre tratamente
              </Link>
              .
            </p>
          </section>
        ))}
      </div>
      <CtaBand />
    </>
  );
}
