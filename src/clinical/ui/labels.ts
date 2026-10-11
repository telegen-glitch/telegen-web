import { evaluations } from "@/content/evaluations";

export const conditionName = (slug: string) => evaluations.find((e) => e.topic === slug)?.name ?? slug;

const fmt = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Bucharest",
});
export const when = (iso: string | null) => (iso ? fmt.format(new Date(iso)) : "—");

/** "rămân 5 h" / "depășit cu 2 h" for an SLA deadline. */
export function slaText(iso: string | null, paused = false, now = Date.now()): string {
  if (paused) return "oprit: așteaptă pacientul";
  if (!iso) return "—";
  const h = Math.round((new Date(iso).getTime() - now) / 3_600_000);
  return h >= 0 ? `rămân ${h} h` : `depășit cu ${-h} h`;
}

export const DOCTOR_STATUS: Record<string, string> = {
  submitted: "În coadă",
  in_review: "În analiză",
  waiting_patient: "Așteaptă pacientul",
  adjusted: "Plan ajustat, așteaptă acceptul",
  approved: "Aprobat",
  declined: "Fără tratament online",
  expired: "Expirat",
  canceled: "Anulat",
};
