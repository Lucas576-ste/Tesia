import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

const nextFiles = ["apps/web/**/*.{js,jsx,mjs,ts,tsx}"];

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals.map((config) => ({ ...config, files: nextFiles })),
  {
    files: nextFiles,
    settings: { next: { rootDir: "apps/web" }, react: { version: "19.3" } },
  },
  prettier,
];
