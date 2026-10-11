/** A query executor bound to one transaction. Parameters are always bound, never interpolated. */
export interface Executor {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
}

export interface Driver {
  readonly name: "postgres" | "pglite";
  /** Runs `fn` in one transaction; `setup` statements run first (role and JWT claims). */
  transaction<T>(
    setup: { claims: string | null; role: "authenticated" | "service_role" },
    fn: (q: Executor) => Promise<T>,
  ): Promise<T>;
}

/** Who is acting. Mirrors the Supabase JWT claims that RLS reads. */
export interface Actor {
  id: string;
  /** "aal2" once the user has passed two-factor authentication. */
  aal: "aal1" | "aal2";
}
