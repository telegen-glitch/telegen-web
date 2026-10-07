import type { Condition } from "@/content/types";
import { SceneArt } from "./SceneArt";

/**
 * Condition illustrations for the hero panels. Hair loss and acne are realistic
 * WebGL scenes with a static poster (SceneArt); erectile dysfunction is the
 * traced line below, unchanged.
 */

type Kind = Condition["panel"]["illustration"];

// A wide canvas cropped to each tile (slice), so the line keeps its proportions
// from the narrow door to the full-width mobile card. Strokes never scale.
const W = 960;
const H = 200;

/** One continuous line: a steady beat that settles into a calm curve. */
function Pulse() {
  const beat = "h58l8-2 8 2h6l8-34 10 66 9-48 7 16h34l6-10 7 18 6-8h26";
  // The second beat sits at the canvas centre, so even the narrow door crop shows a beat.
  const d = `M0 112h210${beat}${beat}h40` + "C664 112 684 84 718 88S786 128 830 106S902 84 960 92";
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="cp-layer">
        <path
          d={d}
          fill="none"
          className="stroke-navy-800"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          opacity={0.16}
        />
      </svg>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="cp-layer">
        <path
          d={d}
          fill="none"
          pathLength={1}
          className="cp-trace stroke-blue-600"
          strokeWidth={2.4}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}

export function PanelIllustration({ kind }: { kind: Kind }) {
  if (kind === "hair" || kind === "skin") return <SceneArt kind={kind} />;
  return (
    <div aria-hidden="true" className="cp-art">
      <Pulse />
    </div>
  );
}
