import "server-only";

/**
 * Prescription format (CLAUDE.md v5): behind an adapter until the owner, the
 * lawyer and the partner pharmacy agree on the format and how it is sent
 * (e.g. electronic prescription). The "manual" adapter stores the doctor's
 * structured prescription; the pharmacy sees it, with the doctor's name and
 * parafă code, in /farmacie. Nothing is sent anywhere else.
 */
export interface PrescriptionItem {
  name: string;
  /** The doctor's instructions: dose, frequency, duration. */
  instructions: string;
}

export interface PrescriptionAdapter {
  readonly kind: "manual";
  build(items: PrescriptionItem[]): PrescriptionItem[];
}

export function prescriptionAdapter(): PrescriptionAdapter {
  return {
    kind: "manual",
    build: (items) =>
      items.map((i) => ({
        name: i.name.slice(0, 200),
        instructions: i.instructions.replace(/\s+/g, " ").trim().slice(0, 500),
      })),
  };
}
