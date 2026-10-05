import { content } from "@/content/source";

export interface NavLink {
  href: string;
  label: string;
  description?: string;
}

/** Condition-led navigation: conditions first, then how care works, education, trust. */
export function conditionNav(): NavLink[] {
  return content.listConditions().map((c) => ({
    href: `/afectiuni/${c.slug}`,
    label: c.name,
    description: c.teaser,
  }));
}

export const primaryNav: NavLink[] = [
  { href: "/cum-functioneaza", label: "Cum funcționează" },
  { href: "/ghiduri", label: "Ghiduri" },
  { href: "/standarde-clinice", label: "Standarde clinice" },
];

export const evaluationCta = {
  href: "/evaluare",
  label: "Începe evaluarea",
  longLabel: "Evaluare dermatologică online",
} as const;

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Afecțiuni",
    links: [{ href: "/afectiuni", label: "Toate afecțiunile" }],
  },
  {
    heading: "Informații",
    links: [
      { href: "/ghiduri", label: "Ghiduri" },
      { href: "/tratamente", label: "Despre tratamente" },
      { href: "/cum-functioneaza", label: "Cum funcționează" },
    ],
  },
  {
    heading: "Telegen",
    links: [
      { href: "/standarde-clinice", label: "Standarde clinice" },
      { href: "/echipa-medicala", label: "Echipa medicală" },
      { href: "/evaluare", label: "Evaluare online" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/termeni-si-conditii", label: "Termeni și condiții" },
      { href: "/politica-de-confidentialitate", label: "Confidențialitate" },
      { href: "/politica-cookie", label: "Cookie-uri" },
    ],
  },
];
