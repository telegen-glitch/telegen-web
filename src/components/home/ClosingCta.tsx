import { StartButton } from "@/components/topic/StartButton";
import { ButtonLink } from "@/components/ui/Button";
import { prelaunchCopy } from "@/lib/prelaunch-copy";
import { isPrelaunch } from "@/lib/site";

/** Condition-led closing call to action. Never names a medicine. */
export function ClosingCta({
  title = "Fă primul pas",
  accent = "în câteva minute.",
  text = isPrelaunch()
    ? prelaunchCopy.closingCta
    : "Răspunzi la câteva întrebări, un medic îți analizează evaluarea și primești un plan clar, cu urmărire.",
}: {
  title?: string;
  accent?: string;
  text?: string;
}) {
  return (
    <section className="container-page pb-16 lg:pb-24">
      <div data-reveal className="rounded-card-lg bg-navy-950 px-6 py-12 text-white md:px-12 md:py-16">
        <h2 className="max-w-2xl text-display-2 text-white">
          {title} <span className="accent text-blue-200">{accent}</span>
        </h2>
        <p className="mt-4 max-w-xl text-white/75">{text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <StartButton variant="inverse" className="w-full sm:w-auto" />
          <ButtonLink href="/cum-functioneaza" variant="ghost-inverse" className="w-full sm:w-auto">
            Cum funcționează
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
