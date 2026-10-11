/**
 * Supabase settings from environment variables, under either naming scheme, so
 * whatever the owner types or the Vercel–Supabase integration adds works
 * (docs/LAUNCH.md §1). First non-empty name wins:
 *
 * - URL: SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL
 * - public key (browser-safe; `sb_publishable_…` or the legacy anon JWT):
 *   SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - secret key (server only; `sb_secret_…` or the legacy service_role JWT):
 *   SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY. A NEXT_PUBLIC_ name is never read.
 * - database (the clinical schema is reached only over Postgres, not the REST API):
 *   DATABASE_URL, POSTGRES_URL (the integration's pooled connection string).
 *
 * No value is ever logged; problems name the variable, never its content.
 */
export interface SupabaseSettings {
  url: string | null;
  publicKey: string | null;
  secretKey: string | null;
  databaseUrl: string | null;
  problems: string[];
}

const URL_NAMES = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"] as const;
const PUBLIC_NAMES = [
  "SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;
const SECRET_NAMES = ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;
const DATABASE_NAMES = ["DATABASE_URL", "POSTGRES_URL"] as const;

const first = (env: NodeJS.ProcessEnv, names: readonly string[]) => {
  for (const name of names) {
    const v = env[name]?.trim();
    if (v) return v;
  }
  return null;
};

/** True for the new key format, which is not a JWT and goes only in the `apikey` header. */
export const isNewApiKey = (key: string) => key.startsWith("sb_publishable_") || key.startsWith("sb_secret_");

/**
 * Headers for a server-side call to Supabase Auth admin or Storage with the
 * secret key. New-format keys are sent only as `apikey` (Supabase turns them into
 * a short-lived token); a legacy JWT key also goes in `Authorization`, as before.
 */
export function secretKeyHeaders(key: string): Record<string, string> {
  return isNewApiKey(key) ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };
}

/**
 * The connection string without query parameters Postgres does not know (the
 * integration adds e.g. `supa=base-pooler.x`, which the driver would send to the
 * server as a setting). Only `sslmode` is kept.
 */
export function cleanDatabaseUrl(raw: string): string {
  try {
    const u = new URL(raw);
    for (const key of [...u.searchParams.keys()]) if (key !== "sslmode") u.searchParams.delete(key);
    return u.toString();
  } catch {
    return raw;
  }
}

export function readSupabaseEnv(env: NodeJS.ProcessEnv = process.env): SupabaseSettings {
  const problems: string[] = [];
  const url = first(env, URL_NAMES)?.replace(/\/$/, "") ?? null;
  let publicKey = first(env, PUBLIC_NAMES);
  let secretKey = first(env, SECRET_NAMES);
  const db = first(env, DATABASE_NAMES);

  for (const name of Object.keys(env)) {
    if (/^NEXT_PUBLIC_.*(SECRET|SERVICE_ROLE)/.test(name) && env[name]?.trim())
      problems.push(
        `${name}: a secret key must never have the NEXT_PUBLIC_ prefix (it would reach the browser); remove it`,
      );
  }
  if (publicKey?.startsWith("sb_secret_")) {
    problems.push("the public key variable holds a secret key (sb_secret_…); use the publishable key");
    publicKey = null;
  }
  if (secretKey?.startsWith("sb_publishable_")) {
    problems.push("the secret key variable holds a publishable key; use the secret key (sb_secret_…)");
    secretKey = null;
  }
  if (url && !/^https:\/\/[^/]+$/.test(url))
    problems.push("SUPABASE_URL must look like https://<project>.supabase.co");

  return { url, publicKey, secretKey, databaseUrl: db ? cleanDatabaseUrl(db) : null, problems };
}

/** Every Supabase value the clinical service needs is present (names only, for the launch lock). */
export function supabaseMissing(env: NodeJS.ProcessEnv = process.env): string[] {
  const s = readSupabaseEnv(env);
  const missing: string[] = [];
  if (!s.url) missing.push("SUPABASE_URL");
  if (!s.publicKey) missing.push("SUPABASE_PUBLISHABLE_KEY");
  if (!s.secretKey) missing.push("SUPABASE_SECRET_KEY");
  if (!s.databaseUrl) missing.push("DATABASE_URL");
  return missing;
}
