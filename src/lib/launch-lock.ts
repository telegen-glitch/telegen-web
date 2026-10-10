import type { LaunchConfig } from "./launch-config";

/**
 * Launch lock (CLAUDE.md v4.7): what still stops the site from going live in the
 * "open" state. Pure, so it is unit-tested; scripts/launch-lock.ts runs it before
 * every build and fails a production build while anything is listed. Previews
 * never fail on it.
 */
export function launchBlockers(input: {
  config: LaunchConfig;
  clinicalAppUrl: string | null;
  conditions: { slug: string; name: string }[];
}): string[] {
  const { config, clinicalAppUrl, conditions } = input;
  const missing: string[] = [];
  const need = (value: string | null, label: string) => {
    if (!value?.trim()) missing.push(label);
  };
  need(config.company.legalName, "denumirea societății (launch-config: company.legalName)");
  need(config.company.cui, "CUI (company.cui)");
  need(config.company.regCom, "nr. Registrul Comerțului (company.regCom)");
  need(config.company.address, "adresa sediului (company.address)");
  need(config.contact.email, "adresa de e-mail de contact (contact.email)");
  need(config.contact.responseTime, "timpul de răspuns (contact.responseTime)");
  for (const c of conditions) {
    const prices = config.prices[c.slug] ?? [];
    if (prices.length === 0 || prices.some((p) => !(p.amount > 0) || !p.label.trim()))
      missing.push(`prețul pentru ${c.name.toLowerCase()} (prices["${c.slug}"])`);
  }
  if (!clinicalAppUrl) missing.push("adresa aplicației clinice (variabila CLINICAL_APP_URL, https)");
  if (!config.legalApproved) missing.push("acordul juristului pentru paginile legale (legalApproved: true)");
  return missing;
}

/** True when this build must refuse to go live: production, "open", something missing. */
export function launchLocked(env: NodeJS.ProcessEnv, launchState: string, blockers: string[]): boolean {
  return env.VERCEL_ENV === "production" && launchState === "open" && blockers.length > 0;
}
