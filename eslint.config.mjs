import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated reports — linting them only produces noise about their own
    // inlined eslint directives.
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    // Copied verbatim from src/, which is linted at the source.
    "packages/*/registry/**",
  ]),
]);

export default eslintConfig;
