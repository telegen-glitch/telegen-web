import { beforeAll, describe, expect, it } from "vitest";
import { createDoctor, ledgerCsv, overview } from "@/clinical/admin/ops";
import { CONSENT_KINDS } from "@/clinical/config/consents";
import { asService, setDriverForTests } from "@/clinical/db";
import { createPglite, pgliteDriver } from "@/clinical/db/pglite";
import {
  adjust,
  approve,
  askPatient,
  decline,
  doctorCase,
  doctorQueue,
  takeCase,
} from "@/clinical/doctor/workflow";
import { ensureAccount } from "@/clinical/intake/account";
import { recordConsents, startCase } from "@/clinical/intake/cases";
import { savePhoto } from "@/clinical/intake/photos";
import { fakeAuthorize, saveDelivery, startCheckout } from "@/clinical/intake/proposal";
import { tick } from "@/clinical/jobs/tick";
import { acceptAdjustment, patientCase, patientMessage, refuseAdjustment } from "@/clinical/patient/case";
import type { Session } from "@/clinical/auth";

/** The doctor's workflow, the SLA job and admin operations (CLAUDE.md v5 P3), on the real migrations. */

const uid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const derm: Session = { userId: uid(501), email: "derm@t.test", aal: "aal2" };
const uro: Session = { userId: uid(502), email: "uro@t.test", aal: "aal2" };
const admin: Session = { userId: uid(503), email: "admin@t.test", aal: "aal2" };
const jpeg = () =>
  new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0xff, 0xda, 0, 8, 1,
    1, 0, 0, 0x3f, 0, 0xff, 0xd9,
  ]);
const answers = {
  sex: ["m"],
  age: ["25-34"],
  duration: ["1-3y"],
  areas: ["crown"],
  onset: ["gradual"],
  scalp: ["none"],
  family: ["yes"],
  tried: ["no"],
  health: ["no"],
  mood: ["no"],
  goal: ["stop"],
};
const instructions = {
  "Finasteridă 1 mg, comprimate": "1 comprimat pe zi, 3 luni",
  "Minoxidil, soluție pentru scalp": "5%, 1 ml de două ori pe zi",
};

let n = 600;
/** A patient whose hair-loss case is authorised and waiting in the queue. */
async function submittedCase() {
  n += 1;
  const s: Session = { userId: uid(n), email: `p${n}@t.test`, aal: "aal1" };
  await asService((q) => q.query("insert into auth.users (id, email) values ($1, $2)", [s.userId, s.email]));
  await ensureAccount(s);
  await recordConsents(s, CONSENT_KINDS);
  const { caseId } = await startCase(s, {
    topic: "caderea-parului",
    answers,
    test: true,
    allowedTopics: ["caderea-parului"],
  });
  for (const slot of ["front", "top", "crown"]) await savePhoto(s, { caseId, slot, bytes: jpeg() });
  await saveDelivery(s, {
    fullName: "Pacient Test",
    phone: "0712345678",
    addressLine: "Str. A 1",
    city: "Iași",
    county: "Iași",
    postalCode: "700001",
  });
  const { paymentId } = await startCheckout(s, {
    caseId,
    planId: "hair-fin-min",
    billing: "monthly",
    returnUrl: "http://x/cont",
  });
  expect(await fakeAuthorize(s, paymentId)).toBe("submitted");
  return { s, caseId };
}

const one = async <T>(sql: string, p: unknown[]) => (await asService((q) => q.query<T>(sql, p)))[0];

beforeAll(async () => {
  setDriverForTests(pgliteDriver(await createPglite()));
  await asService(async (q) => {
    for (const [s, role] of [
      [derm, "doctor"],
      [uro, "doctor"],
      [admin, "admin"],
    ] as const) {
      await q.query("insert into auth.users (id, email) values ($1, $2)", [s.userId, s.email]);
      await q.query("insert into clinical.profiles (id, role, email) values ($1, $2, $3)", [
        s.userId,
        role,
        s.email,
      ]);
    }
    await q.query(
      "insert into clinical.doctors (id, full_name, specialty, parafa_code) values ($1, 'Medic TEST D', 'dermatologie', 'P100'), ($2, 'Medic TEST U', 'urologie', 'P200')",
      [derm.userId, uro.userId],
    );
  });
});

