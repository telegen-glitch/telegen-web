import type { Condition } from "@/content/types";

/**
 * Condition illustrations for the hero panels: one continuous line per condition,
 * hand-authored and deterministic (no randomness). Each is drawn the same way:
 * a faint ghost of the whole line plus a blue trace that draws it left to right
 * (`.cp-trace` in globals.css), paused offscreen and fully drawn and static with
 * reduced motion. Every line starts flat on the baseline (y=112), keeps its key
 * feature at the canvas centre (so the narrow closed door still shows it) and
 * ends in the same calm curve.
 */

type Kind = Condition["panel"]["illustration"];

// A wide canvas cropped to each tile (slice), so the line keeps its proportions
// from the narrow door to the full-width mobile card. Strokes never scale.
const W = 960;
const H = 200;
const BASE = 112;
/** The calm ending shared by every line (same as the ED line). */
const CALM = "H636C664 112 684 84 718 88S786 128 830 106S902 84 960 92";

/** Ghost + trace, rendered exactly like the ED line. */
function TracedLine({ d }: { d: string }) {
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
 * Hair that grows back: narrow hairpin strands with rounded tips standing on the
 * baseline, drawn without lifting the pen. Left to right they get taller and
 * closer together. [gap before the strand, height]
 */
const STRANDS: [number, number][] = [
  [0, 16],
  [30, 22],
  [24, 28],
  [19, 33],
  [15, 38],
  [11, 42],
  [8, 45],
  [6, 48],
  [5, 50],
  [4, 51],
];

function hairPath(): string {
  const foot = 5; // rounded foot where a strand leaves and meets the baseline
  const width = 9;
  let x = 240;
  let d = `M0 ${BASE}H${x}`;
  for (const [gap, height] of STRANDS) {
    x += gap;
    const x0 = x + foot;
    const x1 = x0 + width;
    const tip = BASE - height;
    // Each strand curves gently forward as it rises, like a wisp of hair.
    const lean = Math.round(height * 0.22);
    const mid = Math.round(BASE - foot - 0.5 * (BASE - foot - tip));
    d +=
      `H${x}Q${x0} ${BASE} ${x0} ${BASE - foot}` +
      `C${x0} ${mid} ${x0 + lean - 1} ${tip} ${x0 + width / 2 + lean} ${tip}` +
      `C${x1 + lean + 1} ${tip} ${x1} ${mid} ${x1} ${BASE - foot}` +
      `Q${x1} ${BASE} ${x1 + foot} ${BASE}`;
    x = x1 + foot;
  }
  return d + CALM;
}

/**
 * Skin that settles: the skin surface with small, uneven, soft bumps that get
 * smaller and further apart until the line is calm. [half-width, height, gap after]
 */
const BUMPS: [number, number, number][] = [
  [16, 17, 5],
  [11, 24, 4],
  [18, 13, 7],
  [10, 19, 10],
  [15, 12, 13],
  [11, 14, 17],
  [14, 9, 21],
  [10, 8, 25],
  [13, 5, 28],
  [10, 3, 0],
];

function skinPath(): string {
  let x = 250;
  let d = `M0 ${BASE}H${x}`;
  for (const [half, height, gap] of BUMPS) {
    const top = BASE - height;
    const c = Math.round(half * 0.55 * 10) / 10;
    const mid = x + half;
    const end = x + 2 * half;
    d += `C${x + c} ${BASE} ${mid - c} ${top} ${mid} ${top}C${mid + c} ${top} ${end - c} ${BASE} ${end} ${BASE}`;
    x = end + gap;
    if (gap) d += `H${x}`;
  }
  return d + CALM;
}

function Hair() {
  return <TracedLine d={hairPath()} />;
}

function Skin() {
  return <TracedLine d={skinPath()} />;
}

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
  return (
    <div aria-hidden="true" className="cp-art">
      {kind === "hair" ? <Hair /> : kind === "skin" ? <Skin /> : <Pulse />}
    </div>
  );
}
