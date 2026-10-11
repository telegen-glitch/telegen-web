import { beforeAll, describe, expect, it } from "vitest";
import { evaluations, getEvaluation } from "@/content/evaluations";
import { CONSENT_KINDS } from "@/clinical/config/consents";
import { createPglite, pgliteDriver } from "@/clinical/db/pglite";
import { asService, setDriverForTests } from "@/clinical/db";
import { ensureAccount } from "@/clinical/intake/account";
import {
  consentsCurrent,
  IntakeError,
  latestDraft,
  recordConsents,
  saveAnswer,
  startCase,
} from "@/clinical/intake/cases";
import { stripJpegMetadata } from "@/clinical/intake/jpeg";
import { savePhoto } from "@/clinical/intake/photos";
import { validateAnswers } from "@/lib/evaluation";
import type { Session } from "@/clinical/auth";

/** Intake (CLAUDE.md v5 P1) on the real migrations in PGlite, as the signed-in patient. */

const hair = getEvaluation("caderea-parului")!;
const ok = {
  sex: ["m"],
  age: ["25-34"],
  duration: ["1-3y"],
  areas: ["temples", "crown"],
  onset: ["gradual"],
  scalp: ["none"],
  family: ["yes"],
  tried: ["no"],
  health: ["no"],
  mood: ["no"],
  goal: ["stop"],
};
const allowed = ["caderea-parului"];

const patient = (n: string): Session => ({
  userId: `00000000-0000-4000-8000-${n.padStart(12, "0")}`,
  email: `p${n}@exemplu.test`,
  aal: "aal1",
});
const A = patient("a1");
const B = patient("b1");

async function signUp(s: Session) {
  await asService((q) => q.query("insert into auth.users (id, email) values ($1, $2)", [s.userId, s.email]));
  return ensureAccount(s);
}

beforeAll(async () => {
  setDriverForTests(pgliteDriver(await createPglite()));
  expect(await signUp(A)).toBe("patient");
  expect(await signUp(B)).toBe("patient");
});

describe("server-side validation of answers", () => {
  it("accepts a complete, valid evaluation", () => {
    const v = validateAnswers(hair, ok);
    expect(v).toMatchObject({ complete: true, invalid: [], missing: [], stop: undefined });
  });

  it("drops answers to hidden or unknown questions and flags invalid ones", () => {
    const v = validateAnswers(hair, { ...ok, "health-details": ["ascuns"], extra: ["x"], onset: ["nope"] });
    expect(v.answers["health-details"]).toBeUndefined();
    expect(v.answers.extra).toBeUndefined();
    expect(v.invalid).toEqual(["onset"]);
    expect(v.complete).toBe(false);
  });

  it("enforces single, exclusive and free-text rules", () => {
    expect(validateAnswers(hair, { ...ok, sex: ["m", "f"] }).invalid).toEqual(["sex"]);
    expect(validateAnswers(hair, { ...ok, scalp: ["none", "itch"] }).invalid).toEqual(["scalp"]);
    const details = { ...ok, health: ["yes"] };
    expect(validateAnswers(hair, details).missing).toEqual(["health-details"]);
    expect(validateAnswers(hair, { ...details, "health-details": ["   "] }).invalid).toEqual([
      "health-details",
    ]);
    expect(validateAnswers(hair, { ...details, "health-details": ["x".repeat(1001)] }).invalid).toEqual([
      "health-details",
    ]);
    expect(
      validateAnswers(hair, { ...details, "health-details": ["Tiroidă\u0000, levotiroxină"] }).answers[
        "health-details"
      ],
    ).toEqual(["Tiroidă, levotiroxină"]);
  });

  it("finds every hard stop of every question set, whatever else the request claims", () => {
    for (const def of evaluations) {
      for (const q of def.questions.filter((x) => x.stop)) {
        for (const value of q.stop!.anyOf) {
          const answers: Record<string, string[]> = {};
          for (const other of def.questions) {
            if (other.id === q.id) break;
            if (other.type === "text") answers[other.id] = ["text"];
            else answers[other.id] = [other.options.find((o) => !other.stop?.anyOf.includes(o.value))!.value];
          }
          if (q.showIf) answers[q.showIf.question] = [q.showIf.anyOf[0]];
          answers[q.id] = [value];
          const v = validateAnswers(def, answers);
          expect(v.stop?.id, `${def.topic}/${q.id}=${value}`).toBe(q.stop!.stopId);
          expect(v.complete).toBe(false);
        }
      }
    }
  });
});

