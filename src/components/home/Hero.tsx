import { StartButton } from "@/components/topic/StartButton";
import { ConditionPanels, PanelChip, PanelsProvider, type PanelView } from "./panels/ConditionPanels";

export interface Chip {
  label: string;
  slug: string;
  href: string;
}

/**
 * Hero: two-part headline (second phrase in the italic accent), short subtext,
 * condition chips, primary CTA and the condition panels. No entrance animation
 * on the text: the headline is the LCP element. The chips open their panel
 * (and stay plain links without JS).
 */
export function Hero({
  eyebrow,
  title,
  accent,
  text,
  chips,
  panels,
}: {
  eyebrow?: string;
  title: string;
  accent: string;
  text: string;
  chips: Chip[];
  panels: PanelView[];
}) {
  return (
    <section className="overflow-hidden">
      <PanelsProvider initial={panels[0]?.slug ?? ""}>
        <div className="container-page grid gap-10 pt-8 pb-14 md:pt-14 xl:grid-cols-[1fr_1.12fr] xl:items-center xl:gap-14 xl:pt-14 xl:pb-20">
          <div>
            {eyebrow && <p className="text-eyebrow text-blue-700">{eyebrow}</p>}
            <h1 className="mt-4 max-w-[15ch] text-display-1">
              {title} <span className="accent">{accent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lead">{text}</p>
            <ul className="mt-7 flex flex-wrap gap-2" aria-label="Afecțiuni">
              {chips.map((c) => (
                <li key={c.slug}>
                  <PanelChip slug={c.slug} href={c.href}>
                    {c.label}
                  </PanelChip>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <StartButton className="w-full sm:w-auto" />
              <p className="text-sm text-ink-muted sm:ml-3">Câteva minute · fără cont</p>
            </div>
          </div>
          <ConditionPanels panels={panels} />
        </div>
      </PanelsProvider>
    </section>
  );
}
