/**
 * Writes docs/supabase-setup.sql: every file in supabase/migrations combined into
 * one block for the Supabase SQL Editor (paste, Run), followed by a verification
 * query. Each migration is wrapped so it runs only if clinical_meta.migrations does
 * not list it yet: pasting the block twice, or after the owner's Claude chat applied
 * some migrations, changes nothing. `pnpm db:setup-sql` regenerates it;
 * tests/unit/supabase-setup.test.ts checks it is current and runs it on PGlite.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const VERIFY_SQL = `-- Verification: one row per clinical table (every one must say "RLS on"),
-- per applied migration, and the photo bucket (must say "private").
select 'table' as kind, n.nspname || '.' || c.relname as name,
  case when c.relrowsecurity then 'RLS on' else 'RLS OFF (wrong)' end as status
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('clinical', 'clinical_meta') and c.relkind in ('r', 'p')
union all
select 'migration', name, 'applied ' || to_char(applied_at, 'YYYY-MM-DD HH24:MI') from clinical_meta.migrations
union all
select 'bucket', id, case when public then 'PUBLIC (wrong)' else 'private' end
from storage.buckets where id = 'case-photos'
order by 1, 2;
`;

export function buildSetupSql(dir = path.join(process.cwd(), "supabase/migrations")): string {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const blocks = files.map((name) => {
    const body = readFileSync(path.join(dir, name), "utf8").trimEnd();
    const tag = `$m${name.slice(0, 4)}$`;
    if (body.includes(tag) || body.includes("$setup$"))
      throw new Error(`${name} uses a reserved dollar-quote tag`);
    if (/'/.test(name)) throw new Error(`bad migration name ${name}`);
    return `-- ${name}
do $setup$
begin
  if not exists (select 1 from clinical_meta.migrations where name = '${name}') then
    execute ${tag}
${body}
${tag};
  end if;
end
$setup$;`;
  });
  return `-- Telegen: Supabase setup, generated from supabase/migrations by scripts/supabase-setup.ts.
-- Do not edit by hand. Paste everything into Supabase -> SQL Editor -> New query -> Run.
-- Safe to run more than once: a migration that is already applied is skipped.
-- Creates the private "clinical" schema (not exposed to the REST API), Row Level
-- Security on every table with policies per role (patient, doctor, pharmacy,
-- admin), the audit log and the private photo bucket "case-photos".
-- Test data is NOT included; for the preview project only, see supabase/seed-preview.sql.

create schema if not exists clinical_meta;
create table if not exists clinical_meta.migrations (
  name text primary key,
  applied_at timestamptz not null default now()
);
alter table clinical_meta.migrations enable row level security;

${blocks.join("\n\n")}

${VERIFY_SQL}`;
}

const out = path.join(process.cwd(), "docs/supabase-setup.sql");
if (process.argv[1] && path.basename(process.argv[1]).startsWith("supabase-setup")) {
  writeFileSync(out, buildSetupSql());
  console.log(`wrote ${path.relative(process.cwd(), out)}`);
}
