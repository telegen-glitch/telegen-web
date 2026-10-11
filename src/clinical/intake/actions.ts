"use server";

import { headers } from "next/headers";
import { authAdapter, currentSession } from "../auth";
import { normalCode, normalEmail } from "../auth/types";
import { intakeGate, purchasableTopics } from "../launch";
import { logEvent } from "../log";
import { ensureAccount } from "./account";
import {
  fakeAuthorize,
  proposalFor,
  saveDelivery,
  startCheckout,
  type CheckoutStart,
  type Delivery,
  type ProposalView,
} from "./proposal";
import {
  consentsCurrent,
  IntakeError,
  recordConsents,
  saveAnswer,
  startCase,
  type SaveResult,
} from "./cases";

/**
 * Server Actions of the evaluation (CLAUDE.md v5 P1). They run as POST requests
 * to /evaluare: answers travel in the request body, never in a URL. Identity
 * always comes from the verified session, never from the browser.
 */

export type ActionError =
  "invalid" | "signed_out" | "closed" | "consent" | "locked" | "not_patient" | "error";
export type ActionResult<T> = ({ ok: true } & T) | { ok: false; error: ActionError };

function fail(e: unknown): { ok: false; error: ActionError } {
  if (e instanceof IntakeError) return { ok: false, error: e.code === "not_found" ? "invalid" : e.code };
  return { ok: false, error: "error" };
}

export async function sendCodeAction(rawEmail: unknown): Promise<ActionResult<object>> {
  const auth = authAdapter();
  if (!auth) return { ok: false, error: "closed" };
  const email = normalEmail(rawEmail);
  if (!email) return { ok: false, error: "invalid" };
  const res = await auth.sendCode(email);
  if (!res.ok) {
    if (res.reason !== "rate_limited") logEvent("auth.error");
    return { ok: false, error: res.reason === "invalid_email" ? "invalid" : "error" };
  }
  return { ok: true };
}

export async function verifyCodeAction(
  rawEmail: unknown,
  rawCode: unknown,
): Promise<ActionResult<{ email: string; consented: boolean }>> {
  const auth = authAdapter();
  if (!auth) return { ok: false, error: "closed" };
  const email = normalEmail(rawEmail);
  const code = normalCode(rawCode);
  if (!email || !code) return { ok: false, error: "invalid" };
  const res = await auth.verifyCode(email, code);
  if (!res.ok) return { ok: false, error: res.reason === "invalid_code" ? "invalid" : "error" };
  try {
    const role = await ensureAccount(res.session);
    if (role !== "patient") return { ok: false, error: "not_patient" };
    return { ok: true, email: res.session.email, consented: await consentsCurrent(res.session) };
  } catch (e) {
    return fail(e);
  }
}

export async function recordConsentsAction(kinds: unknown): Promise<ActionResult<object>> {
  const session = await currentSession();
  if (!session) return { ok: false, error: "signed_out" };
  try {
    await recordConsents(session, kinds);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Saves the evaluation after consent (or opens an empty case to autosave into). */
export async function startCaseAction(topic: unknown, answers: unknown): Promise<ActionResult<SaveResult>> {
  const session = await currentSession();
  if (!session) return { ok: false, error: "signed_out" };
  try {
    const gate = await intakeGate();
    if (gate.mode === "closed") return { ok: false, error: "closed" };
    if ((await ensureAccount(session)) !== "patient") return { ok: false, error: "not_patient" };
    if (!(await consentsCurrent(session))) return { ok: false, error: "consent" };
    const saved = await startCase(session, {
      topic: String(topic),
      answers,
      test: gate.mode === "test",
      allowedTopics: purchasableTopics(),
    });
    return { ok: true, ...saved };
  } catch (e) {
    return fail(e);
  }
}

export async function saveAnswerAction(
  caseId: unknown,
  questionId: unknown,
  value: unknown,
): Promise<ActionResult<SaveResult>> {
  const session = await currentSession();
  if (!session) return { ok: false, error: "signed_out" };
  try {
    return { ok: true, ...(await saveAnswer(session, { caseId, questionId, value })) };
  } catch (e) {
    return fail(e);
  }
}

/** "Planul tău propus": signed-in only, the one place a medicine is named next to a price. */
export async function proposalAction(caseId: unknown): Promise<ActionResult<{ proposal: ProposalView }>> {
  const session = await currentSession();
  if (!session) return { ok: false, error: "signed_out" };
  try {
    return { ok: true, proposal: await proposalFor(session, caseId) };
  } catch (e) {
    return fail(e);
  }
}

export async function saveDeliveryAction(fields: unknown): Promise<ActionResult<{ delivery: Delivery }>> {
  const session = await currentSession();
  if (!session) return { ok: false, error: "signed_out" };
  if (!fields || typeof fields !== "object") return { ok: false, error: "invalid" };
  try {
    return { ok: true, delivery: await saveDelivery(session, fields as Record<string, unknown>) };
  } catch (e) {
    return fail(e);
  }
}

/** Starts the card authorisation. The patient comes back to /cont: nothing in the URL. */
export async function checkoutAction(
  caseId: unknown,
  planId: unknown,
  billing: unknown,
): Promise<ActionResult<CheckoutStart>> {
  const session = await currentSession();
  if (!session) return { ok: false, error: "signed_out" };
  try {
    const gate = await intakeGate();
    if (gate.mode === "closed") return { ok: false, error: "closed" };
    const origin = (await headers()).get("origin");
    if (!origin) return { ok: false, error: "invalid" };
    const started = await startCheckout(session, { caseId, planId, billing, returnUrl: `${origin}/cont` });
    return { ok: true, ...started };
  } catch (e) {
    return fail(e);
  }
}

export async function fakeAuthorizeAction(paymentId: unknown): Promise<ActionResult<object>> {
  const session = await currentSession();
  if (!session) return { ok: false, error: "signed_out" };
  try {
    const outcome = await fakeAuthorize(session, paymentId);
    return outcome === "released" ? { ok: false, error: "locked" } : { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function signOutAction(): Promise<void> {
  await authAdapter()?.signOut();
}
