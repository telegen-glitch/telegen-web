import { CompanyIdentity } from "@/components/layout/CompanyIdentity";
import { PageHeader } from "@/components/layout/PageHeader";
import { Missing } from "@/components/ui/Missing";
import { launchConfig } from "@/lib/launch-config";
import { staticPageMetadata } from "@/lib/page-meta";

export const metadata = staticPageMetadata("/contact");

export default function ContactPage() {
  const { email, responseTime } = launchConfig.contact;
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Contact", href: "/contact" }]}
        eyebrow="Contact"
        title="Scrie-ne."
        accent="Îți răspundem noi."
        lead="Pentru întrebări despre Telegen, despre site sau despre datele tale personale."
      />
      <div className="container-page grid gap-10 section-y lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div className="space-y-6">
          <section aria-labelledby="email" className="rounded-card-lg bg-mist p-7">
            <h2 id="email" className="text-display-3">
              E-mail
            </h2>
            <p className="mt-3 text-lg">
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="font-semibold text-blue-700 underline underline-offset-2"
                >
                  {email}
                </a>
              ) : (
                <Missing what="adresa de e-mail de contact" />
              )}
            </p>
            <p className="mt-4 text-ink-soft">
              {responseTime ? (
                <>Răspundem de obicei în {responseTime}.</>
              ) : (
                <Missing what="timpul de răspuns" />
              )}
            </p>
          </section>
          <section
            aria-labelledby="medical"
            className="rounded-card-lg border-l-4 border-amber-800/60 bg-amber-100/50 p-7"
          >
            <h2 id="medical" className="text-lg font-semibold text-navy-950">
              Nu oferim sfaturi medicale prin e-mail
            </h2>
            <p className="mt-2 text-ink-soft">
              Pentru o problemă de sănătate, adresează-te medicului tău. În caz de urgență, sună la 112.
            </p>
          </section>
        </div>
        <section aria-labelledby="societate">
          <h2 id="societate" className="text-display-3">
            Date de identificare
          </h2>
          <div className="mt-4">
            <CompanyIdentity />
          </div>
        </section>
      </div>
    </>
  );
}
