/**
 * Diagram of the hair growth cycle. Arc lengths are illustrative, not to scale,
 * and the figure carries no numbers.
 */
export function GrowthCycle() {
  const r = 108;
  const c = 2 * Math.PI * r;
  // illustrative proportions: growth (long), transition (short), rest (medium)
  const growth = c * 0.68;
  const transition = c * 0.07;
  const rest = c * 0.17;
  const gap = (c - growth - transition - rest) / 3;

  return (
    <figure className="relative mx-auto w-full max-w-[26rem]">
      <svg viewBox="0 0 300 300" role="img" aria-labelledby="ciclu-titlu ciclu-desc" className="w-full">
        <title id="ciclu-titlu">Ciclul firului de păr</title>
        <desc id="ciclu-desc">
          Trei faze: creștere, tranziție și repaus. În alopecia androgenetică, faza de creștere se scurtează
          de la un ciclu la altul.
        </desc>
        <g transform="rotate(-90 150 150)" fill="none" strokeLinecap="round">
          <circle cx="150" cy="150" r={r} stroke="var(--color-line)" strokeWidth="1" />
          <circle
            cx="150"
            cy="150"
            r={r}
            stroke="var(--color-navy-950)"
            strokeWidth="10"
            strokeDasharray={`${growth} ${c}`}
          />
          <circle
            cx="150"
            cy="150"
            r={r}
            stroke="var(--color-blue-600)"
            strokeWidth="10"
            strokeDasharray={`${transition} ${c}`}
            strokeDashoffset={-(growth + gap)}
          />
          <circle
            cx="150"
            cy="150"
            r={r}
            stroke="var(--color-blue-100)"
            strokeWidth="10"
            strokeDasharray={`${rest} ${c}`}
            strokeDashoffset={-(growth + transition + 2 * gap)}
          />
          {/* the shortened growth phase in androgenetic alopecia */}
          <circle
            cx="150"
            cy="150"
            r={r - 22}
            stroke="var(--color-navy-950)"
            strokeOpacity="0.28"
            strokeWidth="2"
            strokeDasharray={`${(growth * 0.55 * (r - 22)) / r} ${c}`}
          />
        </g>
        <g fontFamily="var(--font-sans)" textAnchor="middle">
          <text x="150" y="140" fontSize="13" fill="var(--color-ink-muted)" letterSpacing="0.06em">
            CICLUL FIRULUI
          </text>
          <text x="150" y="166" fontSize="22" fill="var(--color-navy-950)" fontFamily="var(--font-serif)">
            de păr
          </text>
        </g>
      </svg>
      <figcaption className="mt-4 grid grid-cols-3 gap-2 text-xs leading-snug text-ink-soft">
        <span className="flex items-start gap-2">
          <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-navy-950" />
          Creștere
        </span>
        <span className="flex items-start gap-2">
          <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
          Tranziție
        </span>
        <span className="flex items-start gap-2">
          <span
            aria-hidden="true"
            className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-100 ring-1 ring-line"
          />
          Repaus
        </span>
        <span className="col-span-3 mt-1 flex items-start gap-2 text-ink-muted">
          <span aria-hidden="true" className="mt-[0.45rem] h-px w-4 shrink-0 bg-navy-950/40" />
          În alopecia androgenetică, faza de creștere se scurtează de la un ciclu la altul.
        </span>
      </figcaption>
    </figure>
  );
}
