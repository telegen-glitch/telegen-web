import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { TemporaryNote } from "@/components/ui/Temporary";
import { ClosingCta } from "@/components/home/ClosingCta";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Standarde clinice și despre Telegen",
  description:
    "Regulile după care lucrează Telegen: medici cu drept de liberă practică, protocoale clinice scrise, informații medicale cu surse și date de sănătate protejate.",
  path: "/standarde-clinice",
});

const standards = [
  {
    id: "medici",
    title: "Medici cu drept de liberă practică",
    text: "Evaluările sunt analizate de medici cu specialitatea potrivită afecțiunii, înscriși în Colegiul Medicilor din România, cu aviz de liberă practică valabil. Documentele fiecărui medic sunt verificate înainte de colaborare.",
  },
  {
    id: "protocoale",
    title: "Protocoale clinice scrise",
    text: "Pentru fiecare afecțiune există un protocol scris, bazat pe ghiduri clinice actuale, aprobat de echipa medicală. Protocolul stabilește ce întrebări punem, când recomandăm un consult în persoană și cum urmărim tratamentul.",
  },
  {
    id: "limite",
    title: "Știm unde se oprește medicina la distanță",
    text: "Nu orice situație se poate evalua online. Semnele care cer un examen clinic sunt scrise în protocol, iar medicul are întotdeauna ultimul cuvânt.",
  },
  {
    id: "continut",
    title: "Conținut medical cu surse și revizuire",
    text: "Ghidurile de pe site citează surse primare. O pagină medicală apare în motoarele de căutare doar după ce un medic din echipă a revizuit-o, cu specialitatea lui și data revizuirii afișate.",
  },
  {
    id: "promovare",
    title: "Fără promovarea medicamentelor",
    text: "Nu facem reclamă la medicamente eliberate pe bază de rețetă. Pornim de la afecțiune și de la evaluare, iar informațiile despre tratamente sunt strict educative.",
  },
  {
    id: "date",
    title: "Date de sănătate protejate",
    text: "Acest site nu colectează date medicale. La lansare, datele clinice vor fi gestionate într-o aplicație separată, cu acordul tău explicit, găzduire în Uniunea Europeană și criptare.",
  },
];

export default function ClinicalStandards() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Standarde clinice", href: "/standarde-clinice" }]}
        eyebrow="Despre Telegen"
        title="Standardele"
        accent="după care lucrăm."
        lead="Telegen este o clinică dermatologică online construită în România. Publicăm regulile după care funcționăm, ca să le poți verifica."
      />
      <div className="container-page section-y">
        <ol data-reveal-group className="grid gap-x-16 md:grid-cols-2">
          {standards.map((s, i) => (
            <li key={s.id} data-reveal className="border-t border-line py-8">
              <p className="font-serif text-2xl text-blue-700 italic" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 text-display-3">{s.title}</h2>
              <p className="mt-3 text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 max-w-2xl space-y-3">
          <TemporaryNote>
            Standardele de mai sus sunt în curs de confirmare de către echipa medicală. Datele de identificare
            ale societății și autorizațiile se publică înainte de lansare.
          </TemporaryNote>
          <p className="text-sm text-ink-soft">
            Vezi și{" "}
            <Link href="/echipa-medicala" className="text-blue-700 underline underline-offset-2">
              echipa medicală
            </Link>{" "}
            și{" "}
            <Link
              href="/politica-de-confidentialitate"
              className="text-blue-700 underline underline-offset-2"
            >
              politica de confidențialitate
            </Link>
            .
          </p>
        </div>
      </div>
      <ClosingCta />
    </>
  );
}
