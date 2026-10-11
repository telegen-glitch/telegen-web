/**
 * Unit tests exercise the code, not the deployment they happen to run in. They
 * run before every build (prebuild), including on Vercel where VERCEL=1 and,
 * once configured, real Supabase/Stripe keys are present: clear all of that so
 * tests always use the local stand-ins (PGlite, test sign-in, file storage,
 * fake payments) and can never reach a real service. Tests that need a
 * deployment value set it themselves.
 */
for (const key of [
  "VERCEL",
  "VERCEL_ENV",
  "APP_LAUNCH",
  "SITE_INDEXING",
  "CLINICAL_APP_URL",
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "BREVO_API_KEY",
  "EMAIL_SENDER",
  "CRON_SECRET",
  "ADMIN_EMAILS",
])
  delete process.env[key];
// Vercel builds run with NODE_ENV=production, which alone switches the stand-ins off.
process.env.CLINICAL_LOCAL = "on";
