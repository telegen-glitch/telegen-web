import "server-only";
import { getEvaluation } from "@/content/evaluations";
import type { Question } from "@/content/evaluations/types";
import { PLANS, type PlanDefinition, type PlanId } from "../config/plans";
import { asService, asUser, type Executor } from "../db";
import { enqueue } from "../email/outbox";
import { IntakeError, type CaseStatus } from "../intake/cases";
import { logEvent } from "../log";
import { paymentProvider } from "../payments/provider";
import { fulfil } from "../pharmacy/orders";
import { startPlan } from "../subscriptions";
import { prescriptionAdapter, type PrescriptionItem } from "../prescriptions/adapter";
import type { Session } from "../auth";

/**
 * The doctor's side of a case (CLAUDE.md v5 P3). Every read and write runs as
 * the signed-in doctor with two-factor authentication, so Row Level Security
 * limits them to their specialty's open queue and their own cases. Card
 * captures and releases, the order, the pay ledger and e-mails are done by the
 * server once the doctor's decision is recorded.
 */

const actor = (s: Session) => ({ id: s.userId, aal: s.aal });
const OPEN: CaseStatus[] = ["submitted", "in_review", "waiting_patient", "adjusted"];

export const DECLINE_REASONS = {
  contraindication: "Există o contraindicație pentru tratamentul propus.",
  needs_in_person: "Situația ta are nevoie de un consult în persoană.",
  insufficient_information: "Informațiile nu au fost suficiente pentru o decizie online.",
  not_indicated: "Tratamentul propus nu este indicat în situația ta.",
  other: "Alt motiv, explicat de medic în mesaj.",
} as const;
export type DeclineReason = keyof typeof DECLINE_REASONS;

export interface QueueItem {
  id: string;
  condition: string;
  status: CaseStatus;
  mine: boolean;
  slaDueAt: string | null;
  paused: boolean;
  test: boolean;
}

export async function doctorQueue(session: Session): Promise<QueueItem[]> {
  const rows = await asUser(actor(session), (q) =>
    q.query<{
      id: string;
      condition: string;
      status: CaseStatus;
      mine: boolean;
      sla_due_at: Date | null;
      sla_paused_at: Date | null;
      test: boolean;
    }>(
      `select id, condition, status, assigned_doctor_id = auth.uid() as mine, sla_due_at, sla_paused_at, test
       from clinical.cases where status = any($1::text[]) order by sla_due_at nulls last`,
      [OPEN],
    ),
  );
  return rows.map((r) => ({
    id: r.id,
    condition: r.condition,
    status: r.status,
    mine: Boolean(r.mine),
    slaDueAt: r.sla_due_at ? new Date(r.sla_due_at).toISOString() : null,
    paused: r.sla_paused_at !== null,
    test: r.test,
  }));
}

export interface ThreadMessage {
  id: number;
  from: "patient" | "doctor";
  body: string;
  at: string;
}

export interface DoctorCaseView {
  id: string;
  condition: string;
  status: CaseStatus;
  mine: boolean;
  test: boolean;
  slaDueAt: string | null;
  patientName: string | null;
  answers: { question: string; answer: string }[];
  photos: { id: string; slot: string }[];
  proposal: { planId: PlanId; billing: string; firstAmount: number; recurringAmount: number } | null;
  plan: PlanDefinition | null;
  alternatives: PlanDefinition[];
  messages: ThreadMessage[];
}

const answerText = (q: Question | undefined, v: string[]) =>
  !q || q.type === "text"
    ? v.join(", ")
    : v.map((x) => q.options.find((o) => o.value === x)?.label ?? x).join(", ");

export async function readMessages(q: Executor, caseId: string): Promise<ThreadMessage[]> {
  const rows = await q.query<{
    id: number;
    sender_role: "patient" | "doctor";
    body: string;
    created_at: Date;
  }>(
    "select id, sender_role, body, created_at from clinical.messages where case_id = $1 order by created_at, id",
    [caseId],
  );
  if (rows.length) await q.query("select clinical.audit('read', 'messages', $1)", [caseId]);
  return rows.map((r) => ({
    id: Number(r.id),
    from: r.sender_role,
    body: r.body,
    at: new Date(r.created_at).toISOString(),
  }));
}

