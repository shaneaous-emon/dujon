import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // FR-I18N-004: no hard-coded user-facing text in components — use messages/*.json.
    files: ["src/**/*.tsx"],
    ignores: ["src/app/not-found.tsx"],
    rules: {
      "react/jsx-no-literals": [
        "error",
        { noStrings: false, ignoreProps: true, allowedStrings: ["|", "/", "·", "—", "–", "…", "(", ")", ":"] },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**", "playwright-report/**", "test-results/**"]),
]);

export default eslintConfig;
