import { content } from "@/content/source";
import { ClosingCta } from "@/components/home/ClosingCta";
import { ConditionCards } from "@/components/home/ConditionCards";
import { PageHeader } from "@/components/layout/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Afecțiuni dermatologice tratate online",
  description:
    "Afecțiunile pentru care Telegen oferă evaluare dermatologică online. Începem cu căderea părului (alopecia androgenetică).",
  path: "/afectiuni",
});

export default function ConditionsHub() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Afecțiuni", href: "/afectiuni" }]}
        eyebrow="Afecțiuni"
        title="Ce evaluăm"
        accent="online."
        lead="Lucrăm pe rând, câte o afecțiune, fiecare cu protocol clinic scris și revizuit de medici dermatologi. Prima este căderea părului."
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
