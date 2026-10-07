import { ClosingCta } from "@/components/home/ClosingCta";
import { SectionHeading } from "@/components/home/SectionHeading";
import { PageHeader } from "@/components/layout/PageHeader";
import { staticPageMetadata } from "@/lib/page-meta";

export const metadata = staticPageMetadata("/echipa-medicala");

const specialties = [
  ["Căderea părului și acneea", "Medici specialiști sau primari în dermatovenerologie."],
  ["Disfuncția erectilă", "Medici specialiști sau primari în urologie ori medicină de familie."],
];

const principles = [
  [
    "Drept de liberă practică",
    "Fiecare medic este înscris în Colegiul Medicilor din România și are aviz de liberă practică valabil.",
  ],
  [
    "Specialitatea potrivită",
    "Evaluarea este făcută de un medic cu specialitatea potrivită afecțiunii tale.",
  ],
  [
    "Știi cine te consultă",
    "Înainte de consult primești numele medicului și codul lui de parafă, ca să-l poți verifica în registrul Colegiului Medicilor.",
  ],
  ["Răspunde de plan", "Medicul care te evaluează răspunde de planul tău și de urmărire."],
];

/**
 * Team page under the privacy model (§v4.D): the team is described by
 * specialty and registration only. No names, photos or parafă codes on the
 * public site; patients receive them in the clinical app before the consult.
 */
export default function TeamPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Echipa medicală", href: "/echipa-medicala" }]}
        eyebrow="Echipa medicală"
        title="Medici cu drept de liberă practică,"
        accent="pentru fiecare afecțiune."
        lead="Pe site nu publicăm numele și fotografiile medicilor. Înainte de consult, afli numele medicului care te evaluează și codul lui de parafă, ca să-l poți verifica."
      />

      <section aria-labelledby="specialitati" className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionHeading
            id="specialitati"
            eyebrow="Specialități"
            title="Cine evaluează"
            accent="fiecare afecțiune."
          />
          <ul data-reveal-group className="grid gap-3">
            {specialties.map(([t, d]) => (
              <li key={t} data-reveal className="rounded-card bg-mist p-6">
                <p className="font-semibold text-navy-950">{t}</p>
                <p className="mt-1 text-ink-soft">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="principii" className="bg-mist section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionHeading
            id="principii"
            eyebrow="Cum lucrăm"
            title="Reguli"
            accent="pentru echipa medicală."
          />
          <ol data-reveal-group className="grid gap-3 sm:grid-cols-2">
            {principles.map(([t, d], i) => (
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
