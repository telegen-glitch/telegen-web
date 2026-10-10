import Link from "next/link";
import { CompanyIdentity } from "@/components/layout/CompanyIdentity";
import { ContactEmail } from "@/components/layout/ContactEmail";
import { LegalPage } from "@/components/layout/LegalPage";
import { staticPageMetadata } from "@/lib/page-meta";
import { publishedConditionList } from "@/lib/positioning";

export const metadata = staticPageMetadata("/termeni-si-conditii");

/** Launch version (v4.7). Requires the lawyer's sign-off: docs/legal-review-needed.md. */
export default function TermsPage() {
  return (
    <LegalPage title="Termeni și condiții" path="/termeni-si-conditii" updatedAt="2026-10-10">
      <h2>Cine suntem</h2>
      <p>
        Telegen este o clinică online pentru sănătatea bărbaților. Site-ul telegen.ro și aplicația clinică
        Telegen sunt administrate de:
      </p>
      <div className="not-prose my-4">
        <CompanyIdentity />
      </div>
      <p>
        Ne poți scrie la <ContactEmail />.
      </p>

      <h2>Ce oferă Telegen</h2>
      <p>
        Telegen oferă evaluare medicală online pentru {publishedConditionList()}. Evaluarea este analizată de
        un medic cu drept de liberă practică în România și cu specialitatea potrivită afecțiunii. Site-ul
        telegen.ro conține informații medicale educative și evaluarea inițială; serviciul medical propriu-zis
        se desfășoară în aplicația clinică Telegen.
      </p>

      <h2>Cum funcționează serviciul</h2>
      <ol>
        <li>
          Pe site răspunzi la câteva întrebări. Răspunsurile rămân doar în pagina deschisă și nu se transmit.
        </li>
        <li>
          În aplicația clinică îți creezi contul, îți dai acordul explicit pentru prelucrarea datelor medicale
          și răspunzi la întrebările medicale.
        </li>
        <li>
          Un medic îți analizează evaluarea, îți poate pune întrebări și decide ce recomandă: un plan de
          tratament, investigații sau un consult în persoană. Înainte de consult afli numele medicului și
          codul lui de parafă.
        </li>
        <li>Primești planul în aplicație, împreună cu reevaluările stabilite de medic.</li>
      </ol>

      <h2>Limitele evaluării online</h2>
      <ul>
        <li>Telegen nu tratează urgențe. În caz de urgență, sună la 112.</li>
        <li>
          Medicul poate decide că evaluarea online nu este potrivită pentru situația ta și îți poate recomanda
          un consult în persoană.
        </li>
        <li>Răspunsul la tratament diferă de la o persoană la alta. Nu promitem un anumit rezultat.</li>
        <li>
          Recomandarea medicului se bazează pe informațiile pe care le dai. Te rugăm să răspunzi complet și
          corect, inclusiv despre medicamentele pe care le iei.
        </li>
      </ul>

      <h2>Cine poate folosi serviciul</h2>
      <p>Serviciul medical este destinat persoanelor de cel puțin 18 ani.</p>

      <h2>Prețuri și plată</h2>
      <p>
        Prețurile sunt publicate pe pagina <Link href="/cum-functioneaza">Cum funcționează</Link> și sunt
        afișate din nou în aplicație, înainte de plată. Ce include fiecare preț este descris lângă preț. Plata
        se face online, în aplicația clinică.
      </p>

      <h2>Anulare</h2>
      <p>
        Poți renunța oricând înainte de plată, fără niciun cost. După plată, condițiile de anulare și de
        rambursare sunt cele afișate în aplicație înainte să plătești, în limitele prevăzute de lege.
      </p>

      <h2>Informațiile de pe site</h2>
      <p>
        Ghidurile de pe site au scop educativ. Nu reprezintă diagnostic, recomandare de tratament sau ofertă
        de medicamente. Informațiile despre medicamente sunt neutre și nu înlocuiesc prospectul sau sfatul
        medicului.
      </p>

      <h2>Date personale</h2>
      <p>
        Datele tale sunt prelucrate conform{" "}
        <Link href="/politica-de-confidentialitate">politicii de confidențialitate</Link>. Datele de sănătate
        sunt prelucrate doar în aplicația clinică, cu acordul tău explicit. Despre cookie-uri, vezi{" "}
        <Link href="/politica-cookie">politica de cookie-uri</Link>.
      </p>

      <h2>Proprietate intelectuală</h2>
      <p>Textele, grafica și elementele de identitate vizuală ale site-ului aparțin Telegen.</p>

      <h2>Reclamații și litigii</h2>
      <p>
        Pentru orice reclamație, scrie-ne la <ContactEmail />. Ca și consumator, te poți adresa și Autorității
        Naționale pentru Protecția Consumatorilor (ANPC), inclusiv prin procedura de{" "}
        <a href="https://anpc.ro/ce-este-sal/" rel="noopener noreferrer">
          soluționare alternativă a litigiilor (SAL)
        </a>
        .
      </p>

      <h2>Modificări</h2>
      <p>
        Când modificăm acești termeni, actualizăm data de la începutul paginii. Pentru un serviciu deja plătit
        se aplică termenii în vigoare la data plății.
      </p>
    </LegalPage>
  );
}
