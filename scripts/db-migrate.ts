/**
 * Applies supabase/migrations/*.sql to the Supabase database before each build,
 * once each, in name order (CLAUDE.md v5). Runs only when DATABASE_URL is set,
 * so the owner never has to paste SQL from a phone: adding the variable in
 * Vercel is enough. Each migration runs in its own transaction.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";

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
        await tx`insert into clinical_meta.migrations (name) values (${name})`;
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

const url = process.env.DATABASE_URL?.trim();
if (url) void main(url);
else console.log("db-migrate: DATABASE_URL not set, skipped (local and CI use PGlite).");
