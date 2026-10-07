import Link from "next/link";
import { Arrow } from "@/components/ui/Button";
import { SectionHeading } from "./SectionHeading";

/**
 * Medical team section under the privacy model (§v4.D): described by
 * specialty and registration, never by name or photo.
 */
export function TeamSection() {
  return (
    <section aria-labelledby="echipa" className="section-y">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            id="echipa"
            eyebrow="Echipa medicală"
            title="Medici cu drept de liberă practică,"
            accent="nu algoritmi."
            text="Fiecare evaluare este citită de un medic cu specialitatea potrivită afecțiunii tale. Medicul decide, nu un formular."
          />
          <Link
            href="/echipa-medicala"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-navy-950 hover:underline"
          >
            Despre echipa medicală <Arrow />
          </Link>
        </div>
        <div data-reveal className="mt-10 grid gap-4 rounded-card-lg bg-mist p-6 md:grid-cols-3 md:p-8">
          {[
            [
              "Specialitatea potrivită",
              "Dermatologi pentru piele și păr; urologi sau medici de familie pentru disfuncția erectilă.",
            ],
            ["Înscriși în Colegiul Medicilor", "Toți medicii au drept de liberă practică în România."],
            ["Știi cine te consultă", "Afli numele medicului și codul de parafă înainte de consult."],
          ].map(([t, d]) => (
            <div key={t}>
              <p className="font-semibold text-navy-950">{t}</p>
              <p className="mt-1 text-sm text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
