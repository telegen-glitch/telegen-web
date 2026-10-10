import type { Condition } from "@/content/types";
import { hairHeroMedia } from "@/lib/hero-media";
import { HairPhoto } from "./HairPhoto";
import { SceneArt, ScenePoster } from "./SceneArt";

/**
 * Condition illustrations for the hero panels. Hair loss shows the photo by
 * default (HairPhoto, v4.6); its "illustration" option and acne are realistic
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

/**
 * The art for a condition panel. Hair loss shows the photo when the hero media
 * switch says so and the files exist (src/lib/hero-media.ts), with the hair
 * scene's still poster as the fallback if the photo cannot load; otherwise the
 * WebGL scene. Acne is its WebGL scene, ED the traced line.
 */
export function PanelIllustration({ kind }: { kind: Kind }) {
  if (kind === "hair" && hairHeroMedia() === "photo")
    return <HairPhoto fallback={<ScenePoster kind="hair" />} />;
  if (kind === "hair" || kind === "skin") return <SceneArt kind={kind} />;
  return (
    <div aria-hidden="true" className="cp-art">
      <Pulse />
    </div>
  );
}
