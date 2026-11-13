import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "typescript", "unicorn", "oxc"],
  ignorePatterns: ["dist", "dist-dts", "coverage", ".changeset"],
  categories: {
    correctness: "error",
    suspicious: "warn",
  },
  rules: {
    "typescript/no-explicit-any": "warn",
    "unicorn/no-useless-fallback-in-spread": "error",
  },
  overrides: [
    {
      files: ["**/*.spec.ts", "**/*.bench.ts"],
      rules: {
        "unicorn/consistent-function-scoping": "off",
        "no-useless-concat": "off",
      },
    },
  ],
});
