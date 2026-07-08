# Changelog

## 0.1.0

### Minor Changes

- 55b9ec9: 분기 규칙(`branchRule`)이 적중한 후보가 `minScore` 컷오프에 조기 탈락하던 문제를 고쳤습니다.

  > ⚠️ **BREAKING CHANGE (동작)** — `detectAccount` / `detectBest` 에 `options.minScore` 를 기본값(1)보다 높게 지정한 경우 결과가 달라집니다. 기본 옵션 사용자는 영향이 없습니다 (아래 실측 표 참조).

  `branchRuleMatch` 보너스(+2)가 `minScore` 검사 **뒤에** 적용되고 있었습니다. 그래서 "분기 규칙 덕에 `minScore` 를 넘겼어야 할 후보" 가 보너스를 받아보지도 못하고 잘려 나갔습니다. 분기 규칙은 PDF 가 명시한 강한 식별 신호이므로, 보너스를 먼저 얹고 자릅니다.

  **영향 범위 — 24,000 케이스 코퍼스로 실측했습니다.**

  | 옵션                       | 변경된 결과 |
  | -------------------------- | ----------: |
  | 기본값 (`minScore` 미지정) |     **0건** |
  | `minScore: 0`              |     **0건** |
  | `minScore: 5`              |       875건 |
  | `minScore: 8`              |        48건 |

  **후보 920건이 복구되고 사라진 후보는 0건** 입니다. `limit` 에 걸린 꼬리에서 동점 후보가 교체된 3건을 제외하면 상위 후보 순서는 그대로입니다.

  ### 함께 고친 것

  - `normalizeSubject` 가 `lifetime` kind 를 출금 차단으로 보지 않아, `subject.allowsWithdrawal` 은 `true` 인데 `capabilities.allowsWithdrawal` 은 `false` 인 모순이 났습니다. 이제 `computeCapabilities` 와 같은 정의를 씁니다. 기본 레지스트리에는 `lifetime` + `subjects` 를 동시에 가진 패턴이 없어 **출력 변화는 0건** 이며, 커스텀 기관에만 영향이 있습니다.
  - 아무 효과도 없던 죽은 선언 4개를 제거했습니다 — `subjects` 없는 `subjectPosition` 3개(HSBC, DB증권, 우리투자증권), `identifiers` 없는 `identifierPosition` 1개(수협 12자리). 런타임 동작은 그대로입니다.
  - 데이터 레지스트리 불변식 테스트 923개를 추가했습니다. 위 죽은 선언들은 이 테스트가 없어 아무 신호 없이 존재했습니다.

