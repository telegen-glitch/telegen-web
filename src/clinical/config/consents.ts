/**
 * The four separate consents asked before anything is saved (CLAUDE.md v5).
 * Each is stored with its version and a timestamp; a new version is asked again.
 * Wording is a draft for the lawyer (docs/legal-review-needed.md); bump
 * CONSENT_VERSION whenever any text changes.
 */
export const CONSENT_VERSION = "2026-10-11";

export type ConsentKind = "gdpr_art9" | "telemedicine" | "terms" | "privacy";

export interface ConsentText {
  kind: ConsentKind;
  text: string;
  link?: { href: string; label: string };
}

export const CONSENTS: ConsentText[] = [
  {
    kind: "gdpr_art9",
    text: "Sunt de acord ca Telegen să prelucreze datele despre sănătatea mea (răspunsurile, fotografiile și mesajele) pentru evaluarea medicală, tratament și urmărire. Îmi pot retrage acordul oricând din cont.",
    link: { href: "/politica-de-confidentialitate", label: "Cum folosim datele" },
  },
  {
    kind: "telemedicine",
    text: "Sunt de acord să primesc servicii de telemedicină: un medic Telegen îmi analizează evaluarea la distanță și decide dacă un tratament este potrivit. Am înțeles că evaluarea online nu înlocuiește un consult de urgență.",
    link: { href: "/cum-functioneaza", label: "Cum funcționează" },
  },
  {
    kind: "terms",
    text: "Am citit și accept termenii și condițiile.",
    link: { href: "/termeni-si-conditii", label: "Termeni și condiții" },
  },
  {
    kind: "privacy",
    text: "Am citit politica de confidențialitate.",
    link: { href: "/politica-de-confidentialitate", label: "Politica de confidențialitate" },
  },
];

export const CONSENT_KINDS: ConsentKind[] = CONSENTS.map((c) => c.kind);
