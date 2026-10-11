import "server-only";
import postgres from "postgres";
import type { Driver, Executor } from "./types";

/**
 * Production database: Supabase Postgres (EU) through the connection pooler.
 * Transaction pooling does not keep prepared statements, so they are off.
 */
export function postgresDriver(url: string): Driver {
  const sql = postgres(url, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 10 });
  return {
    name: "postgres",
    async transaction(setup, fn) {
      return sql.begin(async (tx) => {
        await tx.unsafe("select set_config('request.jwt.claims', $1, true)", [setup.claims ?? ""]);
        await tx.unsafe(`set local role ${setup.role}`);
        const q: Executor = {
          async query(text, params) {
            return (await tx.unsafe(text, (params ?? []) as never[])) as never[];
          },
        };
        return fn(q);
      }) as Promise<never>;
    },
  };
}
