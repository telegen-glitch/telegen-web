import Link from "next/link";
import { content } from "@/content/source";
import { ClosingCta } from "@/components/home/ClosingCta";
import { SectionHeading } from "@/components/home/SectionHeading";
import { PageHeader } from "@/components/layout/PageHeader";
import { Arrow } from "@/components/ui/Button";
import { TemporaryBadge, TemporaryNote } from "@/components/ui/Temporary";
import { isEnabled } from "@/lib/flags";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Echipa medicală",
  description:
    "Medicii dermatologi care evaluează pacienții Telegen și revizuiesc conținutul medical al site-ului.",
  path: "/echipa-medicala",
  // No real clinicians yet: keep out of the index until the team is confirmed.
  indexable: content.listClinicians().some((c) => !c.temporary),
});

const selection = [
  [
    "Specialitate",
    "Medici specialiști sau primari în dermatovenerologie, cu aviz de liberă practică valabil.",
  ],
  ["Verificare", "Documentele fiecărui medic sunt verificate înainte de colaborare."],
  ["Transparență", "Nume, grad profesional și cod de parafă, publicate pe pagina fiecărui medic."],
  ["Responsabilitate", "Medicul care te evaluează răspunde de planul tău și de urmărire."],
];

export default function TeamPage() {
  const team = content.listClinicians();
  const profiles = isEnabled("doctorProfiles") ? team.filter((c) => !c.temporary) : [];
  const roles = team.filter((c) => c.temporary);

  return (
    <>
      <PageHeader
        crumbs={[{ name: "Echipa medicală", href: "/echipa-medicala" }]}
        eyebrow="Echipa medicală"
        title="Medicii din spatele"
        accent="fiecărei evaluări."
        lead="Prezentăm fiecare medic cu nume, grad profesional, specialitate și cod de parafă, ca să poți verifica în registrul Colegiului Medicilor din România."
      />

      <section aria-labelledby="medici" className="section-y">
        <div className="container-page">
          <SectionHeading id="medici" title="Echipa" accent="Telegen" />
          {profiles.length > 0 ? (
            <ul className="mt-10 snap-track auto-cols-[80%] gap-4 sm:auto-cols-[45%] lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible">
              {profiles.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/echipa-medicala/${c.slug}`}
                    className="block h-full rounded-card-lg bg-mist p-7"
                  >
                    <span className="block text-xl font-semibold text-navy-950">{c.name}</span>
                    <span className="mt-1 block text-ink-soft">{c.credential}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/echipa-medicala/${c.slug}`}
                    className="group flex h-full flex-col rounded-card-lg border border-dashed border-line p-7"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-xl font-semibold tracking-tight text-navy-950">{c.name}</span>
                      <TemporaryBadge />
                    </span>
                    <span className="mt-1 text-ink-soft">{c.role}</span>
                    <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-navy-950">
                      Despre rol <Arrow className="text-blue-700" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 max-w-2xl">
            <TemporaryNote>
              Medicii se prezintă nominal înainte de lansare. Nu folosim fotografii de stoc și nu prezentăm
              medici înainte de confirmarea colaborării.
            </TemporaryNote>
          </div>
        </div>
      </section>

      <section aria-labelledby="selectie" className="bg-mist section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionHeading id="selectie" eyebrow="Cum lucrăm" title="Cum alegem" accent="medicii." />
          <ol data-reveal-group className="grid gap-3 sm:grid-cols-2">
            {selection.map(([t, d], i) => (
              <li key={t} data-reveal className="rounded-card bg-white p-6">
                <span className="font-serif text-2xl text-blue-700 italic" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 font-semibold text-navy-950">{t}</p>
                <p className="mt-1 text-sm text-ink-soft">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
