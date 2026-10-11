import "server-only";
import { authAdapter, type Session } from "./auth";
import { asService } from "./db";
import { ensureAccount, type Role } from "./intake/account";

/**
 * Access to the staff areas (/medic, /admin, /farmacie). Doctors and admins
 * must pass two-factor authentication (aal2) on every session; Row Level
 * Security enforces the same in the database.
 */
export type StaffGate =
  | { state: "unconfigured" }
  | { state: "signed_out" }
  | { state: "forbidden" }
  | { state: "needs_2fa"; enrolled: boolean }
  | { state: "ok"; session: Session; role: Role };

const NEEDS_2FA: Role[] = ["doctor", "admin"];

export async function staffGate(role: Role): Promise<StaffGate> {
  const auth = authAdapter();
  if (!auth) return { state: "unconfigured" };
  const session = await auth.session();
  if (!session) return { state: "signed_out" };
  const actual = await ensureAccount(session);
  if (actual !== role) return { state: "forbidden" };
  if (NEEDS_2FA.includes(role) && session.aal !== "aal2")
    return { state: "needs_2fa", enrolled: (await auth.mfaFactors()).length > 0 };
  if (role === "doctor") {
    const [d] = await asService((q) =>
      q.query<{ active: boolean }>("select active from clinical.doctors where id = $1", [session.userId]),
    );
    if (!d?.active) return { state: "forbidden" };
  }
  return { state: "ok", session, role: actual };
}
