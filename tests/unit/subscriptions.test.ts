import { beforeAll, describe, expect, it } from "vitest";
import { CONSENT_KINDS } from "@/clinical/config/consents";
import { asService, setDriverForTests } from "@/clinical/db";
import { createPglite, pgliteDriver } from "@/clinical/db/pglite";
import { approve, takeCase } from "@/clinical/doctor/workflow";
import { ensureAccount } from "@/clinical/intake/account";
import { consentsCurrent, recordConsents, startCase } from "@/clinical/intake/cases";
import { savePhoto } from "@/clinical/intake/photos";
import { fakeAuthorize, saveDelivery, startCheckout } from "@/clinical/intake/proposal";
import { tick } from "@/clinical/jobs/tick";
import { answerCheckin, caseCheckins, decideRenewal } from "@/clinical/patient/checkins";
import { deleteAccount, exportData, withdrawConsent } from "@/clinical/patient/data-rights";
import { changePlan, planFor } from "@/clinical/subscriptions";
import type { Session } from "@/clinical/auth";

/** Plans after approval (CLAUDE.md v5 P5): renewals, check-ins, re-review, pause/cancel, data rights. */

const uid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const derm: Session = { userId: uid(901), email: "derm@t.test", aal: "aal2" };
const DAY = 86_400_000;
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
const one = async <T>(sql: string, p: unknown[] = []) => (await asService((q) => q.query<T>(sql, p)))[0];
const count = async (sql: string, p: unknown[] = []) => (await one<{ n: number }>(sql, p)).n;

let n = 1000;
async function patient(): Promise<Session> {
  n += 1;
  const s: Session = { userId: uid(n), email: `p${n}@t.test`, aal: "aal1" };
  await asService((q) => q.query("insert into auth.users (id, email) values ($1, $2)", [s.userId, s.email]));
  await ensureAccount(s);
  await recordConsents(s, CONSENT_KINDS);
  return s;
}
async function draftCase(s: Session) {
  const { caseId } = await startCase(s, {
    topic: "caderea-parului",
    answers,
    test: true,
    allowedTopics: ["caderea-parului"],
  });
  for (const slot of ["front", "top", "crown"]) await savePhoto(s, { caseId, slot, bytes: jpeg() });
  return caseId;
}
async function approvedCase(billing: "monthly" | "quarterly" = "monthly") {
  const s = await patient();
  const caseId = await draftCase(s);
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
    billing,
    returnUrl: "http://x",
  });
  await fakeAuthorize(s, paymentId);
  await takeCase(derm, caseId);
  await approve(derm, {
    caseId,
    instructions: {
      "Finasteridă 1 mg, comprimate": "1 pe zi",
      "Minoxidil, soluție pentru scalp": "5%, seara",
    },
  });
  return { s, caseId };
}

beforeAll(async () => {
  setDriverForTests(pgliteDriver(await createPglite()));
  await asService(async (q) => {
    await q.query("insert into auth.users (id, email) values ($1, $2)", [derm.userId, derm.email]);
    await q.query("insert into clinical.profiles (id, role, email) values ($1, 'doctor', $2)", [
      derm.userId,
      derm.email,
    ]);
    await q.query(
      "insert into clinical.doctors (id, full_name, specialty, parafa_code) values ($1, 'Medic TEST', 'dermatologie', 'P1')",
      [derm.userId],
    );
    await q.query("insert into clinical.pharmacies (name) values ('Farmacie TEST')");
  });
});

