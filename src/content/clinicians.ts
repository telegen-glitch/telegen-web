import type { Clinician } from "./types";

/**
 * Clinical team. No real clinician has been supplied yet, so the only entry is a
 * role placeholder marked temporary. It is never presented as a person, never
 * emitted in structured data and never counts as a medical reviewer.
 */
export const clinicians: Clinician[] = [
  {
    slug: "medic-dermatolog-coordonator",
    name: "Medic dermatolog coordonator",
    role: "Coordonare clinică și revizuire medicală",
    bio: [
      "Rolul este rezervat unui medic specialist sau primar dermatovenerolog, cu drept de liberă practică în România. Numele, gradul profesional și codul de parafă vor fi publicate aici după confirmare.",
      "Medicul coordonator aprobă protocoalele clinice, revizuiește conținutul medical al site-ului și răspunde de calitatea evaluărilor.",
    ],
    temporary: true,
  },
];

export function getClinician(slug: string): Clinician | undefined {
  return clinicians.find((c) => c.slug === slug);
}
