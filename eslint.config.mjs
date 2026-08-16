import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "supabase/.temp/**",
    "next-env.d.ts",
    // Agent tooling: CommonJS hook scripts that are not part of the app build and do not
    // follow the Next.js/TypeScript rules this config enforces.
    ".claude/**",
    ".codex/**",
    ".agents/**",
  ]),
]);

export default eslintConfig;
