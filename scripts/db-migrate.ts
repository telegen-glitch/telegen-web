/**
 * Applies supabase/migrations/*.sql to the Supabase database before a build,
 * once each, in name order (CLAUDE.md v5), only with DB_MIGRATE_ON_BUILD=on and a
 * database URL. Off by default: the shared project is migrated from the SQL Editor
 * (docs/supabase-setup.sql) or the owner's Claude chat, so a preview of an
 * unfinished branch never changes it. Every migration records its own name in
 * clinical_meta.migrations, however it was applied, so nothing runs twice.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { readSupabaseEnv } from "../src/lib/supabase-env";

async function main(url: string): Promise<void> {
  const dir = path.join(process.cwd(), "supabase/migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 15 });

  try {
    await sql`create schema if not exists clinical_meta`;
    await sql`create table if not exists clinical_meta.migrations (name text primary key, applied_at timestamptz not null default now())`;
    const done = new Set(
      (await sql<{ name: string }[]>`select name from clinical_meta.migrations`).map((r) => r.name),
    );
    for (const name of files) {
      if (done.has(name)) continue;
      const body = readFileSync(path.join(dir, name), "utf8");
      await sql.begin(async (tx) => {
        await tx.unsafe(body);
        await tx`insert into clinical_meta.migrations (name) values (${name}) on conflict do nothing`;
      });
      console.log(`db-migrate: applied ${name}`);
    }
    console.log(`db-migrate: ${files.length} migration(s), database up to date.`);
  } catch (error) {
    console.error(`db-migrate failed: ${(error as Error).message}`);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

const url = readSupabaseEnv().databaseUrl;
if (process.env.DB_MIGRATE_ON_BUILD !== "on") console.log("db-migrate: off (DB_MIGRATE_ON_BUILD is not on).");
else if (url) void main(url);
else console.log("db-migrate: no database URL, skipped (local and CI use PGlite).");
