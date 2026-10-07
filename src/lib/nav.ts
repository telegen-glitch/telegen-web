import { content } from "@/content/source";

export interface NavLink {
  href: string;
  label: string;
  description?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  columns: { heading: string; links: NavLink[] }[];
}

/** Condition-led navigation: every published condition. */
export function conditionNav(): NavLink[] {
  return content.listConditions().map((c) => ({
    href: c.basePath,
    label: c.name,
    description: c.teaser,
  }));
}

/** Desktop mega-menu groups and mobile menu sections. */
export function mainNav(): NavGroup[] {
  return [
    {
      id: "tratamente",
      label: "Tratamente",
      columns: [
        { heading: "Afecțiuni", links: conditionNav() },
        {
          heading: "Informații",
          links: [
            {
              href: "/tratamente",
              label: "Despre tratamente",
              description: "Cum acționează, efecte adverse, limite.",
            },
            {
              href: "/ghiduri",
              label: "Ghiduri medicale",
              description: "Semne, cauze, tratament și întrebări frecvente.",
            },
          ],
        },
      ],
    },
    {
      id: "despre",
      label: "Despre Telegen",
      columns: [
        {
          heading: "Telegen",
          links: [
            {
              href: "/cum-functioneaza",
              label: "Cum funcționează",
              description: "De la evaluare la urmărire.",
            },
            { href: "/echipa-medicala", label: "Echipa medicală", description: "Medicii care evaluează." },
            {
              href: "/standarde-clinice",
              label: "Standarde clinice",
              description: "Regulile după care lucrăm.",
            },
          ],
        },
      ],
    },
  ];
}

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Tratamente",
    links: [
      { href: "/afectiuni", label: "Toate afecțiunile" },
      { href: "/tratamente", label: "Despre tratamente" },
    ],
  },
  {
    heading: "Informații",
    links: [
      { href: "/ghiduri", label: "Ghiduri" },
      { href: "/cum-functioneaza", label: "Cum funcționează" },
      { href: "/evaluare", label: "Evaluare online" },
    ],
  },
  {
    heading: "Despre Telegen",
    links: [
      { href: "/standarde-clinice", label: "Standarde clinice" },
      { href: "/echipa-medicala", label: "Echipa medicală" },
      { href: "/politica-editoriala", label: "Politica editorială" },
      { href: "/contact", label: "Contact" },
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
