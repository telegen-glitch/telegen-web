import { NextResponse } from "next/server";
import { asService } from "@/clinical/db";
import { clinicalEnv } from "@/clinical/env";

export const dynamic = "force-dynamic";

/**
 * Set-up check the owner can open on a phone: which services are configured and
 * whether the database answers. Booleans and counts only, never data or keys.
 */
export async function GET() {
  const env = clinicalEnv();
  let database: "ok" | "error" | "not-configured" = "not-configured";
  let migrations: number | null = null;
  if (env.databaseUrl || env.localDrivers) {
    try {
      const rows = await asService((q) =>
        q.query<{ n: number }>(
          "select count(*)::int as n from information_schema.tables where table_schema = 'clinical'",
        ),
      );
      database = "ok";
      migrations = rows[0]?.n ?? 0;
    } catch {
      database = "error";
    }
  }
  return NextResponse.json(
    {
      database,
      clinicalTables: migrations,
      auth: env.supabase ? "supabase" : env.localDrivers ? "local" : "not-configured",
      payments: env.stripe ? `stripe-${env.stripe.mode}` : env.localDrivers ? "fake" : "not-configured",
      email: env.brevo ? "brevo" : env.localDrivers ? "outbox" : "not-configured",
      problems: env.problems,
    },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
