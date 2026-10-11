import "server-only";
import { clinicalEnv } from "../env";
import type { Actor, Driver, Executor } from "./types";

export type { Actor, Executor } from "./types";

let driver: Promise<Driver> | null = null;

/** The configured database: Supabase Postgres when DATABASE_URL is set, otherwise local PGlite (never on Vercel). */
export function getDriver(): Promise<Driver> {
  if (!driver) {
    driver = (async () => {
      const env = clinicalEnv();
      if (env.databaseUrl) {
        const { postgresDriver } = await import("./postgres");
        return postgresDriver(env.databaseUrl);
      }
      if (!env.localDrivers) throw new Error("DATABASE_URL is not configured");
      const { createPglite, pgliteDriver } = await import("./pglite");
      const { seedLocal } = await import("./seed");
      const db = await createPglite();
      const d = pgliteDriver(db);
      await seedLocal(d);
      return d;
    })();
  }
  return driver;
}

/** Test hook: use a specific driver (unit tests with their own PGlite). */
export function setDriverForTests(d: Driver | null): void {
  driver = d ? Promise.resolve(d) : null;
}

const claimsFor = (actor: Actor) => JSON.stringify({ sub: actor.id, role: "authenticated", aal: actor.aal });

/** Run as the signed-in user: Row Level Security decides what is visible. */
export async function asUser<T>(actor: Actor, fn: (q: Executor) => Promise<T>): Promise<T> {
  return (await getDriver()).transaction({ claims: claimsFor(actor), role: "authenticated" }, fn);
}

/** Run as the server itself (webhooks, scheduled jobs, account set-up). Bypasses RLS: keep it narrow. */
export async function asService<T>(fn: (q: Executor) => Promise<T>): Promise<T> {
  return (await getDriver()).transaction(
    { claims: JSON.stringify({ role: "service_role" }), role: "service_role" },
    fn,
  );
}
