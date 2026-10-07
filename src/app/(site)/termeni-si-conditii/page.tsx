import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { staticPageMetadata } from "@/lib/page-meta";

export const metadata = staticPageMetadata("/termeni-si-conditii");

export default function TermsPage() {
  return (
    <LegalPage title="Termeni și condiții" path="/termeni-si-conditii" updatedAt="2026-10-05">
      <h2>Despre site</h2>
      <p>
        Site-ul telegen.ro oferă informații despre afecțiunile tratate de Telegen și despre serviciul Telegen.
        Datele de identificare ale societății care administrează site-ul se completează înainte de lansare.
      </p>
      <h2>Informațiile nu înlocuiesc consultul medical</h2>
      <p>
        Conținutul are scop educativ. Nu reprezintă diagnostic, recomandare de tratament sau ofertă de
        medicamente. Pentru o problemă de sănătate, adresează-te unui medic. În caz de urgență, sună la 112.
      </p>
      <h2>Pre-lansare</h2>
      <p>
        Serviciul medical nu este încă deschis. Evaluarea online disponibilă acum este o previzualizare:
        răspunsurile nu sunt trimise unui medic și nu sunt salvate. Condițiile serviciului medical vor fi
        publicate separat, înainte de lansare.
      </p>
      <h2>Proprietate intelectuală</h2>
      <p>Textele, grafica și elementele de identitate vizuală ale site-ului aparțin Telegen.</p>
      <h2>Date personale</h2>
      <p>
        Vezi <Link href="/politica-de-confidentialitate">politica de confidențialitate</Link> și{" "}
        <Link href="/politica-cookie">politica de cookie-uri</Link>.
      </p>
      <h2>Soluționarea litigiilor</h2>
      <p>
        Consumatorii se pot adresa Autorității Naționale pentru Protecția Consumatorilor, inclusiv prin
        procedura de soluționare alternativă a litigiilor (SAL). Legăturile și datele finale se completează
        înainte de lansare.
      </p>
    </LegalPage>
  );
}
