import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** SQL migrations in supabase/migrations, in name order. */
export function migrationFiles(
  dir = path.join(process.cwd(), "supabase/migrations"),
): { name: string; sql: string }[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((name) => ({ name, sql: readFileSync(path.join(dir, name), "utf8") }));
}