export async function doctorCase(session: Session, caseId: string): Promise<DoctorCaseView | null> {
  return asUser(actor(session), async (q) => {
    const [k] = await q.query<{
      id: string;
      condition: string;
      status: CaseStatus;
      assigned_doctor_id: string | null;
      test: boolean;
      sla_due_at: Date | null;
      patient_id: string;
    }>(
      "select id, condition, status, assigned_doctor_id, test, sla_due_at, patient_id from clinical.cases where id = $1",
      [caseId],
    );
    if (!k) return null;
    const def = getEvaluation(k.condition);
    const rows = await q.query<{ question_id: string; answer: string[] }>(
      "select question_id, answer from clinical.answers where case_id = $1",
      [caseId],
    );
    await q.query("select clinical.audit('read', 'answers', $1)", [caseId]);
    const order = def?.questions.map((x) => x.id) ?? [];
    rows.sort((a, b) => order.indexOf(a.question_id) - order.indexOf(b.question_id));
    const photos = await q.query<{ id: string; slot: string }>(
      "select id, slot from clinical.photos where case_id = $1 order by created_at",
      [caseId],
    );
    const [p] = await q.query<{
      plan_id: PlanId;
      billing: string;
      first_amount: number;
      recurring_amount: number;
    }>(
      `select plan_id, billing, first_amount, recurring_amount from clinical.proposals
       where case_id = $1 order by created_at desc limit 1`,
      [caseId],
    );
    const [patient] = await q.query<{ full_name: string | null }>(
      "select full_name from clinical.patients where id = $1",
      [k.patient_id],
    );
    return {
      id: k.id,
      condition: k.condition,
      status: k.status,
      mine: k.assigned_doctor_id === session.userId,
      test: k.test,
      slaDueAt: k.sla_due_at ? new Date(k.sla_due_at).toISOString() : null,
      patientName: patient?.full_name ?? null,
      answers: rows.map((r) => {
        const question = def?.questions.find((x) => x.id === r.question_id);
        return { question: question?.title ?? r.question_id, answer: answerText(question, r.answer) };
      }),
      photos,
      proposal: p
        ? {
            planId: p.plan_id,
            billing: p.billing,
            firstAmount: p.first_amount,
            recurringAmount: p.recurring_amount,
          }
        : null,
      plan: p ? PLANS[p.plan_id] : null,
      alternatives: Object.values(PLANS).filter((x) => x.condition === k.condition && x.id !== p?.plan_id),
      messages: await readMessages(q, caseId),
    };
  });
}

/** The doctor takes a case from the queue; the patient learns who their doctor is. */
export async function takeCase(session: Session, caseId: string): Promise<void> {
  const [row] = await asUser(actor(session), (q) =>
    q.query<{ patient_id: string }>(
      `update clinical.cases set assigned_doctor_id = auth.uid(), status = 'in_review'
       where id = $1 and status = 'submitted' and assigned_doctor_id is null returning patient_id`,
      [caseId],
    ),
  );
  if (!row) throw new IntakeError("locked");
  await asService((q) => enqueue(q, row.patient_id, "doctor_assigned", caseId));
}

async function myOpenCase(q: Executor, session: Session, caseId: string, statuses: CaseStatus[]) {
  const [k] = await q.query<{
    id: string;
    condition: string;
    status: CaseStatus;
    patient_id: string;
    assigned_doctor_id: string | null;
  }>("select id, condition, status, patient_id, assigned_doctor_id from clinical.cases where id = $1", [
    caseId,
  ]);
  if (!k) throw new IntakeError("not_found");
  if (k.assigned_doctor_id !== session.userId || !statuses.includes(k.status))
    throw new IntakeError("locked");
  return k;
}

function prescriptionItems(plan: PlanDefinition, instructions: unknown): PrescriptionItem[] {
  const given =
    instructions && typeof instructions === "object" ? (instructions as Record<string, unknown>) : {};
  const items = plan.items.map((i) => ({ name: i.name, instructions: String(given[i.name] ?? "").trim() }));
  if (items.some((i) => i.instructions.length < 3)) throw new IntakeError("invalid");
  return prescriptionAdapter().build(items);
}