describe("the plan after approval", () => {
  it("starts from the next cycle with check-ins at month 1 and 3 and a re-review at 6 months", async () => {
    const { s, caseId } = await approvedCase();
    const plan = await planFor(s, caseId);
    expect(plan).toMatchObject({ status: "active", amount: 320, intervalMonths: 1 });
    const days = (iso: string | null) => Math.round((new Date(iso!).getTime() - Date.now()) / DAY);
    expect(days(plan!.nextChargeAt)).toBeGreaterThanOrEqual(28);
    expect(days(plan!.nextChargeAt)).toBeLessThanOrEqual(31);
    expect(days(plan!.renewalReviewAt)).toBeGreaterThanOrEqual(180);
    expect((await caseCheckins(s, caseId)).map((c) => c.kind)).toEqual(["month1", "month3"]);
    expect(
      await one("select provider_id from clinical.subscriptions where case_id = $1", [caseId]),
    ).toMatchObject({
      provider_id: expect.stringMatching(/^fake_sub_/),
    });
  });

  it("tells the patient before each payment, then charges the cycle once and sends a new order", async () => {
    const { s, caseId } = await approvedCase();
    const next = new Date((await planFor(s, caseId))!.nextChargeAt!);
    await tick(new Date(next.getTime() - 2 * DAY));
    await tick(new Date(next.getTime() - 1 * DAY));
    expect(
      await count(
        "select count(*)::int as n from clinical.outbox where ref_id = $1 and template = 'payment_upcoming'",
        [caseId],
      ),
    ).toBe(1);
    await tick(new Date(next.getTime() + 3_600_000));
    await tick(new Date(next.getTime() + 7_200_000));
    expect(
      await count(
        "select count(*)::int as n from clinical.payments where case_id = $1 and purpose = 'renewal' and status = 'captured'",
        [caseId],
      ),
    ).toBe(1);
    expect(await count("select count(*)::int as n from clinical.orders where case_id = $1", [caseId])).toBe(
      2,
    );
    expect(await count("select count(*)::int as n from clinical.invoices where case_id = $1", [caseId])).toBe(
      2,
    );
    const after = new Date((await planFor(s, caseId))!.nextChargeAt!);
    expect(Math.round((after.getTime() - next.getTime()) / DAY)).toBeGreaterThanOrEqual(28);
  });

  it("pause stops charges until resumed; cancel ends them", async () => {
    const { s, caseId } = await approvedCase();
    const next = new Date((await planFor(s, caseId))!.nextChargeAt!);
    await changePlan(s, caseId, "pause");
    await tick(new Date(next.getTime() + 3_600_000));
    expect(
      await count(
        "select count(*)::int as n from clinical.payments where case_id = $1 and purpose = 'renewal'",
        [caseId],
      ),
    ).toBe(0);
    await changePlan(s, caseId, "resume");
    await changePlan(s, caseId, "cancel");
    await expect(changePlan(s, caseId, "resume")).rejects.toMatchObject({ code: "locked" });
    expect((await planFor(s, caseId))?.status).toBe("canceled");
  });
});

