import Link from "next/link";
import { CompanyIdentity } from "@/components/layout/CompanyIdentity";
import { ContactEmail } from "@/components/layout/ContactEmail";
import { LegalPage } from "@/components/layout/LegalPage";
import { staticPageMetadata } from "@/lib/page-meta";
import { publishedConditionList } from "@/lib/positioning";
import { PROMISE_STEPS } from "@/lib/promise";
import { purchasableConditionNames } from "@/lib/purchasable-names";

export const metadata = staticPageMetadata("/termeni-si-conditii");

/** v5 version, DRAFT FOR LAWYER: not final until signed off (docs/legal-review-needed.md #35). */
export default function TermsPage() {
  const open = purchasableConditionNames();
  return (
    <LegalPage title="Termeni și condiții" path="/termeni-si-conditii" updatedAt="2026-10-11">
      <h2>Cine suntem</h2>
      <p>
        Telegen este o clinică online pentru sănătatea bărbaților. Site-ul telegen.ro și conturile pacienților
        sunt administrate de:
      </p>
      <div className="not-prose my-4">
        <CompanyIdentity />
      </div>
      <p>
        Ne poți scrie la <ContactEmail />.
      </p>

      <h2>Ce oferă Telegen</h2>
      <p>
        Pe telegen.ro găsești ghiduri medicale despre {publishedConditionList()}.
        {open.length > 0 && (
          <>
            {" "}
            Pentru {open.join(", ").toLowerCase()} oferim și evaluare medicală online: un medic cu drept de
            liberă practică în România și cu specialitatea potrivită îți analizează evaluarea și decide dacă
            îți prescrie un tratament, pe care o farmacie parteneră ți-l livrează acasă.
          </>
        )}
      </p>

      <h2>Cum funcționează serviciul</h2>
      <ol>
        {PROMISE_STEPS.map((step) => (
          <li key={step.id}>
            <strong>{step.title}.</strong> {step.text}
          </li>
        ))}
      </ol>

      <h2>Limitele evaluării online</h2>
      <ul>
        <li>Telegen nu tratează urgențe. În caz de urgență, sună la 112.</li>
        <li>
          Medicul poate decide că evaluarea online nu este potrivită pentru situația ta și îți poate recomanda
          un consult în persoană. În acest caz nu plătești nimic.
        </li>
        <li>Răspunsul la tratament diferă de la o persoană la alta. Nu promitem un anumit rezultat.</li>
        <li>
          Decizia medicului se bazează pe informațiile pe care le dai. Te rugăm să răspunzi complet și corect,
          inclusiv despre medicamentele pe care le iei.
        </li>
      </ul>

      <h2>Cine poate folosi serviciul</h2>
      <p>Serviciul medical este destinat persoanelor de cel puțin 18 ani, cu adresă de livrare în România.</p>

      <h2>Prețuri și plată</h2>
      <ul>
        <li>Evaluarea este gratuită.</li>
        <li>
          Prețul planului îl vezi în cont, înainte să plătești. Include analiza medicului, mesajele cu medicul
          și livrarea; ce mai include este scris lângă preț.
        </li>
        <li>
          La final, suma doar se rezervă pe card. O încasăm numai după ce medicul aprobă planul. Dacă medicul
          nu îți prescrie tratamentul, rezervarea se anulează integral.
        </li>
        <li>
          Dacă medicul ajustează planul și prețul se schimbă, îți cerem acordul înainte de orice încasare.
        </li>
      </ul>

      <h2>Abonament, pauză și anulare</h2>
      <ul>
        <li>
          Planul se reînnoiește automat la sfârșitul fiecărei perioade (o lună sau trei luni, după planul
          ales), cu cardul folosit la prima plată. Primești un e-mail cu 3 zile înainte de fiecare plată.
        </li>
        <li>
          Îl poți pune pe pauză sau îl poți anula oricând din cont, înainte de următoarea plată, fără costuri
          și fără să dai explicații. Perioada deja plătită rămâne valabilă.
        </li>
        <li>
          Medicul reevaluează periodic dacă tratamentul rămâne potrivit și poate opri sau ajusta planul.
        </li>
        <li>
          Medicamentele livrate nu pot fi returnate, din motive de protecție a sănătății. Dacă un colet ajunge
          deteriorat sau incomplet, scrie-ne.
        </li>
      </ul>

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
        se salvează doar după ce îți creezi contul și îți dai acordul explicit. Despre cookie-uri, vezi{" "}
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
        Când modificăm acești termeni, actualizăm data de la începutul paginii și îți scriem în cont înainte
        de următoarea plată. Pentru o perioadă deja plătită se aplică termenii în vigoare la data plății.
      </p>
    </LegalPage>
  );
}
