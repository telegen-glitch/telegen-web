import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { createPglite, pgliteDriver } from "@/clinical/db/pglite";
import type { Driver, Executor } from "@/clinical/db/types";

/**
 * Row Level Security per role (CLAUDE.md v5 WALLS), on the real migrations in
 * PGlite with the same roles and auth.uid() as Supabase.
 */

const id = (n: string) => `00000000-0000-4000-8000-${n.padStart(12, "0")}`;
const U = {
  patientA: id("a"),
  patientB: id("b"),
  derm: id("d1"),
  uro: id("d2"),
  pharmacy: id("f1"),
  otherPharmacy: id("f2"),
  admin: id("ad"),
};
const PHARM = id("fa1");
const PHARM2 = id("fa2");
const C = { a1: id("ca1"), a2: id("ca2"), b1: id("cb1"), b2: id("cb2") };

let db: PGlite;
let driver: Driver;

const as = <T>(user: string, aal: "aal1" | "aal2", fn: (q: Executor) => Promise<T>) =>
  driver.transaction(
    { claims: JSON.stringify({ sub: user, role: "authenticated", aal }), role: "authenticated" },
    fn,
  );
const service = <T>(fn: (q: Executor) => Promise<T>) =>
  driver.transaction({ claims: JSON.stringify({ role: "service_role" }), role: "service_role" }, fn);
const rows = (q: Executor, sql: string, p: unknown[] = []) => q.query(sql, p);

beforeAll(async () => {
  db = await createPglite();
  driver = pgliteDriver(db);
  await service(async (q) => {
    for (const [, u] of Object.entries(U))
      await q.query("insert into auth.users (id, email) values ($1, $2)", [u, `${u}@t.test`]);
    const role = (u: string, r: string) =>
      q.query("insert into clinical.profiles (id, role, email) values ($1, $2, 'x@t.test')", [u, r]);
    await role(U.patientA, "patient");
    await role(U.patientB, "patient");
    await role(U.derm, "doctor");
    await role(U.uro, "doctor");
    await role(U.pharmacy, "pharmacy");
    await role(U.otherPharmacy, "pharmacy");
    await role(U.admin, "admin");
    for (const p of [U.patientA, U.patientB])
      await q.query(
        "insert into clinical.patients (id, full_name, address_line) values ($1, 'Pacient TEST', 'Str. TEST 1')",
        [p],
      );
    await q.query(
      "insert into clinical.doctors (id, full_name, specialty, parafa_code) values ($1, 'Medic TEST D', 'dermatologie', 'P1'), ($2, 'Medic TEST U', 'urologie', 'P2')",
      [U.derm, U.uro],
    );
    await q.query("insert into clinical.pharmacies (id, name) values ($1, 'F1'), ($2, 'F2')", [
      PHARM,
      PHARM2,
    ]);
    await q.query("insert into clinical.pharmacy_members values ($1, $2), ($3, $4)", [
      U.pharmacy,
      PHARM,
      U.otherPharmacy,
      PHARM2,
    ]);
    const kase = (cid: string, pid: string, cond: string, status: string, doctor: string | null) =>
      q.query(
        "insert into clinical.cases (id, patient_id, condition, status, questionnaire_version, assigned_doctor_id) values ($1, $2, $3, $4, 'v1', $5)",
        [cid, pid, cond, status, doctor],
      );
    await kase(C.a1, U.patientA, "caderea-parului", "draft", null);
    await kase(C.a2, U.patientA, "caderea-parului", "submitted", null);
    await kase(C.b1, U.patientB, "disfunctie-erectila", "in_review", U.uro);
    await kase(C.b2, U.patientB, "acnee", "approved", U.derm);
    for (const c of Object.values(C))
      await q.query(
        "insert into clinical.answers (case_id, question_id, answer) values ($1, 'q1', '[\"x\"]')",
        [c],
      );
    await q.query(
      "insert into clinical.messages (case_id, sender_id, sender_role, body) values ($1, $2, 'patient', 'mesaj TEST')",
      [C.b1, U.patientB],
    );
    const rx = await q.query<{ id: string }>(
      'insert into clinical.prescriptions (case_id, doctor_id, items) values ($1, $2, \'[{"name":"TEST"}]\') returning id',
      [C.b2, U.derm],
    );
    await q.query("insert into clinical.orders (case_id, prescription_id, pharmacy_id) values ($1, $2, $3)", [
      C.b2,
      rx[0].id,
      PHARM,
    ]);
    await q.query(
      "insert into clinical.payments (case_id, provider, amount, status) values ($1, 'fake', 199, 'authorized')",
      [C.a2],
    );
  });
});

