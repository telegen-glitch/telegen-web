/**
 * Launch values supplied by the owner (CLAUDE.md v4.7). This is the single place
 * for company identity, contact, prices and the lawyer's sign-off.
 *
 * Nothing here may be invented. While a value is null, previews show a small
 * owner-only marker "[lipsește: …]" where it belongs, production never shows it,
 * and the production build fails while the site is in the "open" launch state
 * (scripts/launch-lock.ts lists what is missing). A condition without a price
 * simply cannot be bought (CLAUDE.md v5). How to fill it: docs/LAUNCH.md.
 */

/** A price shown to patients. Labels never name a medicine (§9.4). */
export interface Price {
  /** Amount in RON, VAT included. */
  amount: number;
  /** What the price covers, e.g. "Evaluare și plan de tratament". */
  label: string;
  /** Optional note, e.g. what is not included (medicines). */
  note?: string;
}

export interface LaunchConfig {
  company: {
    /** Denumirea societății, e.g. "Telegen Health SRL". */
    legalName: string | null;
    /** Cod unic de înregistrare, e.g. "RO12345678". */
    cui: string | null;
    /** Nr. Registrul Comerțului, e.g. "J40/1234/2026". */
    regCom: string | null;
    /** Sediul social, full address. */
    address: string | null;
  };
  contact: {
    /** Public contact address, e.g. "contact@telegen.ro". */
    email: string | null;
    /** Usual reply time as it reads after "Răspundem de obicei în", e.g. "2 zile lucrătoare". */
    responseTime: string | null;
  };
  /** Public plan prices per condition slug (no medicine names). Without one, a condition cannot be bought. */
  prices: Record<string, Price[]>;
  /** Set to true by the owner only after the lawyer signs off the legal pages. */
  legalApproved: boolean;
}

export const launchConfig: LaunchConfig = {
  company: {
    legalName: null,
    cui: null,
    regCom: null,
    address: null,
  },
  contact: {
    email: null,
    responseTime: null,
  },
  // Owner pricing, v5 brief (2026-10-11). Acne and ED have no price: they cannot be bought.
  prices: {
    "caderea-parului": [
      {
        amount: 320,
        label: "Plan pentru căderea părului, lunar",
        note: "Evaluarea medicului, mesajele cu medicul și livrarea sunt incluse.",
      },
      {
        amount: 870,
        label: "Plan pentru căderea părului, 3 luni",
        note: "Plătești o dată la 3 luni. Evaluarea medicului, mesajele și livrarea sunt incluse.",
      },
    ],
  },
  legalApproved: false,
};

/**
 * Owner-only "[lipsește: …]" markers render everywhere except production
 * (Vercel previews, local builds and tests). Production never shows them.
 */
export function showOwnerMarkers(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL_ENV !== "production";
}

export function pricesFor(conditionSlug: string, config: LaunchConfig = launchConfig): Price[] {
  return config.prices[conditionSlug] ?? [];
}
