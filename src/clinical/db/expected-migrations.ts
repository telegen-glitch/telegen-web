/**
 * The migrations this build expects in clinical_meta.migrations, in order
 * (/api/health compares them; tests/unit/supabase-setup.test.ts keeps the list
 * equal to supabase/migrations). Listed here because the migration files are not
 * shipped with the server functions.
 */
export const EXPECTED_MIGRATIONS = [
  "0001_clinical_core.sql",
  "0002_intake.sql",
  "0003_payments.sql",
  "0004_doctor.sql",
  "0005_pharmacy.sql",
  "0006_subscriptions.sql",
  "0007_storage.sql",
] as const;
