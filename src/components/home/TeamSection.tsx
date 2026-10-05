import Link from "next/link";
import type { Clinician } from "@/content/types";
import { Arrow } from "@/components/ui/Button";
import { TemporaryNote } from "@/components/ui/Temporary";
import { isEnabled } from "@/lib/flags";
import { SectionHeading } from "./SectionHeading";

/**
 * Medical team: swipe carousel (mobile) + grid (desktop) + credential badges.
 * Profiles render only for confirmed clinicians and only with the doctorProfiles
 * flag on. Until then the section says plainly that the team is announced later.
 */
export function TeamSection({ clinicians }: { clinicians: Clinician[] }) {
  const confirmed = clinicians.filter((c) => !c.temporary && c.credential);
  const showProfiles = isEnabled("doctorProfiles") && confirmed.length > 0;

  return (
    <section aria-labelledby="echipa" className="section-y">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            id="echipa"
            eyebrow="Echipa medicală"
            title="Medici dermatologi,"
            accent="nu algoritmi."
            text="Fiecare evaluare este citită de un medic dermatolog cu drept de liberă practică în România. Medicul decide, nu un formular."
          />
          <Link
            href="/echipa-medicala"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-navy-950 hover:underline"
          >
            Despre echipa medicală <Arrow />
          </Link>
        </div>

        {showProfiles ? (
          <ul className="mt-10 snap-track auto-cols-[80%] gap-4 sm:auto-cols-[45%] lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible">
            {confirmed.map((c) => (
              <li key={c.slug}>
                <Link href={`/echipa-medicala/${c.slug}`} className="block rounded-card bg-mist p-6">
                  <span className="block text-lg font-semibold text-navy-950">{c.name}</span>
                  <span className="mt-1 block text-sm text-ink-soft">{c.credential}</span>
                  {isEnabled("certificationBadges") && c.registration && (
                    <span className="mt-4 inline-flex rounded-pill bg-white px-3 py-1 text-xs font-semibold text-navy-950">
                      CMR {c.registration}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div data-reveal className="mt-10 grid gap-4 rounded-card-lg bg-mist p-6 md:grid-cols-3 md:p-8">
            {[
              ["Specialiști dermatologi", "Doar medici specialiști sau primari în dermatovenerologie."],
              ["Verificabili public", "Nume, grad și cod de parafă, publicate pe site."],
              ["Răspund de plan", "Medicul care te evaluează rămâne responsabil de urmărire."],
            ].map(([t, d]) => (
              <div key={t}>
                <p className="font-semibold text-navy-950">{t}</p>
                <p className="mt-1 text-sm text-ink-soft">{d}</p>
              </div>
            ))}
            <div className="md:col-span-3">
              <TemporaryNote>
                Medicii se prezintă nominal, cu date verificabile, înainte de lansare.
              </TemporaryNote>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
