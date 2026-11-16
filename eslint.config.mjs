import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The old site. Never linted, never imported.
    "legacy/**",
    "playwright-report/**",
    "test-results/**",
  ]),
  {
    rules: {
      // legacy/ must never be imported (see CLAUDE.md).
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["**/legacy/**"], message: "Never import from legacy/." }] },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    // Command-line scripts report progress on stdout.
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
]);

export default eslintConfig;
