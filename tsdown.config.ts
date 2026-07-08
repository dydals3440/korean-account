import { defineConfig } from "tsdown";

// 레지스트리를 별도 청크로 떼어내야 `sideEffects: false` 가 모듈 단위로 먹는다.
// 같은 청크에 있으면 57개 `defineInstitution(...)` 최상위 호출 때문에 번들러가
// 순수성을 증명하지 못해, `normalize` 만 import 한 소비자도 94 KB 를 받는다.
//
// 함정 1: `helpers` 그룹이 `registry` 보다 먼저 와야 한다 (선언 순서대로 매칭).
//         그러지 않으면 순수 헬퍼가 레지스트리 청크로 빨려 들어간다.
// 함정 2: `includeDependenciesRecursively: false` 는 쓰면 안 된다 — index ↔ registry
//         순환 청크가 생겨 import 시점에 TDZ 로 크래시한다.
// 함정 3: `institutionIds.ts` 는 두 그룹 모두에서 제외한다 (`/schema` 전용).
//
// 회귀 방지: scripts/check-treeshaking.mjs
const PURE_HELPER_MODULES =
  /src[\\/](?:(?:createPatternTemplate|rules|subjects|confidence)[\\/]|_internal[\\/]templateLength\.ts$|data[\\/](?:defineInstitution|expandTwoDigitRange)\.ts$)/;

const REGISTRY_MODULES = /src[\\/]data[\\/](banks|nonBanks|securities|index)\.ts$/;

const ENTRY = {
  index: "src/index.ts",
  schema: "src/schema/index.ts",
};

// JS 와 d.ts 를 별도 빌드로 굽는다. tsdown 은 d.ts 를 ESM 패스 안에서 생성하는데,
// `codeSplitting.groups` 가 d.ts 에도 적용되면서 끝내 emit 되지 않는 `helpers-*.d.ts`
// 를 import 하는 깨진 선언을 낸다 (0.22.0 · 0.22.4 재현). publint 는 못 잡고 attw 가 잡는다.
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
    // `engines.node` 와 짝을 이룬다. 명시하지 않으면 소스의 문법 수준이 그대로 새어 나간다.
    target: "es2020",
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
    // declarationMap 은 끈다 — `.d.ts.map` 은 sourcesContent 없이 배포되지 않는
    // `../src/*.ts` 를 가리켜 go-to-definition 이 조용히 실패한다.
    dts: { emitDtsOnly: true, sourcemap: false },
    clean: false,
    platform: "neutral",
    deps: { neverBundle: ["zod"] },
    attw: { profile: "strict" },
    publint: true,
  },
]);