- 1917393: zod v4 지원을 실제로 성립하게 만들고, 배포되던 깨진 타입 선언을 고쳤습니다.

  ### 배포되던 `.d.ts` 가 깨져 있었습니다

  `index.d.ts` / `schema.d.ts` 가 끝내 emit 되지 않는 `helpers-*.d.ts` 청크를 import 하고 있었습니다. 소비자는 `Cannot find module './helpers-CHbaQZwO.js'` 를 만났을 것입니다. `publint` 는 이걸 잡지 못합니다.

  원인은 tsdown 이 d.ts 를 ESM 패스 안에서 생성하면서 `codeSplitting.groups` 를 d.ts 에도 적용하는 것이었습니다 (0.22.0 · 0.22.4 모두 재현). JS 와 d.ts 를 별도 빌드로 분리했습니다.

  이제 `pnpm build` 가 **attw(strict) + publint** 를 관문으로 실행합니다.

  ### `zod@^4` 는 타입 레벨에서 거짓이었습니다

  `peerDependencies` 는 `^3.23.0 || ^4.0.0` 을 광고했지만, 생성된 `dist/schema.d.ts` 가 v3 전용 타입을 하드코딩했습니다 — `z.ZodEffects` ×4 (v4 에서 제거됨), 튜플형 `z.ZodEnum`. devDep 이 zod v3 이라 CI 가 구조적으로 잡을 수 없었습니다.

  증상은 시끄러운 에러가 아니라 **조용한 붕괴** 였습니다. 대부분의 소비자가 쓰는 `skipLibCheck: true` 아래서 `tsc` 는 통과하지만 스키마 타입이 `any` 로 무너져 검증 기능을 잃습니다.

  - 모든 스키마 export 에 버전 중립 타입(`ZodType<T>`)을 명시했습니다.
  - `institutionIdSchema` 은 `z.custom` 으로 바꿨습니다. v3 의 `.refine((v): v is InstitutionId => …)` 는 타입 서술로 출력을 좁히지만 v4 의 `.refine` 은 좁히지 않아, 같은 코드가 두 메이저에서 다른 타입을 냅니다.
  - CI 에 zod v3 / v4 매트릭스를 추가했습니다. 광고한 것을 실제로 검증합니다.

  ### 추가된 것 (additive)

  `.options` / `.enum` 접근자가 타입 표면에서 사라진 것을 상쇄하고, 리터럴 유니온의 이중 정의를 컴파일 타임에 결박합니다.

  - `ACCOUNT_KINDS`, `SUBJECT_CATEGORIES`, `INSTITUTION_CATEGORIES`, `CONFIDENCE_LEVELS` — `as const satisfies readonly X[]` + 양방향 exhaustiveness 테스트.
  - `korean-account/schema` 에 `DetectionPayload` 타입.
  - `typesVersions` — `moduleResolution: "node"` (node10) 소비자가 `korean-account/schema` 타입을 해석할 수 있게. attw strict 가 이 갭을 잡아냈습니다.

  ### ⚠️ BREAKING CHANGE (타입 전용)

  `korean-account/schema` 의 스키마 선언 타입이 zod 구체 타입에서 `ZodType<T>` 로 바뀝니다. **런타임 동작과 `parse` / `safeParse` 결과 타입은 그대로** 이지만, zod 고유 접근자는 타입에서 사라집니다.

  ```ts
  // before
  accountKindSchema.options; // readonly ["new", "old", ...]

  // after — 새로 export 된 상수를 쓰세요
  import { ACCOUNT_KINDS } from "korean-account";
  ACCOUNT_KINDS; // readonly ["new", "old", ...]
  ```

  영향받는 접근자: `.options` · `.enum` · `.innerType()` · `.shape`. 스키마를 `parse` / `safeParse` / zod 조합에만 쓴다면 아무것도 바꾸지 않아도 됩니다.

  ### 하위호환

  공개 export 는 **5개 추가, 0개 제거** 입니다 (스냅샷 테스트로 강제). 런타임 동작은 불변입니다.

- 55b9ec9: `Detector.extend()` 가 `scoring` 과 `checkDigitVerifiers` 를 받습니다.

  지금까지 `extend()` 는 `institutions` 와 `globalRules` 만 받았습니다. 커스텀 기관을 추가해도 **그 기관의 체크디지트 verifier 를 등록할 길이 없어** `createDetector` 로 되돌아가야 했습니다.

  ```ts
  defaultDetector.extend({
    institutions: [myBank],
    checkDigitVerifiers: { "my-bank": verifyMyBank },
    scoring: { identifierMatch: 6 },
  });
  ```

  `scoring` 은 기존 가중치 위에 얕게 병합되고, `checkDigitVerifiers` 는 기존 맵과 합쳐집니다 (같은 id 는 교체). 둘 다 생략하면 기존 설정이 그대로 이어집니다.

  ### 내부 정리 (공개 API 불변)

  - `_internal/` 이 사실상 공개 API 였습니다 — `kb11FirstDigit`, `toss12First1719` 등 8개 분기 룰과 `scoreToConfidence`, `normalizeSubject` 가 `_internal` 이라는 이름 아래 semver 로 얼어붙어 있었습니다. 파일을 `src/rules/`, `src/subjects/`, `src/confidence/` 로 옮겼습니다. **export 목록은 68개 그대로입니다** — 값은 `src/index.spec.ts` 스냅샷이, 타입은 `src/index.types.spec.ts` 가 강제합니다.
  - 아무도 import 하지 않으면서 테스트 픽스처를 re-export 하던 죽은 배럴 `src/_internal/index.ts` 를 삭제했습니다.
  - 구현·반환되지만 한 번도 호출되지 않던 내부 함수 `DetectorIndex.byLength()` 를 제거했습니다.
  - `AccountPattern.checkDigitPosition` 을 `@deprecated` 로 표시했습니다. 152개 패턴 중 하나도 채우지 않고 어떤 코드 경로도 읽지 않지만, 커스텀 기관 정의에서 넘기고 있을 수 있어 제거하지 않았습니다.
  - `pickInstitutions` / `pickInstitutionsByIds` 의 축자 중복(include/exclude 필터)을 공통 헬퍼로 추출했습니다.

