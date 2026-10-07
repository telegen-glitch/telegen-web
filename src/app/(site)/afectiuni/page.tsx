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
        lead="Fiecare afecțiune are ghiduri medicale scrise din surse citate și o evaluare online. Medicii cu specialitatea potrivită revizuiesc conținutul înainte de lansare."
      />
      <div className="container-page section-y">
        <ConditionCards
          items={content
            .listConditions()
            .map((c) => ({ slug: c.slug, name: c.name, teaser: c.teaser, href: c.basePath }))}
        />
      </div>
      <ClosingCta />
    </>
  );
}
