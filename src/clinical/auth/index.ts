import "server-only";
import { clinicalEnv } from "../env";
import { devAuth } from "./dev";
import { supabaseAuth } from "./supabase";
import type { AuthAdapter, Session } from "./types";

export type { Session } from "./types";

/** Supabase when configured; the development sign-in only where local stand-ins are allowed. */
export function authAdapter(): AuthAdapter | null {
  const env = clinicalEnv();
  if (env.supabase) return supabaseAuth(env.supabase);
  if (env.localDrivers) return devAuth();
  return null;
}

export async function currentSession(): Promise<Session | null> {
  return (await authAdapter()?.session()) ?? null;
}
