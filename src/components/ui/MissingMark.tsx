/**
 * Owner-only marker for a launch value that has not been supplied yet
 * (src/lib/launch-config.ts). Purely presentational: whether it may render is
 * decided on the server (`Missing`, or a prop computed from showOwnerMarkers()),
 * so production never shows it.
 */
export function MissingMark({ what, tone = "light" }: { what: string; tone?: "light" | "dark" }) {
  return (
    <span
      data-owner-marker=""
      className={`inline-flex items-center rounded-md border border-dashed px-1.5 py-0.5 text-xs font-medium ${
        tone === "dark" ? "border-amber-100/70 text-amber-100" : "border-amber-800/70 text-amber-800"
      }`}
    >
      [lipsește: {what}]
    </span>
  );
}