describe("consents before anything is saved", () => {
  it("nothing can be saved without the four current consents", async () => {
    expect(await consentsCurrent(A)).toBe(false);
    await expect(recordConsents(A, ["gdpr_art9", "terms"])).rejects.toThrow(IntakeError);
    await recordConsents(A, CONSENT_KINDS);
    expect(await consentsCurrent(A)).toBe(true);
    const rows = await asService((q) =>
      q.query<{ kind: string; version: string; at: Date }>(
        "select kind, version, at from clinical.consents where patient_id = $1",
        [A.userId],
      ),
    );
    expect(rows.map((r) => r.kind).sort()).toEqual([...CONSENT_KINDS].sort());
    for (const r of rows) {
      expect(r.version).toBe("2026-10-11");
      expect(r.at).toBeTruthy();
    }
  });

  it("a withdrawal counts: the patient is asked again", async () => {
    await recordConsents(B, CONSENT_KINDS);
    await asService((q) =>
      q.query(
        "insert into clinical.consents (patient_id, kind, version, action, at) values ($1, 'gdpr_art9', '2026-10-11', 'withdrawn', now() + interval '1 second')",
        [B.userId],
      ),
    );
    expect(await consentsCurrent(B)).toBe(false);
    await recordConsents(B, CONSENT_KINDS);
  });
});

describe("cases, autosave and hard stops", () => {
  it("saves a complete evaluation as a draft and resumes it, with nothing in a URL", async () => {
    const res = await startCase(A, {
      topic: "caderea-parului",
      answers: ok,
      test: true,
      allowedTopics: allowed,
    });
    expect(res).toMatchObject({ stopId: null, complete: true });
    const draft = await latestDraft(A, allowed);
    expect(draft?.caseId).toBe(res.caseId);
    expect(draft?.answers).toEqual(ok);
    const [kase] = await asService((q) =>
      q.query<{ status: string; test: boolean; questionnaire_version: string }>(
        "select status, test, questionnaire_version from clinical.cases where id = $1",
        [res.caseId],
      ),
    );
    expect(kase).toEqual({ status: "draft", test: true, questionnaire_version: hair.version });
  });

  it("autosaves one answer at a time and removes answers a change hides", async () => {
    const { caseId } = (await latestDraft(A, allowed))!;
    await saveAnswer(A, { caseId, questionId: "health", value: ["yes"] });
    let r = await saveAnswer(A, { caseId, questionId: "health-details", value: ["Hipotiroidie"] });
    expect(r.complete).toBe(true);
    expect((await latestDraft(A, allowed))!.answers["health-details"]).toEqual(["Hipotiroidie"]);
    r = await saveAnswer(A, { caseId, questionId: "health", value: ["no"] });
    expect((await latestDraft(A, allowed))!.answers["health-details"]).toBeUndefined();
    await expect(saveAnswer(A, { caseId, questionId: "sex", value: ["x"] })).rejects.toThrow(IntakeError);
  });

  it("another patient cannot read or change the case", async () => {
    const { caseId } = (await latestDraft(A, allowed))!;
    await expect(saveAnswer(B, { caseId, questionId: "goal", value: ["regrow"] })).rejects.toMatchObject({
      code: "not_found",
    });
    expect(await latestDraft(B, allowed)).toBeNull();
  });

  it("a hard stop ends the case: status stopped, no further changes", async () => {
    const { caseId } = (await latestDraft(A, allowed))!;
    const r = await saveAnswer(A, { caseId, questionId: "age", value: ["u18"] });
    expect(r.stopId).toBe("minor");
    const [kase] = await asService((q) =>
      q.query<{ status: string }>("select status from clinical.cases where id = $1", [caseId]),
    );
    expect(kase.status).toBe("stopped");
    await expect(saveAnswer(A, { caseId, questionId: "age", value: ["25-34"] })).rejects.toMatchObject({
      code: "locked",
    });
    expect(await latestDraft(A, allowed)).toBeNull();
  });

  it("only purchasable conditions can be started", async () => {
    await expect(
      startCase(A, { topic: "acnee", answers: {}, test: true, allowedTopics: allowed }),
    ).rejects.toThrow(IntakeError);
  });

  it("every write is audited without content", async () => {
    const log = await asService((q) =>
      q.query("select * from clinical.audit_log where actor_id = $1 and entity = 'answers'", [A.userId]),
    );
    expect(log.length).toBeGreaterThan(0);
    expect(JSON.stringify(log)).not.toContain("Hipotiroidie");
  });
});