### Patch Changes

- 55b9ec9: `engines.node` 하한을 `>=22.0.0` 에서 `>=20.19.0` 으로 낮췄습니다.

  산출물의 최고 문법은 `??` 와 `?.` (ES2020) 이고 `node:` 내장 모듈을 하나도 쓰지 않습니다. Node 22 하한에는 근거가 없었습니다.

  빌드 도구(tsdown)가 `^22.18.0 || >=24.11.0` 을 요구하지만 **그건 툴체인의 제약이지 산출물의 제약이 아닙니다.** CI 에 `runtime` 잡을 두어 Node 22 로 빌드한 `dist` 를 **Node 20 에서 직접 실행** 해 ESM·CJS 양쪽을 검증한 뒤 하한을 낮췄고, 빌드에 `target: "es2020"` 을 명시해 다시 어긋나지 않게 했습니다.

  기존 Node 22+ 사용자에게는 영향이 없습니다 (하한을 낮추기만 함).

  ### 저장소 하드닝

  - `.github/dependabot.yml` 신설 — npm · GitHub Actions 주간 갱신.
  - GitHub Actions 를 모두 커밋 SHA 로 고정했습니다. `changesets/action@v1` 은 태그가 아니라 force-push 가능한 브랜치를 가리키고 있었습니다.
  - `ci.yml` 에 `permissions: contents: read` 를 추가했습니다 (세 워크플로 중 유일하게 없었습니다).
  - `.nvmrc` 가 `lts/*` 라 CI 와 조용히 어긋날 수 있었습니다. `22` 로 고정하고 워크플로가 `node-version-file` 로 읽게 했습니다.
  - `.gitignore` 에 `.npmrc`, `.env.*`, `*.pem`, `*.key` 를 추가했습니다.
  - PR 제목 Conventional Commits 검사 워크플로를 추가했습니다 (`CONTRIBUTING.md` 가 의무화하지만 강제 도구가 없었습니다).

- 570223a: 번들 트리셰이킹 복구 — `normalize` 하나만 import 해도 기관 레지스트리 94 KB 가 통째로 딸려 오던 문제를 고쳤습니다.

  `sideEffects: false` 와 `treeshake: true` 가 켜져 있었지만 실제로는 동작하지 않았습니다. `defaultDetector` 가 최상위 함수 호출(`createDetector({ institutions })`)이라 번들러가 순수성을 증명하지 못해, 레지스트리를 모든 소비자 번들에 고정시키고 있었습니다.

  **공개 API·런타임 동작은 전혀 바뀌지 않습니다.** 소비자 번들 크기만 줄어듭니다 (esbuild, minify, gzip 기준):

  | import                                    |   before |     after |
  | ----------------------------------------- | -------: | --------: |
  | `normalize`                               | 11,546 B | **169 B** |
  | `formatAccount` + `createPatternTemplate` | 11,537 B | **312 B** |
  | `defineInstitution`                       | 11,541 B |  **67 B** |
  | `korean-account/schema`                   |  9,681 B | **926 B** |
  | `detectAccount`                           | 11,560 B |  11,510 B |

  `detectAccount` / `institutionById` 처럼 레지스트리가 실제로 필요한 경로는 그대로입니다.

  바뀐 것:

  - `defaultDetector` 와 `data/index.ts` 의 조회 Map 에 `/* @__PURE__ */` 를 붙였습니다.
  - 레지스트리(`banks` / `nonBanks` / `securities`)와 순수 헬퍼(`createPatternTemplate` 등)를 각각 별도 청크로 분리했습니다. `sideEffects: false` 가 모듈 단위로 동작할 수 있게 됩니다.
  - `korean-account/schema` 가 `institutions` 대신 id 리터럴 배열(`src/data/institutionIds.ts`)만 참조합니다. id 목록 하나 때문에 레지스트리 전체를 끌어오지 않습니다. 두 목록의 동기화는 런타임·타입 양쪽 테스트로 강제됩니다.
  - `declarationMap` 을 껐습니다. `.d.ts.map` 4개는 `sourcesContent` 가 없고 배포되지 않는 `../src/*.ts` 를 가리켜, go-to-definition 이 조용히 실패하는 죽은 파일이었습니다.

