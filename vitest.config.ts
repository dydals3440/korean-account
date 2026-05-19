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
  },
});
