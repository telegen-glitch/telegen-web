import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { CONSENT_KINDS } from "@/clinical/config/consents";
import { eligiblePlans, PLANS } from "@/clinical/config/plans";
import { INCLUDED, PRICING, quote } from "@/clinical/config/pricing";
import { SERVICE } from "@/clinical/config/service";
import { asService, setDriverForTests } from "@/clinical/db";
import { createPglite, pgliteDriver } from "@/clinical/db/pglite";
import { ensureAccount } from "@/clinical/intake/account";
import { recordConsents, startCase } from "@/clinical/intake/cases";
import { savePhoto } from "@/clinical/intake/photos";
import { fakeAuthorize, proposalFor, saveDelivery, startCheckout } from "@/clinical/intake/proposal";
import { markAuthorized } from "@/clinical/payments/flow";
import { PRODUCT_NAME } from "@/clinical/payments/provider";
import { launchConfig } from "@/lib/launch-config";
import type { Session } from "@/clinical/auth";
import { MEDICINE_NAMES } from "./compliance";

/** Proposal, pricing, A/B and card authorisation (CLAUDE.md v5 P2), on the real migrations. */

const allowed = ["caderea-parului"];
const answers = (over: Record<string, string[]> = {}) => ({
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
  ...over,
});
const jpeg = () =>
  new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0xff, 0xda, 0, 8, 1,
    1, 0, 0, 0x3f, 0, 0xff, 0xd9,
  ]);
const delivery = {
  fullName: "Pacient Test",
  phone: "0712345678",
  addressLine: "Str. Exemplu 1, bl. 2, ap. 3",
  city: "Cluj-Napoca",
  county: "Cluj",
  postalCode: "400001",
};

let n = 0;
async function patientWithCase(over: Record<string, string[]> = {}, photos = true) {
  n += 1;
  const s: Session = {
    userId: `00000000-0000-4000-8000-${String(900 + n).padStart(12, "0")}`,
    email: `p${n}@t.test`,
    aal: "aal1",
  };
  await asService((q) => q.query("insert into auth.users (id, email) values ($1, $2)", [s.userId, s.email]));
  await ensureAccount(s);
  await recordConsents(s, CONSENT_KINDS);
  const { caseId } = await startCase(s, {
    topic: "caderea-parului",
    answers: answers(over),
    test: true,
    allowedTopics: allowed,
  });
  if (photos)
    for (const slot of ["front", "top", "crown"]) await savePhoto(s, { caseId, slot, bytes: jpeg() });
  return { s, caseId };
}

beforeAll(async () => {
  setDriverForTests(pgliteDriver(await createPglite()));
});

