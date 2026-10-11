/**
 * Service settings (CLAUDE.md v5). Defaults from the owner's brief; the doctor
 * confirms the renewal interval (docs/open-items.md).
 */
export const SERVICE = {
  /** A doctor decides within this many hours of the authorisation. */
  slaHours: Number(process.env.SLA_HOURS) > 0 ? Number(process.env.SLA_HOURS) : 24,
  /** Doctor reminders, hours after submission. */
  reminderHours: [12, 20],
  /** Admin escalation when no decision by then. */
  escalateHours: 24,
  /** Admin is warned this many days before an authorisation lapses. */
  authorizationWarningDays: 2,
  /** Periodic doctor re-review for renewals, in months (doctor to confirm). */
  renewalReviewMonths: 6,
  /** Check-ins after approval, in months. */
  checkinMonths: [1, 3],
} as const;