- 55b9ec9: 영문 README 추가 및 문서 정확도 수정.

  - **`README.en.md` 신설** + 양쪽 README 상단에 언어 스위처. npm 키워드는 영문(`korean`, `fintech`, `kftc`)인데 문서는 한국어 전용이라, 확장 모델·PDF 충실성 원칙·한계 섹션을 외국인 사용자가 읽을 수 없었습니다.
  - `CODE_OF_CONDUCT.md` 가 스스로를 Contributor Covenant **2.1** 이라 밝히면서 실제로는 1.4 구조(4단계 시행 지침 없음)였고, "비공개 채널로 신고" 라고 쓰면서 그 채널을 정의하지 않았습니다. 진짜 2.1 로 교체하고 신고 이메일을 명시했습니다.
  - `SECURITY.md` 에 지원 버전 표, 응답 목표, 위협 모델(런타임 의존성 0 · 네트워크 I/O 없음 · provenance)을 추가했습니다.
  - JSDoc 드리프트 수정:
    - `ScoringWeights` 의 기본 가중치 목록에서 `branchRuleMatch: 2` 가 빠져 있었습니다.
    - `Subject.allowsWithdrawal` 이 "기본 true" 라고 적혀 있었지만, 실제로는 kind 에서 유도됩니다.
  - README 의 `Node 22+` 표기를 `Node 20.19+` 로, 기관 수 `~57곳` 을 `57곳` 으로 정정했습니다.

## 0.0.3

### Patch Changes

- f11f8d0: 문서·내부 정비 릴리스 — 공개 API 변경 없음 (0.0.2 와 완전 호환)

  - npm 패키지에 `DOCS.md` 포함 — README 의 상세 레퍼런스 링크가 npmjs.com 에서도 동작
  - README API 카탈로그에 누락되어 있던 공개 export 보강 (`normalizeSubject`, `RegisteredInstitution`, `InstitutionIdInput`, 선택자 필터 타입 등)
  - CONTRIBUTING 의 툴체인 표기를 실제 (Node 22+ / pnpm 10) 와 일치하도록 수정
  - 핵심 공개 함수에 `@example` 포함 JSDoc 보강 — 에디터 호버 문서 개선
  - 내부 리팩토링: 중복 패턴 가드를 명명 헬퍼로 통합, 채점 함수를 단일 책임 소함수로 분해 (동작·점수 동일)

## 0.0.2

### Patch Changes

- 056ac84: `zod` 를 `peerDependencies` 로 이동 (optional, `^3.23.0 || ^4.0.0`).

  메인 진입점 (`detectAccount` / `detectBest` / `institutionById` 등) 은 zod 를 require 하지 않으므로 컨슈머는 zod 없이도 그대로 사용 가능. `korean-account/schema` 서브엔트리를 쓸 때만 컨슈머 프로젝트에 zod 가 필요.

  배경 — `dependencies` 로 두면 컨슈머 프로젝트의 zod 인스턴스와 우리 라이브러리 안의 zod 인스턴스가 다르게 resolve 될 때 `instanceof z.ZodType` 같은 동일성 검사가 깨지는 위험. `peerDependencies` 로 옮기면 컨슈머의 zod 단일 인스턴스를 공유.

## 0.0.1

초기 publish. 한국 금융기관 계좌번호 식별·과목 추출 코어 (KFTC CMS PDF 충실).
