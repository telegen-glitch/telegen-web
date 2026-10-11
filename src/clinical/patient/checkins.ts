import "server-only";
import type { EvaluationDefinition } from "@/content/evaluations/types";
import { validateAnswers } from "@/lib/evaluation";
import { CHECKINS, urgentCheckin, type CheckinKind } from "../config/checkins";
import { SERVICE } from "../config/service";
import { asService, asUser } from "../db";
import { enqueue } from "../email/outbox";
import { IntakeError } from "../intake/cases";
import { paymentProvider } from "../payments/provider";
import type { Session } from "../auth";

/** Follow-up check-ins (CLAUDE.md v5): the patient answers in /cont; the doctor reads and, at renewal, decides. */
const actor = (s: Session) => ({ id: s.userId, aal: s.aal });

const defFor = (kind: CheckinKind): EvaluationDefinition => ({
  topic: `checkin-${kind}`,
  version: "2026-10-11",
  name: CHECKINS[kind].title,
  label: "",
  introTitle: "",
  introAccent: "",
  questions: CHECKINS[kind].questions,
  stops: [],
  notes: [],
});

export interface CheckinView {
  id: string;
  kind: CheckinKind;
  dueAt: string;
  completedAt: string | null;
  answers: Record<string, string[]> | null;
  decision: "continue" | "stop" | null;
}

export async function caseCheckins(session: Session, caseId: string): Promise<CheckinView[]> {
  const rows = await asUser(actor(session), async (q) => {
    const r = await q.query<{
      id: string;
      kind: CheckinKind;
      due_at: Date;
      completed_at: Date | null;
      answers: Record<string, string[]> | null;
      decision: "continue" | "stop" | null;
    }>(
      "select id, kind, due_at, completed_at, answers, decision from clinical.checkins where case_id = $1 order by due_at",
      [caseId],
    );
    if (r.some((x) => x.answers)) await q.query("select clinical.audit('read', 'checkins', $1)", [caseId]);
    return r;
  });
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    dueAt: new Date(r.due_at).toISOString(),
    completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : null,
    answers: r.answers,
    decision: r.decision,
  }));
}

/** The patient answers a check-in that is due. Mood changes or worrying side effects alert the doctor. */
export async function answerCheckin(
  session: Session,
  checkinId: unknown,
  raw: unknown,
): Promise<{ urgent: boolean }> {
  if (typeof checkinId !== "string") throw new IntakeError("invalid");
  const { kind, caseId, doctor } = await asUser(actor(session), async (q) => {
    const [k] = await q.query<{
      kind: CheckinKind;
      case_id: string;
      completed_at: Date | null;
      due_at: Date;
    }>("select kind, case_id, completed_at, due_at from clinical.checkins where id = $1", [checkinId]);
    if (!k) throw new IntakeError("not_found");
    if (k.completed_at) throw new IntakeError("locked");
    const [c] = await q.query<{ assigned_doctor_id: string | null; patient_id: string }>(
      "select assigned_doctor_id, patient_id from clinical.cases where id = $1",
      [k.case_id],
    );
    if (c?.patient_id !== session.userId) throw new IntakeError("not_found");
    return { kind: k.kind, caseId: k.case_id, doctor: c.assigned_doctor_id };
  });
  const input = raw && typeof raw === "object" ? { ...(raw as Record<string, unknown>) } : {};
  if (!input.note) delete input.note;
  const v = validateAnswers(defFor(kind), input);
  const missing = v.missing.filter((m) => m !== "note");
  if (v.invalid.length || missing.length) throw new IntakeError("invalid");
  await asUser(actor(session), (q) =>
    q.query("update clinical.checkins set answers = $2::jsonb, completed_at = now() where id = $1", [
      checkinId,
      JSON.stringify(v.answers),
    ]),
  );
  if (doctor) await asService((q) => enqueue(q, doctor, "checkin_answered", caseId));
  return { urgent: urgentCheckin(v.answers) };
}

const addMonths = (d: Date, m: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x;
};

/** The doctor's renewal decision: continue (new prescription, next review in N months) or stop. */
export async function decideRenewal(
  session: Session,
  input: { caseId: string; decision: unknown; message: unknown },
): Promise<void> {
  const decision = input.decision === "continue" || input.decision === "stop" ? input.decision : null;
  const message = String(input.message ?? "").trim();
  if (!decision || (decision === "stop" && message.length < 10)) throw new IntakeError("invalid");
  const { c: sub, checkinId } = await asUser(actor(session), async (q) => {
    const [c] = await q.query<{ assigned_doctor_id: string | null; patient_id: string }>(
      "select assigned_doctor_id, patient_id from clinical.cases where id = $1",
      [input.caseId],
    );
    if (!c || c.assigned_doctor_id !== session.userId) throw new IntakeError("not_found");
    const [k] = await q.query<{ id: string }>(
      "select id from clinical.checkins where case_id = $1 and kind = 'renewal' and completed_at is not null and decision is null order by due_at desc limit 1",
      [input.caseId],
    );
    if (!k) throw new IntakeError("locked");
    await q.query("update clinical.checkins set decision = $2, reviewed_at = now() where id = $1", [
      k.id,
      decision,
    ]);
    if (message)
      await q.query(
        "insert into clinical.messages (case_id, sender_id, sender_role, body) values ($1, auth.uid(), 'doctor', $2)",
        [input.caseId, message],
      );
    if (decision === "continue") {
      const [rx] = await q.query<{ items: unknown }>(
        "select items from clinical.prescriptions where case_id = $1 order by issued_at desc limit 1",
        [input.caseId],
      );
      if (!rx) throw new IntakeError("invalid");
      await q.query(
        "insert into clinical.prescriptions (case_id, doctor_id, items) values ($1, auth.uid(), $2::jsonb)",
        [input.caseId, JSON.stringify(rx.items)],
      );
    }
    return { c, checkinId: k.id };
  });
  const [s] = await asService((q) =>
    q.query<{ id: string; provider_id: string | null; renewal_review_at: Date }>(
      "select id, provider_id, renewal_review_at from clinical.subscriptions where case_id = $1",
      [input.caseId],
    ),
  );
  const provider = paymentProvider();
  const real = s?.provider_id && !s.provider_id.startsWith("fake_") && provider?.kind === "stripe";
  if (s && decision === "continue") {
    if (real) await provider!.pauseSubscription(s.provider_id!, false);
    await asService((q) =>
      q.query(
        "update clinical.subscriptions set status = 'active', renewal_review_at = $2, updated_at = now() where id = $1",
        [s.id, addMonths(new Date(s.renewal_review_at), SERVICE.renewalReviewMonths)],
      ),
    );
  } else if (s) {
    if (real) await provider!.cancelSubscription(s.provider_id!);
    await asService((q) =>
      q.query(
        "update clinical.subscriptions set status = 'canceled', cancel_at = now(), updated_at = now() where id = $1",
        [s.id],
      ),
    );
  }
  await asService(async (q) => {
    await q.query(
      "insert into clinical.doctor_ledger (doctor_id, case_id, kind, ref) values ($1, $2, 'renewal_review', $3) on conflict do nothing",
      [session.userId, input.caseId, checkinId],
    );
    await enqueue(q, sub.patient_id, "doctor_message", input.caseId);
  });
}
