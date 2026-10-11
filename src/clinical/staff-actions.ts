"use server";

import { authAdapter } from "./auth";
import { normalCode } from "./auth/types";
import { createDoctor, createPharmacy, setDoctorActive } from "./admin/ops";
import { updateOrder } from "./pharmacy/orders";
import { adjust, approve, askPatient, decline, doctorMessage, takeCase } from "./doctor/workflow";
import { IntakeError } from "./intake/cases";
import { staffGate } from "./staff";
import type { Role } from "./intake/account";

/**
 * Server Actions of the staff areas. Each one re-checks the role and the
 * two-factor session on the server: a page rendering a button is not a permission.
 */
export type StaffResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function as<T>(
  role: Role,
  fn: (
    s: NonNullable<Extract<Awaited<ReturnType<typeof staffGate>>, { state: "ok" }>["session"]>,
  ) => Promise<T>,
) {
  const gate = await staffGate(role);
  if (gate.state !== "ok") return { ok: false as const, error: gate.state };
  try {
    return { ok: true as const, ...((await fn(gate.session)) ?? {}) };
  } catch (e) {
    return { ok: false as const, error: e instanceof IntakeError ? e.code : "error" };
  }
}

export async function mfaEnrollAction(): Promise<
  StaffResult<{ factorId: string; qr: string; secret: string }>
> {
  const auth = authAdapter();
  if (!auth || !(await auth.session())) return { ok: false, error: "signed_out" };
  const res = await auth.mfaEnroll();
  if (!res.ok) return { ok: false, error: "error" };
  const qr = res.qrSvg.startsWith("data:")
    ? res.qrSvg
    : `data:image/svg+xml;utf8,${encodeURIComponent(res.qrSvg)}`;
  return { ok: true, factorId: res.factorId, qr, secret: res.secret };
}

export async function mfaVerifyAction(factorId: unknown, rawCode: unknown): Promise<StaffResult> {
  const auth = authAdapter();
  if (!auth || !(await auth.session())) return { ok: false, error: "signed_out" };
  const code = normalCode(rawCode);
  if (!code) return { ok: false, error: "invalid" };
  const id = typeof factorId === "string" && factorId ? factorId : (await auth.mfaFactors())[0];
  if (!id) return { ok: false, error: "invalid" };
  return (await auth.mfaVerify(id, code)) ? { ok: true } : { ok: false, error: "invalid" };
}

const caseIdOf = (v: unknown) => {
  if (typeof v !== "string" || !/^[0-9a-f-]{36}$/.test(v)) throw new IntakeError("invalid");
  return v;
};

export async function takeCaseAction(caseId: unknown) {
  return as("doctor", (s) => takeCase(s, caseIdOf(caseId)));
}
export async function approveAction(caseId: unknown, instructions: unknown) {
  return as("doctor", (s) => approve(s, { caseId: caseIdOf(caseId), instructions }));
}
export async function adjustAction(
  caseId: unknown,
  planId: unknown,
  instructions: unknown,
  message: unknown,
) {
  return as("doctor", (s) => adjust(s, { caseId: caseIdOf(caseId), planId, instructions, message }));
}
export async function declineAction(caseId: unknown, reason: unknown, message: unknown) {
  return as("doctor", (s) => decline(s, { caseId: caseIdOf(caseId), reason, message }));
}
export async function askAction(caseId: unknown, message: unknown) {
  return as("doctor", (s) => askPatient(s, { caseId: caseIdOf(caseId), message }));
}
export async function doctorMessageAction(caseId: unknown, message: unknown) {
  return as("doctor", (s) => doctorMessage(s, { caseId: caseIdOf(caseId), message }));
}

export async function createDoctorAction(form: {
  email: unknown;
  fullName: unknown;
  specialty: unknown;
  parafa: unknown;
}) {
  return as("admin", (s) => createDoctor(s, form));
}
export async function setDoctorActiveAction(doctorId: unknown, active: unknown) {
  return as("admin", (s) => setDoctorActive(s, caseIdOf(doctorId), active === true));
}

export async function createPharmacyAction(form: {
  name: unknown;
  stripeAccount: unknown;
  memberEmail: unknown;
}) {
  return as("admin", (s) => createPharmacy(s, form));
}

export async function updateOrderAction(
  orderId: unknown,
  status: unknown,
  carrier: unknown,
  tracking: unknown,
) {
  return as("pharmacy", (s) => updateOrder(s, { orderId: caseIdOf(orderId), status, carrier, tracking }));
}
