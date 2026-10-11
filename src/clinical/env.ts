import "server-only";

/**
 * Clinical configuration from environment variables, validated in one place.
 * Real services (Supabase, Stripe, Brevo) are used when their variables are set.
 * The local stand-ins (PGlite database, development sign-in, fake payments,
 * e-mail outbox) are allowed only outside Vercel: local development, CI and e2e.
 */
export interface ClinicalEnv {
  vercelEnv: "production" | "preview" | "development" | null;
  /** Local stand-ins allowed (never on Vercel). */
  localDrivers: boolean;
  databaseUrl: string | null;
  supabase: { url: string; anonKey: string; serviceKey: string } | null;
  stripe: { secretKey: string; webhookSecret: string | null; mode: "test" | "live" } | null;
  brevo: { apiKey: string; senderEmail: string; senderName: string } | null;
  /** APP_LAUNCH=on: real patients may be accepted (production only, with the launch checks). */
  appLaunch: boolean;
  cronSecret: string | null;
  siteUrl: string;
  problems: string[];
}

const trim = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export function readClinicalEnv(env: NodeJS.ProcessEnv = process.env): ClinicalEnv {
  const problems: string[] = [];
  const vercelEnv = (trim(env.VERCEL_ENV) as ClinicalEnv["vercelEnv"]) ?? null;
  const onVercel = Boolean(trim(env.VERCEL));

  const supabaseUrl = trim(env.SUPABASE_URL);
  const anonKey = trim(env.SUPABASE_ANON_KEY);
  const serviceKey = trim(env.SUPABASE_SERVICE_ROLE_KEY);
  const supabase =
    supabaseUrl && anonKey && serviceKey
      ? { url: supabaseUrl.replace(/\/$/, ""), anonKey, serviceKey }
      : null;
  if (supabaseUrl && !supabase) problems.push("SUPABASE_URL is set but a Supabase key is missing");

  const secretKey = trim(env.STRIPE_SECRET_KEY);
  let stripe: ClinicalEnv["stripe"] = null;
  if (secretKey) {
    const mode = secretKey.startsWith("sk_live_") ? "live" : secretKey.startsWith("sk_test_") ? "test" : null;
    if (!mode) problems.push("STRIPE_SECRET_KEY is not a Stripe secret key");
    else if (vercelEnv === "production" ? mode !== "live" : mode !== "test")
      problems.push(
        vercelEnv === "production"
          ? "production needs a live Stripe key"
          : "previews accept only Stripe test keys",
      );
    else stripe = { secretKey, webhookSecret: trim(env.STRIPE_WEBHOOK_SECRET), mode };
  }

  const brevoKey = trim(env.BREVO_API_KEY);
  const sender = trim(env.EMAIL_SENDER);
  const brevo = brevoKey && sender ? { apiKey: brevoKey, senderEmail: sender, senderName: "Telegen" } : null;

  return {
    vercelEnv,
    localDrivers: !onVercel,
    databaseUrl: trim(env.DATABASE_URL),
    supabase,
    stripe,
    brevo,
    appLaunch: env.APP_LAUNCH === "on" && vercelEnv === "production",
    cronSecret: trim(env.CRON_SECRET),
    siteUrl: (trim(env.NEXT_PUBLIC_SITE_URL) ?? "https://telegen.ro").replace(/\/$/, ""),
    problems,
  };
}

let cached: ClinicalEnv | null = null;
export function clinicalEnv(): ClinicalEnv {
  cached ??= readClinicalEnv();
  return cached;
}
