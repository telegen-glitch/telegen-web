import "server-only";
import { clinicalEnv } from "../env";
import { devAuth } from "./dev";
import { supabaseAuth } from "./supabase";
import type { AuthAdapter, Session } from "./types";

export type { Session } from "./types";

/**
 * Supabase when configured, together with its database (a sign-in without the
 * database would only lead to an error page); the development sign-in only where
 * local stand-ins are allowed. Null means "service not ready" (ServiceNotReady).
 */
export function authAdapter(): AuthAdapter | null {
  const env = clinicalEnv();
  if (env.supabase && (env.databaseUrl || env.localDrivers)) return supabaseAuth(env.supabase);
  if (env.supabase) return null;
  if (env.localDrivers) return devAuth();
  return null;
}

export async function currentSession(): Promise<Session | null> {
  return (await authAdapter()?.session()) ?? null;
}
