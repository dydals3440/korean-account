import { defineConfig } from "tsdown";

/**
 * 기관 레지스트리 (`banks` / `nonBanks` / `securities` + 이를 합치는 `data/index`) 는
 * 57개 `defineInstitution(...)` 호출로 만들어진다. 최상위 함수 호출이라 번들러가
 * 순수성을 증명하지 못하므로, 같은 청크에 있으면 `normalize` 하나만 import 한
 * 소비자에게도 94 KB 가 통째로 딸려 간다.
 *
 * 별도 청크로 떼어내면 `package.json` 의 `sideEffects: false` 덕에 *모듈 단위* 로
 * 통째로 버려진다. `helpers` 그룹이 `registry` 보다 **먼저** 와야 한다 (그룹은 선언
 * 순서대로 매칭) — 그러지 않으면 `createPatternTemplate` 같은 순수 헬퍼가 레지스트리
 * 청크로 빨려 들어가 헬퍼만 쓰는 소비자도 94 KB 를 받는다.
 *
 * `includeDependenciesRecursively: false` 로 끄는 방법은 **쓰면 안 된다** —
 * `index ↔ registry` 순환 청크가 생겨 `ALLOWED_CHARS` TDZ 로 import 시점에 크래시한다.
 *
 * `src/data/institutionIds.ts` 는 두 그룹 모두에서 제외 — `korean-account/schema` 가
 * 레지스트리 없이 id 목록만 쓰기 위한 파일이다.
 *
 * 회귀 방지: `scripts/check-treeshaking.mjs`.
 */
const PURE_HELPER_MODULES =
  /src[\\/](?:createPatternTemplate[\\/]|_internal[\\/](?:branchRules|subjects|confidence|templateLength)\.ts$|data[\\/](?:defineInstitution|expandTwoDigitRange)\.ts$)/;

const REGISTRY_MODULES = /src[\\/]data[\\/](banks|nonBanks|securities|index)\.ts$/;

const ENTRY = {
  index: "src/index.ts",
  schema: "src/schema/index.ts",
};

/**
 * JS 와 d.ts 를 **별도 빌드**로 굽는다.
 *
 * tsdown 은 d.ts 를 ESM 패스 안에서 함께 생성하는데, 이때 `codeSplitting.groups` 가
 * d.ts 에도 적용되면서 `index.d.ts` 가 끝내 emit 되지 않는 `helpers-*.d.ts` 를
 * import 하는 깨진 선언을 낸다 (tsdown 0.22.0 · 0.22.4 모두 재현). `publint` 는 이걸
 * 잡지 못한다 — `attw` 가 잡는다.
 *
 * 그래서 청크 분할은 JS 빌드에만 적용하고, d.ts 는 분할 없이 따로 굽는다.
 * 순서 의존: JS 빌드가 `clean` 하고, d.ts 빌드는 그 위에 얹는다.
 */
export default defineConfig([
  {
    entry: ENTRY,
    format: ["esm", "cjs"],
    dts: false,
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
  },
  {
    entry: ENTRY,
    format: ["esm", "cjs"],
    // declarationMap 은 끈다. `.d.ts.map` 은 sourcesContent 를 담지 않고 배포되지 않는
    // `../src/*.ts` 를 가리켜, go-to-definition 이 조용히 실패하는 죽은 파일이 된다.
    dts: { emitDtsOnly: true, sourcemap: false },
    clean: false,
    platform: "neutral",
    deps: { neverBundle: ["zod"] },
    // 배포 직전 관문. publint 가 못 잡는 타입 해석 오류 — 누락된 d.ts 청크,
    // node10 resolution 갭 (`typesVersions` 로 메움) — 을 잡는다.
    attw: { profile: "strict" },
    publint: true,
  },
]);
