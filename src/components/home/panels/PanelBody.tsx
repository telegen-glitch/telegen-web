import Link from "next/link";
import { StartButton } from "@/components/topic/StartButton";
import { Arrow } from "@/components/ui/Button";
import { careRoute } from "@/lib/care-route";

/** The care route: a thin line that draws itself, with four nodes appearing in sequence. */
export function CareRoute() {
  return (
    <ol aria-label="Cum decurge îngrijirea" className="cp-route">
      {/* Pixel units (no viewBox scaling), so the dash used for drawing stays exact. */}
      <svg aria-hidden="true" className="cp-route-svg">
        <line className="cp-route-line cp-route-h" x1="0" y1="1" x2="100%" y2="1" pathLength={1} />
        <line className="cp-route-line cp-route-v" x1="1" y1="0" x2="1" y2="100%" pathLength={1} />
      </svg>
      {careRoute.map((n, i) => (
        <li key={n.title} className="cp-node" style={{ "--i": i } as React.CSSProperties}>
          <span aria-hidden="true" className="cp-node-dot" />
          <span className="block text-sm font-semibold text-white">{n.title}</span>
          <span className="mt-0.5 block text-xs text-white/75">{n.text}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * What an open condition panel shows. Everything comes from content data:
 * no medicine names, prices, statistics or promises.
 */
export function PanelBody({
  slug,
  lead,
  analyses,
  decider,
  href,
  name,
  variant = "home",
}: {
  slug: string;
  lead: string;
  analyses: readonly string[];
  decider: string;
  href: string;
  name: string;
  variant?: "home" | "hub";
}) {
  return (
    <div className="cp-body">
      {variant === "home" && <p className="text-base leading-6 text-white/80">{lead}</p>}
      <div className="cp-facts">
        <div>
          <p className="text-eyebrow text-blue-200">Ce analizează medicul</p>
          <ul className="mt-2.5 space-y-1.5">
            {analyses.map((a) => (
              <li key={a} className="flex gap-2.5 text-sm leading-5 text-white/90">
                <span aria-hidden="true" className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-blue-200" />
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-eyebrow text-blue-200">Cine decide</p>
          <p className="mt-2.5 text-sm leading-5 text-white/90">{decider}</p>
        </div>
      </div>
      <CareRoute />
      {variant === "home" && (
        <div className="cp-actions">
          <StartButton topic={slug} variant="inverse" size="md">
            Începe evaluarea<span className="sr-only"> pentru {name.toLowerCase()}</span>
          </StartButton>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-semibold text-white hover:underline"
          >
            Află mai multe<span className="sr-only"> despre {name.toLowerCase()}</span> <Arrow />
          </Link>
        </div>
      )}
    </div>
  );
}
