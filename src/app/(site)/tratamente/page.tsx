import Link from "next/link";
import { content } from "@/content/source";
import { PageHeader } from "@/components/layout/PageHeader";
import { Arrow } from "@/components/ui/Button";
import { plainText } from "@/lib/rich-text";
import { staticPageMetadata } from "@/lib/page-meta";

export const metadata = staticPageMetadata("/tratamente");

/** Neutral medicine information. No calls to action next to medicine names (section 9.4). */
export default function TreatmentsIndex() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Despre tratamente", href: "/tratamente" }]}
        eyebrow="Informații despre tratamente"
        title="Ce trebuie să știi"
        accent="despre tratamente."
        lead="Strict informativ: cum acționează, ce arată studiile, ce efecte adverse pot avea și unde sunt limitele. Ce ți se potrivește stabilește medicul."
      />
      <div className="container-page section-y">
        <div className="space-y-16">
          {content.listConditions().map((c) => (
            <section key={c.slug} aria-labelledby={`tratamente-${c.slug}`}>
              <h2 id={`tratamente-${c.slug}`} className="text-display-3">
                {c.name}
              </h2>
              <ul data-reveal-group className="mt-6 grid gap-4 md:grid-cols-2">
                {content.listTreatments(c.slug).map((t) => (
                  <li key={t.slug} data-reveal>
                    <Link
                      href={`/tratamente/${t.slug}`}
                      className="group flex h-full flex-col rounded-card-lg border border-line p-7 transition-colors hover:border-navy-950 md:p-9"
                    >
                      <span className="text-[1.75rem] leading-tight font-semibold tracking-tight text-navy-950">
                        {t.title}
                      </span>
                      <span className="mt-3 text-ink-soft">{plainText(t.summary)}</span>
                      <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-6 text-sm font-semibold text-navy-950">
                        Citește informațiile{" "}
                        <Arrow className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm text-ink-muted">
          Aceste pagini nu sunt recomandări de tratament și nu promovează medicamente. Unele substanțe se
          eliberează doar pe bază de prescripție medicală.
        </p>
      </div>
    </>
  );
}
