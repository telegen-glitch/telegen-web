import { NextResponse } from "next/server";
import { asService } from "@/clinical/db";
import { EXPECTED_MIGRATIONS } from "@/clinical/db/expected-migrations";
import { clinicalEnv } from "@/clinical/env";
import { isNewApiKey, secretKeyHeaders } from "@/lib/supabase-env";

export const dynamic = "force-dynamic";

/**
 * Set-up check the owner can open on a phone: which services are configured and
 * whether the database answers. Booleans and counts only, never data or keys.
 */
export async function GET() {
  const env = clinicalEnv();
  let database: "ok" | "error" | "not-configured" = "not-configured";
  let tables: number | null = null;
  let missingMigrations: string[] | null = null;
  if (env.databaseUrl || env.localDrivers) {
    try {
      const [t] = await asService((q) =>
        q.query<{ n: number }>(
          "select count(*)::int as n from information_schema.tables where table_schema = 'clinical'",
        ),
      );
      tables = t?.n ?? 0;
      database = "ok";
      const applied = await asService((q) =>
        q.query<{ name: string }>("select name from clinical_meta.migrations"),
      ).catch(() => []);
      const names = new Set(applied.map((r) => r.name));
      missingMigrations = EXPECTED_MIGRATIONS.filter((m) => !names.has(m));
    } catch {
      database = "error";
    }
  }
  // The private photo bucket, through the Storage API with the secret key (status only).
  let photoBucket: "private" | "public (wrong)" | "missing" | "error" | "not-configured" = "not-configured";
  if (env.supabase) {
    try {
      const res = await fetch(`${env.supabase.url}/storage/v1/bucket/case-photos`, {
        headers: secretKeyHeaders(env.supabase.secretKey),
        cache: "no-store",
      });
      if (res.status === 404 || res.status === 400) photoBucket = "missing";
      else if (!res.ok) photoBucket = "error";
      else photoBucket = ((await res.json()) as { public?: boolean }).public ? "public (wrong)" : "private";
    } catch {
      photoBucket = "error";
    }
  }
  return NextResponse.json(
    {
      database,
      clinicalTables: tables,
      // Empty when the database is up to date; otherwise paste docs/supabase-setup.sql again.
      missingMigrations,
      photoBucket,
      auth: env.supabase
        ? `supabase (${isNewApiKey(env.supabase.publicKey) ? "publishable" : "legacy"} key)`
        : env.localDrivers
          ? "local"
          : "not-configured",
      payments: env.stripe ? `stripe-${env.stripe.mode}` : env.localDrivers ? "fake" : "not-configured",
      email: env.brevo ? "brevo" : env.localDrivers ? "outbox" : "not-configured",
      problems: env.problems,
    },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
