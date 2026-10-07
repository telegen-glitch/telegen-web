import { content } from "@/content/source";
import { ClosingCta } from "@/components/home/ClosingCta";
import { ConditionCards } from "@/components/home/ConditionCards";
import { PageHeader } from "@/components/layout/PageHeader";
import { staticPageMetadata } from "@/lib/page-meta";

export const metadata = staticPageMetadata("/afectiuni");

export default function ConditionsHub() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Afecțiuni", href: "/afectiuni" }]}
        eyebrow="Afecțiuni"
        title="Ce evaluăm"
        accent="online."
        lead="Lucrăm pe rând, câte o afecțiune, fiecare cu protocol clinic scris și revizuit de medici cu specialitatea potrivită."
      />
      <div className="container-page section-y">
        <ConditionCards
          items={[
            ...content
              .listConditions()
              .map((c) => ({ slug: c.slug, name: c.name, teaser: c.teaser, href: c.basePath })),
            ...content.listUpcomingTopics().map((t) => ({
              slug: t.slug,
              name: t.name,
              teaser: "Pregătim protocolul clinic și ghidurile medicale.",
            })),
          ]}
        />
      </div>
      <ClosingCta />
    </>
  );
}
