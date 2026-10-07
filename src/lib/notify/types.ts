/**
 * Launch-notification storage adapter. Receives ONLY an email address and the
 * consent record. Never health answers: the evaluation flow has no path to it.
 */
export interface NotifySignup {
  email: string;
  consentText: string;
  consentVersion: number;
  consentedAt: string;
}

export type NotifyResult =
  { status: "ok" } | { status: "disabled" } | { status: "invalid" } | { status: "error" };

export interface NotifyAdapter {
  readonly name: string;
  readonly enabled: boolean;
  subscribe(signup: NotifySignup): Promise<NotifyResult>;
}