describe("patients see only their own records", () => {
  it("cases and answers", async () => {
    await as(U.patientA, "aal1", async (q) => {
      expect((await rows(q, "select id from clinical.cases order by id")).map((r) => r.id)).toEqual([
        C.a1,
        C.a2,
      ]);
      expect(
        (await rows(q, "select distinct case_id from clinical.answers order by case_id")).map(
          (r) => r.case_id,
        ),
      ).toEqual([C.a1, C.a2]);
      expect(await rows(q, "select * from clinical.messages")).toEqual([]);
      expect(await rows(q, "select * from clinical.prescriptions")).toEqual([]);
      expect(await rows(q, "select * from clinical.audit_log")).toEqual([]);
    });
  });

  it("cannot open a case for someone else or skip the payment", async () => {
    await expect(
      as(U.patientA, "aal1", (q) =>
        rows(
          q,
          "insert into clinical.cases (patient_id, condition, questionnaire_version) values ($1, 'acnee', 'v1')",
          [U.patientB],
        ),
      ),
    ).rejects.toThrow(/row-level security/);
    await expect(
      as(U.patientA, "aal1", (q) =>
        rows(
          q,
          "insert into clinical.cases (patient_id, condition, status, questionnaire_version) values ($1, 'acnee', 'submitted', 'v1')",
          [U.patientA],
        ),
      ),
    ).rejects.toThrow(/row-level security/);
    await expect(
      as(U.patientA, "aal1", (q) =>
        rows(q, "update clinical.cases set status = 'awaiting_payment' where id = $1", [C.a1]).then(() =>
          rows(q, "update clinical.cases set status = 'submitted' where id = $1", [C.a1]),
        ),
      ),
    ).rejects.toThrow(/row-level security|not allowed/);
  });

  it("cannot change answers once the case went to the doctor", async () => {
    const changed = await as(U.patientA, "aal1", (q) =>
      rows(q, "update clinical.answers set answer = '[\"y\"]' where case_id = $1 returning case_id", [C.a2]),
    );
    expect(changed).toEqual([]);
  });

  it("sees the assigned doctor's name and parafă, no other doctor", async () => {
    await as(U.patientB, "aal1", async (q) => {
      expect(
        (await rows(q, "select full_name from clinical.doctors order by full_name")).map((r) => r.full_name),
      ).toEqual(["Medic TEST D", "Medic TEST U"]);
    });
    await as(U.patientA, "aal1", async (q) =>
      expect(await rows(q, "select * from clinical.doctors")).toEqual([]),
    );
  });
});

describe("doctors need two-factor authentication and see only their queue", () => {
  it("without 2FA a doctor sees nothing", async () => {
    await as(U.derm, "aal1", async (q) => {
      expect(await rows(q, "select * from clinical.cases")).toEqual([]);
      expect(await rows(q, "select * from clinical.answers")).toEqual([]);
    });
  });

  it("with 2FA: the open queue of their specialty plus own cases, never drafts or a colleague's case", async () => {
    await as(U.derm, "aal2", async (q) => {
      expect((await rows(q, "select id from clinical.cases order by id")).map((r) => r.id)).toEqual([
        C.a2,
        C.b2,
      ]);
      expect(
        (await rows(q, "select distinct case_id from clinical.answers order by case_id")).map(
          (r) => r.case_id,
        ),
      ).toEqual([C.a2, C.b2]);
      expect(await rows(q, "select * from clinical.messages")).toEqual([]);
      expect(await rows(q, "select * from clinical.payments")).toEqual([]);
      expect(await rows(q, "select * from clinical.audit_log")).toEqual([]);
    });
    await as(U.uro, "aal2", async (q) => {
      // The open hair-loss case is for dermatology: the urologist sees only his own.
      expect((await rows(q, "select id from clinical.cases order by id")).map((r) => r.id)).toEqual([C.b1]);
      expect((await rows(q, "select body from clinical.messages")).map((r) => r.body)).toEqual([
        "mesaj TEST",
      ]);
    });
  });

  it("cannot take a colleague's case", async () => {
    const updated = await as(U.derm, "aal2", (q) =>
      rows(q, "update clinical.cases set assigned_doctor_id = $1 where id = $2 returning id", [U.derm, C.b1]),
    );
    expect(updated).toEqual([]);
  });
});

