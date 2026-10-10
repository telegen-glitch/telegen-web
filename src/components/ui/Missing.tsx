import "server-only";
import { showOwnerMarkers } from "@/lib/launch-config";
import { MissingMark } from "./MissingMark";

/** Server-side guard around MissingMark: renders on previews and locally, never in production. */
export function Missing({ what, tone }: { what: string; tone?: "light" | "dark" }) {
  return showOwnerMarkers() ? <MissingMark what={what} tone={tone} /> : null;
}
