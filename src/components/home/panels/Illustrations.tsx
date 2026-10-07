import type { Condition } from "@/content/types";

/**
 * Abstract condition illustrations for the hero panels: inline SVG, no images.
 * Geometry is generated from a fixed seed, so server and client render the same
 * markup. Motion lives in globals.css (`.cp-art`): whole layers move with
 * transform/opacity only, paused offscreen and static with reduced motion.
 */

type Kind = Condition["panel"]["illustration"];

/** Small deterministic PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A wide canvas cropped to each tile (slice), so density and size stay steady
// from the narrow door to the full-width mobile card. Strokes never scale.
const W = 960;
const H = 200;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Fine strokes rising from the base; fewer reach the top. Three layers sway at different speeds. */
function Hair() {
  const rand = rng(7);
  const layers: string[][] = [[], [], []];
  const n = 210;
  for (let i = 0; i < n; i++) {
    const x = 6 + (i * (W - 12)) / (n - 1) + (rand() - 0.5) * 3;
    const h = 62 + 118 * Math.pow(rand(), 1.7);
    const lean = (rand() - 0.5) * 16;
    layers[i % 3].push(
      `M${r1(x)} ${H}Q${r1(x + lean * 0.3)} ${r1(H - h * 0.55)} ${r1(x + lean)} ${r1(H - h)}`,
    );
  }
  const tone = ["stroke-navy-800", "stroke-blue-600", "stroke-navy-700"];
  return (
    <>
      {layers.map((paths, li) => (
        <svg
          key={li}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMax slice"
          className={`cp-layer cp-sway cp-sway-${li}`}
        >
          <path
            d={paths.join("")}
            fill="none"
            className={tone[li]}
            strokeWidth={li === 1 ? 1.1 : 1.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={li === 1 ? 0.7 : 0.85}
          />
        </svg>
      ))}
    </>
  );
}

/** A field of soft dots: an irregular layer that fades into an even, calm grid. */
function Skin() {
  const rand = rng(11);
  const cols = 34;
  const rows = 7;
  const dot = (x: number, y: number, r: number) =>
    `M${r1(x - r)} ${r1(y)}a${r} ${r} 0 1 0 ${r1(2 * r)} 0a${r} ${r} 0 1 0 ${r1(-2 * r)} 0`;
  const even: string[] = [];
  const calmDots: string[] = [];
  const hotDots: string[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = 18 + col * 28;
      const y = 16 + row * 28;
      even.push(dot(x, y, 3.2));
      const target = rand() > 0.72 ? hotDots : calmDots;
      target.push(dot(x + (rand() - 0.5) * 16, y + (rand() - 0.5) * 16, r1(2.4 + rand() * 6.4)));
    }
  }
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="cp-layer cp-calm">
        <path d={even.join("")} className="fill-navy-800" opacity={0.55} />
      </svg>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="cp-layer cp-unrest">
        <path d={calmDots.join("")} className="fill-navy-800" opacity={0.4} />
        <path d={hotDots.join("")} className="fill-blue-600" opacity={0.55} />
      </svg>
    </>
  );
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
