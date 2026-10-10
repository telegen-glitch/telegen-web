/**
 * Postbuild launch copy check (CLAUDE.md v4.7). Every page is prerendered, so
 * this reads the HTML of every route the build produced and fails the build if
 * any of it says the service is not open while the launch state is "open".
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
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

if (siteConfig.launchState !== "open") {
  console.log(`Launch copy check skipped: launch state is "${siteConfig.launchState}".`);
  process.exit(0);
}

const files = htmlFiles(root);
if (files.length === 0) {
  console.error("Launch copy check: no prerendered HTML found in .next/server/app.");
  process.exit(1);
}
const problems = files.flatMap((file) => {
  const found = prelaunchPhrases(readFileSync(file, "utf8"));
  return found.length > 0 ? [`${path.relative(root, file)}: ${found.join(", ")}`] : [];
});
if (problems.length > 0) {
  console.error(
    `Launch copy check failed: pre-launch wording in ${problems.length} page(s):\n  ${problems.join("\n  ")}`,
  );
  process.exit(1);
}
console.log(`Launch copy check: ${files.length} pages, no pre-launch wording.`);
