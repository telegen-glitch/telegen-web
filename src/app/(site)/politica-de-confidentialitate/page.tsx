import Link from "next/link";
import { CompanyIdentity } from "@/components/layout/CompanyIdentity";
import { ContactEmail } from "@/components/layout/ContactEmail";
import { LegalPage } from "@/components/layout/LegalPage";
import { staticPageMetadata } from "@/lib/page-meta";
import { isPrelaunch } from "@/lib/site";

export const metadata = staticPageMetadata("/politica-de-confidentialitate");

/** v5 version, DRAFT FOR LAWYER: not final until signed off (docs/legal-review-needed.md #35). */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politica de confidențialitate"
      path="/politica-de-confidentialitate"
      updatedAt="2026-10-11"
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
        <strong>Paginile publice nu colectează date despre sănătate.</strong> Cât timp răspunzi la evaluare
        fără cont, răspunsurile rămân doar în pagina deschisă: nu sunt trimise, nu sunt salvate pe server, în
        cookie-uri sau în memoria browserului. Se salvează abia după ce îți creezi contul și îți dai acordul
        explicit, ca mai jos.
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

      <h2>În contul tău Telegen</h2>
      <p>
        Serviciul medical se desfășoară în contul tău (evaluare, plan, plată, mesaje), o zonă separată de
        paginile publice, fără statistici și fără scripturi ale altor companii. Acolo prelucrăm:
      </p>
      <ul>
        <li>datele contului: adresa de e-mail și momentele în care te-ai autentificat;</li>
        <li>
          datele de sănătate pe care ni le dai (răspunsurile la evaluare, istoricul medical, medicamentele,
          fotografiile cerute pentru piele și păr, răspunsurile la reevaluări, mesajele către medic) și ce
          stabilește medicul (decizia, motivul ei, planul și rețeta);
        </li>
        <li>datele de livrare: nume, telefon și adresă;</li>
        <li>
          datele despre plată: suma, momentul rezervării, al încasării sau al anulării. Datele cardului le
          prelucrează procesatorul de plăți, nu Telegen.
        </li>
        <li>acordurile tale, cu versiunea textului și momentul în care le-ai dat sau retras.</li>
      </ul>

      <h2>De ce și pe ce temei</h2>
      <ul>
        <li>
          <strong>Evaluarea medicală, planul și urmărirea.</strong> Datele de sănătate sunt o categorie
          specială de date (art. 9 din Regulamentul (UE) 2016/679, GDPR). Le prelucrăm pe baza acordului tău
          explicit, cerut separat înainte de salvare, și pentru asigurarea asistenței medicale de către un
          medic obligat la secret profesional (art. 9 alin. (2) lit. (a) și (h)).
        </li>
        <li>
          <strong>Plata, livrarea și facturarea.</strong> Pentru executarea contractului cu tine (art. 6 alin.
          (1) lit. (b)) și pentru obligațiile legale contabile și fiscale (lit. (c)).
        </li>
        <li>
          <strong>Securitatea contului și jurnalul de acces.</strong> Pentru obligația de a proteja datele
          (art. 32) și interesul nostru legitim de a preveni abuzurile (art. 6 alin. (1) lit. (f)). Jurnalul
          arată cine a deschis un dosar și când, niciodată conținutul lui.
        </li>
      </ul>

      <h2>Cine vede datele</h2>
      <ul>
        <li>
          <strong>Medicul Telegen</strong> care îți preia evaluarea vede răspunsurile, fotografiile și
          mesajele. Contul lui are autentificare în doi pași.
        </li>
        <li>
          <strong>Farmacia parteneră</strong> vede doar rețeta, numele și adresa de livrare, ca să pregătească
          și să trimită coletul. Nu vede răspunsurile, fotografiile sau mesajele.
        </li>
        <li>
          <strong>Echipa operațională Telegen</strong> vede starea comenzilor și a plăților, niciodată
          răspunsurile, fotografiile sau mesajele.
        </li>
      </ul>
      <p>
        Folosim acești furnizori, fiecare pe baza unui contract de prelucrare, doar conform instrucțiunilor
        noastre:
      </p>
      <ul>
        <li>Supabase: baza de date, autentificarea și fotografiile, găzduite la Frankfurt (Germania);</li>
        <li>Vercel: găzduirea site-ului, cu procesarea la Frankfurt;</li>
        <li>
          Stripe: procesarea plăților. Stripe nu primește datele tale de sănătate și nici numele afecțiunii;
        </li>
        <li>
          Brevo: e-mailurile despre cont. E-mailurile nu conțin date de sănătate, doar un link spre cont;
        </li>
        <li>furnizorul de facturare electronică, pentru factura plății;</li>
        <li>farmacia parteneră și curierul ei, pentru livrare.</li>
      </ul>
      <p>
        Datele de sănătate rămân în Uniunea Europeană și sunt criptate la transfer și la stocare. Nu vindem
        datele și nu le folosim pentru reclame.
      </p>

      <h2>Cât timp păstrăm datele</h2>
      <ul>
        <li>
          Documentația medicală (evaluarea, decizia medicului, rețeta, mesajele) o păstrăm cât ne obligă
          legislația privind documentele medicale, chiar dacă îți închizi contul.
        </li>
        <li>Documentele contabile (facturi, plăți) le păstrăm cât prevede legislația contabilă.</li>
        <li>Cookie-ul cu preferința ta privind cookie-urile se păstrează 6 luni.</li>
      </ul>

      <h2>Drepturile tale</h2>
      <p>
        Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție, precum și
        dreptul de a-ți retrage oricând acordul, fără să afecteze prelucrarea făcută înainte. Din cont poți
        descărca toate datele tale, îți poți retrage acordul și poți cere închiderea contului; ce trebuie
        păstrat prin lege se păstrează, restul se șterge. Poți depune o plângere la Autoritatea Națională de
        Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).
      </p>

      <h2>Contact</h2>
      <p>
        Pentru exercitarea drepturilor tale, scrie-ne la <ContactEmail />. Îți răspundem în cel mult o lună,
        cum prevede GDPR.
      </p>
    </LegalPage>
  );
}
