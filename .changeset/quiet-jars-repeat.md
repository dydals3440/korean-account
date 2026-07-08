---
"korean-account": patch
---

번들 트리셰이킹 복구 — `normalize` 하나만 import 해도 기관 레지스트리 94 KB 가 통째로 딸려 오던 문제를 고쳤습니다.

`sideEffects: false` 와 `treeshake: true` 가 켜져 있었지만 실제로는 동작하지 않았습니다. `defaultDetector` 가 최상위 함수 호출(`createDetector({ institutions })`)이라 번들러가 순수성을 증명하지 못해, 레지스트리를 모든 소비자 번들에 고정시키고 있었습니다.

**공개 API·런타임 동작은 전혀 바뀌지 않습니다.** 소비자 번들 크기만 줄어듭니다 (esbuild, minify, gzip 기준):

| import | before | after |
| --- | ---: | ---: |
| `normalize` | 11,546 B | **169 B** |
| `formatAccount` + `createPatternTemplate` | 11,537 B | **312 B** |
| `defineInstitution` | 11,541 B | **67 B** |
| `korean-account/schema` | 9,681 B | **926 B** |
| `detectAccount` | 11,560 B | 11,510 B |

`detectAccount` / `institutionById` 처럼 레지스트리가 실제로 필요한 경로는 그대로입니다.

바뀐 것:

- `defaultDetector` 와 `data/index.ts` 의 조회 Map 에 `/* @__PURE__ */` 를 붙였습니다.
- 레지스트리(`banks` / `nonBanks` / `securities`)와 순수 헬퍼(`createPatternTemplate` 등)를 각각 별도 청크로 분리했습니다. `sideEffects: false` 가 모듈 단위로 동작할 수 있게 됩니다.
- `korean-account/schema` 가 `institutions` 대신 id 리터럴 배열(`src/data/institutionIds.ts`)만 참조합니다. id 목록 하나 때문에 레지스트리 전체를 끌어오지 않습니다. 두 목록의 동기화는 런타임·타입 양쪽 테스트로 강제됩니다.
- `declarationMap` 을 껐습니다. `.d.ts.map` 4개는 `sourcesContent` 가 없고 배포되지 않는 `../src/*.ts` 를 가리켜, go-to-definition 이 조용히 실패하는 죽은 파일이었습니다.
