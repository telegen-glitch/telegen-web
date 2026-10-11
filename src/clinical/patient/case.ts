import "server-only";
import { PLANS, type PlanDefinition, type PlanId } from "../config/plans";
import { asService, asUser } from "../db";
import {
  afterApproval,
  captureFor,
  DECLINE_REASONS,
  readMessages,
  releaseFor,
  type ThreadMessage,
} from "../doctor/workflow";
import { enqueue } from "../email/outbox";
import { IntakeError, type CaseStatus } from "../intake/cases";
import type { Session } from "../auth";

/** The patient's view of one case (CLAUDE.md v5): status, their doctor, messages, an adjusted plan. */

const actor = (s: Session) => ({ id: s.userId, aal: s.aal });

const SPECIALTY: Record<string, string> = {
  dermatologie: "dermatologie",
  urologie: "urologie",
  "medicina-de-familie": "medicină de familie",
};

export interface PatientCaseView {
  id: string;
  condition: string;
  status: CaseStatus;
  test: boolean;
  doctor: { name: string; specialty: string; parafa: string } | null;
  declineReason: string | null;
  adjustedPlan: PlanDefinition | null;
  plan: PlanDefinition | null;
  messages: ThreadMessage[];
  canMessage: boolean;
  order: { status: string; carrier: string | null; trackingCode: string | null } | null;
}

export async function patientCase(session: Session, caseId: string): Promise<PatientCaseView | null> {
  return asUser(actor(session), async (q) => {
    const [k] = await q.query<{
      id: string;
      condition: string;
      status: CaseStatus;
      test: boolean;
      assigned_doctor_id: string | null;
      decision_reason: keyof typeof DECLINE_REASONS | null;
      patient_id: string;
    }>(
      "select id, condition, status, test, assigned_doctor_id, decision_reason, patient_id from clinical.cases where id = $1",
      [caseId],
    );
    if (!k || k.patient_id !== session.userId) return null;
    const [d] = k.assigned_doctor_id
      ? await q.query<{ full_name: string; specialty: string; parafa_code: string }>(
          "select full_name, specialty, parafa_code from clinical.doctors where id = $1",
          [k.assigned_doctor_id],
        )
      : [];
    const [p] = await q.query<{ plan_id: PlanId; source: string; accepted_at: Date | null }>(
      "select plan_id, source, accepted_at from clinical.proposals where case_id = $1 order by created_at desc limit 1",
      [caseId],
    );
    const [o] = await q.query<{ status: string; carrier: string | null; tracking_code: string | null }>(
      "select status, carrier, tracking_code from clinical.orders where case_id = $1 order by created_at desc limit 1",
      [caseId],
    );
    return {
      id: k.id,
      condition: k.condition,
      status: k.status,
      test: k.test,
      doctor: d
        ? { name: d.full_name, specialty: SPECIALTY[d.specialty] ?? d.specialty, parafa: d.parafa_code }
        : null,
      declineReason: k.decision_reason ? DECLINE_REASONS[k.decision_reason] : null,
      adjustedPlan:
        k.status === "adjusted" && p?.source === "doctor" && !p.accepted_at ? PLANS[p.plan_id] : null,
      plan: p ? PLANS[p.plan_id] : null,
      messages: await readMessages(q, caseId),
      canMessage: ["submitted", "in_review", "waiting_patient", "adjusted", "approved", "declined"].includes(
        k.status,
      ),
      order: o ? { status: o.status, carrier: o.carrier, trackingCode: o.tracking_code } : null,
    };
  });
}

/** A message from the patient. Answering a doctor's question restarts the SLA clock where it stopped. */
export async function patientMessage(
  session: Session,
  input: { caseId: string; message: unknown },
): Promise<void> {
  const message = String(input.message ?? "").trim();
  if (message.length < 1 || message.length > 4000) throw new IntakeError("invalid");
  const k = await asUser(actor(session), async (q) => {
    const [k] = await q.query<{ status: CaseStatus; assigned_doctor_id: string | null }>(
      "select status, assigned_doctor_id from clinical.cases where id = $1 and patient_id = auth.uid()",
      [input.caseId],
    );
    if (!k) throw new IntakeError("not_found");
    if (!["submitted", "in_review", "waiting_patient", "adjusted", "approved", "declined"].includes(k.status))
      throw new IntakeError("locked");
    await q.query(
      "insert into clinical.messages (case_id, sender_id, sender_role, body) values ($1, auth.uid(), 'patient', $2)",
      [input.caseId, message],
    );
    return k;
  });
  await asService(async (q) => {
    if (k.status === "waiting_patient")
      await q.query(
        `update clinical.cases set status = 'in_review', sla_due_at = sla_due_at + (now() - sla_paused_at),
           sla_paused_at = null where id = $1 and status = 'waiting_patient'`,
        [input.caseId],
      );
    if (k.assigned_doctor_id) await enqueue(q, k.assigned_doctor_id, "patient_replied", input.caseId);
  });
}

/** The patient accepts the doctor's adjusted plan: only now is the amount captured. */
export async function acceptAdjustment(session: Session, caseId: string): Promise<void> {
  const p = await asUser(actor(session), async (q) => {
    const [k] = await q.query<{ status: CaseStatus }>(
      "select status from clinical.cases where id = $1 and patient_id = auth.uid()",
      [caseId],
    );
    if (!k) throw new IntakeError("not_found");
    if (k.status !== "adjusted") throw new IntakeError("locked");
    const [p] = await q.query<{
      id: string;
      first_amount: number;
      instructions: unknown;
      created_by: string;
    }>(
      `update clinical.proposals set accepted_at = now()
       where id = (select id from clinical.proposals where case_id = $1 and source = 'doctor' and accepted_at is null
                   order by created_at desc limit 1)
       returning id, first_amount, instructions, created_by`,
      [caseId],
    );
    if (!p) throw new IntakeError("invalid");
    return p;
  });
  if (!(await captureFor(caseId, p.first_amount))) throw new IntakeError("closed");
  const { rxId, patientId } = await asService(async (q) => {
    const [rx] = await q.query<{ id: string }>(
      "insert into clinical.prescriptions (case_id, doctor_id, items) values ($1, $2, $3::jsonb) returning id",
      [caseId, p.created_by, JSON.stringify(p.instructions)],
    );
    const [k] = await q.query<{ patient_id: string }>(
      "update clinical.cases set status = 'approved', decided_at = now(), approved_proposal_id = $2 where id = $1 returning patient_id",
      [caseId, p.id],
    );
    return { rxId: rx.id, patientId: k.patient_id };
  });
  await afterApproval(caseId, patientId, rxId, p.created_by);
}

/** The patient says no to the adjusted plan: the card hold is released in full. */
export async function refuseAdjustment(session: Session, caseId: string): Promise<void> {
  await asUser(actor(session), async (q) => {
    const [k] = await q.query<{ status: CaseStatus }>(
      "select status from clinical.cases where id = $1 and patient_id = auth.uid()",
      [caseId],
    );
    if (!k) throw new IntakeError("not_found");
    if (k.status !== "adjusted") throw new IntakeError("locked");
  });
  await asService((q) => q.query("update clinical.cases set status = 'canceled' where id = $1", [caseId]));
  await releaseFor(caseId);
}
