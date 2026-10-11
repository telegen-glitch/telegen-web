import { StartButton } from "@/components/topic/StartButton";
import { ButtonLink } from "@/components/ui/Button";
import { prelaunchCopy } from "@/lib/prelaunch-copy";
import { isPurchasable } from "@/lib/purchasable";
import { purchasableConditionNames } from "@/lib/purchasable-names";
import { PROMISE_SHORT } from "@/lib/promise";
import { isPrelaunch } from "@/lib/site";

/**
 * Condition-led closing call to action. Never names a medicine. On a page about
 * a condition that cannot be started (no price, CLAUDE.md v5) it is left out.
 */
export function ClosingCta({
  topic,
  title = "Fă primul pas",
  accent = "în câteva minute.",
  text = isPrelaunch() ? prelaunchCopy.closingCta : PROMISE_SHORT,
}: {
  /** The page's condition: the button starts its evaluation directly. */
  topic?: string;
  title?: string;
  accent?: string;
  text?: string;
}) {
  if (topic && !isPurchasable(topic)) return null;
  if (!topic && purchasableConditionNames().length === 0) return null;
  return (
    <section className="container-page pb-16 lg:pb-24">
      <div data-reveal className="rounded-card-lg bg-navy-950 px-6 py-12 text-white md:px-12 md:py-16">
        <h2 className="max-w-2xl text-display-2 text-white">
          {title} <span className="accent text-blue-200">{accent}</span>
        </h2>
        <p className="mt-4 max-w-xl text-white/75">{text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <StartButton topic={topic} variant="inverse" className="w-full sm:w-auto" />
          <ButtonLink href="/cum-functioneaza" variant="ghost-inverse" className="w-full sm:w-auto">
            Cum funcționează
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
