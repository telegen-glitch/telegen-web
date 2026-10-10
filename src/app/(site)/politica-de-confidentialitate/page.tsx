import Link from "next/link";
import { CompanyIdentity } from "@/components/layout/CompanyIdentity";
import { ContactEmail } from "@/components/layout/ContactEmail";
import { LegalPage } from "@/components/layout/LegalPage";
import { staticPageMetadata } from "@/lib/page-meta";
import { isPrelaunch } from "@/lib/site";

export const metadata = staticPageMetadata("/politica-de-confidentialitate");

/** Launch version (v4.7). Requires the lawyer's sign-off: docs/legal-review-needed.md. */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politica de confidențialitate"
      path="/politica-de-confidentialitate"
      updatedAt="2026-10-10"
    >
      <h2>Cine este operatorul</h2>
      <p>Operatorul datelor tale personale este societatea care administrează Telegen:</p>
      <div className="not-prose my-4">
        <CompanyIdentity />
      </div>
      <p>
        Pentru orice întrebare despre datele tale, scrie-ne la <ContactEmail />.
      </p>

      <h2>Pe site-ul telegen.ro</h2>
      <p>
        <strong>Site-ul nu colectează date despre sănătate.</strong> Evaluarea de pe site funcționează
        exclusiv în browserul tău: răspunsurile nu sunt trimise, nu sunt salvate pe server, în cookie-uri sau
        în memoria browserului și dispar când închizi pagina. Când continui către consult, aplicația clinică
        primește doar afecțiunea aleasă, nu și răspunsurile.
      </p>
      <ul>
        <li>
          <strong>Preferința privind cookie-urile</strong>, salvată într-un cookie necesar. Detalii în{" "}
          <Link href="/politica-cookie">politica de cookie-uri</Link>.
        </li>
        {isPrelaunch() && (
          <li>
            <strong>Adresa de e-mail</strong>, doar dacă alegi să primești un mesaj când serviciul se deschide
            și îți dai acordul. O folosim numai pentru acest mesaj și o ștergem la cerere.
          </li>
        )}
        <li>
          <strong>Date tehnice</strong> (de exemplu adresa IP), prelucrate de furnizorul de găzduire pentru
          securitatea și funcționarea site-ului.
        </li>
      </ul>

      <h2>În aplicația clinică Telegen</h2>
      <p>Serviciul medical se desfășoară în aplicația clinică Telegen, separată de site. Acolo prelucrăm:</p>
      <ul>
        <li>datele contului: nume, adresă de e-mail, număr de telefon, data nașterii;</li>
        <li>
          datele de sănătate pe care ni le dai (răspunsurile la evaluare, istoricul medical, medicamentele,
          fotografiile cerute pentru piele și păr) și ce stabilește medicul (planul, recomandările, rețetele);
        </li>
        <li>datele despre plată; datele cardului sunt prelucrate de procesatorul de plăți, nu de Telegen.</li>
      </ul>
      <p>
        Datele de sănătate sunt o categorie specială de date (art. 9 din Regulamentul (UE) 2016/679, GDPR). Le
        prelucrăm pe baza acordului tău explicit, cerut separat în aplicație, și pentru asigurarea asistenței
        medicale de către un medic obligat la secret profesional (art. 9 alin. (2) lit. (a) și (h)). Le
        folosim doar ca să te evalueze medicul, să primești planul și să te urmărim pe durata tratamentului.
      </p>
      <p>
        Datele sunt găzduite în Uniunea Europeană și sunt criptate. Le văd medicul care te evaluează și
        persoanele din echipă care au strict nevoie de ele. Furnizorii care ne ajută (găzduire, plăți,
        comunicări) prelucrează datele doar pe baza unui contract, conform instrucțiunilor noastre. Nu vindem
        datele și nu le folosim pentru reclame.
      </p>

      <h2>Cât timp păstrăm datele</h2>
      <p>
        Documentația medicală o păstrăm cât timp ne obligă legislația privind documentele medicale. Celelalte
        date ale contului le păstrăm până închizi contul, cu excepția celor pe care legea ne obligă să le
        păstrăm mai mult (de exemplu documentele contabile). Cookie-ul cu preferința ta se păstrează 6 luni.
      </p>

      <h2>Drepturile tale</h2>
      <p>
        Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție, precum și
        dreptul de a-ți retrage oricând acordul, fără să afecteze prelucrarea făcută înainte. Poți depune o
        plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal
        (ANSPDCP).
      </p>

      <h2>Contact</h2>
      <p>
        Pentru exercitarea drepturilor tale, scrie-ne la <ContactEmail />. Îți răspundem în cel mult o lună,
        cum prevede GDPR.
      </p>
    </LegalPage>
  );
}
