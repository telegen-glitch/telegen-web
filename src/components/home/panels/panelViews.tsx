import { decidingDoctor } from "@/content/clinicians";
import type { Condition } from "@/content/types";
import { PanelIllustration } from "./Illustrations";
import { PanelBody } from "./PanelBody";
import type { PanelView } from "./ConditionPanels";

/** Server-rendered views for the hero panels: one per published condition, from content data. */
export function panelViews(conditions: Condition[]): PanelView[] {
  return conditions.map((c) => ({
    slug: c.slug,
    name: c.name,
    art: <PanelIllustration kind={c.panel.illustration} />,
    body: (
      <PanelBody
        slug={c.slug}
        name={c.name}
        lead={c.panel.lead}
        analyses={c.panel.analyses}
        decider={decidingDoctor(c.slug)}
        href={c.basePath}
      />
    ),
  }));
}
