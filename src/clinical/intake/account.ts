import "server-only";
import { asService } from "../db";
import { clinicalEnv } from "../env";
import { logEvent } from "../log";
import type { Session } from "../auth";

export type Role = "patient" | "doctor" | "pharmacy" | "admin";

/**
 * First sign-in creates the profile: admin for ADMIN_EMAILS, otherwise patient.
 * Doctor and pharmacy accounts are created by an admin, never by signing in.
 * Returns the account's role.
 */
export async function ensureAccount(session: Session): Promise<Role> {
  const admin = clinicalEnv().adminEmails.includes(session.email);
  return asService(async (q) => {
    const existing = await q.query<{ role: Role }>("select role from clinical.profiles where id = $1", [
      session.userId,
    ]);
    if (existing[0]) return existing[0].role;
    const role: Role = admin ? "admin" : "patient";
    await q.query("insert into clinical.profiles (id, role, email) values ($1, $2, $3)", [
      session.userId,
      role,
      session.email,
    ]);
    if (role === "patient") await q.query("insert into clinical.patients (id) values ($1)", [session.userId]);
    logEvent("account.created", { profile: session.userId });
    return role;
  });
}
