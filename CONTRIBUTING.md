# 기여 안내

이슈·PR·커밋은 한국어를 기본으로 하고 영어 기여도 환영합니다. 코드 식별자와 소스의 JSDoc·주석은 영어로 씁니다. 영어 요약은 [맨 아래](#english-summary)에 있습니다.

## 개발 환경

| 항목                         | 버전                                | 기준                                               |
| ---------------------------- | ----------------------------------- | -------------------------------------------------- |
| Node.js (개발·빌드·릴리스)   | 26.13.1                             | `.nvmrc`                                           |
| pnpm                         | 12.18.0                             | `package.json`의 `packageManager`                  |
| Node.js (사용자 런타임 하한) | 22.12.0                             | `engines`. CI가 22.12.0·22·24·26에서 `dist`를 실행 |
| TypeScript (개발)            | 7.x                                 | `devDependencies`                                  |
| TypeScript (사용자)          | 5.1.6 · 5.9.3 · 6.0.3에서 타입 검사 | CI `consumer-types`                                |

```bash
pnpm install
pnpm check   # typecheck + lint + test
```

## 명령

| 명령                  | 내용                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| `pnpm test`           | Vitest 전체. `*.types.spec.ts`는 타입 검사로 실행                                |
| `pnpm test:watch`     | 개발 중 감시 모드                                                                |
| `pnpm test:coverage`  | 커버리지. `vitest.config.ts`의 임계값은 내려가지 않는 래칫                       |
| `pnpm test:bench`     | `*.bench.ts` 벤치마크                                                            |
| `pnpm typecheck`      | `tsc --noEmit`(strict, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) |
| `pnpm lint`           | oxlint(경고도 실패) + `oxfmt --check`(Markdown 포함)                             |
| `pnpm lint:fix`       | oxlint 자동 수정 + oxfmt                                                         |
| `pnpm build`          | tsdown 빌드 → 선언 수집 → attw(strict) → publint                                 |
| `pnpm check:dist`     | 번들 크기(`.size-limit.json`) + 런타임 실행 + 패키지 파일 목록·README 링크       |
| `pnpm check:consumer` | 실제 tarball을 소비자 프로젝트에 설치해 호환성 검사(아래)                        |

### `pnpm check:consumer`

`pnpm build` 후에 실행합니다. `pnpm pack`으로 만든 tarball을 임시 프로젝트에 설치하고, 직전 공개 버전 **0.4.1**을 `korean-account-baseline`이라는 npm 별칭으로 함께 설치해 비교합니다.

- **peer 조합**: peer 없음, zod 3.23.0·^3·4.0.0·^4, valibot 1.0.0·^1, yup 1.4.0·^1, arktype 2.1.0·^2. 각 peer의 하한과 최신 버전에서 따로 검사합니다. `pnpm check:consumer zod@^4`처럼 인자로 조합 하나만 고를 수 있습니다.
- **런타임**: ESM·CJS 모두에서 0.4.1의 export가 빠지지 않았는지, 기관 ID 목록이 같은지, 대표 입력의 1순위가 바뀌지 않았는지(의도한 변경은 스크립트의 `REVIEWED_TOP_CHANGES`에 사유와 함께 기록), 어댑터의 통과·거부가 0.4.1과 같은지, `exports`·`engines`·peer 설정이 같은지, 런타임 의존성이 0개이고 다른 peer를 요구하지 않는지 확인합니다.
- **타입**: 새 선언이 0.4.1 자리에 그대로 들어가는지(의도한 시그니처 변경은 `ROOT_TYPE_EXCEPTIONS`)를 Node16·NodeNext·Bundler 해석에서 검사하고, 각 어댑터의 추론 타입(`z.infer`, `v.InferOutput`, `InferType`, `.infer`, `StandardSchemaV1.InferOutput`)이 기대한 `string`·`InstitutionId`·`DetectionPayload<…>`인지 peer 버전별로 확인합니다.
- **환경 변수**: `CONSUMER_TYPESCRIPT=5.1.6`으로 소비자 TypeScript 버전을, `CONSUMER_RUNTIME_ONLY=true`로 런타임 검사만 실행합니다.

## 폴더 구조와 계층 규칙

```text
src/
├── types/           공개 타입 (런타임 코드 없음)
├── constants.ts     ACCOUNT_KINDS 등 리터럴 배열
├── core/
│   ├── account/     normalizeAccount · formatAccount · extract*
│   ├── define/      define* · patternTemplate · cmsServices
│   ├── detector/    createDetector, 채점·분기·정렬·capability
│   ├── lookup/      기관·패턴 조회 헬퍼
│   └── labels.ts    한국어 라벨
├── registry/        기관 데이터: banks/ · non-banks/ · securities/ (기관당 1파일), branch-rules.ts, institution-ids.ts
├── builtin/         내장 레지스트리에 묶인 detect · detectBest · getInstitution · searchInstitutions · pickPattern
├── adapters/        contract.ts(공통 규칙·메시지) + <lib>/schema.ts
├── deprecated.ts    1.0에서 제거할 별칭
└── index.ts         루트 공개 export
```

의존 방향은 `types ← constants ← core ← registry ← builtin ← index`입니다. 화살표 왼쪽 계층은 오른쪽 계층을 import하지 않습니다.

| 계층                                | import할 수 있는 것                             |
| ----------------------------------- | ----------------------------------------------- |
| `src/types/`, `src/constants.ts`    | 서로만                                          |
| `src/core/`                         | types, constants. 레지스트리를 모르는 순수 엔진 |
| `src/registry/`                     | types, constants, `core/define`만               |
| `src/builtin/`                      | types, constants, core, registry                |
| `src/adapters/`                     | types, constants, `registry/institution-ids`만  |
| `src/deprecated.ts`, `src/index.ts` | 모두                                            |

이 규칙은 [`oxlint.config.ts`](./oxlint.config.ts)의 `no-restricted-imports` override와 `import/no-cycle`이 강제하므로 `pnpm lint`가 위반을 잡습니다. 어댑터가 레지스트리 데이터를 import하지 않아야 어댑터 번들과 선언에 기관 데이터가 섞이지 않습니다.

## 코드 규칙

- **파일**: kebab-case(`unicorn/filename-case`). 파일 하나에 주요 export 하나를 두고 파일 이름을 그 export에 맞춥니다(`create-detector.ts` → `createDetector`).
- **이름**: 함수는 역할을 드러내는 동사로 시작합니다. `create*`(새 객체·함수 생성), `define*`(타입을 붙여 그대로 반환), `get*`(키로 조회, 없으면 `null`), `find*`(조건으로 검색, 없으면 `null`), `is*`(boolean), `to*`(변환). 제네릭은 `TInstitution`·`TId`처럼 `T` 접두어와 의미 있는 이름을 씁니다. 복잡한 조건과 매직 넘버는 이름을 붙인 상수로 뺍니다.
- **함수**: 순수 함수로 작성하고 숨은 부수 효과를 두지 않습니다. 입력을 바꾸지 않습니다(`no-param-reassign`). 같은 종류의 함수는 같은 모양을 반환합니다.
- **타입**: export에는 반환 타입을 명시합니다(`explicit-module-boundary-types`). 객체 모양은 `interface`, 타입 import는 `import type`을 씁니다. `any`, non-null 단언(`!`), 불필요한 `as`를 쓰지 않습니다. 공개 타입의 필드는 `readonly`입니다.
- **없음 규칙**: 값 하나를 찾지 못하면 `null`, 목록이 비면 빈 배열, 결과의 선택 필드는 키를 생략, 판단할 수 없는 capability는 `null`입니다. 옵션·정의의 선택 필드는 `?: T | undefined`로 선언하고 `undefined`는 기본값으로 처리합니다.
- **오류**: 잘못된 옵션은 `RangeError`, 잘못된 형식의 정의는 `TypeError`를 던집니다. 메시지는 `korean-account: <대상> <조건> (received <값>)` 형식입니다(예: `korean-account: limit must be a non-negative integer or Infinity (received -1)`). 사용자 입력 문자열은 오류가 아니라 빈 결과로 처리합니다.
- **런타임**: 런타임 의존성은 0개입니다. optional peer는 `src/adapters/<lib>/`에서만 import합니다. `node:` 모듈과 DOM API는 쓰지 않습니다(`platform: "neutral"`).
- **번들 크기**: `.size-limit.json` 예산을 지킵니다. 레지스트리에서 반복되는 값은 `cms-service-presets.ts`처럼 공유 상수로 뺍니다.
- **주석**: 코드 안의 설명 주석은 "왜"가 필요한 곳에만 짧게 둡니다. 변경 이력은 주석이 아니라 changeset과 커밋에 남깁니다.

### 공개 JSDoc

공개 export(함수·타입·상수·어댑터)에는 영어 JSDoc을 다음 순서로 씁니다. 내부 헬퍼는 한 줄 요약이면 충분합니다.

1. 한 문장 요약
2. 동작: 경계 조건, 하지 않는 일, 언제 쓰는지
3. `@typeParam`, `@param`, `@returns`(없을 때 무엇을 반환하는지 포함), `@throws`
4. `@example`: 실제로 실행해 확인한 결과만 `// =>`로 적습니다.
5. `@see`: 관련 API

```ts
/**
 * Returns the top-ranked candidate from {@link detect}, or `null` when nothing matches.
 *
 * The top candidate is a hint, not proof that the account exists. Check `ambiguous` and
 * `confidence` before relying on it.
 *
 * @param input - Account number as entered; hyphens, spaces and full-width digits are accepted.
 * @param options - Same as {@link detect}.
 * @returns The best candidate, or `null` when the input has no digits or nothing matches.
 * @throws {RangeError} When `options.limit` or `options.minScore` is invalid.
 * @example
 * detectBest("3333-12-3456789")?.institution.id; // => "kakao"
 * @see {@link detect} for every candidate.
 */
```

## 테스트 규칙

- 테스트는 대상 파일 옆에 `*.spec.ts`로 둡니다. 한 모듈의 테스트가 길면 관심사별로 나눕니다(`create-detector.scoring.spec.ts`, `create-detector.routing.spec.ts`).
- 타입 테스트는 `*.types.spec.ts`에 `expectTypeOf`로 씁니다. 공유 데이터는 `*.fixtures.ts`, 벤치마크는 `*.bench.ts`입니다.
- 제목은 한국어로 동작을 설명하고, 본문은 `// Given` · `// When` · `// Then`으로 나눕니다. 표 형태의 사례는 `test.each`를 씁니다.

```ts
test("근거 없는 후보는 점수와 관계없이 low 다", () => {
  // Given
  const input = "000000000000";

  // When
  const result = detectBest(input);

  // Then
  expect(result?.confidence).toBe("low");
});
```

- 다섯 어댑터는 [`src/adapters/contract.fixtures.ts`](./src/adapters/contract.fixtures.ts)의 `describeAdapterContract`로 같은 통과·거부·메시지 표를 실행합니다. 어댑터 동작을 바꾸면 이 표를 먼저 고칩니다.
- 문서의 주장도 테스트합니다. `src/readme-examples.spec.ts`는 README 예제의 결과를, `src/registry-doc.spec.ts`는 `docs/registry.md`의 기관 행을, `src/registry/source-audit.spec.ts`는 PDF에서 독립적으로 옮긴 기대값을 고정합니다.
- 평가 지표(`src/builtin/evaluation.spec.ts`)와 커버리지 임계값은 래칫입니다. 낮추지 말고, 개선되면 올립니다.

## 기관 추가·수정 절차

PDF에 나열되지 않은 접두어·운영 코드는 내장 레지스트리가 아니라 [애플리케이션 보강](./docs/customization.md#책임-경계)으로 다룹니다.

1. **근거 인용**: [금융결제원 CMS 자료](https://www.cmsedi.or.kr/cms/board/workdata/cms)의 판본·페이지·표 행을 이슈나 PR에 적습니다. 기대값은 현재 코드에서 만들지 말고 원문에서 독립적으로 읽습니다.
2. **레지스트리**: `src/registry/<banks|non-banks|securities>/<id>.ts`를 고칩니다(기관당 1파일). 패턴 위에 `/** p.N … */`로 쪽수를 남기고, 서비스 열은 `cmsServices`로 옮깁니다. 새 기관이면 분류의 `index.ts`, `src/registry/institution-ids.ts`(같은 순서, `institution-ids.types.spec.ts`가 검사), export 스냅샷(`src/__snapshots__/index.spec.ts.snap`)도 갱신합니다.
3. **회귀 테스트**: `src/registry/source-audit.fixtures.ts`에 원문 기대값을, `src/builtin/detect.fixtures.ts`에 대표 입력을 추가하고, 결과가 바뀌는 입력마다 통과·거부 사례를 씁니다. 실제 계좌번호 대신 합성 번호를 씁니다.
4. **문서**: `docs/registry.md`의 표와 `docs/source-audit.md`의 판독 근거·호환 예외·미확인 항목을 갱신합니다.
5. **changeset**: 관측 결과(후보·점수·capability)가 바뀌면 0.x 동안은 minor changeset과 `docs/migration.md` 항목을 함께 씁니다.

## 검증 어댑터 추가

규칙을 새로 쓰지 않고 [`src/adapters/contract.ts`](./src/adapters/contract.ts)의 정규식·메시지·가드를 재사용합니다.

1. **구현**: `src/adapters/<lib>/{schema,index}.ts`. 가장 가까운 기존 어댑터를 따르고, 모든 export에 그 라이브러리의 안정된 공개 타입을 명시합니다(선언에 내부 제네릭이 새지 않게).
2. **계약 테스트**: `schema.spec.ts`에서 `describeAdapterContract("<lib>", { schemas, createAccountSchema, createInstitutionIdSchema, createDetectionSchema, firstIssue })`를 호출합니다.
3. **배선**: `package.json`의 `exports`·`typesVersions`·optional peer, `tsdown.config.ts` 엔트리 2곳, `.size-limit.json` 예산, `ci.yml`의 `adapter-compat` 행(하한·최신), `scripts/check-consumer.mjs`의 peer 조합과 `INFERENCE_CHECKS`.

## 이슈·PR·커밋

- **제목**: 이슈·PR·커밋 모두 [Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/) 형식의 `type(scope): 구체적인 변경`을 씁니다. 설명은 한국어로 씁니다(예: `fix(adapters): 전각 입력·비문자열 메시지 정리`). scope와 비호환 표시(`!`)는 [운영 가이드](./.github/MAINTAINING.md#제목과-본문)를 따릅니다. squash merge라 PR 제목이 main의 커밋 제목이 됩니다.
- **본문**: 요약 → 변경 및 영향 → 검증 → 관련 항목. 검증에는 실제로 실행한 명령과 결과만 씁니다. 완료하는 이슈는 `Closes #번호`, 일부 작업은 `Refs #번호`입니다.
- **브랜치**: `feat/…`, `fix/…`, `docs/…`, `chore/…` 등 type과 같은 접두어를 씁니다.
- **changeset**: 사용자에게 보이는 변경(API·타입·결과·메시지·패키지 구성)은 `pnpm changeset`으로 한국어 changeset을 추가합니다. 내부 리팩터·테스트·CI·문서만 바꾸면 생략합니다.

### 쌓인 PR(stacked PR)

큰 변경은 리뷰할 수 있는 단위로 나눠 [`gh stack`](https://github.com/github/gh-stack)으로 쌓습니다. 기반이 되는 변경(타입·엔진)을 아래에, 그 위에 의존하는 변경(레지스트리·어댑터·문서)을 위에 둡니다. CI는 각 PR을 자기 base 브랜치 기준으로 실행합니다.

```bash
gh stack init fix/core-evidence     # 첫 브랜치(main 기준)
git add src/core && git commit -m "fix(core): 근거 없는 후보를 low로 제한"
gh stack add fix/registry-services  # 위에 쌓을 다음 브랜치
git add src/registry && git commit -m "fix(registry): PDF 서비스 열 반영"
gh stack submit --auto              # 브랜치 push와 PR 생성(draft)
gh stack view                       # 스택 상태 확인

# 아래 브랜치를 고친 뒤 위 브랜치를 다시 쌓기
gh stack down && git commit -am "…" && gh stack rebase --upstack && gh stack push
# 아래 PR이 머지된 뒤 동기화
gh stack sync --prune
```

PR마다 제목·changeset 규칙은 같습니다. 스택이 필요 없는 작은 변경은 PR 하나로 충분합니다.

## 문서

- 상세 문서는 [`docs/`](./docs/README.md)에, 이미지는 `docs/assets/`에 둡니다.
- npm에 포함되는 `README.md`·`README.en.md`는 저장소 파일을 절대 GitHub URL로 연결합니다(`pnpm check:package`가 검사). 그 밖의 문서는 상대 링크를 씁니다.
- [`DOCS.md`](./DOCS.md)는 예전 앵커를 새 위치로 잇는 안내 파일입니다. 그 파일이 가리키는 제목을 바꾸면 링크도 함께 고칩니다.
- 문서의 예제 결과는 `pnpm build` 후 `dist`로 실행해 확인한 값만 적습니다.

## 릴리스

메인테이너가 진행합니다. 절차는 [저장소 운영 가이드](./.github/MAINTAINING.md#버전태그릴리스)에 있습니다.

## 행동 강령

[Contributor Covenant 2.1](./CODE_OF_CONDUCT.md)을 따릅니다.

## English summary

- **Toolchain**: Node.js 26.13.1 (`.nvmrc`) and pnpm 12.18.0 (`packageManager`) for development; the published library supports Node.js 22.12+. Run `pnpm install` then `pnpm check`.
- **Checks**: `pnpm build && pnpm check:dist` for the package; `pnpm check:consumer` installs the packed tarball next to 0.4.1 with every peer at its floor and latest version, and checks exports, top candidates, adapter behaviour, drop-in types and inferred adapter types.
- **Layers**: `types ← constants ← core ← registry (core/define only) ← builtin ← index`; adapters import only types, constants and `registry/institution-ids`. Enforced by oxlint (`no-restricted-imports`, `import/no-cycle`).
- **Code**: kebab-case files with one main export; `create*/define*/get*/find*/is*/to*` verbs; `T*` generics; pure functions with explicit return types; `null` for "not found", empty arrays for empty lists, omitted optional result fields, `undefined` options mean the default; errors read `korean-account: <subject> <condition> (received <value>)`. Public exports carry English JSDoc with verified examples.
- **Tests**: colocated `*.spec.ts` with Korean titles and `// Given` / `// When` / `// Then`; type tests in `*.types.spec.ts`; adapters share `src/adapters/contract.fixtures.ts`.
- **Registry changes**: cite the KFTC PDF page, edit `src/registry/<category>/<id>.ts`, add regression tests, update `docs/registry.md` and `docs/source-audit.md`.
- **PRs**: Conventional Commits titles with Korean descriptions, a changeset for user-visible changes, and `gh stack` for stacked PRs.
