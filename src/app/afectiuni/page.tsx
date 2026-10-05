import Link from "next/link";
import { content } from "@/content/source";
import { PageHeader } from "@/components/layout/PageHeader";
import { Arrow } from "@/components/ui/Button";
import { CtaBand } from "@/components/home/CtaBand";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Afecțiuni dermatologice tratate online",
  description:
    "Afecțiunile pentru care Telegen oferă evaluare dermatologică online. Începem cu căderea părului (alopecia androgenetică).",
  path: "/afectiuni",
});

export default function ConditionsHub() {
  const conditions = content.listConditions();
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Afecțiuni", href: "/afectiuni" }]}
        eyebrow="Afecțiuni"
        title="Ce evaluăm online"
        lead="Lucrăm pe rând, câte o afecțiune, fiecare cu protocol clinic scris și revizuit de medici dermatologi. Prima este căderea părului."
      />
      <div className="container-page py-14 md:py-20">
        <ul className="grid gap-4">
          {conditions.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/afectiuni/${c.slug}`}
                className="group grid gap-6 rounded-card border border-line p-7 transition-colors hover:border-navy-950 md:grid-cols-[1fr_auto] md:items-center md:p-10"
              >
                <div>
                  <h2 className="font-serif text-[2rem] leading-tight text-navy-950">{c.name}</h2>
                  <p className="mt-2 max-w-2xl text-ink-soft">{c.teaser}</p>
                  <p className="mt-4 text-sm text-ink-muted">
                    {content.listGuides(c.slug).length} ghiduri · {content.listTreatments(c.slug).length}{" "}
                    pagini despre tratamente
                  </p>
                </div>
                <span className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy-950">
                  Despre {c.shortName.toLowerCase()}{" "}
                  <Arrow className="text-blue-700 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
          <li className="rounded-card border border-dashed border-line p-7 md:p-10">
            <h2 className="font-serif text-2xl text-navy-950">Alte afecțiuni dermatologice</h2>
            <p className="mt-2 max-w-2xl text-ink-soft">
              În pregătire. Publicăm o afecțiune nouă doar după ce protocolul clinic și conținutul medical
              sunt revizuite.
            </p>
          </li>
        </ul>
      </div>
      <CtaBand />
    </>
  );
}
