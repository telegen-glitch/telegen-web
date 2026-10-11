import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** Where clinical code may be imported from (CLAUDE.md v5 WALLS). */
const CLINICAL_ALLOWED = ["src/clinical/**", "src/app/(clinical)/**", "src/app/api/**"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Wall 1: public code (marketing pages, shared components, lib) never imports clinical code.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: CLINICAL_ALLOWED,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/clinical", "@/clinical/*", "**/clinical", "**/clinical/*"],
              message:
                "Clinical code may be imported only under src/clinical, src/app/(clinical) and src/app/api (CLAUDE.md v5 WALLS).",
            },
          ],
        },
      ],
    },
  },
  // Wall 2: clinical code logs only through src/clinical/log.ts and loads no analytics or third-party scripts.
  {
    files: CLINICAL_ALLOWED.map((g) => g.replace("**", "**/*.{ts,tsx}")),
    rules: {
      "no-console": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@/lib/analytics", message: "No analytics in the clinical area (CLAUDE.md v5)." },
            { name: "next/script", message: "No third-party scripts in the clinical area (CLAUDE.md v5)." },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