async function recordReview(caseId: string, doctorId: string) {
  await asService((q) =>
    q.query(
      "insert into clinical.doctor_ledger (doctor_id, case_id, kind) values ($1, $2, 'review') on conflict do nothing",
      [doctorId, caseId],
    ),
  );
}

/** Captures the authorised amount; returns false when the card hold can no longer be captured. */
export async function captureFor(caseId: string, amount: number): Promise<boolean> {
  const [pay] = await asService((q) =>
    q.query<{ id: string; intent_id: string | null; provider: string }>(
      "select id, intent_id, provider from clinical.payments where case_id = $1 and status = 'authorized' order by created_at desc limit 1",
      [caseId],
    ),
  );
  const provider = paymentProvider();
  if (!pay?.intent_id || !provider || provider.kind !== pay.provider) return false;
  try {
    await provider.capture(pay.intent_id, amount);
  } catch {
    logEvent("payment.error", { case: caseId, payment: pay.id });
    return false;
  }
  await asService((q) =>
    q.query(
      "update clinical.payments set status = 'captured', captured_at = now(), amount = $2 where id = $1",
      [pay.id, amount],
    ),
  );
  logEvent("payment.captured", { case: caseId, payment: pay.id });
  return true;
}

/** Releases the card hold in full (no prescription, expiry, or the patient said no). */
export async function releaseFor(caseId: string): Promise<void> {
  const pays = await asService((q) =>
    q.query<{ id: string; intent_id: string | null; provider: string }>(
      "update clinical.payments set status = 'canceled', canceled_at = now() where case_id = $1 and status in ('authorized', 'pending') returning id, intent_id, provider",
      [caseId],
    ),
  );
  const provider = paymentProvider();
  for (const p of pays)
    if (p.intent_id && provider?.kind === p.provider)
      await provider
        .cancel(p.intent_id)
        .catch(() => logEvent("payment.error", { case: caseId, payment: p.id }));
  if (pays.length) logEvent("payment.canceled", { case: caseId });
}

/** After approval: order for the pharmacy, the pay ledger and the patient's e-mail. */
export async function afterApproval(
  caseId: string,
  patientId: string,
  prescriptionId: string,
  doctorId: string,
) {
  await asService(async (q) => {
    await q.query("insert into clinical.orders (case_id, prescription_id) values ($1, $2)", [
      caseId,
      prescriptionId,
    ]);
    await enqueue(q, patientId, "plan_approved", caseId);
  });
  await recordReview(caseId, doctorId);
  await fulfil(caseId);
  await startPlan(caseId);
  logEvent("case.decided", { case: caseId });
}

export async function approve(
  session: Session,
  input: { caseId: string; instructions: unknown },
): Promise<void> {
  const { k, p } = await asUser(actor(session), async (q) => {
    const k = await myOpenCase(q, session, input.caseId, ["in_review"]);
    const [p] = await q.query<{ id: string; plan_id: PlanId; first_amount: number }>(
      `select id, plan_id, first_amount from clinical.proposals
       where case_id = $1 and accepted_at is not null order by created_at desc limit 1`,
      [input.caseId],
    );
    if (!p) throw new IntakeError("invalid");
    return { k, p };
  });
  const items = prescriptionItems(PLANS[p.plan_id], input.instructions);
  if (!(await captureFor(input.caseId, p.first_amount))) throw new IntakeError("closed");
  const rx = await asUser(actor(session), async (q) => {
    const [rx] = await q.query<{ id: string }>(
      "insert into clinical.prescriptions (case_id, doctor_id, items, adapter) values ($1, auth.uid(), $2::jsonb, $3) returning id",
      [input.caseId, JSON.stringify(items), prescriptionAdapter().kind],
    );
    await q.query(
      "update clinical.cases set status = 'approved', decided_at = now(), approved_proposal_id = $2 where id = $1",
      [input.caseId, p.id],
    );
    return rx;
  });
  await afterApproval(input.caseId, k.patient_id, rx.id, session.userId);
}