describe("queue and taking a case", () => {
  it("the dermatologist sees the hair-loss case, the urologist does not; without 2FA nobody does", async () => {
    const { caseId } = await submittedCase();
    expect((await doctorQueue(derm)).map((c) => c.id)).toContain(caseId);
    expect((await doctorQueue(uro)).map((c) => c.id)).not.toContain(caseId);
    expect(await doctorQueue({ ...derm, aal: "aal1" })).toEqual([]);
  });

  it("taking a case tells the patient who their doctor is", async () => {
    const { s, caseId } = await submittedCase();
    expect((await patientCase(s, caseId))?.doctor).toBeNull();
    await takeCase(derm, caseId);
    await expect(takeCase(uro, caseId)).rejects.toThrow();
    expect((await patientCase(s, caseId))?.doctor).toEqual({
      name: "Medic TEST D",
      specialty: "dermatologie",
      parafa: "P100",
    });
    expect(
      await one("select template from clinical.outbox where ref_id = $1 and template = 'doctor_assigned'", [
        caseId,
      ]),
    ).toBeTruthy();
    const view = await doctorCase(derm, caseId);
    expect(view?.answers.length).toBeGreaterThan(5);
    expect(view?.photos).toHaveLength(3);
  });
});

describe("decisions", () => {
  it("approve: needs the doctor's instructions, then captures, prescribes, orders, pays the doctor, tells the patient", async () => {
    const { caseId } = await submittedCase();
    await takeCase(derm, caseId);
    await expect(approve(derm, { caseId, instructions: {} })).rejects.toMatchObject({ code: "invalid" });
    await approve(derm, { caseId, instructions });
    expect(await one("select status from clinical.cases where id = $1", [caseId])).toEqual({
      status: "approved",
    });
    expect(
      await one("select status, amount from clinical.payments where case_id = $1 and status = 'captured'", [
        caseId,
      ]),
    ).toBeTruthy();
    const rx = await one<{ items: { name: string; instructions: string }[]; doctor_id: string }>(
      "select items, doctor_id from clinical.prescriptions where case_id = $1",
      [caseId],
    );
    expect(rx.doctor_id).toBe(derm.userId);
    expect(rx.items.map((i) => i.instructions)).toEqual(Object.values(instructions));
    expect(await one("select status from clinical.orders where case_id = $1", [caseId])).toEqual({
      status: "pending",
    });
    expect(await one("select fee from clinical.doctor_ledger where case_id = $1", [caseId])).toEqual({
      fee: null,
    });
    expect(
      await one("select 1 as ok from clinical.outbox where ref_id = $1 and template = 'plan_approved'", [
        caseId,
      ]),
    ).toBeTruthy();
  });

  it("decline: releases the card hold in full, records why, pays the doctor the same", async () => {
    const { s, caseId } = await submittedCase();
    await takeCase(derm, caseId);
    await decline(derm, {
      caseId,
      reason: "needs_in_person",
      message: "Te rog să mergi la un dermatolog în persoană.",
    });
    expect(await one("select status, decision_reason from clinical.cases where id = $1", [caseId])).toEqual({
      status: "declined",
      decision_reason: "needs_in_person",
    });
    expect(
      await one("select status from clinical.payments where case_id = $1 order by created_at desc", [caseId]),
    ).toEqual({
      status: "canceled",
    });
    expect(
      await one("select count(*)::int as n from clinical.doctor_ledger where case_id = $1", [caseId]),
    ).toEqual({ n: 1 });
    const view = await patientCase(s, caseId);
    expect(view?.declineReason).toMatch(/consult în persoană/);
    expect(view?.messages.at(-1)?.body).toMatch(/dermatolog/);
  });

  it("ask: the SLA stops while the patient answers, then resumes where it stopped", async () => {
    const { s, caseId } = await submittedCase();
    await takeCase(derm, caseId);
    const before = await one<{ sla_due_at: Date }>("select sla_due_at from clinical.cases where id = $1", [
      caseId,
    ]);
    await askPatient(derm, { caseId, message: "Ai observat căderea și pe sprâncene?" });
    await asService((q) =>
      q.query("update clinical.cases set sla_paused_at = sla_paused_at - interval '3 hours' where id = $1", [
        caseId,
      ]),
    );
    await patientMessage(s, { caseId, message: "Nu, doar pe creștet." });
    const after = await one<{ status: string; sla_due_at: Date; sla_paused_at: Date | null }>(
      "select status, sla_due_at, sla_paused_at from clinical.cases where id = $1",
      [caseId],
    );
    expect(after.status).toBe("in_review");
    expect(after.sla_paused_at).toBeNull();
    const shift = (new Date(after.sla_due_at).getTime() - new Date(before.sla_due_at).getTime()) / 3_600_000;
    expect(shift).toBeGreaterThan(2.9);
    expect(
      await one("select 1 as ok from clinical.outbox where ref_id = $1 and template = 'patient_replied'", [
        caseId,
      ]),
    ).toBeTruthy();
  });

  it("adjust: nothing is charged until the patient accepts; refusing releases the hold", async () => {
    const a = await submittedCase();
    await takeCase(derm, a.caseId);
    await adjust(derm, {
      caseId: a.caseId,
      planId: "hair-min",
      instructions: { "Minoxidil, soluție pentru scalp": "5%, de două ori pe zi" },
      message: "Prefer să începem doar cu minoxidil.",
    });
    expect((await patientCase(a.s, a.caseId))?.adjustedPlan?.id).toBe("hair-min");
    expect(
      await one("select status from clinical.payments where case_id = $1 and status = 'authorized'", [
        a.caseId,
      ]),
    ).toBeTruthy();
    await acceptAdjustment(a.s, a.caseId);
    expect(await one("select status from clinical.cases where id = $1", [a.caseId])).toEqual({
      status: "approved",
    });
    expect(await one("select doctor_id from clinical.prescriptions where case_id = $1", [a.caseId])).toEqual({
      doctor_id: derm.userId,
    });

    const b = await submittedCase();
    await takeCase(derm, b.caseId);
    await adjust(derm, {
      caseId: b.caseId,
      planId: "hair-min",
      instructions: { "Minoxidil, soluție pentru scalp": "5%, seara" },
      message: "Prefer să începem doar cu minoxidil.",
    });
    await refuseAdjustment(b.s, b.caseId);
    expect(await one("select status from clinical.cases where id = $1", [b.caseId])).toEqual({
      status: "canceled",
    });
    expect(
      await one("select status from clinical.payments where case_id = $1 order by created_at desc", [
        b.caseId,
      ]),
    ).toEqual({
      status: "canceled",
    });
  });
});

