import { supabaseMissing } from "./supabase-env";
import type { LaunchConfig } from "./launch-config";

/**
 * Launch lock (CLAUDE.md v4.7, v5): what still stops the site from going live in the
 * "open" state. Pure, so it is unit-tested; scripts/launch-lock.ts runs it before
 * every build and fails a production build while anything is listed. Previews
 * never fail on it.
 */
export function launchBlockers(input: {
  config: LaunchConfig;
  conditions: { slug: string; name: string }[];
}): string[] {
  const { config, conditions } = input;
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
  // v5: a condition without a price simply cannot be bought; at least one must be, and every
  // configured price must be complete.
  for (const c of conditions) {
    const prices = config.prices[c.slug] ?? [];
    if (prices.some((p) => !(p.amount > 0) || !p.label.trim()))
      missing.push(`prețul pentru ${c.name.toLowerCase()} este incomplet (prices["${c.slug}"])`);
  }
  if (!conditions.some((c) => (config.prices[c.slug] ?? []).length > 0))
    missing.push("prețul pentru cel puțin o afecțiune (prices)");
  if (!config.legalApproved) missing.push("acordul juristului pentru paginile legale (legalApproved: true)");
  return missing;
}

/**
 * With APP_LAUNCH=on (real patients, CLAUDE.md v5) the clinical services must be
 * configured with live keys. Names of variables only, never their values.
 */
export function clinicalLaunchBlockers(env: NodeJS.ProcessEnv): string[] {
  if (env.APP_LAUNCH !== "on") return [];
  const missing: string[] = [];
  const supabase = supabaseMissing(env);
  if (supabase.length) missing.push(`Supabase (${supabase.join(", ")})`);
  if (!env.STRIPE_SECRET_KEY?.startsWith("sk_live_") || !env.STRIPE_WEBHOOK_SECRET)
    missing.push("Stripe live (STRIPE_SECRET_KEY sk_live_…, STRIPE_WEBHOOK_SECRET)");
  if (!env.BREVO_API_KEY || !env.EMAIL_SENDER) missing.push("Brevo (BREVO_API_KEY, EMAIL_SENDER)");
  if (!env.CRON_SECRET) missing.push("CRON_SECRET");
  return missing;
}

/** True when this build must refuse to go live: production, "open", something missing. */
export function launchLocked(env: NodeJS.ProcessEnv, launchState: string, blockers: string[]): boolean {
  return env.VERCEL_ENV === "production" && launchState === "open" && blockers.length > 0;
}
