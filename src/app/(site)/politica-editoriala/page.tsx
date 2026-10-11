import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { staticPageMetadata } from "@/lib/page-meta";

export const metadata = staticPageMetadata("/politica-editoriala");

export default function EditorialPolicy() {
  return (
    <LegalPage title="Politica editorială" path="/politica-editoriala" updatedAt="2026-10-07">
      <h2>De ce scriem</h2>
      <p>
        Informațiile medicale de pe telegen.ro te ajută să înțelegi o afecțiune și opțiunile de tratament
        înainte de a vorbi cu un medic. Ele nu înlocuiesc un consult și nu promovează medicamente.
      </p>

      <h2>Ce surse folosim</h2>
      <p>Pornim de la cele mai solide dovezi disponibile, în această ordine:</p>
      <ol>
        <li>
          ghiduri clinice europene și internaționale actuale (de exemplu ale societăților de dermatologie și
          urologie);
        </li>
        <li>informațiile oficiale despre medicamente (Agenția Europeană a Medicamentului și ANMDM);</li>
        <li>recenzii sistematice și studii clinice publicate în reviste cu evaluare inter pares.</li>
      </ol>
      <p>
        Fiecare afirmație medicală are o sursă citată pe aceeași pagină. Nu publicăm cifre despre eficacitate
        sau siguranță fără o sursă primară.
      </p>

      <h2>Cum scriem și cine verifică</h2>
      <p>
        Primele versiuni ale textelor sunt pregătite de redacția Telegen cu ajutorul unor instrumente de
        inteligență artificială, pornind de la sursele de mai sus. Fiecare pagină medicală este apoi
        verificată de un medic din echipa Telegen, cu specialitatea potrivită afecțiunii: dermatolog pentru
        piele și păr, urolog sau medic de familie pentru disfuncția erectilă.
      </p>
      <p>
        O pagină verificată afișează „Revizuit medical de un medic [specialitate] din echipa Telegen” și data
        revizuirii. O pagină care nu are încă o revizuire înregistrată arată „Scris de echipa editorială
        Telegen pe baza ghidurilor citate” și data actualizării, fără o mențiune de revizuire, și nu apare în
        motoarele de căutare.
      </p>
      <p>
        Pe site nu publicăm numele medicilor. Înainte de consult, primești numele medicului care te evaluează
        și codul lui de parafă, ca să-l poți verifica în registrul Colegiului Medicilor din România. Detalii
        în <Link href="/echipa-medicala">echipa medicală</Link>.
      </p>

      <h2>Actualizări</h2>
      <p>
        Recitim paginile când apar ghiduri noi sau informații noi despre siguranța unui medicament. Fiecare
        pagină arată data publicării și data ultimei actualizări. Orice modificare a conținutului medical
        trece din nou prin revizuirea unui medic.
      </p>

      <h2>Corecturi</h2>
      <p>
        Dacă găsești o greșeală, scrie-ne prin pagina de <Link href="/contact">contact</Link>. Verificăm
        fiecare semnalare și corectăm pagina, cu data actualizării schimbată.
      </p>

      <h2>Independență</h2>
      <p>
        Nu primim bani de la producători de medicamente pentru conținut și nu numim medicamente în reclame sau
        în butoane de acțiune.
      </p>
    </LegalPage>
  );
}
