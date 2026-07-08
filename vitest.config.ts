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
        // 데이터 레지스트리는 로직이 아니라 선언이다. 분모에 넣으면 실제 로직의
        // 커버리지가 데이터 양에 묻힌다.
        "src/data/**",
        // 한 줄짜리 re-export 배럴. 실행 가능한 문장이 없다.
        "src/**/index.ts",
      ],
      // 현재 실측치 (statements 98.27 / branches 96.06 / functions 98.11) 바로 아래에
      // 두어 래칫으로 쓴다. 커버리지가 떨어지면 CI 가 실패한다.
      thresholds: {
        statements: 97,
        branches: 95,
        functions: 95,
        lines: 97,
      },
    },
  },
});
