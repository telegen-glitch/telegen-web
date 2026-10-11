import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AUTH_STUB } from "@/clinical/db/pglite";
import { EXPECTED_MIGRATIONS } from "@/clinical/db/expected-migrations";
import { migrationFiles } from "@/clinical/db/migrations";
import { buildSetupSql } from "../../scripts/supabase-setup";

/**
 * docs/supabase-setup.sql, the one block the owner pastes into the Supabase SQL
 * Editor (CLAUDE.md v5.1): current, runs on a fresh database with Supabase's
 * auth and storage shapes, can be pasted twice, and leaves RLS on every table.
 */

// The parts of Supabase's storage schema the migrations touch.
const STORAGE_STUB = `
create schema storage;
create table storage.buckets (id text primary key, name text not null, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets (id), name text);
alter table storage.objects enable row level security;
`;

async function freshDb() {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite();
  await db.exec(AUTH_STUB + STORAGE_STUB);
  return db;
}

// Each test builds a full database in WebAssembly: slow under a parallel run.
describe("docs/supabase-setup.sql", { timeout: 60_000 }, () => {
  const setup = buildSetupSql();

  it("is up to date with supabase/migrations (run pnpm db:setup-sql)", () => {
    expect(readFileSync(path.join(process.cwd(), "docs/supabase-setup.sql"), "utf8")).toBe(setup);
  });

  it("the health check expects exactly the migrations in supabase/migrations", () => {
    expect([...EXPECTED_MIGRATIONS]).toEqual(migrationFiles().map((m) => m.name));
  });

  it("every migration records its own name, so no path applies it twice", () => {
    for (const m of migrationFiles())
      expect(m.sql, m.name).toContain(
        `insert into clinical_meta.migrations (name) values ('${m.name}') on conflict do nothing;`,
      );
  });

  it("runs on a fresh database, twice, and leaves RLS on every table and a private bucket", async () => {
    const db = await freshDb();
    await db.exec(setup);
    await db.exec(setup); // pasted again: nothing changes, nothing fails
    const rows = (
      await db.query<{ kind: string; name: string; status: string }>(
        setup.slice(setup.lastIndexOf("select 'table'")),
      )
    ).rows;
    const tables = rows.filter((r) => r.kind === "table");
    expect(tables.length).toBeGreaterThan(20);
    expect(tables.filter((r) => r.status !== "RLS on")).toEqual([]);
    expect(rows.filter((r) => r.kind === "migration").map((r) => r.name)).toEqual(
      migrationFiles().map((m) => m.name),
    );
    expect(rows.find((r) => r.kind === "bucket")).toEqual({
      kind: "bucket",
      name: "case-photos",
      status: "private",
    });
    const bucket = await db.query<{ file_size_limit: number; allowed_mime_types: string[] }>(
      "select file_size_limit, allowed_mime_types from storage.buckets where id = 'case-photos'",
    );
    expect(bucket.rows[0]).toEqual({ file_size_limit: 5242880, allowed_mime_types: ["image/jpeg"] });
    const policy = await db.query<{ permissive: string; roles: string[] }>(
      "select permissive, roles::text[] as roles from pg_policies where schemaname = 'storage' and policyname = 'case_photos_server_only'",
    );
    expect(policy.rows).toEqual([{ permissive: "RESTRICTIVE", roles: ["anon", "authenticated"] }]);
  });

  it("is skipped migration by migration after another path applied some of them", async () => {
    const db = await freshDb();
    const [first, second] = migrationFiles();
    await db.exec(first.sql);
    await db.exec(second.sql);
    await db.exec(setup);
    const n = await db.query<{ n: number }>("select count(*)::int as n from clinical_meta.migrations");
    expect(n.rows[0].n).toBe(migrationFiles().length);
  });

  it("the browser roles cannot read photos in storage, even with a permissive policy added later", async () => {
    const db = await freshDb();
    await db.exec(setup);
    await db.exec(`
      insert into storage.objects (bucket_id, name) values ('case-photos', 'a/b/front.jpg');
      create policy oops on storage.objects for select to authenticated using (true);
      grant usage on schema storage to authenticated; grant select on storage.objects to authenticated;`);
    const seen = await db.transaction(async (tx) => {
      await tx.exec("set local role authenticated");
      return (await tx.query("select name from storage.objects")).rows;
    });
    expect(seen).toEqual([]);
  });
});
