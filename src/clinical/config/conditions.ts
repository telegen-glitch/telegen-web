/**
 * Clinical settings per condition (CLAUDE.md v5). Client-safe: no secrets.
 * Photos: hair front/top/crown, acne face, ED never.
 */
export type PhotoSlot = "front" | "top" | "crown" | "face";

export interface PhotoSlotInfo {
  slot: PhotoSlot;
  title: string;
  how: string;
}

export const PHOTO_SLOTS: Record<PhotoSlot, PhotoSlotInfo> = {
  front: {
    slot: "front",
    title: "Din față",
    how: "Privește drept în cameră, cu fruntea liberă și linia părului vizibilă.",
  },
  top: {
    slot: "top",
    title: "De sus",
    how: "Apleacă puțin capul în față, ca să se vadă partea de sus a scalpului.",
  },
  crown: {
    slot: "crown",
    title: "Creștetul",
    how: "Zona din spatele capului, de sus. Cel mai ușor te ajută cineva sau o oglindă.",
  },
  face: {
    slot: "face",
    title: "Fața",
    how: "Lumină naturală, fără machiaj sau filtre, cu zonele afectate vizibile.",
  },
};

export interface ClinicalCondition {
  slug: string;
  /** Photos the doctor needs, in order. Empty: the flow never asks for photos. */
  photoSlots: PhotoSlot[];
}

export const CLINICAL_CONDITIONS: Record<string, ClinicalCondition> = {
  "caderea-parului": { slug: "caderea-parului", photoSlots: ["front", "top", "crown"] },
  acnee: { slug: "acnee", photoSlots: ["face"] },
  "disfunctie-erectila": { slug: "disfunctie-erectila", photoSlots: [] },
};

export function photoSlotsFor(condition: string): PhotoSlot[] {
  return CLINICAL_CONDITIONS[condition]?.photoSlots ?? [];
}
