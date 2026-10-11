import "server-only";
import { normalEmail } from "../auth/types";
import { asService, asUser } from "../db";
import { clinicalEnv } from "../env";
import { IntakeError, type CaseStatus } from "../intake/cases";
import type { Session } from "../auth";

/**
 * Operations for admins (CLAUDE.md v5): case status, SLA and card holds, the
 * doctor accounts and the pay ledger. Row Level Security lets admins (with 2FA)
 * read cases, payments, doctors and the ledger, never answers, photos or messages.
 */
const actor = (s: Session) => ({ id: s.userId, aal: s.aal });
export const SPECIALTIES = ["dermatologie", "urologie", "medicina-de-familie"] as const;
export type Specialty = (typeof SPECIALTIES)[number];

export interface Overview {
  counts: { status: CaseStatus; n: number; test: boolean }[];
  attention: {
    id: string;
    condition: string;
    status: CaseStatus;
    slaDueAt: string | null;
    holdUntil: string | null;
    doctor: string | null;
    test: boolean;
  }[];
}

export async function overview(session: Session): Promise<Overview> {
  return asUser(actor(session), async (q) => {
    const counts = await q.query<{ status: CaseStatus; n: number; test: boolean }>(
      "select status, test, count(*)::int as n from clinical.cases group by status, test order by status",
    );
    const attention = await q.query<{
      id: string;
      condition: string;
      status: CaseStatus;
      sla_due_at: Date | null;
      capture_before: Date | null;
      doctor: string | null;
      test: boolean;
    }>(
      `select c.id, c.condition, c.status, c.sla_due_at, c.test, d.full_name as doctor,
         (select max(p.capture_before) from clinical.payments p where p.case_id = c.id and p.status = 'authorized') as capture_before
       from clinical.cases c left join clinical.doctors d on d.id = c.assigned_doctor_id
       where c.status in ('submitted', 'in_review', 'waiting_patient', 'adjusted')
       order by c.sla_due_at nulls last limit 100`,
    );
    return {
      counts,
      attention: attention.map((a) => ({
        id: a.id,
        condition: a.condition,
        status: a.status,
        slaDueAt: a.sla_due_at ? new Date(a.sla_due_at).toISOString() : null,
        holdUntil: a.capture_before ? new Date(a.capture_before).toISOString() : null,
        doctor: a.doctor,
        test: a.test,
      })),
    };
  });
}

export interface DoctorRow {
  id: string;
  email: string;
  fullName: string;
  specialty: Specialty;
  parafa: string;
  active: boolean;
  twoFactor: boolean;
}

export async function listDoctors(session: Session): Promise<DoctorRow[]> {
  const rows = await asUser(actor(session), (q) =>
    q.query<{
      id: string;
      email: string;
      full_name: string;
      specialty: Specialty;
      parafa_code: string;
      active: boolean;
    }>(
      `select d.id, p.email, d.full_name, d.specialty, d.parafa_code, d.active
       from clinical.doctors d join clinical.profiles p on p.id = d.id order by d.full_name`,
    ),
  );
  const ready = await asService((q) =>
    q.query<{ user_id: string }>("select distinct user_id from auth.mfa_factors where status = 'verified'"),
  ).catch(() => [] as { user_id: string }[]);
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    specialty: r.specialty,
    parafa: r.parafa_code,
    active: r.active,
    twoFactor: ready.some((x) => x.user_id === r.id),
  }));
}

/** Creates the sign-in account of a doctor (no password: e-mail code, then mandatory 2FA). */
async function createAuthUser(email: string): Promise<string> {
  const env = clinicalEnv();
  if (env.supabase) {
    const res = await fetch(`${env.supabase.url}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: env.supabase.serviceKey,
        Authorization: `Bearer ${env.supabase.serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, email_confirm: true }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    if (!res.ok || !data.id) throw new IntakeError("locked");
    return data.id;
  }
  const [row] = await asService((q) =>
    q.query<{ id: string }>("insert into auth.users (email) values ($1) returning id", [email]),
  ).catch(() => {
    throw new IntakeError("locked");
  });
  return row.id;
}

export async function createDoctor(
  session: Session,
  raw: { email: unknown; fullName: unknown; specialty: unknown; parafa: unknown },
): Promise<void> {
  const email = normalEmail(raw.email);
  const fullName = String(raw.fullName ?? "")
    .replace(/\s+/g, " ")
    .trim();
  const parafa = String(raw.parafa ?? "").trim();
  const specialty = SPECIALTIES.find((s) => s === raw.specialty);
  if (
    !email ||
    fullName.length < 3 ||
    fullName.length > 120 ||
    !/^[A-Za-z0-9-]{3,20}$/.test(parafa) ||
    !specialty
  )
    throw new IntakeError("invalid");
  // Only an admin with 2FA may do this (checked again here, not only in the page).
  const [me] = await asUser(actor(session), (q) =>
    q.query<{ ok: boolean }>("select clinical.is_admin() as ok"),
  );
  if (!me?.ok) throw new IntakeError("locked");
  const exists = await asService((q) => q.query("select 1 from clinical.profiles where email = $1", [email]));
  if (exists.length) throw new IntakeError("locked");
  const id = await createAuthUser(email);
  await asService(async (q) => {
    await q.query("insert into clinical.profiles (id, role, email) values ($1, 'doctor', $2)", [id, email]);
    await q.query(
      "insert into clinical.doctors (id, full_name, specialty, parafa_code) values ($1, $2, $3, $4)",
      [id, fullName, specialty, parafa],
    );
    await q.query(
      "insert into clinical.audit_log (actor_id, actor_role, action, entity, entity_id) values ($1, 'admin', 'insert', 'doctors', $2)",
      [session.userId, id],
    );
  });
}

export async function setDoctorActive(session: Session, doctorId: string, active: boolean): Promise<void> {
  const [me] = await asUser(actor(session), (q) =>
    q.query<{ ok: boolean }>("select clinical.is_admin() as ok"),
  );
  if (!me?.ok) throw new IntakeError("locked");
  await asService(async (q) => {
    await q.query("update clinical.doctors set active = $2 where id = $1", [doctorId, active]);
    await q.query(
      "insert into clinical.audit_log (actor_id, actor_role, action, entity, entity_id) values ($1, 'admin', 'update', 'doctors', $2)",
      [session.userId, doctorId],
    );
  });
}

/** Monthly pay export: completed reviews per doctor (approve, adjust and decline count the same). */
export async function ledgerCsv(session: Session, month: string, feeRon: number | null): Promise<string> {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new IntakeError("invalid");
  const rows = await asUser(actor(session), (q) =>
    q.query<{ full_name: string; parafa_code: string; reviews: number }>(
      `select d.full_name, d.parafa_code, count(l.id)::int as reviews
       from clinical.doctor_ledger l join clinical.doctors d on d.id = l.doctor_id
       where to_char(l.created_at at time zone 'Europe/Bucharest', 'YYYY-MM') = $1
       group by d.full_name, d.parafa_code order by d.full_name`,
      [month],
    ),
  );
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [["luna", "medic", "cod_parafa", "evaluari", "tarif_lei", "total_lei"].join(",")];
  for (const r of rows)
    lines.push(
      [
        month,
        r.full_name,
        r.parafa_code,
        r.reviews,
        feeRon ?? "nestabilit",
        feeRon === null ? "" : feeRon * r.reviews,
      ]
        .map(cell)
        .join(","),
    );
  return lines.join("\n") + "\n";
}