/** A minimal JPEG with an EXIF (APP1) segment carrying a fake GPS tag. */
function jpegWithExif(): Uint8Array {
  const exif = Buffer.from("Exif\0\0GPS-TEST-LOCATION");
  const app1 = Buffer.concat([Buffer.from([0xff, 0xe1, 0, exif.length + 2]), exif]);
  const app0 = Buffer.from([0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);
  const sos = Buffer.from([0xff, 0xda, 0, 8, 1, 1, 0, 0, 0x3f, 0, 0x12, 0x34, 0xff, 0xd9]);
  return new Uint8Array(Buffer.concat([Buffer.from([0xff, 0xd8]), app0, app1, sos]));
}

describe("photos", () => {
  it("strips EXIF and other metadata, keeps the image data", () => {
    const out = Buffer.from(stripJpegMetadata(jpegWithExif()));
    expect(out.includes(Buffer.from("GPS-TEST"))).toBe(false);
    expect(out.includes(Buffer.from("JFIF"))).toBe(true);
    expect(out.subarray(-2)).toEqual(Buffer.from([0xff, 0xd9]));
    expect(() => stripJpegMetadata(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toThrow();
  });

  it("accepts only the slots of the condition, on the patient's own draft", async () => {
    const { caseId } = await startCase(A, {
      topic: "caderea-parului",
      answers: ok,
      test: true,
      allowedTopics: allowed,
    });
    const saved = await savePhoto(A, { caseId, slot: "front", bytes: jpegWithExif() });
    expect(saved.slot).toBe("front");
    await expect(savePhoto(A, { caseId, slot: "face", bytes: jpegWithExif() })).rejects.toMatchObject({
      code: "invalid",
    });
    await expect(savePhoto(B, { caseId, slot: "top", bytes: jpegWithExif() })).rejects.toMatchObject({
      code: "not_found",
    });
    // A new photo replaces the old one in the same slot.
    await savePhoto(A, { caseId, slot: "front", bytes: jpegWithExif() });
    const rows = await asService((q) =>
      q.query("select slot from clinical.photos where case_id = $1", [caseId]),
    );
    expect(rows).toEqual([{ slot: "front" }]);
  });

  it("erectile dysfunction never takes photos", async () => {
    const [row] = await asService((q) =>
      q.query<{ id: string }>(
        "insert into clinical.cases (patient_id, condition, questionnaire_version) values ($1, 'disfunctie-erectila', 'v') returning id",
        [A.userId],
      ),
    );
    for (const slot of ["front", "top", "crown", "face"])
      await expect(savePhoto(A, { caseId: row.id, slot, bytes: jpegWithExif() })).rejects.toMatchObject({
        code: "invalid",
      });
  });
});
