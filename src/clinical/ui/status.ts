import type { CaseStatus } from "../intake/cases";

/** What each case status means for the patient, in plain words. */
export const PATIENT_STATUS: Record<CaseStatus, string> = {
  draft: "Evaluare începută",
  stopped: "Recomandare: consult în persoană",
  awaiting_payment: "Planul te așteaptă",
  submitted: "Trimisă medicului",
  in_review: "Medicul analizează evaluarea",
  waiting_patient: "Medicul așteaptă un răspuns de la tine",
  adjusted: "Medicul a ajustat planul",
  approved: "Plan aprobat",
  declined: "Fără rețetă: nu plătești nimic",
  expired: "Expirată",
  canceled: "Anulată",
};
