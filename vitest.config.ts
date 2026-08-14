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
        "src/_internal/fixtures.ts",
        // The registry is declarative data, not logic. Including it would drown
        // real logic coverage in data volume.
        "src/data/**",
        // Single-line re-export barrels have no executable statements.
        "src/**/index.ts",
      ],
      // Ratchet: pinned just below measured coverage (97.83 / 94.73 / 96.92 / 98.33
      // under @vitest/coverage-v8 4.x). CI fails if coverage drops.
      thresholds: {
        statements: 97,
        branches: 94,
        functions: 96,
        lines: 98,
      },
    },
  },
});