describe("check-ins and the periodic re-review", () => {
  it("month 1: the patient is told once, answers once; mood changes alert the doctor as urgent", async () => {
    const { s, caseId } = await approvedCase();
    const [m1] = await caseCheckins(s, caseId);
    await tick(new Date(new Date(m1.dueAt).getTime() + 3_600_000));
    await tick(new Date(new Date(m1.dueAt).getTime() + 7_200_000));
    expect(
      await count(
        "select count(*)::int as n from clinical.outbox where ref_id = $1 and template = 'checkin_due'",
        [caseId],
      ),
    ).toBe(1);
    await expect(answerCheckin(s, m1.id, { tolerance: ["good"] })).rejects.toMatchObject({ code: "invalid" });
    expect(
      await answerCheckin(s, m1.id, { tolerance: ["mild"], mood: ["yes"], note: ["Sunt mai trist."] }),
    ).toEqual({ urgent: true });
    await expect(answerCheckin(s, m1.id, { tolerance: ["good"], mood: ["no"] })).rejects.toMatchObject({
      code: "locked",
    });
    expect(
      await count(
        "select count(*)::int as n from clinical.outbox where ref_id = $1 and template = 'checkin_answered'",
        [caseId],
      ),
    ).toBe(1);
  });

  it("charges stop at the re-review until the doctor decides; continue issues the prescription again", async () => {
    const { s, caseId } = await approvedCase();
    const review = new Date((await planFor(s, caseId))!.renewalReviewAt!);
    await tick(new Date(review.getTime() - 13 * DAY));
    const renewal = (await caseCheckins(s, caseId)).find((c) => c.kind === "renewal")!;
    expect(renewal).toBeTruthy();
    await tick(new Date(review.getTime() + 3_600_000));
    expect((await planFor(s, caseId))?.status).toBe("renewal_review");
    expect(
      await one("select 1 as ok from clinical.outbox where ref_id = $1 and template = 'renewal_review_due'", [
        caseId,
      ]),
    ).toBeTruthy();
    const paidBefore = await count(
      "select count(*)::int as n from clinical.payments where case_id = $1 and purpose = 'renewal'",
      [caseId],
    );
    await tick(new Date(review.getTime() + 40 * DAY));
    expect(
      await count(
        "select count(*)::int as n from clinical.payments where case_id = $1 and purpose = 'renewal'",
        [caseId],
      ),
    ).toBe(paidBefore);
    await expect(decideRenewal(derm, { caseId, decision: "continue", message: "" })).rejects.toMatchObject({
      code: "locked",
    });
    await answerCheckin(s, renewal.id, {
      tolerance: ["good"],
      mood: ["no"],
      results: ["better"],
      continue: ["yes"],
    });
    await decideRenewal(derm, { caseId, decision: "continue", message: "Continuăm, totul arată bine." });
    const plan = await planFor(s, caseId);
    expect(plan?.status).toBe("active");
    expect(new Date(plan!.renewalReviewAt!).getTime()).toBeGreaterThan(review.getTime() + 150 * DAY);
    expect(
      await count("select count(*)::int as n from clinical.prescriptions where case_id = $1", [caseId]),
    ).toBe(2);
    expect(
      await count(
        "select count(*)::int as n from clinical.doctor_ledger where case_id = $1 and kind = 'renewal_review'",
        [caseId],
      ),
    ).toBe(1);
  });
});

describe("data rights", () => {
  it("export: everything about the patient, nothing about anyone else", async () => {
    const a = await approvedCase();
    const b = await approvedCase();
    const data = await exportData(a.s);
    expect((data.cases as { id: string }[]).map((c) => c.id)).toEqual([a.caseId]);
    expect((data.answers as unknown[]).length).toBeGreaterThan(5);
    expect(JSON.stringify(data)).not.toContain(b.caseId);
    expect((data.consents as unknown[]).length).toBe(4);
  });

  it("withdrawing consent stops open cases (hold released) and plans", async () => {
    const { s, caseId } = await approvedCase();
    const open = await draftCase(s);
    await withdrawConsent(s);
    expect(await consentsCurrent(s)).toBe(false);
    expect(await one("select status from clinical.cases where id = $1", [open])).toEqual({
      status: "canceled",
    });
    expect((await planFor(s, caseId))?.status).toBe("canceled");
  });

  it("deletes everything at once without medical records; otherwise records the request", async () => {
    const fresh = await patient();
    await draftCase(fresh);
    expect(await deleteAccount(fresh)).toBe("deleted");
    expect(
      await count("select count(*)::int as n from clinical.profiles where id = $1", [fresh.userId]),
    ).toBe(0);
    expect(
      await count("select count(*)::int as n from clinical.cases where patient_id = $1", [fresh.userId]),
    ).toBe(0);

    const { s, caseId } = await approvedCase();
    expect(await deleteAccount(s)).toBe("requested");
    expect(
      await count("select count(*)::int as n from clinical.deletion_requests where patient_id = $1", [
        s.userId,
      ]),
    ).toBe(1);
    expect((await planFor(s, caseId))?.status).toBe("canceled");
  });
});