describe("pricing and plans", () => {
  it("matches the owner's public prices; the first-month test is 320 (A) or 199 (B)", () => {
    const pub = launchConfig.prices["caderea-parului"].map((p) => p.amount);
    expect(PRICING["caderea-parului"].monthly.recurring).toBe(pub[0]);
    expect(PRICING["caderea-parului"].quarterly.recurring).toBe(pub[1]);
    expect(quote("caderea-parului", "monthly", "A")).toMatchObject({
      firstAmount: 320,
      recurringAmount: 320,
    });
    expect(quote("caderea-parului", "monthly", "B")).toMatchObject({
      firstAmount: 199,
      recurringAmount: 320,
    });
    expect(quote("caderea-parului", "quarterly", "B")).toMatchObject({
      firstAmount: 870,
      recurringAmount: 870,
    });
    expect(quote("acnee", "monthly", "A")).toBeNull();
  });

  it("finasteride is proposed only to men; a mood history starts from minoxidil alone", () => {
    expect(eligiblePlans("caderea-parului", answers())).toEqual(["hair-fin-min", "hair-min"]);
    expect(eligiblePlans("caderea-parului", answers({ sex: ["f"] }))).toEqual(["hair-min"]);
    expect(eligiblePlans("caderea-parului", answers({ sex: ["na"] }))).toEqual(["hair-min"]);
    expect(eligiblePlans("caderea-parului", answers({ mood: ["past"] }))).toEqual([
      "hair-min",
      "hair-fin-min",
    ]);
    expect(PLANS["hair-fin-min"].warning).toMatch(/2025/);
  });

  it("names a medicine only in the plan itself: never in what the price includes, nor what Stripe sees", () => {
    for (const x of INCLUDED) expect(x).not.toMatch(MEDICINE_NAMES);
    expect(PRODUCT_NAME).not.toMatch(MEDICINE_NAMES);
    expect(PRODUCT_NAME).not.toMatch(/păr|acnee|erectil/i);
  });

  it("plans and prices never reach a browser bundle except as types", () => {
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => {
        const full = path.join(dir, f);
        return statSync(full).isDirectory() ? files(full) : /\.tsx?$/.test(f) ? [full] : [];
      });
    const offenders = files(path.join(process.cwd(), "src"))
      .filter((f) => /^["']use client["']/m.test(readFileSync(f, "utf8")))
      .filter((f) =>
        /import\s+(?!type\b)[^;]*from\s+["'][^"']*config\/(plans|pricing)["']/.test(readFileSync(f, "utf8")),
      );
    expect(offenders).toEqual([]);
    for (const f of ["plans", "pricing"])
      expect(readFileSync(path.join(process.cwd(), `src/clinical/config/${f}.ts`), "utf8")).toMatch(
        /^import "server-only";/,
      );
  });
});

describe("the proposed plan", () => {
  it("needs complete answers and every photo", async () => {
    const { s, caseId } = await patientWithCase({}, false);
    await expect(proposalFor(s, caseId)).rejects.toMatchObject({ code: "invalid" });
  });

  it("keeps the patient's A/B variant on the server, the same every time", async () => {
    const { s, caseId } = await patientWithCase();
    const a = await proposalFor(s, caseId);
    const b = await proposalFor(s, caseId);
    expect(a.quotes.monthly.firstAmount).toBe(b.quotes.monthly.firstAmount);
    expect([320, 199]).toContain(a.quotes.monthly.firstAmount);
    const [row] = await asService((q) =>
      q.query<{ variant: string }>("select variant from clinical.price_assignments where patient_id = $1", [
        s.userId,
      ]),
    );
    expect(a.quotes.monthly.firstAmount).toBe(row.variant === "B" ? 199 : 320);
    expect(a.plans.map((p) => p.id)).toEqual(["hair-fin-min", "hair-min"]);
  });

  it("another patient cannot see it", async () => {
    const { caseId } = await patientWithCase();
    const other = await patientWithCase();
    await expect(proposalFor(other.s, caseId)).rejects.toMatchObject({ code: "not_found" });
  });

  it("validates the delivery address", async () => {
    const { s } = await patientWithCase();
    await expect(saveDelivery(s, { ...delivery, phone: "123" })).rejects.toMatchObject({ code: "invalid" });
    await expect(saveDelivery(s, { ...delivery, postalCode: "40" })).rejects.toMatchObject({
      code: "invalid",
    });
    expect(await saveDelivery(s, { ...delivery, phone: "+40 712 345 678" })).toMatchObject({
      phone: "+40712345678",
    });
  });
});

describe("checkout: the amount is only authorised, then the case goes to the doctor", () => {
  it("refuses a plan the answers do not allow, and checkout without a delivery address", async () => {
    const { s, caseId } = await patientWithCase({ sex: ["f"] });
    const go = (planId: string) =>
      startCheckout(s, { caseId, planId, billing: "monthly", returnUrl: "http://x/cont" });
    await expect(go("hair-min")).rejects.toMatchObject({ code: "invalid" });
    await saveDelivery(s, delivery);
    await expect(go("hair-fin-min")).rejects.toMatchObject({ code: "invalid" });
    await expect(go("hair-min")).resolves.toMatchObject({ redirectUrl: null });
  });

  it("records the server's amounts, authorises, and starts the SLA", async () => {
    const { s, caseId } = await patientWithCase();
    await saveDelivery(s, delivery);
    const first = await startCheckout(s, {
      caseId,
      planId: "hair-fin-min",
      billing: "monthly",
      returnUrl: "http://x/cont",
    });
    // Changing the choice abandons the first checkout: one hold on the card at most.
    const second = await startCheckout(s, {
      caseId,
      planId: "hair-fin-min",
      billing: "quarterly",
      returnUrl: "http://x/cont",
    });
    expect(await fakeAuthorize(s, second.paymentId)).toBe("submitted");
    const [kase] = await asService((q) =>
      q.query<{ status: string; plan_id: string; sla: number }>(
        "select status, plan_id, extract(epoch from sla_due_at - submitted_at)::int as sla from clinical.cases where id = $1",
        [caseId],
      ),
    );
    expect(kase).toEqual({ status: "submitted", plan_id: "hair-fin-min", sla: SERVICE.slaHours * 3600 });
    const pays = await asService((q) =>
      q.query<{ id: string; status: string; amount: number; capture_before: Date | null }>(
        "select id, status, amount, capture_before from clinical.payments where case_id = $1 order by created_at",
        [caseId],
      ),
    );
    expect(pays.map((p) => [p.id === first.paymentId, p.status, p.amount])).toEqual([
      [true, "expired", pays[0].amount],
      [false, "authorized", 870],
    ]);
    expect(pays[1].capture_before).toBeTruthy();
    const mail = await asService((q) =>
      q.query("select template, ref_id from clinical.outbox where to_profile_id = $1", [s.userId]),
    );
    expect(mail).toEqual([{ template: "case_received", ref_id: caseId }]);
    // A late authorisation of the abandoned checkout is released, never kept.
    const [old] = await asService((q) =>
      q.query<{ checkout_id: string }>("select checkout_id from clinical.payments where id = $1", [
        first.paymentId,
      ]),
    );
    expect(
      await markAuthorized({ checkoutId: old.checkout_id, intentId: "pi_late", captureBefore: null }),
    ).toBe("released");
    // A repeated webhook for the same checkout changes nothing.
    const [cur] = await asService((q) =>
      q.query<{ checkout_id: string }>("select checkout_id from clinical.payments where id = $1", [
        second.paymentId,
      ]),
    );
    expect(await markAuthorized({ checkoutId: cur.checkout_id, intentId: "pi_x", captureBefore: null })).toBe(
      "duplicate",
    );
  });
});
