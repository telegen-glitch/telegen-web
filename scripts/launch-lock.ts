/**
 * Prebuild launch lock (CLAUDE.md v4.7, v5). A production build (VERCEL_ENV=production)
 * in the "open" launch state fails while any launch value is missing, and lists
 * exactly what; with APP_LAUNCH=on it also needs the clinical services' keys.
 * Previews and local builds only print the list. Checks that need the database
 * (doctors with 2FA, pharmacy split) run when the clinical flow starts
 * (src/clinical/launch.ts).
 */
import { content } from "../src/content/source";
import { launchConfig } from "../src/lib/launch-config";
import { clinicalLaunchBlockers, launchBlockers, launchLocked } from "../src/lib/launch-lock";
import { siteConfig } from "../src/lib/site";

const blockers = [
  ...launchBlockers({ config: launchConfig, conditions: content.listConditions() }),
  ...clinicalLaunchBlockers(process.env),
];

if (launchLocked(process.env, siteConfig.launchState, blockers)) {
  console.error(
    `\nLansarea este blocată: site-ul este în starea "open", dar lipsesc ${blockers.length} valori:\n` +
      blockers.map((b) => `  - ${b}`).join("\n") +
      "\n\nCompletează src/lib/launch-config.ts și variabilele din Vercel (docs/LAUNCH.md), apoi reconstruiește.\n",
  );
  process.exit(1);
}

if (blockers.length > 0) {
  console.log(
    `Launch lock: ${blockers.length} value(s) still missing (blocks production only):\n` +
      blockers.map((b) => `  - ${b}`).join("\n"),
  );
} else {
  console.log("Launch lock: every launch value is present.");
}