/** A different plan: the patient must accept it before anything is charged. */
export async function adjust(
  session: Session,
  input: { caseId: string; planId: unknown; instructions: unknown; message: unknown },
): Promise<void> {
  const plan = PLANS[input.planId as PlanId];
  const message = String(input.message ?? "").trim();
  if (!plan || message.length < 10 || message.length > 4000) throw new IntakeError("invalid");
  const items = prescriptionItems(plan, input.instructions);
  const k = await asUser(actor(session), async (q) => {
    const k = await myOpenCase(q, session, input.caseId, ["in_review"]);
    if (plan.condition !== k.condition) throw new IntakeError("invalid");
    const [cur] = await q.query<{ billing: string; first_amount: number; recurring_amount: number }>(
      "select billing, first_amount, recurring_amount from clinical.proposals where case_id = $1 and accepted_at is not null order by created_at desc limit 1",
      [input.caseId],
    );
    if (!cur) throw new IntakeError("invalid");
    await q.query(
      `insert into clinical.proposals (case_id, plan_id, billing, first_amount, recurring_amount, source, created_by, instructions)
       values ($1, $2, $3, $4, $5, 'doctor', auth.uid(), $6::jsonb)`,
      [input.caseId, plan.id, cur.billing, cur.first_amount, cur.recurring_amount, JSON.stringify(items)],
    );
    await q.query(
      "insert into clinical.messages (case_id, sender_id, sender_role, body) values ($1, auth.uid(), 'doctor', $2)",
      [input.caseId, message],
    );
    await q.query("update clinical.cases set status = 'adjusted' where id = $1", [input.caseId]);
    return k;
  });
  await asService((q) => enqueue(q, k.patient_id, "plan_adjusted", input.caseId));
  await recordReview(input.caseId, session.userId);
}

export async function decline(
  session: Session,
  input: { caseId: string; reason: unknown; message: unknown },
): Promise<void> {
  const reason = input.reason as DeclineReason;
  const message = String(input.message ?? "").trim();
  if (!(reason in DECLINE_REASONS) || message.length < 10 || message.length > 4000)
    throw new IntakeError("invalid");
  const k = await asUser(actor(session), async (q) => {
    const k = await myOpenCase(q, session, input.caseId, ["in_review", "waiting_patient"]);
    await q.query(
      "insert into clinical.messages (case_id, sender_id, sender_role, body) values ($1, auth.uid(), 'doctor', $2)",
      [input.caseId, message],
    );
    await q.query(
      "update clinical.cases set status = 'declined', decision_reason = $2, decided_at = now(), sla_paused_at = null where id = $1",
      [input.caseId, reason],
    );
    return k;
  });
  await releaseFor(input.caseId);
  await asService((q) => enqueue(q, k.patient_id, "plan_declined", input.caseId));
  await recordReview(input.caseId, session.userId);
  logEvent("case.decided", { case: input.caseId });
}

/** A question for the patient: the SLA clock stops until they answer. */
export async function askPatient(
  session: Session,
  input: { caseId: string; message: unknown },
): Promise<void> {
  const message = String(input.message ?? "").trim();
  if (message.length < 3 || message.length > 4000) throw new IntakeError("invalid");
  const k = await asUser(actor(session), async (q) => {
    const k = await myOpenCase(q, session, input.caseId, ["in_review"]);
    await q.query(
      "insert into clinical.messages (case_id, sender_id, sender_role, body) values ($1, auth.uid(), 'doctor', $2)",
      [input.caseId, message],
    );
    await q.query(
      "update clinical.cases set status = 'waiting_patient', sla_paused_at = now() where id = $1",
      [input.caseId],
    );
    return k;
  });
  await asService((q) => enqueue(q, k.patient_id, "doctor_message", input.caseId));
}

/** Free follow-up messages on the doctor's own cases, before or after the decision. */
export async function doctorMessage(
  session: Session,
  input: { caseId: string; message: unknown },
): Promise<void> {
  const message = String(input.message ?? "").trim();
  if (message.length < 1 || message.length > 4000) throw new IntakeError("invalid");
  const k = await asUser(actor(session), async (q) => {
    const k = await myOpenCase(q, session, input.caseId, [
      "in_review",
      "waiting_patient",
      "adjusted",
      "approved",
      "declined",
    ]);
    await q.query(
      "insert into clinical.messages (case_id, sender_id, sender_role, body) values ($1, auth.uid(), 'doctor', $2)",
      [input.caseId, message],
    );
    return k;
  });
  await asService((q) => enqueue(q, k.patient_id, "doctor_message", input.caseId));
}
