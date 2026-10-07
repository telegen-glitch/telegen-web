import Link from "next/link";
import { content } from "@/content/source";
import { ClosingCta } from "@/components/home/ClosingCta";
import { PageHeader } from "@/components/layout/PageHeader";
import { Arrow } from "@/components/ui/Button";
import { plainText } from "@/lib/rich-text";
import { staticPageMetadata } from "@/lib/page-meta";

export const metadata = staticPageMetadata("/ghiduri");

const roleLabel = {
  symptoms: "Semne",
  causes: "Cauze",
  questions: "Întrebări",
  condition: "Afecțiune",
  treatment: "Tratament",
  types: "Tipuri",
  scars: "Cicatrici",
  heart: "Inimă",
} as const;

/** Knowledge base: articles grouped by condition, with links to treatment information. */
export default function GuidesIndex() {
  const conditions = content.listConditions();
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Ghiduri", href: "/ghiduri" }]}
        eyebrow="Ghiduri medicale"
        title="Tot ce merită să știi,"
        accent="explicat clar."
        lead="Scrise pornind de la ghiduri clinice și studii, cu sursele citate pe fiecare pagină. Fără promisiuni, fără senzațional."
      />
      <div className="container-page space-y-16 section-y">
        {conditions.map((c) => (
          <section key={c.slug} aria-labelledby={`ghiduri-${c.slug}`}>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h2 id={`ghiduri-${c.slug}`} className="text-display-2">
                {c.name}
              </h2>
              <Link
                href={c.basePath}
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy-950 hover:underline"
              >
                Despre afecțiune <Arrow />
              </Link>
            </div>
            <ul data-reveal-group className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.listGuides(c.slug).map((g) => (
                <li key={g.slug} data-reveal>
                  <Link
                    href={`/ghiduri/${g.slug}`}
                    className="group flex h-full flex-col rounded-card-lg bg-mist p-7 transition-colors hover:bg-mist-deep"
                  >
                    <span className="self-start rounded-pill bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                      {roleLabel[g.graphRole]}
                    </span>
                    <span className="mt-5 text-xl leading-snug font-semibold tracking-tight text-navy-950">
                      {g.title}
                    </span>
                    <span className="mt-3 line-clamp-3 text-sm text-ink-soft">{plainText(g.summary)}</span>
                    <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-navy-950">
                      Citește ghidul <Arrow className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section
          aria-labelledby="ghiduri-tratamente"
          className="rounded-card-lg border border-line p-7 md:p-10"
        >
          <h2 id="ghiduri-tratamente" className="text-display-3">
            Informații despre tratamente
          </h2>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Cum acționează substanțele folosite în alopecia androgenetică, ce arată studiile și ce efecte
            adverse pot avea.
          </p>
          <Link
            href="/tratamente"
            className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-blue-700 hover:underline"
          >
            Vezi informațiile <Arrow />
          </Link>
        </section>
      </div>
      <ClosingCta />
    </>
  );
}
