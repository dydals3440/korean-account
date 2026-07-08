import { defineConfig } from "tsdown";

/**
 * 기관 레지스트리 (`banks` / `nonBanks` / `securities` + 이를 합치는 `data/index`) 는
 * 57개 `defineInstitution(...)` 호출로 만들어진다. 최상위 함수 호출이라 번들러가
 * 순수성을 증명하지 못하므로, 같은 청크에 있으면 `normalize` 하나만 import 한
 * 소비자에게도 94 KB 가 통째로 딸려 간다.
 *
 * 별도 청크로 떼어내면 `package.json` 의 `sideEffects: false` 덕에 *모듈 단위* 로
 * 통째로 버려진다.
 *
 * `helpers` 그룹이 `registry` 보다 **먼저** 와야 한다 (그룹은 선언 순서대로 매칭).
 * 기본값인 `includeDependenciesRecursively` 는 레지스트리의 의존성 —
 * `createPatternTemplate` / `defineInstitution` 같은 순수 헬퍼 — 까지 레지스트리
 * 청크로 빨아들이는데, 그러면 헬퍼만 쓰는 소비자도 94 KB 를 받는다. 헬퍼를 먼저
 * 잡아 두면 `registry → helpers` 단방향 의존만 남는다.
 *
 * `includeDependenciesRecursively: false` 로 끄는 방법은 **쓰면 안 된다** —
 * `index ↔ registry` 순환 청크가 생겨 `ALLOWED_CHARS` TDZ 로 import 시점에 크래시한다.
 * 헬퍼 모듈은 `src/data/*` 를 import 하지 않으므로 이 그룹 분리는 순환을 만들지 않는다.
 *
 * `src/data/institutionIds.ts` 는 두 그룹 모두에서 제외 — `korean-account/schema` 가
 * 레지스트리 없이 id 목록만 쓰기 위한 파일이다.
 *
 * 회귀 방지: `scripts/check-treeshaking.mjs`.
 */
const PURE_HELPER_MODULES =
  /src[\\/](?:createPatternTemplate[\\/]|_internal[\\/](?:branchRules|subjects|confidence|templateLength)\.ts$|data[\\/](?:defineInstitution|expandTwoDigitRange)\.ts$)/;

const REGISTRY_MODULES = /src[\\/]data[\\/](banks|nonBanks|securities|index)\.ts$/;

export default defineConfig({
  entry: {
    index: "src/index.ts",
    schema: "src/schema/index.ts",
  },
  format: ["esm", "cjs"],
  // declarationMap 은 끈다. `.d.ts.map` 은 sourcesContent 를 담지 않고 `../src/*.ts`
  // 를 가리키는데 `src` 는 `files` 에 없다 — go-to-definition 이 조용히 실패하는
  // 죽은 파일을 실어 보내게 된다. JS 소스맵은 sourcesContent 가 인라인되어 실제로
  // 동작하므로 유지한다.
  dts: { sourcemap: false },
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  platform: "neutral",
  deps: { neverBundle: ["zod"] },
  outputOptions: {
    codeSplitting: {
      groups: [
        { name: "helpers", test: PURE_HELPER_MODULES },
        { name: "registry", test: REGISTRY_MODULES },
      ],
    },
  },
});
