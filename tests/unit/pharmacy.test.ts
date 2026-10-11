import { beforeAll, describe, expect, it } from "vitest";
import { CONSENT_KINDS } from "@/clinical/config/consents";
import { PHARMACY_SPLIT } from "@/clinical/config/pharmacy";
import { asService, setDriverForTests } from "@/clinical/db";
import { createPglite, pgliteDriver } from "@/clinical/db/pglite";
import { approve, takeCase } from "@/clinical/doctor/workflow";
import { ensureAccount } from "@/clinical/intake/account";
import { recordConsents, startCase } from "@/clinical/intake/cases";
import { savePhoto } from "@/clinical/intake/photos";
import { fakeAuthorize, saveDelivery, startCheckout } from "@/clinical/intake/proposal";
import { invoiceAdapter } from "@/clinical/invoicing/adapter";
import { launchProblems } from "@/clinical/launch";
import { pharmacyOrders, updateOrder } from "@/clinical/pharmacy/orders";
import { patientCase } from "@/clinical/patient/case";
import type { Session } from "@/clinical/auth";

/** Pharmacy, payment split and invoices (CLAUDE.md v5 P4), on the real migrations. */

const uid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const derm: Session = { userId: uid(701), email: "derm@t.test", aal: "aal2" };
const pharm: Session = { userId: uid(702), email: "farm@t.test", aal: "aal2" };
const other: Session = { userId: uid(703), email: "farm2@t.test", aal: "aal2" };
const PH = uid(7701);
const PH2 = uid(7702);
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

let n = 800;
async function approvedCase() {
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
    for (const [s, role] of [
      [derm, "doctor"],
      [pharm, "pharmacy"],
      [other, "pharmacy"],
    ] as const) {
      await q.query("insert into auth.users (id, email) values ($1, $2)", [s.userId, s.email]);
      await q.query("insert into clinical.profiles (id, role, email) values ($1, $2, $3)", [
        s.userId,
        role,
        s.email,
      ]);
    }
    await q.query(
      "insert into clinical.doctors (id, full_name, specialty, parafa_code) values ($1, 'Medic TEST', 'dermatologie', 'P1')",
      [derm.userId],
    );
    await q.query(
      "insert into clinical.pharmacies (id, name, stripe_account_id) values ($1, 'Farmacie TEST', 'acct_TEST1'), ($2, 'Alta', null)",
      [PH, PH2],
    );
    await q.query("update clinical.pharmacies set created_at = now() + interval '1 hour' where id = $1", [
      PH2,
    ]);
    await q.query("insert into clinical.pharmacy_members values ($1, $2), ($3, $4)", [
      pharm.userId,
      PH,
      other.userId,
      PH2,
    ]);
  });
});

describe("after approval", () => {
  it("the order goes to the partner pharmacy and an invoice for the service is queued", async () => {
    const { caseId } = await approvedCase();
    expect(await one("select pharmacy_id from clinical.orders where case_id = $1", [caseId])).toEqual({
      pharmacy_id: PH,
    });
    expect(
      await one("select status, amount from clinical.invoices where case_id = $1", [caseId]),
    ).toMatchObject({
      status: "pending",
    });
    // No split configured (owner + pharmacy decision): nothing is transferred.
    expect(await one("select transfer_id from clinical.orders where case_id = $1", [caseId])).toEqual({
      transfer_id: null,
    });
  });

  it("with a split configured, the pharmacy's share is transferred after capture", async () => {
    PHARMACY_SPLIT["hair-fin-min"] = { monthly: 120, quarterly: 330 };
    try {
      const { caseId } = await approvedCase();
      const o = await one<{ transfer_id: string; transfer_amount: number }>(
        "select transfer_id, transfer_amount from clinical.orders where case_id = $1",
        [caseId],
      );
      expect(o.transfer_amount).toBe(120);
      expect(o.transfer_id).toMatch(/^fake_tr_/);
    } finally {
      delete PHARMACY_SPLIT["hair-fin-min"];
    }
  });
});

describe("pharmacy panel", () => {
  it("needs 2FA; shows the prescription, doctor and address, never the condition", async () => {
    await approvedCase();
    expect(await pharmacyOrders({ ...pharm, aal: "aal1" })).toEqual([]);
    const orders = await pharmacyOrders(pharm);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0].doctor).toEqual({ name: "Medic TEST", parafa: "P1" });
    expect(orders[0].ship.postalCode).toBe("700001");
    expect(JSON.stringify(orders)).not.toMatch(/caderea|căderea|alopec|acnee|erectil/i);
    expect(await pharmacyOrders(other)).toEqual([]);
  });

  it("ships with a carrier and AWB (the patient is told), and only its own orders", async () => {
    const { s, caseId } = await approvedCase();
    const [order] = (await pharmacyOrders(pharm)).filter((o) => o.status === "pending");
    await expect(
      updateOrder(other, { orderId: order.id, status: "packing", carrier: null, tracking: null }),
    ).rejects.toThrow();
    await updateOrder(pharm, { orderId: order.id, status: "packing", carrier: null, tracking: null });
    await expect(
      updateOrder(pharm, { orderId: order.id, status: "shipped", carrier: "Curier", tracking: "" }),
    ).rejects.toThrow();
    await updateOrder(pharm, {
      orderId: order.id,
      status: "shipped",
      carrier: "Curier TEST",
      tracking: "AWB12345",
    });
    expect(
      await one("select 1 as ok from clinical.outbox where ref_id = $1 and template = 'order_shipped'", [
        caseId,
      ]),
    ).toBeTruthy();
    expect((await patientCase(s, caseId))?.order).toEqual({
      status: "shipped",
      carrier: "Curier TEST",
      trackingCode: "AWB12345",
    });
  });
});

describe("launch checks", () => {
  it("production needs the pharmacy split, invoicing and a partner pharmacy with Stripe Connect", async () => {
    const problems = await launchProblems();
    expect(problems).toContain("împărțirea plății cu farmacia, pe produs (PHARMACY_SPLIT)");
    expect(problems).toContain("facturarea (SmartBill sau Oblio)");
  });

  it("invoicing is off until credentials exist, then SmartBill or Oblio", () => {
    const env = (v: Record<string, string>) => v as unknown as NodeJS.ProcessEnv;
    expect(invoiceAdapter(env({}))).toBeNull();
    expect(invoiceAdapter(env({ INVOICE_CIF: "RO1", INVOICE_SERIES: "TLG" }))).toBeNull();
    expect(
      invoiceAdapter(
        env({ INVOICE_CIF: "RO1", INVOICE_SERIES: "TLG", SMARTBILL_EMAIL: "a", SMARTBILL_TOKEN: "b" }),
      )?.kind,
    ).toBe("smartbill");
    expect(
      invoiceAdapter(env({ INVOICE_CIF: "RO1", INVOICE_SERIES: "TLG", OBLIO_EMAIL: "a", OBLIO_SECRET: "b" }))
        ?.kind,
    ).toBe("oblio");
  });
});