describe("pharmacies see only what they need to dispense and ship", () => {
  it("their orders through the narrow view, without the condition", async () => {
    await as(U.pharmacy, "aal1", async (q) => {
      const orders = await rows(q, "select * from clinical.pharmacy_orders");
      expect(orders).toHaveLength(1);
      expect(Object.keys(orders[0])).not.toContain("condition");
      expect(JSON.stringify(orders[0])).not.toMatch(/acnee|caderea|disfunctie/);
      expect(orders[0].ship_name).toBe("Pacient TEST");
      expect(await rows(q, "select * from clinical.cases")).toEqual([]);
      expect(await rows(q, "select * from clinical.answers")).toEqual([]);
      expect(await rows(q, "select * from clinical.prescriptions")).toEqual([]);
    });
    await as(U.otherPharmacy, "aal1", async (q) =>
      expect(await rows(q, "select * from clinical.pharmacy_orders")).toEqual([]),
    );
  });

  it("can move only their own orders forward", async () => {
    const [order] = await service((q) => rows(q, "select id from clinical.orders"));
    await as(U.pharmacy, "aal1", (q) =>
      rows(q, "select clinical.pharmacy_update_order($1, 'shipped', 'TEST', 'T123')", [order.id]),
    );
    await expect(
      as(U.otherPharmacy, "aal1", (q) =>
        rows(q, "select clinical.pharmacy_update_order($1, 'delivered', null, null)", [order.id]),
      ),
    ).rejects.toThrow(/not found/);
  });
});

describe("admins see operations, never health content", () => {
  it("with 2FA: cases and payments, but no answers, photos, messages or prescriptions", async () => {
    await as(U.admin, "aal2", async (q) => {
      expect(await rows(q, "select id from clinical.cases")).toHaveLength(4);
      expect(await rows(q, "select id from clinical.payments")).toHaveLength(1);
      expect(await rows(q, "select * from clinical.answers")).toEqual([]);
      expect(await rows(q, "select * from clinical.photos")).toEqual([]);
      expect(await rows(q, "select * from clinical.messages")).toEqual([]);
      expect(await rows(q, "select * from clinical.prescriptions")).toEqual([]);
    });
    await as(U.admin, "aal1", async (q) =>
      expect(await rows(q, "select id from clinical.cases")).toEqual([]),
    );
  });
});

describe("audit log and state machine", () => {
  it("every write to health data is logged with who, when and which record, never the content", async () => {
    await as(U.patientA, "aal1", (q) =>
      rows(
        q,
        "insert into clinical.answers (case_id, question_id, answer) values ($1, 'q2', '[\"secret-answer\"]')",
        [C.a1],
      ),
    );
    const log = await service((q) =>
      rows(q, "select * from clinical.audit_log where entity = 'answers' and actor_id = $1", [U.patientA]),
    );
    expect(log.length).toBeGreaterThan(0);
    expect(log.at(-1)).toMatchObject({
      action: "insert",
      entity: "answers",
      entity_id: C.a1,
      actor_role: "patient",
    });
    expect(JSON.stringify(log)).not.toContain("secret-answer");
  });

  it("refuses a status jump the clinical flow does not allow", async () => {
    await expect(
      service((q) => rows(q, "update clinical.cases set status = 'approved' where id = $1", [C.a1])),
    ).rejects.toThrow(/not allowed/);
  });
});
