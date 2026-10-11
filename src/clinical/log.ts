import "server-only";

/**
 * The only logger allowed in clinical code (console is banned there by lint).
 * It takes an event name from a closed list and opaque ids. It cannot carry
 * free text, so answers, conditions, names or addresses never reach a log.
 */
export type LogEvent =
  | "case.created"
  | "case.submitted"
  | "case.decided"
  | "payment.authorized"
  | "payment.captured"
  | "payment.canceled"
  | "payment.error"
  | "sla.reminder"
  | "sla.escalated"
  | "email.sent"
  | "email.error"
  | "auth.error"
  | "webhook.ignored"
  | "storage.error";

const OPAQUE = /^[0-9a-f-]{8,64}$|^(?:pi|cs|sub|cus|evt|acct)_[A-Za-z0-9]+$/;

export function opaqueIds(ids: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(ids).map(([k, v]) => [k, OPAQUE.test(v) ? v : "[redacted]"]));
}

export function logEvent(event: LogEvent, ids: Record<string, string> = {}): void {
  const line = JSON.stringify({ at: new Date().toISOString(), event, ...opaqueIds(ids) });
  // eslint-disable-next-line no-console -- the single, structured log sink
  console.info(line);
}
