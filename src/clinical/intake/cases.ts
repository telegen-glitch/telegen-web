import "server-only";
import { getEvaluation } from "@/content/evaluations";
import type { Answers } from "@/content/evaluations/types";
import { cleanAnswer, validateAnswers } from "@/lib/evaluation";
import { CONSENT_KINDS, CONSENT_VERSION } from "../config/consents";
import { photoSlotsFor, type PhotoSlot } from "../config/conditions";
import { asUser, type Executor } from "../db";
import { logEvent } from "../log";
import type { Session } from "../auth";

/**
 * Intake (CLAUDE.md v5 P1). Every query runs as the signed-in patient, so Row
 * Level Security decides what exists; the server re-validates every answer
 * against the question set and refuses anything a hard stop has ended.
 */

export type CaseStatus =
  | "draft"
  | "stopped"
  | "awaiting_payment"
  | "submitted"
  | "in_review"
  | "waiting_patient"
  | "adjusted"
  | "approved"
  | "declined"
  | "expired"
  | "canceled";

export class IntakeError extends Error {
  constructor(public code: "not_found" | "invalid" | "closed" | "consent" | "locked") {
    super(code);
  }
}

const actor = (s: Session) => ({ id: s.userId, aal: s.aal });

/** Every consent of the current version accepted, and none withdrawn since. */
export async function consentsCurrent(session: Session): Promise<boolean> {
  const rows = await asUser(actor(session), (q) =>
    q.query<{ kind: string; action: string }>(
      `select distinct on (kind) kind, action from clinical.consents
       where patient_id = auth.uid() and version = $1 order by kind, at desc, id desc`,
      [CONSENT_VERSION],
    ),
  );
  return CONSENT_KINDS.every((k) => rows.some((r) => r.kind === k && r.action === "accepted"));
}

/** Records each consent separately, with its version; the database adds the timestamp. */
export async function recordConsents(session: Session, kinds: unknown): Promise<void> {
  const given = Array.isArray(kinds) ? kinds : [];
  if (!CONSENT_KINDS.every((k) => given.includes(k))) throw new IntakeError("consent");
  await asUser(actor(session), async (q) => {
    for (const kind of CONSENT_KINDS)
      await q.query("insert into clinical.consents (patient_id, kind, version) values (auth.uid(), $1, $2)", [
        kind,
        CONSENT_VERSION,
      ]);
  });
}

async function writeAnswers(q: Executor, caseId: string, answers: Answers) {
  await q.query("delete from clinical.answers where case_id = $1 and not (question_id = any($2::text[]))", [
    caseId,
    Object.keys(answers),
  ]);
  for (const [questionId, value] of Object.entries(answers))
    await q.query(
      `insert into clinical.answers (case_id, question_id, answer) values ($1, $2, $3::jsonb)
       on conflict (case_id, question_id) do update set answer = excluded.answer, updated_at = now()`,
      [caseId, questionId, JSON.stringify(value)],
    );
}

export interface SaveResult {
  caseId: string;
  stopId: string | null;
  complete: boolean;
}

/**
 * Opens a case (or reuses the patient's open draft for the same condition) and
 * stores the answers given so far. A hard stop marks the case "stopped".
 */
export async function startCase(
  session: Session,
  input: { topic: string; answers: unknown; test: boolean; allowedTopics: string[] },
): Promise<SaveResult> {
  const def = getEvaluation(input.topic);
  if (!def || !input.allowedTopics.includes(input.topic)) throw new IntakeError("invalid");
  const v = validateAnswers(def, input.answers);
  if (v.invalid.length) throw new IntakeError("invalid");
  return asUser(actor(session), async (q) => {
    const open = await q.query<{ id: string }>(
      `select id from clinical.cases where patient_id = auth.uid() and condition = $1 and status = 'draft'
       order by created_at desc limit 1`,
      [def.topic],
    );
    let caseId = open[0]?.id;
    if (caseId) {
      await q.query(
        "update clinical.cases set questionnaire_version = $2, updated_at = now() where id = $1",
        [caseId, def.version],
      );
    } else {
      const [row] = await q.query<{ id: string }>(
        `insert into clinical.cases (patient_id, condition, questionnaire_version, test)
         values (auth.uid(), $1, $2, $3) returning id`,
        [def.topic, def.version, input.test],
      );
      caseId = row.id;
      logEvent("case.created", { case: caseId });
    }
    await writeAnswers(q, caseId, v.answers);
    if (v.stop) {
      await q.query("update clinical.cases set status = 'stopped' where id = $1", [caseId]);
      logEvent("case.stopped", { case: caseId });
    }
    return { caseId, stopId: v.stop?.id ?? null, complete: v.complete };
  });
}

