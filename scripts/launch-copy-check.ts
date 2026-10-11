/**
 * Postbuild launch copy check (CLAUDE.md v4.7). Every page is prerendered, so
 * this reads the HTML of every route the build produced and fails the build if
 * any of it says the service is not open while the launch state is "open".
 *
 * It fails only on pre-launch wording. If the build output is not laid out as
 * expected (hosting builders may place prerendered pages elsewhere), it warns
 * and passes: the CI build and the e2e suite (tests/e2e/launch.spec.ts) run the
 * same check on every pull request.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { prelaunchPhrases } from "../src/lib/launch-phrases";
import { siteConfig } from "../src/lib/site";

const root = path.join(process.cwd(), ".next/server/app");

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith(".html") ? [full] : [];
  });
}

function main(): number {
  if (siteConfig.launchState !== "open") {
    console.log(`Launch copy check skipped: launch state is "${siteConfig.launchState}".`);
    return 0;
  }
  let files: string[] = [];
  try {
    files = existsSync(root) ? htmlFiles(root) : [];
  } catch (error) {
    console.warn(`Launch copy check skipped: could not read ${root} (${String(error)}).`);
    return 0;
  }
  if (files.length === 0) {
    console.warn(`Launch copy check skipped: no prerendered HTML in ${root}.`);
    return 0;
  }
  const problems = files.flatMap((file) => {
    const found = prelaunchPhrases(readFileSync(file, "utf8"));
    return found.length > 0 ? [`${path.relative(root, file)}: ${found.join(", ")}`] : [];
  });
  if (problems.length > 0) {
    console.error(
      `Launch copy check failed: pre-launch wording in ${problems.length} page(s):\n  ${problems.join("\n  ")}`,
    );
    return 1;
  }
  console.log(`Launch copy check: ${files.length} pages, no pre-launch wording.`);
  return 0;
}

process.exit(main());
