import "server-only";
import { readSupabaseEnv } from "@/lib/supabase-env";

/**
 * Clinical configuration from environment variables, validated in one place.
 * Real services (Supabase, Stripe, Brevo) are used when their variables are set.
 * The local stand-ins (PGlite database, development sign-in, fake payments,
 * e-mail outbox) are allowed only outside Vercel, and only in development or
 * with CLINICAL_LOCAL=on (CI and e2e): a production server never falls back to them.
 */
export interface ClinicalEnv {
  vercelEnv: "production" | "preview" | "development" | null;
  /** Local stand-ins allowed (never on Vercel). */
  localDrivers: boolean;
  /** E-mail addresses that get the admin role on first sign-in (ADMIN_EMAILS, comma-separated). */
  adminEmails: string[];
  databaseUrl: string | null;
  /** Either naming scheme and either key format (src/lib/supabase-env.ts). */
  supabase: { url: string; publicKey: string; secretKey: string } | null;
  stripe: { secretKey: string; webhookSecret: string | null; mode: "test" | "live" } | null;
  brevo: { apiKey: string; senderEmail: string; senderName: string } | null;
  /** APP_LAUNCH=on: real patients may be accepted (production only, with the launch checks). */
  appLaunch: boolean;
  cronSecret: string | null;
  siteUrl: string;
  /** Base for links in e-mails: the branch preview on Vercel previews, the site in production. */
  appUrl: string;
  problems: string[];
}

const trim = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export function readClinicalEnv(env: NodeJS.ProcessEnv = process.env): ClinicalEnv {
  const problems: string[] = [];
  const vercelEnv = (trim(env.VERCEL_ENV) as ClinicalEnv["vercelEnv"]) ?? null;
  const onVercel = Boolean(trim(env.VERCEL));

  const sb = readSupabaseEnv(env);
  problems.push(...sb.problems);
  const supabase =
    sb.url && sb.publicKey && sb.secretKey
      ? { url: sb.url, publicKey: sb.publicKey, secretKey: sb.secretKey }
      : null;
  if (sb.url && !supabase)
    problems.push("the Supabase URL is set but the publishable or the secret key is missing");

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

  const adminEmails = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return {
    vercelEnv,
    localDrivers: !onVercel && (env.NODE_ENV !== "production" || env.CLINICAL_LOCAL === "on"),
    adminEmails,
    databaseUrl: sb.databaseUrl,
    supabase,
    stripe,
    brevo,
    appLaunch: env.APP_LAUNCH === "on" && vercelEnv === "production",
    cronSecret: trim(env.CRON_SECRET),
    siteUrl: (trim(env.NEXT_PUBLIC_SITE_URL) ?? "https://telegen.ro").replace(/\/$/, ""),
    appUrl:
      vercelEnv === "preview" && trim(env.VERCEL_BRANCH_URL)
        ? `https://${trim(env.VERCEL_BRANCH_URL)}`
        : (trim(env.NEXT_PUBLIC_SITE_URL) ?? "https://telegen.ro").replace(/\/$/, ""),
    problems,
  };
}

let cached: ClinicalEnv | null = null;
export function clinicalEnv(): ClinicalEnv {
  cached ??= readClinicalEnv();
  return cached;
}
