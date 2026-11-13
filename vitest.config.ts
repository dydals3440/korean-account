import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts"],
    benchmark: {
      include: ["src/**/*.bench.ts"],
    },
    typecheck: {
      enabled: true,
      include: ["src/**/*.types.spec.ts"],
    },
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.spec.ts",
        "src/**/*.bench.ts",
        "src/**/*.fixtures.ts",
        // Declarative data and re-export barrels would dilute logic coverage.
        "src/registry/**",
        "src/**/index.ts",
      ],
      // Ratchet just below measured coverage; raise when it improves.
      thresholds: {
        statements: 98.5,
        branches: 96.5,
        functions: 97.5,
        lines: 99,
      },
    },
  },
});