/** Autosave of one answer on a draft. Answers hidden by the change are removed. */
export async function saveAnswer(
  session: Session,
  input: { caseId: unknown; questionId: unknown; value: unknown },
): Promise<SaveResult> {
  if (typeof input.caseId !== "string" || typeof input.questionId !== "string")
    throw new IntakeError("invalid");
  const caseId = input.caseId;
  const questionId = input.questionId;
  return asUser(actor(session), async (q) => {
    const [kase] = await q.query<{ condition: string; status: CaseStatus }>(
      "select condition, status from clinical.cases where id = $1",
      [caseId],
    );
    if (!kase) throw new IntakeError("not_found");
    if (kase.status !== "draft") throw new IntakeError("locked");
    const def = getEvaluation(kase.condition);
    const question = def?.questions.find((x) => x.id === questionId);
    if (!def || !question || !cleanAnswer(question, input.value)) throw new IntakeError("invalid");
    const current = await q.query<{ question_id: string; answer: string[] }>(
      "select question_id, answer from clinical.answers where case_id = $1",
      [caseId],
    );
    const merged: Answers = Object.fromEntries(current.map((r) => [r.question_id, r.answer]));
    merged[questionId] = input.value as string[];
    const v = validateAnswers(def, merged);
    if (v.invalid.includes(questionId)) throw new IntakeError("invalid");
    await writeAnswers(q, caseId, v.answers);
    if (v.stop) {
      await q.query("update clinical.cases set status = 'stopped' where id = $1", [caseId]);
      logEvent("case.stopped", { case: caseId });
    }
    return { caseId, stopId: v.stop?.id ?? null, complete: v.complete };
  });
}

export interface Draft {
  caseId: string;
  condition: string;
  answers: Answers;
  photos: { id: string; slot: PhotoSlot }[];
}

/** The patient's most recent open draft, for resuming without anything in the URL. */
export async function latestDraft(session: Session, allowedTopics: string[]): Promise<Draft | null> {
  return asUser(actor(session), async (q) => {
    const [kase] = await q.query<{ id: string; condition: string }>(
      `select id, condition from clinical.cases
       where patient_id = auth.uid() and status = 'draft' and condition = any($1::text[])
       order by updated_at desc limit 1`,
      [allowedTopics],
    );
    if (!kase) return null;
    const rows = await q.query<{ question_id: string; answer: string[] }>(
      "select question_id, answer from clinical.answers where case_id = $1",
      [kase.id],
    );
    const photos = await q.query<{ id: string; slot: PhotoSlot }>(
      "select id, slot from clinical.photos where case_id = $1",
      [kase.id],
    );
    await q.query("select clinical.audit('read', 'answers', $1)", [kase.id]);
    const def = getEvaluation(kase.condition);
    const answers = def
      ? validateAnswers(def, Object.fromEntries(rows.map((r) => [r.question_id, r.answer]))).answers
      : {};
    const slots = photoSlotsFor(kase.condition);
    return {
      caseId: kase.id,
      condition: kase.condition,
      answers,
      photos: photos.filter((p) => slots.includes(p.slot)),
    };
  });
}

export interface CaseListItem {
  id: string;
  condition: string;
  status: CaseStatus;
  createdAt: string;
  test: boolean;
}

export async function listCases(session: Session): Promise<CaseListItem[]> {
  const rows = await asUser(actor(session), (q) =>
    q.query<{ id: string; condition: string; status: CaseStatus; created_at: Date | string; test: boolean }>(
      "select id, condition, status, created_at, test from clinical.cases where patient_id = auth.uid() order by created_at desc",
    ),
  );
  return rows.map((r) => ({
    id: r.id,
    condition: r.condition,
    status: r.status,
    createdAt: new Date(r.created_at).toISOString(),
    test: r.test,
  }));
}
