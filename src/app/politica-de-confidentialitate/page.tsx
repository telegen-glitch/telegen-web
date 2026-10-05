import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Politica de confidențialitate",
  description: "Cum tratează Telegen datele personale ale vizitatorilor site-ului telegen.ro.",
  path: "/politica-de-confidentialitate",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politica de confidențialitate"
      path="/politica-de-confidentialitate"
      updatedAt="2026-10-05"
    >
      <h2>Cine suntem</h2>
      <p>
        Operatorul datelor este societatea care administrează Telegen. Denumirea, sediul, codul unic de
        înregistrare și datele de contact se completează înainte de lansare.
      </p>

      <h2>Ce date colectează acest site</h2>
      <p>
        Site-ul telegen.ro este un site de informare. <strong>Nu colectează date despre sănătate.</strong>{" "}
        Evaluarea online disponibilă în pre-lansare funcționează exclusiv în browserul tău: răspunsurile nu
        sunt trimise, nu sunt salvate pe server, în cookie-uri sau în memoria browserului și dispar când
        închizi pagina.
      </p>
      <ul>
        <li>
          <strong>Preferința privind cookie-urile</strong>, salvată într-un cookie necesar. Detalii în{" "}
          <Link href="/politica-cookie">politica de cookie-uri</Link>.
        </li>
        <li>
          <strong>Adresa de e-mail</strong>, doar dacă alegi să fii anunțat la lansare și îți dai acordul. O
          folosim numai pentru acest anunț și o ștergem la cerere. Înscrierea nu este încă activă.
        </li>
        <li>
          <strong>Date tehnice</strong> (de exemplu adresa IP), prelucrate de furnizorul de găzduire pentru
          securitatea și funcționarea site-ului.
        </li>
      </ul>

      <h2>Datele medicale, la lansare</h2>
      <p>
        Serviciul medical va funcționa într-o aplicație clinică separată (app.telegen.ro). Datele de sănătate
        sunt o categorie specială de date, potrivit art. 9 din Regulamentul (UE) 2016/679 (GDPR). Ele vor fi
        prelucrate doar cu acordul tău explicit, găzduite în Uniunea Europeană și protejate prin criptare.
        Aplicația clinică va avea propria notă de informare.
      </p>

      <h2>Drepturile tale</h2>
      <p>
        Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție, precum și
        dreptul de a-ți retrage oricând consimțământul. Poți depune o plângere la Autoritatea Națională de
        Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).
      </p>

      <h2>Contact</h2>
      <p>Adresa de contact pentru protecția datelor se completează înainte de lansare.</p>
    </LegalPage>
  );
}
