/**
 * Launch values supplied by the owner (CLAUDE.md v4.7). This is the single place
 * for company identity, contact, prices and the lawyer's sign-off.
 *
 * Nothing here may be invented. While a value is null (or a condition has no
 * price), previews show a small owner-only marker "[lipsește: …]" where it
 * belongs, production never shows it, and the production build fails while the
 * site is in the "open" launch state (scripts/launch-lock.ts lists what is
 * missing). How to fill it from a phone: docs/LAUNCH.md.
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
  /** Prices per published condition slug. Every published condition needs one to launch. */
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
  prices: {},
  legalApproved: false,
};

/**
 * The clinical app (app.telegen.ro) the evaluation hands over to. Read from the
 * CLINICAL_APP_URL environment variable at build time; only an https URL counts.
 */
export function clinicalAppUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = env.CLINICAL_APP_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

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
