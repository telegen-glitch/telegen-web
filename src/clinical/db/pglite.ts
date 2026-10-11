import "server-only";
import type { PGlite } from "@electric-sql/pglite";
import { migrationFiles } from "./migrations";
import type { Driver, Executor } from "./types";

/**
 * Local and test database: Postgres compiled to WebAssembly, in memory. It is
 * given the same roles and auth.uid() that Supabase provides, then the real
 * migrations, so RLS behaves as it does in production. Never used on Vercel.
 */
export const AUTH_STUB = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text unique, created_at timestamptz not null default now());
create function auth.uid() returns uuid language sql stable as $$
  select nullif(nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub', '')::uuid
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant select, insert, delete on auth.users to service_role;
`;

export async function createPglite(
  options: { migrations?: { name: string; sql: string }[] } = {},
): Promise<PGlite> {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite();
  await db.exec(AUTH_STUB);
  for (const m of options.migrations ?? migrationFiles()) await db.exec(m.sql);
  return db;
}

export function pgliteDriver(db: PGlite): Driver {
  return {
    name: "pglite",
    async transaction(setup, fn) {
      return db.transaction(async (tx) => {
        await tx.query("select set_config('request.jwt.claims', $1, true)", [setup.claims ?? ""]);
        await tx.exec(`set local role ${setup.role}`);
        const q: Executor = {
          async query(text, params) {
            const res = await tx.query(text, params ?? []);
            return res.rows as never[];
          },
        };
        return fn(q);
      });
    },
  };
}