describe("scheduled job", () => {
  it("reminds at 12 h and 20 h, escalates at 24 h, each once; warns before a hold lapses; expires after", async () => {
    const { caseId } = await submittedCase();
    const at = (h: number) => new Date(Date.now() + h * 3_600_000);
    await tick(at(1));
    expect(
      await one("select count(*)::int as n from clinical.sla_events where case_id = $1", [caseId]),
    ).toEqual({ n: 0 });
    await tick(at(12.5));
    await tick(at(12.6));
    await tick(at(20.5));
    await tick(at(24.5));
    const events = await asService((q) =>
      q.query<{ kind: string }>("select kind from clinical.sla_events where case_id = $1 order by kind", [
        caseId,
      ]),
    );
    expect(events.map((e) => e.kind)).toEqual(["escalated_24h", "reminder_12h", "reminder_20h"]);
    const reminders = await one<{ n: number }>(
      "select count(*)::int as n from clinical.outbox where ref_id = $1 and template = 'doctor_reminder'",
      [caseId],
    );
    expect(reminders.n).toBe(2); // one active dermatologist, two reminders
    expect(
      await one(
        "select count(*)::int as n from clinical.outbox where ref_id = $1 and template = 'admin_alert'",
        [caseId],
      ),
    ).toEqual({ n: 1 });

    await tick(at(24 * 5 + 1)); // within 2 days of the 7-day hold
    expect(
      await one(
        "select 1 as ok from clinical.sla_events where case_id = $1 and kind = 'authorization_expiring'",
        [caseId],
      ),
    ).toBeTruthy();
    await tick(at(24 * 7 + 1));
    expect(await one("select status from clinical.cases where id = $1", [caseId])).toEqual({
      status: "expired",
    });
    expect(
      await one("select status from clinical.payments where case_id = $1 order by created_at desc", [caseId]),
    ).toEqual({
      status: "canceled",
    });
    expect(
      await one("select 1 as ok from clinical.outbox where ref_id = $1 and template = 'case_expired'", [
        caseId,
      ]),
    ).toBeTruthy();
  });
});

describe("admin", () => {
  it("sees operations, creates doctors only with 2FA, exports the monthly review count", async () => {
    const o = await overview(admin);
    expect(o.counts.length).toBeGreaterThan(0);
    await expect(
      createDoctor(
        { ...admin, aal: "aal1" },
        { email: "nou@t.test", fullName: "Medic TEST Nou", specialty: "urologie", parafa: "P300" },
      ),
    ).rejects.toThrow();
    await createDoctor(admin, {
      email: "nou@t.test",
      fullName: "Medic TEST Nou",
      specialty: "urologie",
      parafa: "P300",
    });
    expect(await one("select role from clinical.profiles where email = 'nou@t.test'", [])).toEqual({
      role: "doctor",
    });
    await expect(
      createDoctor(admin, {
        email: "nou@t.test",
        fullName: "Alt Medic",
        specialty: "urologie",
        parafa: "P301",
      }),
    ).rejects.toMatchObject({ code: "locked" });
    const month = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Bucharest" }).slice(0, 7);
    const csv = await ledgerCsv(admin, month, null);
    expect(csv.split("\n")[0]).toBe("luna,medic,cod_parafa,evaluari,tarif_lei,total_lei");
    expect(csv).toMatch(/"Medic TEST D","P100","\d+","nestabilit",""/);
    expect(await ledgerCsv(admin, month, 50)).toMatch(/"Medic TEST D","P100","(\d+)","50","\d+"/);
  });
});
