import Link from "next/link";
import { content } from "@/content/source";
import { PageHeader } from "@/components/layout/PageHeader";
import { Arrow } from "@/components/ui/Button";
import { TemporaryBadge } from "@/components/ui/Temporary";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Echipa medicală",
  description:
    "Medicii dermatologi care evaluează pacienții Telegen și revizuiesc conținutul medical al site-ului.",
  path: "/echipa-medicala",
  // No real clinicians yet: keep out of the index until the team is confirmed.
  indexable: content.listClinicians().some((c) => !c.temporary),
});

export default function TeamPage() {
  const team = content.listClinicians();
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Echipa medicală", href: "/echipa-medicala" }]}
        eyebrow="Echipa medicală"
        title="Medicii din spatele evaluărilor"
        lead="Prezentăm fiecare medic cu nume, grad profesional, specialitate și cod de parafă, ca să poți verifica în registrul Colegiului Medicilor din România."
      />
      <div className="container-page py-14 md:py-20">
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {team.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/echipa-medicala/${c.slug}`}
                className="group flex h-full flex-col rounded-card border border-line p-6 transition-colors hover:border-navy-950 md:p-7"
              >
                <span
                  aria-hidden="true"
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-paper font-serif text-2xl text-ink-muted"
                >
                  {c.temporary
                    ? "?"
                    : c.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                </span>
                <span className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="font-serif text-2xl text-navy-950">{c.name}</span>
                  {c.temporary && <TemporaryBadge />}
                </span>
                <span className="mt-1 text-sm text-ink-soft">{c.credential ?? c.role}</span>
                <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-sm font-semibold text-navy-950">
                  Profil <Arrow className="text-blue-700" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-2xl text-sm text-ink-muted">
          Nu folosim fotografii de stoc și nu prezentăm medici înainte de confirmarea colaborării. Profilele
          marcate TEMPORARY descriu un rol, nu o persoană.
        </p>
      </div>
    </>
  );
}
