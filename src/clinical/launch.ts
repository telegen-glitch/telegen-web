import "server-only";
import { evaluations } from "@/content/evaluations";
import { launchConfig } from "@/lib/launch-config";
import { isPurchasable } from "@/lib/purchasable";
import { authAdapter } from "./auth";
import { asService } from "./db";
import { splitFor } from "./config/pharmacy";
import { PLANS } from "./config/plans";
import { clinicalEnv } from "./env";
import { invoiceAdapter } from "./invoicing/adapter";

/**
 * Launch lock for the clinical flow (CLAUDE.md v5). Previews and local builds run
 * in "test" mode: Stripe test keys and cases marked TEST. Production accepts real
 * patients ("live") only with APP_LAUNCH=on and every launch check passing;
 * otherwise it refuses new cases ("closed"). The checks return labels only.
 */
export interface IntakeGate {
  mode: "test" | "live" | "closed";
  problems: string[];
}

/** Conditions a patient can start: purchasable on the public site and with a question set. */
export function purchasableTopics(): string[] {
  return evaluations.map((e) => e.topic).filter((t) => isPurchasable(t));
}

const SPECIALTY_FOR: Record<string, string[]> = {
  "caderea-parului": ["dermatologie"],
  acnee: ["dermatologie"],
  "disfunctie-erectila": ["urologie", "medicina-de-familie"],
};

export async function launchProblems(): Promise<string[]> {
  const env = clinicalEnv();
  const problems: string[] = [...env.problems];
  if (!env.appLaunch) problems.push("APP_LAUNCH=on");
  const c = launchConfig.company;
  if (!c.legalName || !c.cui || !c.regCom || !c.address) problems.push("datele societății");
  if (!launchConfig.legalApproved) problems.push("acordul juristului pentru textele legale");
  if (!env.supabase || !env.databaseUrl) problems.push("Supabase (bază de date și autentificare)");
  if (env.stripe?.mode !== "live" || !env.stripe.webhookSecret)
    problems.push("cheile Stripe live și webhook");
  if (!env.brevo) problems.push("Brevo (e-mailuri)");
  if (!env.cronSecret) problems.push("CRON_SECRET");
  const topics = purchasableTopics();
  if (topics.length === 0) problems.push("cel puțin o afecțiune cu preț");
  const plans = Object.values(PLANS).filter((p) => topics.includes(p.condition));
  if (plans.some((p) => !splitFor(p.id, "monthly") || !splitFor(p.id, "quarterly")))
    problems.push("împărțirea plății cu farmacia, pe produs (PHARMACY_SPLIT)");
  if (!invoiceAdapter()) problems.push("facturarea (SmartBill sau Oblio)");
  try {
    const [ph] = await asService((q) =>
      q.query<{ n: number }>(
        "select count(*)::int as n from clinical.pharmacies where active and stripe_account_id is not null",
      ),
    );
    if (!ph?.n) problems.push("o farmacie parteneră activă, cu cont Stripe Connect");
    for (const t of topics) {
      let ready = 0;
      for (const spec of SPECIALTY_FOR[t] ?? []) {
        const [row] = await asService((q) =>
          q.query<{ n: number }>("select clinical.doctors_ready($1) as n", [spec]),
        );
        ready += row?.n ?? 0;
      }
      if (ready === 0) problems.push(`un medic activ cu 2FA pentru ${t}`);
    }
  } catch {
    problems.push("baza de date nu răspunde");
  }
  return problems;
}

export async function intakeGate(): Promise<IntakeGate> {
  const env = clinicalEnv();
  if (!authAdapter()) return { mode: "closed", problems: ["autentificarea (Supabase)"] };
  if (env.vercelEnv !== "production") return { mode: "test", problems: [] };
  const problems = await launchProblems();
  return { mode: problems.length ? "closed" : "live", problems };
}
