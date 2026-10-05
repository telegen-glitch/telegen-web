import { LegalPage } from "@/components/layout/LegalPage";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { CONSENT_COOKIE } from "@/lib/consent";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Politica de cookie-uri",
  description: "Ce cookie-uri folosește telegen.ro și cum îți poți schimba alegerea.",
  path: "/politica-cookie",
});

export default function CookiePolicy() {
  return (
    <LegalPage title="Politica de cookie-uri" path="/politica-cookie" updatedAt="2026-10-05">
      <p>
        Folosim doar cookie-urile strict necesare funcționării site-ului. Cookie-urile de analiză sau
        marketing ar fi folosite doar cu acordul tău, separat pentru fiecare categorie. În prezent nu folosim
        astfel de cookie-uri.
      </p>
      <h2>Cookie-uri folosite</h2>
      <div className="overflow-x-auto" role="region" aria-label="Tabel cookie-uri" tabIndex={0}>
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="py-2 pr-4 font-semibold text-navy-950">Nume</th>
              <th className="py-2 pr-4 font-semibold text-navy-950">Categorie</th>
              <th className="py-2 pr-4 font-semibold text-navy-950">Scop</th>
              <th className="py-2 font-semibold text-navy-950">Durată</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line-soft align-top">
              <td className="py-2 pr-4 font-mono text-xs">{CONSENT_COOKIE}</td>
              <td className="py-2 pr-4">Necesar</td>
              <td className="py-2 pr-4">Memorează alegerea ta privind cookie-urile.</td>
              <td className="py-2">6 luni</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2>Cum îți schimbi alegerea</h2>
      <p>
        Poți deschide oricând setările:{" "}
        <CookieSettingsButton className="font-semibold text-blue-700 underline underline-offset-2" />. Poți
        șterge cookie-urile și din setările browserului.
      </p>
    </LegalPage>
  );
}
