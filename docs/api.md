[문서 목록](./README.md) · [빠른 시작](../README.md)

# API 레퍼런스

`korean-account`의 모든 공개 export를 설명합니다. 처음 쓴다면 [README](../README.md)의 빠른 시작을, 점수 계산의 세부는 [점수와 신뢰도](./scoring.md)를, 연동 코드는 [통합 예제](./recipes.md)를 먼저 보세요. 모든 export에는 같은 내용의 영어 JSDoc이 있어 에디터에서 바로 확인할 수 있습니다.

## 설치와 진입점

```bash
pnpm add korean-account
```

| 진입점                           | 내용                                                    | 필요한 peer               |
| -------------------------------- | ------------------------------------------------------- | ------------------------- |
| `korean-account`                 | 탐지·조회·정의 함수, 기관 레지스트리, 타입              | 없음                      |
| `korean-account/standard-schema` | [Standard Schema](https://standardschema.dev) v1 검증기 | 없음                      |
| `korean-account/zod`             | zod 스키마                                              | `zod` ^3.23.0 또는 ^4.0.0 |
| `korean-account/valibot`         | valibot 스키마                                          | `valibot` ^1.0.0          |
| `korean-account/yup`             | yup 스키마                                              | `yup` ^1.4.0              |
| `korean-account/arktype`         | arktype 타입                                            | `arktype` ^2.1.0          |

- ESM과 CommonJS를 모두 제공하고 런타임 의존성이 없습니다. Node.js 22.12 이상과 최신 브라우저에서 동작합니다.
- peer는 모두 optional입니다. 사용하는 어댑터의 라이브러리만 설치합니다.
- 패키지는 `sideEffects: false`이고 모듈 단위로 배포됩니다. `detect`·`detectBest`·`getInstitution`·`searchInstitutions`·`pickPattern`과 `institutions` 배열은 레지스트리 전체를 번들에 넣습니다. 지원할 기관이 정해져 있으면 `createDetector([kb, shinhan])`처럼 기관 상수만 가져옵니다.

## export 목록

### `korean-account`

| 이름                                                                                               | 종류       | 용도                                                   |
| -------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------ |
| [`detect`](#detect)                                                                                | 함수       | 내장 레지스트리에서 후보를 순위대로 반환               |
| [`detectBest`](#detectbest)                                                                        | 함수       | `detect`의 1순위, 없으면 `null`                        |
| [`createDetector`](#createdetector)                                                                | 함수       | 기관 목록·가중치·규칙을 정한 detector 생성             |
| [`toDetectionPayload`](#todetectionpayload)                                                        | 함수       | 결과를 JSON으로 보낼 수 있는 `DetectionPayload`로 변환 |
| [`getInstitution`](#getinstitution)                                                                | 함수       | ID·CMS 코드로 기관 조회                                |
| [`searchInstitutions`](#searchinstitutions)                                                        | 함수       | 조건에 맞는 기관 목록                                  |
| [`pickPattern`](#pickpattern)                                                                      | 함수       | 기관의 패턴 하나를 자릿수·종류로 선택                  |
| [`defineInstitution`](#defineinstitution)                                                          | 함수       | 커스텀 기관 선언(리터럴 타입 유지)                     |
| [`defineSubject`](#definesubject)                                                                  | 함수       | 과목 코드 선언                                         |
| [`defineBranchRule`](#definebranchrule)                                                            | 함수       | 분기 규칙 선언                                         |
| [`cmsServices`](#cmsservices)                                                                      | 함수       | PDF 서비스 4열 레코드 생성                             |
| [`patternTemplate`](#patterntemplate)                                                              | 함수       | 계좌 템플릿 문자열 검증                                |
| [`prevalence`](#prevalence)                                                                        | 함수       | 동점 후보의 순서를 정하는 사전확률                     |
| [`normalizeAccount`](#normalizeaccount)                                                            | 함수       | 입력에서 숫자만 추출(전각 숫자 포함)                   |
| [`formatAccount`](#formataccount)                                                                  | 함수       | 템플릿대로 하이픈 삽입                                 |
| [`extractIdentifier`](#extractidentifier)                                                          | 함수       | 식별 자리 숫자 추출                                    |
| [`extractSubject`](#extractsubject)                                                                | 함수       | 과목 자리의 `Subject` 조회                             |
| [`accountKindLabels`, `subjectCategoryLabels`](#라벨)                                              | 객체       | 계좌 종류·과목 분류의 한국어 표시명                    |
| [`ACCOUNT_KINDS`, `SUBJECT_CATEGORIES`, `INSTITUTION_CATEGORIES`, `CONFIDENCE_LEVELS`](#상수-배열) | 상수 배열  | 리터럴 목록(런타임 검사·반복)                          |
| [`institutions`, `banks`, `nonBanks`, `securities`](#레지스트리-export)                            | 기관 배열  | 내장 레지스트리 전체와 분류별 목록                     |
| [`kb`, `shinhan`, `toss` 등 57개](#레지스트리-export)                                              | 기관 상수  | 기관별 정의, 트리 셰이킹 단위                          |
| [분기 규칙 상수 8개, `scoreToConfidence`, `normalizeSubject`](#deprecated)                         | deprecated | 1.0에서 제거                                           |

| 타입                                                                                            | 용도                                                                |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `DetectionResult`, `DetectionCapabilities`, `ResolvedSubject`, `Confidence`                     | [탐지 결과](#결과)                                                  |
| `DetectionPayload`                                                                              | [직렬화된 결과](#todetectionpayload)                                |
| `DetectOptions`, `CreateDetectorOptions`, `ExtendDetectorOptions`, `ScoringWeights`, `Detector` | [detector 설정](#createdetector)                                    |
| `GlobalRule`, `CheckDigitVerifier`                                                              | [detector 수준 규칙](#additionalrule-globalrule-checkdigitverifier) |
| `Institution`, `InstitutionCategory`, `InstitutionIdInput`                                      | [기관](#defineinstitution)                                          |
| `AccountPattern`, `AccountKind`, `DigitSpan`, `PatternTemplate`, `PatternToken`                 | [패턴](#accountpattern)                                             |
| `Subject`, `SubjectCategory`, `CmsServices`, `CmsService`                                       | [과목·서비스 열](#definesubject)                                    |
| `BranchRule`, `BranchRuleResult`, `AdditionalRule`                                              | [패턴 규칙](#definebranchrule)                                      |
| `InstitutionId`, `InstitutionCode`, `InstitutionIdByCategory`, `RegisteredInstitution`          | [내장 레지스트리의 리터럴 타입](#레지스트리-export)                 |
| `SearchInstitutionsFilter`, `PickPatternFilter`                                                 | [조회 필터](#조회)                                                  |

### `korean-account/<adapter>`

다섯 어댑터(`standard-schema`·`zod`·`valibot`·`yup`·`arktype`)가 같은 이름과 같은 규칙을 내보냅니다. 스키마 타입만 라이브러리마다 다릅니다. 자세한 내용은 [검증 어댑터](#검증-어댑터)에 있습니다.

| 이름                                                                             | 종류   | 용도                                                           |
| -------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| `accountSchema`                                                                  | 스키마 | 계좌번호 입력 형식                                             |
| `createAccountSchema`                                                            | 함수   | 메시지를 바꾼 `accountSchema`                                  |
| `institutionIdSchema`                                                            | 스키마 | 내장 기관 ID(`InstitutionId`)                                  |
| `createInstitutionIdSchema`                                                      | 함수   | 주어진 ID만 허용하는 스키마                                    |
| `accountKindSchema`, `subjectCategorySchema`                                     | 스키마 | `AccountKind`, `SubjectCategory` 리터럴                        |
| `detectionSchema`                                                                | 스키마 | 내장 기관의 `DetectionPayload`                                 |
| `createDetectionSchema`                                                          | 함수   | 주어진 기관 ID의 `DetectionPayload`                            |
| `AccountMessages`, `DetectionMessages`, `ValidationMessages`, `MessageOverrides` | 타입   | 메시지 키와 덮어쓰기                                           |
| `AccountSchemaOptions`, `InstitutionIdSchemaOptions`, `DetectionSchemaOptions`   | 타입   | 팩토리 옵션                                                    |
| `DetectionPayload`                                                               | 타입   | `DetectionPayload<InstitutionId>`, 즉 `detectionSchema`의 출력 |
| `StandardSchemaV1`                                                               | 타입   | `standard-schema`만. Standard Schema v1 인터페이스             |

## 탐지

### `detect`

```ts
function detect(
  input: string,
  options?: DetectOptions<InstitutionId>,
): readonly DetectionResult<RegisteredInstitution>[];
```

내장 레지스트리 전체에서 `input`이 속할 수 있는 기관을 순위대로 반환합니다.

- 입력은 [`normalizeAccount`](#normalizeaccount)를 거칩니다. 하이픈·공백·전각 숫자를 그대로 넣어도 됩니다.
- 기본값은 입력 자릿수와 1자리 이내로 차이 나는 패턴이 있는 기관만 채점합니다. 그래서 후보는 번호를 거의 다 입력했을 때 나타납니다. `partial: true`면 더 긴 형식도 채점해 입력 중인 앞자리로 후보를 제안합니다.
- 결과에는 기관마다 후보가 하나만 나옵니다. 분기 규칙으로 다른 기관의 패턴이 같은 기관으로 재배정되면, 옵션으로 거른 뒤 남은 해석 중 순위가 가장 높은 것을 씁니다. 그래서 `limit`은 기관 수를 셉니다.
- 정렬과 등급은 [신뢰도와 모호성](#신뢰도와-모호성)을 따릅니다.

숫자가 없거나, 일치하는 패턴이 없거나, 옵션이 모두 걸러 내면 빈 배열입니다. `options.limit`·`options.minScore`가 잘못되면 입력과 관계없이 `RangeError`를 던집니다.

```ts
import { detect } from "korean-account";

detect("110-436-387740").map((result) => [
  result.institution.id,
  result.confidence,
  result.ambiguous,
]);
// => [["shinhan", "high", true], ["post", "high", true], ["shinhyup", "high", true]]

detect("110-436-387740", { categories: ["bank"] }).map((result) => result.institution.id);
// => ["shinhan"] (우체국·신협을 숨겨도 ambiguous는 true)

detect("no digits"); // => []
```

### `detectBest`

```ts
function detectBest(
  input: string,
  options?: DetectOptions<InstitutionId>,
): DetectionResult<RegisteredInstitution> | null;
```

`detect(input, options)`의 1순위를 반환하고, 후보가 없으면 `null`을 반환합니다. `limit: 0`이면 항상 `null`입니다. 1순위는 힌트일 뿐이므로 `ambiguous`와 `confidence`를 확인한 뒤 사용합니다([권장 흐름](./recipes.md#후보-제시--사용자-확정--유료-실명조회)).

```ts
import { detectBest } from "korean-account";

const best = detectBest("110-436-387740");
best?.institution.id; // => "shinhan"
best?.ambiguous; // => true: 우체국·신협도 같은 high 등급
detectBest("301-0123-4567-11")?.institution.id; // => "nh" (NH농협은행)
detectBest("352-0123-4567-13")?.institution.id; // => "nh-coop" (지역 농·축협)
detectBest("12"); // => null
```

### `DetectOptions`

`detect`, `detectBest`, `Detector.detect`의 두 번째 인자입니다.

| 옵션         | 타입                             | 기본값      | 동작                                                                                                                                                        |
| ------------ | -------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `categories` | `readonly InstitutionCategory[]` | 거르지 않음 | 결과 기관의 분류가 목록에 있는 후보만 남김                                                                                                                  |
| `kinds`      | `readonly AccountKind[]`         | 거르지 않음 | 결과 `kind`가 목록에 있는 후보만 남김                                                                                                                       |
| `include`    | `readonly InstitutionIdInput[]`  | 거르지 않음 | 이 ID의 후보만 남김                                                                                                                                         |
| `exclude`    | `readonly InstitutionIdInput[]`  | 거르지 않음 | 이 ID의 후보를 뺌. `include`보다 우선                                                                                                                       |
| `limit`      | `number`                         | `5`         | 정렬 후 최대 개수(기관 수). 0 이상의 정수나 `Infinity`가 아니면 `RangeError`                                                                                |
| `minScore`   | `number`                         | `1`         | 이 점수 미만인 후보를 뺌. `NaN`이면 `RangeError`                                                                                                            |
| `partial`    | `boolean`                        | `false`     | 입력이 아직 짧을 수 있다고 보고 더 긴 형식도 채점함. 앞자리 일치는 식별자·과목 점수의 절반만 받아 항상 `low`이므로 제안으로만 씀. 완성된 번호의 결과는 같음 |

- 필터는 분기 규칙이 기관과 종류를 바꾼 **뒤의** 결과에 적용합니다.
- `undefined`는 기본값과 같습니다. 빈 배열(`categories: []`, `kinds: []`, `include: []`)은 아무 후보도 남기지 않습니다.
- 필터와 `limit`은 `ambiguous`를 바꾸지 않습니다. 숨긴 기관도 모호성 판정에는 들어갑니다.
- `include`·`exclude`는 detector의 기관 ID를 자동완성하지만 임의의 문자열도 받습니다(`InstitutionIdInput`).

### `createDetector`

```ts
function createDetector<TInstitution extends Institution>(
  institutions: readonly TInstitution[],
  options?: CreateDetectorOptions<TInstitution>,
): Detector<TInstitution>;
```

주어진 기관만 채점하는 불변 detector를 만듭니다. 기관과 가중치는 생성 시 한 번 색인하므로 모듈 최상위에서 만들어 재사용합니다. 기관 상수를 직접 넘기면 번들러가 나머지 레지스트리를 제거하고, 결과의 `institution.id` 타입도 넘긴 ID로 좁혀집니다. `scoring` 가중치가 0 이상의 유한한 수가 아니면 `RangeError`를 던집니다.

```ts
import { createDetector, institutions, kb, shinhan, toss } from "korean-account";

const detector = createDetector([kb, shinhan, toss]);
detector.detect("110-436-387740")[0]?.institution.id;
// => "shinhan" (타입: "kb" | "shinhan" | "toss")

const tuned = createDetector(institutions, { scoring: { identifierMatch: 6 } });
tuned.detect("110-436-387740").map((result) => [result.institution.id, result.score]);
// => [["shinhan", 11], ["post", 11], ["shinhyup", 11]]
```

#### `CreateDetectorOptions`

| 옵션                  | 타입                                   | 기본값 | 동작                                                                                     |
| --------------------- | -------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `scoring`             | `ScoringWeights`                       | `{}`   | 가중치를 키별로 덮어씀                                                                   |
| `globalRules`         | `readonly GlobalRule[]`                | `[]`   | 패턴이 일치한 기관마다 실행하고, `true`를 반환한 규칙마다 `scoring.globalRule`을 더함    |
| `checkDigitVerifiers` | `{ [id: string]: CheckDigitVerifier }` | `{}`   | 기관 ID별 검증번호 함수. 결과는 `capabilities.validatedCheckDigit`. 내장 verifier는 없음 |

#### `ScoringWeights`

| 키                | 기본값 | 가산 조건                                                               |
| ----------------- | -----: | ----------------------------------------------------------------------- |
| `lengthExact`     |      3 | 입력 자릿수가 템플릿 자릿수와 같음                                      |
| `lengthNear`      |      1 | 입력 자릿수가 템플릿과 1자리 차이                                       |
| `identifierMatch` |      4 | 식별 자리의 값이 `identifiers`나 `identifierRange`에 들어감             |
| `subjectMatch`    |      3 | 과목 자리의 값이 `subjects`의 `code`와 같음                             |
| `additionalRule`  |      1 | `additionalRules` 하나를 통과할 때마다(입력이 템플릿과 1자리 이내일 때) |
| `globalRule`      |      1 | `GlobalRule` 하나가 `true`를 반환할 때마다                              |
| `branchRuleMatch` |      2 | 분기 규칙이 조정을 반환했고 후보에 근거가 있음                          |
| `kindNewBonus`    |      0 | `kind: "new"` 패턴                                                      |

식별자·과목 점수에는 코드 길이에 따른 가산(코드 1자리 초과분마다 1점)이 붙고, 입력이 템플릿보다 짧으면 반으로 내림합니다. 식별 자리와 과목 자리가 겹치면 둘 중 큰 점수 하나만 더합니다. 계산 예시는 [점수와 신뢰도](./scoring.md)에 있습니다. 신뢰도 기준(7·4)은 고정이므로 가중치를 키우면 같은 입력이 더 높은 등급으로 이동합니다.

#### `Detector`

| 멤버                      | 설명                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| `institutions`            | detector가 채점하는 기관 배열                                                              |
| `detect(input, options?)` | 이 기관들에 대해 [`detect`](#detect)와 같이 동작. `include`·`exclude`가 이 ID를 자동완성   |
| `extend(options)`         | 기관을 추가·교체하고 규칙·가중치·verifier를 병합한 **새** detector                         |
| `remove(target)`          | ID 하나 또는 술어 `(institution) => boolean`으로 기관을 뺀 **새** detector. 없는 ID는 무시 |

`extend`는 `ExtendDetectorOptions`를 받습니다. 원래 detector는 바뀌지 않습니다.

| 필드                  | 병합 방식                                          |
| --------------------- | -------------------------------------------------- |
| `institutions`        | 같은 `id`의 기관은 통째로 교체하고, 새 `id`는 추가 |
| `globalRules`         | 기존 규칙 뒤에 이어 붙임                           |
| `scoring`             | 키별로 덮어씀(검증은 `createDetector`와 같음)      |
| `checkDigitVerifiers` | 기관 ID별로 덮어씀                                 |

detector는 넘겨받은 기관 객체를 복사하거나 동결하지 않습니다. 넘긴 뒤에는 읽기 전용으로 취급합니다. 확장 예제는 [커스텀 detector](./customization.md)에 있습니다.

## 결과

### `DetectionResult`

| 필드             | 타입                            | 설명                                                                                                      |
| ---------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `institution`    | `TInstitution`                  | 후보 기관. 분기 규칙이 재배정했으면 재배정된 기관                                                         |
| `matchedPattern` | `AccountPattern`                | 일치한 패턴. 재배정됐으면 원래 기관의 패턴입니다. 근거 있는 등급 → 점수 → 선언 순서로 고릅니다            |
| `kind`           | `AccountKind`                   | 분기 규칙의 `kindOverride`, 없으면 `matchedPattern.kind`                                                  |
| `subject`        | `ResolvedSubject` (선택)        | 과목 코드가 일치할 때만 있음. 없으면 키 자체가 없음                                                       |
| `formatted`      | `string`                        | `matchedPattern.template`대로 묶은 입력. 짧은 입력은 마지막 숫자에서 끝나고, 넘치는 숫자는 묶지 않고 붙음 |
| `score`          | `number`                        | 받은 가중치의 합. 같은 detector의 결과끼리만 비교                                                         |
| `confidence`     | `"high"` · `"medium"` · `"low"` | [신뢰도](#신뢰도와-모호성)                                                                                |
| `ambiguous`      | `boolean`                       | 같은 신뢰도 등급에 다른 기관의 후보가 있음                                                                |
| `capabilities`   | `DetectionCapabilities`         | 일치한 형식의 [정적 서비스 정보](#detectioncapabilities)                                                  |

```ts
detectBest("110-436-387740");
// => {
//   institution: shinhan, matchedPattern: { template: "XXX-XXX-XXXXXX", ... }, kind: "new",
//   subject: { code: "110", category: "savings", label: "저축예금", allowsWithdrawal: true, virtual: false },
//   formatted: "110-436-387740", score: 9, confidence: "high", ambiguous: true,
//   capabilities: {
//     allowsWithdrawal: true, virtual: false, validatedCheckDigit: null,
//     services: { virtualAccount: false, directDebit: true, directCredit: true, additionalServices: true },
//   },
// }
```

결과는 번호 체계상 가능한 후보이며 계좌의 실재·예금주·입력 완료를 보장하지 않습니다.

### `ResolvedSubject`

`DetectionResult.subject`의 타입입니다. 레지스트리의 [`Subject`](#definesubject)에 기본값을 채운 형태입니다.

| 필드                                                    | 값                                                               |
| ------------------------------------------------------- | ---------------------------------------------------------------- |
| `code`, `category`, `services`, `effectiveFrom`, `note` | 선언한 값 그대로                                                 |
| `label`                                                 | 선언한 `label`, 없으면 `subjectCategoryLabels[category]`         |
| `allowsWithdrawal`                                      | `capabilities.allowsWithdrawal`과 항상 같은 값(결정 순서는 아래) |
| `virtual`                                               | 과목의 `virtual`, 없으면 `false`                                 |

### `DetectionCapabilities`

| 필드                  | 타입                   | 설명                                                                                                          |
| --------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `allowsWithdrawal`    | `boolean`              | CMS 출금이체(자동이체 출금)를 등록할 수 있는 형식인지. 결정 순서는 아래                                       |
| `virtual`             | `boolean`              | 이 계좌 자체가 가상계좌인지. 분기 규칙의 `virtualOverride`, 없으면 과목의 `virtual` 또는 `kind === "virtual"` |
| `validatedCheckDigit` | `boolean` · `null`     | 등록한 `CheckDigitVerifier`의 결과. verifier가 없거나 패턴이 `validatesCheckDigit: false`면 `null`            |
| `services`            | `CmsServices` · `null` | 패턴의 PDF 서비스 4열에 과목의 예외를 적용한 값. 패턴에 `services`가 없으면 `null`                            |

`allowsWithdrawal`은 다음 순서로 정합니다.

1. 패턴에 `services`가 있으면(내장 패턴은 하나은행 구 외환 14자리를 빼고 모두 해당) 과목의 `allowsWithdrawal` → 과목의 `services.directDebit` → 패턴의 `services.directDebit` 순으로 처음 정의된 값을 씁니다. 가상계좌라도 PDF 출금이체 열이 ○면 `true`입니다.
2. 패턴에 `services`가 없으면 종류가 상한입니다. 과목의 `allowsWithdrawal` → 과목의 `services.directDebit` → `true` 순으로 처음 정의된 값이 `true`이고, `kind`가 `virtual`·`incoming-only`·`lifetime`이 아니고, `capabilities.virtual`이 `false`일 때만 `true`입니다. 과목은 이 규칙을 좁힐 수만 있습니다.

`services.virtualAccount`는 "이 형식으로 가상계좌를 발급할 수 있다"는 PDF 열이고, `capabilities.virtual`은 "이 계좌가 가상계좌다"라는 판단입니다. 둘은 다를 수 있습니다.

```ts
detectBest("123456-64-12345-1")?.capabilities; // 농협은행 가상계좌(과목 64)
// => { allowsWithdrawal: true, virtual: true, validatedCheckDigit: null,
//      services: { virtualAccount: true, directDebit: true, directCredit: false, additionalServices: false } }

detectBest("1712-3456-7890")?.capabilities.allowsWithdrawal; // => false (토스뱅크 가상계좌)
detectBest("117-123456-12345")?.capabilities.services; // => null (하나은행 구 외환 14자리)
```

capability는 PDF 표의 정적 규칙입니다. 개별 계좌나 은행의 실제 거래 가능 여부를 보장하지 않습니다.

### 신뢰도와 모호성

| `confidence` | 조건                                           |
| ------------ | ---------------------------------------------- |
| `"high"`     | 점수 7 이상이고 근거가 있음                    |
| `"medium"`   | 점수 4 이상 7 미만이고 근거가 있음             |
| `"low"`      | 점수 4 미만이거나, 점수와 관계없이 근거가 없음 |

**근거**는 식별자 일치, 과목 코드 일치, `isFallback`이 아닌 분기 규칙 조정 중 하나입니다. 길이·`additionalRules`·`globalRules`만 맞은 후보는 점수가 높아도 `"low"`입니다. 1순위가 `"high"`나 `"medium"`이면 `"low"` 후보는 목록에서 빠집니다.

`ambiguous`는 **다른 기관**이 같은 `confidence` 등급으로 입력과 맞으면 `true`입니다. 기관마다 가장 높은 등급 하나로 셉니다. 옵션(`categories`·`kinds`·`include`·`exclude`·`minScore`·`limit`)으로 숨긴 기관도 셉니다. 앱이 신한은행만 지원해도 `110-436-387740`이 우체국 계좌일 수 있다는 사실은 그대로이기 때문입니다.

후보는 다음 순서로 정렬합니다(모두 내림차순).

1. 신뢰도 등급: 근거 없는 `"low"` 후보는 점수가 높아도 근거 있는 후보를 앞서지 못합니다.
2. 근거 유무: 같은 `"low"`끼리는 식별자·과목·분기 조건이 맞은 후보가 길이만 맞은 후보보다 앞입니다(`"high"`·`"medium"`은 항상 근거가 있음).
3. 점수
4. 사전확률 [`prevalence`](#prevalence)
5. 계좌 종류: `new` → `old` → `virtual` → `lifetime` → `incoming-only` → `merged-legacy`
6. 같은 기관의 해석이 모든 키에서 같으면 다른 기관에서 재배정된 패턴보다 그 기관 자신의 패턴

정렬 뒤 기관마다 첫 후보만 남깁니다.

입력 중인 번호도 다른 기관의 형식과 맞을 수 있습니다. 예를 들어 카카오뱅크 번호를 12자리까지 입력한 `333312345678`은 농협은행 구계좌의 `"high"` 후보(모호하지 않음)가 1순위입니다. 다음 기준으로 UI를 정하고, 유료 실명조회는 사용자가 기관을 확정한 뒤에만 호출합니다.

| 1순위의 상태                              | 권장 처리                                  |
| ----------------------------------------- | ------------------------------------------ |
| `"high"`이고 `ambiguous: false`           | 미리 선택하되 사용자가 바꿀 수 있게 함     |
| `"medium"`이고 `ambiguous: false`         | 제안으로 표시하고 사용자가 확인            |
| `"high"`·`"medium"`이고 `ambiguous: true` | 같은 등급의 후보를 보여 주고 사용자가 고름 |
| `"low"`이거나 결과 없음                   | 기관 목록에서 직접 선택                    |

구현 예는 [후보 제시 → 사용자 확정 → 유료 실명조회](./recipes.md#후보-제시--사용자-확정--유료-실명조회)에, 점수 계산과 평가 지표는 [점수와 신뢰도](./scoring.md)에 있습니다.

### 없음과 오류 규칙

라이브러리 전체에 같은 규칙을 적용합니다.

| 상황                         | 규칙                                                                               | 해당 API                                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 값 하나를 찾지 못함          | `null`                                                                             | `detectBest`, `getInstitution`(문자열 인자), `pickPattern`, `extractIdentifier`, `extractSubject`                                                  |
| 목록이 비어 있음             | 빈 배열                                                                            | `detect`, `Detector.detect`, `searchInstitutions`                                                                                                  |
| 결과의 선택 필드가 없음      | 키를 생략(`undefined` 값으로 두지 않음)                                            | `DetectionResult.subject`, `DetectionPayload.subject`                                                                                              |
| capability를 판단할 수 없음  | `null`                                                                             | `capabilities.validatedCheckDigit`, `capabilities.services`                                                                                        |
| 옵션·정의 필드가 `undefined` | 기본값(필드를 생략한 것과 같음)                                                    | `DetectOptions`, `CreateDetectorOptions`, `ScoringWeights`, `Institution`·`AccountPattern`·`Subject`·`BranchRuleResult`의 선택 필드, 어댑터 메시지 |
| 잘못된 옵션·정의             | `RangeError`·`TypeError`, 메시지는 `korean-account: <대상> <조건> (received <값>)` | `limit`, `minScore`, `scoring.*`(`RangeError`), `patternTemplate`(`TypeError`)                                                                     |

입력 문자열은 오류가 되지 않습니다. 숫자가 없으면 빈 결과이고, `normalizeAccount`는 문자열이 아닌 값에 `""`를 반환합니다. 과목 유무는 `"subject" in result`가 아니라 `result.subject !== undefined`로 확인합니다.

```ts
detect("110-436-387740", { limit: -1 });
// throws RangeError: korean-account: limit must be a non-negative integer or Infinity (received -1)
```

### `toDetectionPayload`

```ts
function toDetectionPayload<TInstitution extends Institution>(
  result: DetectionResult<TInstitution>,
): DetectionPayload<TInstitution["id"]>;
```

결과를 JSON으로 안전하게 보낼 수 있는 새 객체로 바꿉니다. 함수를 담을 수 있는 `institution`과 `matchedPattern`은 `institutionId`로 대체하고, `subject`는 `code`·`category`·`label`만 남깁니다. 원본은 바꾸지 않습니다. 모든 어댑터의 `detectionSchema`가 이 모양을 그대로 통과시킵니다.

```ts
import { detectBest, toDetectionPayload } from "korean-account";

const best = detectBest("3333-12-3456789");
if (best !== null) toDetectionPayload(best);
// => { institutionId: "kakao", kind: "new", score: 10, confidence: "high", ambiguous: false,
//      formatted: "3333-12-3456789",
//      capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: null,
//        services: { virtualAccount: true, directDebit: true, directCredit: true, additionalServices: true } } }
```

`DetectionPayload<TId>`의 필드는 다음과 같습니다.

| 필드            | 타입                                                            | 원본·비고                                                         |
| --------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| `institutionId` | `TId`                                                           | `institution.id`                                                  |
| `kind`          | `AccountKind`                                                   | `kind`                                                            |
| `subject`       | `{ code, category, label? }` (선택)                             | 결과에 `subject`가 있을 때만                                      |
| `score`         | `number`                                                        | `score`. 스키마는 0 이상의 유한한 수만 허용                       |
| `confidence`    | `Confidence`                                                    | `confidence`                                                      |
| `ambiguous`     | `boolean` (선택)                                                | 항상 채움. 이 필드가 없는 payload도 스키마를 통과                 |
| `formatted`     | `string`                                                        | `formatted`                                                       |
| `capabilities`  | `{ allowsWithdrawal, virtual, validatedCheckDigit, services? }` | `capabilities` 복사. `services`는 항상 채우지만 스키마에서는 선택 |

스키마는 탐지를 다시 하지 않습니다. 서버가 기관을 신뢰해야 한다면 계좌번호로 `detect`를 직접 호출합니다([서버에서 탐지 결과 검증](./recipes.md#서버에서-탐지-결과-검증)).

## 조회

### `getInstitution`

```ts
function getInstitution<TId extends InstitutionId>(
  id: TId,
): Extract<RegisteredInstitution, { id: TId }>;
function getInstitution<TCode extends InstitutionCode>(
  code: TCode,
): Extract<RegisteredInstitution, { code: TCode }>;
function getInstitution(idOrCode: string): Institution | null;
```

내장 기관을 ID나 CMS 참가기관 코드로 찾습니다.

- ID를 코드보다 먼저 찾습니다. 코드는 대표 `code`와 합병으로 흡수한 `aliasCodes`를 찾고, `commonCode`(표준은행코드)는 찾지 않습니다.
- 대소문자를 구분하는 정확 일치입니다.
- 등록된 ID나 대표 코드를 리터럴로 넘기면 반환 타입이 그 기관으로 좁혀지고 `null`이 빠집니다. 그 밖의 문자열은 `Institution | null`입니다.

```ts
import { getInstitution } from "korean-account";

getInstitution("shinhan").code; // => "088" (타입도 "088")
getInstitution("003").id; // => "ibk"
getInstitution("021")?.id; // => "shinhan" (aliasCodes)
getInstitution("081").id; // => "hana-securities-cma" (하나은행의 commonCode가 아니라 하나증권 CMA의 CMS 코드)
getInstitution("SHINHAN"); // => null
```

표준은행코드로 동작하는 시스템(예: 실명조회 API)에는 `institution.commonCode ?? institution.code`를 넘깁니다. 현재 두 코드가 다른 기관은 하나은행(`005` / `081`)뿐입니다. 자세한 내용은 [기관 데이터](./registry.md#6-kftc-표준은행코드-vs-cms-참가기관-코드)에 있습니다.

### `searchInstitutions`

```ts
function searchInstitutions<const TCategory extends InstitutionCategory = InstitutionCategory>(
  filter?: SearchInstitutionsFilter<TCategory>,
): readonly Extract<RegisteredInstitution, { category: TCategory }>[];
```

모든 조건에 맞는 내장 기관을 레지스트리 순서로 반환합니다. 기관 선택 UI나 `createDetector`에 넘길 목록을 만들 때 씁니다.

| 필드         | 동작                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| `categories` | 이 분류의 기관만. 결과 타입이 그 분류로 좁혀지고 `include`·`exclude`도 그 분류의 ID만 받음 |
| `kinds`      | 이 종류의 패턴이 하나라도 있는 기관만                                                      |
| `hasSubject` | `true`면 과목 코드를 선언한 패턴이 있는 기관만. `false`는 거르지 않음                      |
| `include`    | 이 ID만. 결과는 넘긴 순서가 아니라 레지스트리 순서                                         |
| `exclude`    | 이 ID를 뺌. `include`보다 우선                                                             |

생략하거나 `undefined`인 필드는 거르지 않고, 빈 배열은 아무것도 남기지 않습니다.

```ts
import { searchInstitutions } from "korean-account";

const bankList = searchInstitutions({ categories: ["bank"], exclude: ["hsbc"] });
bankList[0]?.category; // => "bank" (타입도 "bank")

searchInstitutions({ include: ["nh", "kb"] }).map((institution) => institution.id); // => ["kb", "nh"]
searchInstitutions({ kinds: ["lifetime"] }).map((institution) => institution.id); // => ["ibk", "kb"]

// @ts-expect-error "kiwoom"은 증권사라 bank 분류의 ID가 아님
searchInstitutions({ categories: ["bank"], include: ["kiwoom"] });
```

### `pickPattern`

```ts
function pickPattern(
  institutionId: InstitutionIdInput<InstitutionId>,
  filter?: PickPatternFilter, // { kind?: AccountKind; length?: number }
): AccountPattern | null;
```

내장 기관의 패턴 중 조건에 맞는 첫 패턴을 선언 순서대로 찾습니다. `institutionId`는 `getInstitution`처럼 ID나 CMS 코드를 받습니다. `length`는 하이픈을 뺀 템플릿 자릿수이고, 생략하거나 `undefined`인 조건은 거르지 않습니다. 기관이 없거나 맞는 패턴이 없으면 `null`입니다.

템플릿·식별 자리·과목 자리를 읽어 [`formatAccount`](#formataccount)나 [`extractSubject`](#extractsubject)에 넘길 때, 또는 라이브러리를 갱신한 뒤에도 보강하던 패턴이 그대로 있는지 테스트할 때 씁니다.

```ts
import { pickPattern } from "korean-account";

pickPattern("shinhan", { kind: "new" })?.template; // => "XXX-XXX-XXXXXX"
pickPattern("kb", { length: 14 })?.kind; // => "virtual"
pickPattern("kb", { kind: "new" }); // => null (국민은행에는 new 형식이 없음)
```

### 레지스트리 export

| export         | 내용                                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| `institutions` | 내장 기관 57개. 은행 → 비은행·금융결제원 → 증권사 순서. `detect`와 `getInstitution`이 쓰는 목록                |
| `banks`        | 은행 25개                                                                                                      |
| `nonBanks`     | 비은행 7개와 금융결제원(`kftc`, 분류 `clearing`)                                                               |
| `securities`   | 증권사 24개                                                                                                    |
| 기관 상수      | ID의 camelCase 이름(`kb`, `nhCoop`, `kbSec`, `hanaSecuritiesCma` 등). 전체 목록은 [기관 데이터](./registry.md) |

| 타입                                 | 내용                                                          |
| ------------------------------------ | ------------------------------------------------------------- |
| `InstitutionId`                      | 내장 기관 ID 57개의 유니온                                    |
| `InstitutionCode`                    | 대표 CMS 코드의 유니온(`aliasCodes`·`commonCode` 제외)        |
| `InstitutionIdByCategory<TCategory>` | 해당 분류의 기관 ID 유니온                                    |
| `RegisteredInstitution`              | 내장 기관 타입의 유니온. 각각 `id`·`code`·`category`가 리터럴 |

금융결제원(`kftc`)은 패턴이 없어 탐지 결과에 나오지 않습니다.

## 정의와 확장

커스텀 기관과 패턴을 선언하는 함수들입니다. `patternTemplate`을 빼면 모두 인자를 그대로 반환하며, 타입 검사와 리터럴 추론만 합니다. 사용 예는 [커스텀 detector](./customization.md)에 있습니다.

### `defineInstitution`

```ts
function defineInstitution<
  const TId extends string,
  const TCode extends string,
  const TCategory extends InstitutionCategory,
>(institution: Institution<TId, TCode, TCategory>): Institution<TId, TCode, TCategory>;
```

`id`·`code`·`category`를 리터럴 타입으로 유지하므로, 이 기관을 넘긴 detector의 결과도 그 ID로 좁혀집니다.

| 필드               | 타입                        | 필수 | 설명                                                                                                 |
| ------------------ | --------------------------- | :--: | ---------------------------------------------------------------------------------------------------- |
| `id`               | `string`                    |  ✓   | 고유한 kebab-case ID. `getInstitution`, `include`·`exclude`, `checkDigitVerifiers`, 분기 규칙이 참조 |
| `code`             | `string`                    |  ✓   | 대표 CMS 참가기관 코드(3자리 문자열)                                                                 |
| `commonCode`       | `string`                    |      | 표준은행코드가 `code`와 다를 때만. 생략하면 `code`와 같음                                            |
| `aliasCodes`       | `readonly string[]`         |      | `getInstitution`이 이 기관으로 찾을 추가 CMS 코드(합병 전 코드 등)                                   |
| `nameKo`           | `string`                    |  ✓   | 한국어 표시명                                                                                        |
| `nameEn`           | `string`                    |      | 영어 표시명                                                                                          |
| `category`         | `InstitutionCategory`       |  ✓   | `"bank"`·`"non-bank"`·`"securities"`·`"clearing"`                                                    |
| `aliases`          | `readonly string[]`         |  ✓   | 검색 UI용 별칭. 탐지는 읽지 않음. 없으면 `[]`                                                        |
| `userBaseMillions` | `number`                    |      | 리테일 고객 수(백만 명). [`prevalence`](#prevalence)의 입력. 생략하면 0                              |
| `priority`         | `number`                    |      | `prevalence` 계산을 통째로 대체하는 값. `userBaseMillions`를 우선 사용                               |
| `patterns`         | `readonly AccountPattern[]` |  ✓   | 계좌 형식. 패턴이 없는 기관은 탐지되지 않음                                                          |
| `successorOf`      | `readonly string[]`         |      | 이 기관에 합병된 기관의 ID. 정보용                                                                   |
| `notes`            | `string`                    |      | 관리용 메모. 탐지는 읽지 않음                                                                        |

`extend`에 같은 `id`를 넘기면 기관 전체가 교체됩니다. 기존 패턴을 유지하려면 `{ ...shinhan, patterns: [...shinhan.patterns, extra] }`처럼 펼칩니다.

### `AccountPattern`

| 필드                  | 타입                           | 설명                                                                                                                       |
| --------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `template`            | `PatternTemplate`              | 필수. `X`의 개수가 자릿수, `-`는 `formatted`의 묶음                                                                        |
| `kind`                | `AccountKind`                  | 필수. 분기 규칙이 바꾸지 않으면 결과의 `kind`                                                                              |
| `identifierPosition`  | `DigitSpan`                    | 식별 자리. `identifiers`나 `identifierRange`와 함께 있어야 점수에 반영                                                     |
| `identifiers`         | `readonly string[]`            | 식별 자리에 허용하는 값. 각각 `identifierPosition.length` 자리                                                             |
| `identifierRange`     | `{ from: number; to: number }` | 식별 자리에 허용하는 숫자 범위(양 끝 포함). `identifiers`와 둘 중 하나만 맞아도 일치                                       |
| `subjectPosition`     | `DigitSpan`                    | 과목 자리. 식별 자리와 겹치면 겹친 숫자는 한 번만 점수에 반영                                                              |
| `subjects`            | `readonly Subject[]`           | 과목 자리에서 인식할 과목. 같은 코드가 여러 번이면 첫 선언                                                                 |
| `services`            | `CmsServices`                  | PDF 서비스 4열. `capabilities.services`와 `allowsWithdrawal`의 기준. 생략하면 `services: null`이고 출금 여부는 종류로 판단 |
| `validatesCheckDigit` | `boolean`                      | `false`면 등록한 verifier를 실행하지 않고 `validatedCheckDigit: null`                                                      |
| `branchRule`          | `BranchRule`                   | 일치 후 기관·종류·가상 여부를 조정하는 [분기 규칙](#definebranchrule)                                                      |
| `additionalRules`     | `readonly AdditionalRule[]`    | 패턴을 거르고 가산하는 [술어](#additionalrule-globalrule-checkdigitverifier)                                               |
| `effectiveFrom`       | `string`                       | 형식 적용일(`YYYY-MM-DD`). 정보용이며 날짜로 거르지 않음                                                                   |
| `note`                | `string`                       | 메모. 보통 PDF 비고                                                                                                        |
| `checkDigitPosition`  | `DigitSpan`                    | **deprecated**. 사용하지 않음. verifier가 자기 자리를 알고 있음                                                            |

`DigitSpan`은 정규화한 숫자열 안의 연속 구간 `{ start, length }`입니다(`start`는 0부터). 식별자·과목 코드 없이 길이만으로 일치하는 패턴은 항상 `"low"`입니다.

### `defineSubject`

```ts
function defineSubject(subject: Subject): Subject;
```

패턴의 `subjects`에 넣을 과목(계정과목)을 선언합니다. `code`가 `subjectPosition`의 숫자와 같으면 일치하며, `scoring.subjectMatch`를 더하고 근거가 되며 `result.subject`가 됩니다.

| 필드               | 타입                                    | 설명                                                                           |
| ------------------ | --------------------------------------- | ------------------------------------------------------------------------------ |
| `code`             | `string`                                | 필수. `subjectPosition.length` 자리로 0을 채운 코드(`"01"`, `"611"`)           |
| `category`         | `SubjectCategory`                       | 필수. 과목 분류                                                                |
| `label`            | `string`                                | 표시명. 생략하면 `subjectCategoryLabels[category]`                             |
| `allowsWithdrawal` | `boolean`                               | 출금이체 가능 여부. 지정하면 `services.directDebit`보다 우선                   |
| `services`         | `{ [service in CmsService]?: boolean }` | 패턴 `services`에 대한 이 코드의 예외(PDF 비고 "(91,92 불가)" 등). 키별로 적용 |
| `virtual`          | `boolean`                               | 이 코드가 가상계좌임. 생략하면 `false`                                         |
| `effectiveFrom`    | `string`                                | 코드 적용일(`YYYY-MM-DD`). 정보용                                              |
| `note`             | `string`                                | 메모                                                                           |

```ts
import { defineSubject } from "korean-account";

const savings = defineSubject({ code: "13", category: "savings" });
const virtualOnly = defineSubject({
  code: "92",
  category: "ordinary",
  virtual: true,
  allowsWithdrawal: false,
});
```

### `cmsServices`

```ts
function cmsServices(...available: readonly CmsService[]): CmsServices;
```

PDF 표의 서비스 4열 중 ○인 열을 나열해 `CmsServices`를 만듭니다. 나열하지 않은 열은 `false`입니다. 순서와 중복은 상관없습니다.

| `CmsService`         | PDF 열            | 의미                                  |
| -------------------- | ----------------- | ------------------------------------- |
| `virtualAccount`     | 가상계좌 가능여부 | 이 형식으로 가상계좌를 발급할 수 있음 |
| `directDebit`        | 출금이체          | CMS 자동이체 출금                     |
| `directCredit`       | 입금이체          | CMS 자동이체 입금                     |
| `additionalServices` | 부가서비스        | CMS 부가서비스                        |

```ts
import { cmsServices } from "korean-account";

cmsServices("directDebit", "directCredit", "additionalServices"); // PDF 행 × ○ ○ ○
// => { virtualAccount: false, directDebit: true, directCredit: true, additionalServices: true }

cmsServices("virtualAccount", "directCredit"); // PDF 행 ○ × ○ ×
// => { virtualAccount: true, directDebit: false, directCredit: true, additionalServices: false }
```

### `defineBranchRule`

```ts
function defineBranchRule(rule: BranchRule): BranchRule;
```

패턴이 일치한 뒤 결과를 조정하는 규칙을 선언하고 `pattern.branchRule`에 붙입니다. 규칙은 기관의 최고 점수 패턴에서만 실행됩니다.

| `BranchRule` 필드  | 설명                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| `describe`         | 조건 요약(문서·디버깅용)                                                           |
| `evaluate(digits)` | 정규화한 입력 전체(길이 무관)를 받아 `BranchRuleResult`나 `null`(변경 없음)을 반환 |

| `BranchRuleResult` 필드 | 설명                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `institutionId`         | 이 ID의 기관으로 재배정. detector에 없는 ID면 원래 기관 유지                          |
| `kindOverride`          | 결과 `kind`를 대체                                                                    |
| `virtualOverride`       | `capabilities.virtual`을 대체                                                         |
| `isFallback`            | "그 외" 분기 표시. 조정은 적용되지만 근거로 세지 않고 `branchRuleMatch`도 더하지 않음 |

조정을 반환하면 후보에 근거(식별자·과목 일치 또는 이 규칙 자체)가 있을 때 `scoring.branchRuleMatch`를 더합니다. `isFallback`이 아닌 조정은 그 자체로 근거입니다. 필터(`categories`·`include` 등)는 재배정된 기관을 기준으로 적용합니다.

```ts
import { defineBranchRule } from "korean-account";

const routeToCoop = defineBranchRule({
  describe: "12자리 중 첫 자리가 2면 조합 계좌",
  evaluate: (digits) =>
    digits.length === 12 && digits[0] === "2" ? { institutionId: "my-coop" } : null,
});
```

내장 패턴에 붙은 분기 규칙은 7개입니다. `pickPattern(...)?.branchRule`로 읽을 수 있습니다.

| 기관·패턴                | 조건                              | 결과                                            |
| ------------------------ | --------------------------------- | ----------------------------------------------- |
| 수협은행 11자리          | 4·5번째 자리가 중앙회 점번호 범위 | `suhyup-coop`으로 재배정                        |
| 수협은행 12자리          | 첫 자리 2·7·9                     | `suhyup-coop`으로 재배정                        |
| 수협은행 14자리          | 앞 3자리 481–489 또는 493         | `suhyup-coop`으로 재배정                        |
| 수협중앙회 12자리        | 첫 자리가 2·7·9가 아님            | `suhyup`으로 재배정(`isFallback`)               |
| 케이뱅크 10자리          | 첫 자리 9                         | `incoming-only`                                 |
| 케이뱅크 14자리          | 첫 자리 7·9 / 그 외               | `virtual`(가상) / `incoming-only`(`isFallback`) |
| 토스뱅크 12자리 가상계좌 | 앞 2자리 17·19                    | `virtual`(가상)                                 |

### `patternTemplate`

```ts
function patternTemplate(template: string): PatternTemplate;
```

`X`(숫자 한 자리)와 `-`(묶음 구분)로 된 템플릿을 검사하고 브랜드 타입으로 반환합니다. 템플릿은 하나 이상의 `X` 묶음을 하이픈 하나로 이은 형식이어야 합니다. 비어 있거나, 다른 문자가 있거나, 하이픈이 앞뒤에 있거나 연속이면 `TypeError`를 던집니다.

```ts
import { patternTemplate } from "korean-account";

patternTemplate("XXX-XX-XXXXXX"); // => "XXX-XX-XXXXXX" (11자리, 3-2-6)
patternTemplate("xxx-xx");
// throws TypeError: korean-account: invalid pattern template "xxx-xx" (expected "X" groups joined by single "-")
```

### `AdditionalRule`, `GlobalRule`, `CheckDigitVerifier`

| 타입                 | 시그니처                                                | 등록 위치                                   | 동작                                                                                                                           |
| -------------------- | ------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `AdditionalRule`     | `(digits: string) => boolean`                           | `pattern.additionalRules`                   | 입력이 템플릿과 1자리 이내면 모두 `true`여야 패턴이 일치하고, 규칙마다 `additionalRule`을 더함. 더 짧은 입력에는 적용하지 않음 |
| `GlobalRule`         | `(digits: string, institution: Institution) => boolean` | `CreateDetectorOptions.globalRules`         | 패턴이 일치한 기관마다 분기 전 기관으로 호출. `true`면 `globalRule`을 더하고, `false`여도 후보를 지우지 않음                   |
| `CheckDigitVerifier` | `(digits: string) => boolean`                           | `CreateDetectorOptions.checkDigitVerifiers` | 분기 후 기관 ID로 찾아 실행. 결과는 `validatedCheckDigit`에만 반영되고 점수·순위는 바꾸지 않음                                 |

세 규칙 모두 정규화한 숫자 전체를 받습니다. `AdditionalRule`·`GlobalRule`은 근거가 아니므로 이것만으로는 `"medium"` 이상이 되지 않습니다. 금융결제원이 검증번호 알고리즘을 공개하지 않아 내장 verifier는 없습니다.

### `prevalence`

```ts
function prevalence(institution: Institution): number;
```

점수까지 같은 후보의 순서를 정하는 사전확률입니다. 점수나 신뢰도를 바꾸지 않으므로 더 강한 근거를 뒤집지 못합니다.

```text
prevalence = institution.priority
           ?? (institution.userBaseMillions ?? 0) × 계수(category)

계수: bank 1 · non-bank 0.6 · securities 0.25 · clearing 0
```

```ts
import { post, prevalence, shinhan } from "korean-account";

prevalence(shinhan); // => 24  (은행: 24 × 1)
prevalence(post); // => 7.8 (비은행: 13 × 0.6)
// 둘 다 "110-436-387740"에서 9점이므로 신한은행이 먼저 나옵니다.
```

내장 기관의 `userBaseMillions`는 일부 실측치와 순위를 보존하기 위한 추정치입니다. 절댓값이 아니라 서로 간의 순서만 의미가 있습니다. 실제와 다르면 이슈로 알려 주거나 `extend`로 덮어씁니다.

| 기관                                                                              | 값             | 근거                                                                                                  |
| --------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| 카카오뱅크                                                                        | 26.7           | 실측 2,670만 명([4Q25 실적발표](https://www.kakaobank.com/view/report/archive/earnings))              |
| 케이뱅크                                                                          | 15             | 실측 1,500만 명([2025.10 보도](https://www.mt.co.kr/finance/2025/10/15/2025101508515560260))          |
| 토스뱅크                                                                          | 13.8           | 실측 1,375만 명([2025.10 보도](https://www.businesspost.co.kr/BP?command=article_view&num=416146))    |
| 국민 32 · 농협은행 25 · 신한 24 · 우리 19 · 하나 18                               | 추정           | [컨슈머인사이트 주거래·거래율 순위](https://m.joseilbo.com/news/view.htm?newsid=505454)의 순서를 보존 |
| 기업 8, 지방은행 0.4–3.3, 수협 1.5, SC 2, 씨티·산업 0.5, 외국계 0.01              | 추정           | 영업권 인구와 리테일 규모                                                                             |
| 지역 농·축협 18 · 새마을금고 17 · 우체국 13 · 신협 12 · 저축은행 6 · 산림조합 0.6 | 추정           | 조합원·거래자 규모(비은행 계수 0.6 적용)                                                              |
| 수협중앙회                                                                        | `priority: 25` | 계산식 대신 고정값                                                                                    |
| 증권사 0.7–14(키움 14가 최대)                                                     | 추정           | 리테일 계좌 규모 순서(증권 계수 0.25 적용)                                                            |

## 저수준 유틸

정규화한 숫자열을 다루는 함수입니다. 위치 기반 함수(`formatAccount`·`extractIdentifier`·`extractSubject`)에는 하이픈이 섞이면 자리가 밀리므로 `normalizeAccount`의 결과를 넘깁니다.

### `normalizeAccount`

```ts
function normalizeAccount(input: string): string;
```

입력의 숫자만 순서대로 남기고 전각 숫자(`０–９`)를 ASCII로 바꿉니다. 앞자리 0은 유지하고 길이는 검사하지 않습니다. 숫자가 없거나 문자열이 아니면 `""`입니다. 모든 탐지 API가 입력에 이 함수를 적용합니다.

```ts
normalizeAccount("110-436-387740"); // => "110436387740"
normalizeAccount("１１０-436"); // => "110436"
normalizeAccount("신한 110 436 387740"); // => "110436387740"
```

### `formatAccount`

```ts
function formatAccount(digits: string, template: PatternTemplate): string;
```

템플릿대로 하이픈을 넣습니다. 입력 중 포맷팅을 위해 하이픈은 다음 숫자가 있을 때만 붙고, 템플릿보다 긴 숫자는 묶지 않고 뒤에 붙입니다. 탐지 결과의 `formatted`가 이 값입니다.

```ts
const template = patternTemplate("XXX-XXX-XXXXXX");
formatAccount("110436387740", template); // => "110-436-387740"
formatAccount("1104", template); // => "110-4"
formatAccount("1104363877401", template); // => "110-436-3877401"
```

### `extractIdentifier`

```ts
function extractIdentifier(
  digits: string,
  pattern: Pick<AccountPattern, "identifierPosition">,
): string | null;
```

`identifierPosition`의 숫자를 잘라 반환합니다. `identifiers`와 비교하지는 않습니다. 패턴에 `identifierPosition`이 없거나 입력이 구간을 다 채우지 못하면 `extractSubject`처럼 `null`입니다.

```ts
const pattern = { identifierPosition: { start: 0, length: 4 } };
extractIdentifier("3333123456789", pattern); // => "3333"
extractIdentifier("333", pattern); // => null (구간이 아직 다 채워지지 않음)
extractIdentifier("", pattern); // => null
```

### `extractSubject`

```ts
function extractSubject(
  digits: string,
  pattern: Pick<AccountPattern, "subjectPosition" | "subjects">,
): Subject | null;
```

`subjectPosition`의 숫자와 `code`가 같은 과목을 선언된 그대로(기본값을 채우지 않고) 반환합니다. 패턴에 과목이 없거나, 입력이 구간 끝까지 닿지 않거나, 일치하는 코드가 없으면 `null`입니다. 기본값이 채워진 과목이 필요하면 탐지 결과의 `subject`를 씁니다.

```ts
const shinhanNew = pickPattern("shinhan", { kind: "new" });
if (shinhanNew !== null) {
  extractSubject("110436387740", shinhanNew); // => { code: "110", category: "savings" }
  extractSubject("999436387740", shinhanNew); // => null
}
```

## 검증 어댑터

폼 입력과 직렬화된 탐지 결과를 검증하는 스키마입니다. 다섯 어댑터는 규칙과 기본 메시지를 [`src/adapters/contract.ts`](../src/adapters/contract.ts) 한 곳에서 가져오고, [`src/adapters/contract.fixtures.ts`](../src/adapters/contract.fixtures.ts)의 같은 계약 테스트를 통과합니다.

### `accountSchema`

계좌번호 입력을 검사하고, 통과하면 **입력 문자열을 그대로** 반환합니다. 숫자만 필요하면 `normalizeAccount`를 따로 적용합니다. 형식 검사일 뿐 계좌의 실재를 확인하지 않습니다. 규칙은 아래 순서로 검사합니다.

| 순서 | 메시지 키   | 조건                                                        | 기본 메시지                        |
| ---: | ----------- | ----------------------------------------------------------- | ---------------------------------- |
|    1 | `required`  | 빈 문자열이거나 문자열이 아님(`null`·`undefined`·숫자 포함) | 계좌번호를 입력해주세요.           |
|    2 | `tooLong`   | 구분자를 포함해 40자 초과                                   | 너무 긴 입력입니다.                |
|    3 | `charset`   | 숫자·공백·하이픈 외의 문자(전각 숫자·전각 하이픈은 허용)    | 숫자, 공백, 하이픈만 입력해주세요. |
|    4 | `minDigits` | 숫자 6개 미만                                               | 계좌번호 자릿수가 부족합니다.      |
|    5 | `maxDigits` | 숫자 20개 초과                                              | 계좌번호 자릿수가 너무 깁니다.     |

```ts
import { accountSchema } from "korean-account/zod";

accountSchema.parse("110-436-387740"); // => "110-436-387740"
accountSchema.parse("１１０－４３６－３８７７４０"); // => 그대로 통과(IME 전각 입력)
accountSchema.safeParse(null).error?.issues[0]?.message; // => "계좌번호를 입력해주세요."
accountSchema.safeParse("12345").error?.issues[0]?.message; // => "계좌번호 자릿수가 부족합니다."
```

### `detectionSchema`

[`toDetectionPayload`](#todetectionpayload)가 만든 `DetectionPayload`를 검사합니다. `institutionId`는 내장 기관 ID, `kind`·`confidence`·`subject.category`는 알려진 리터럴, `score`는 0 이상의 유한한 수여야 합니다. `ambiguous`와 `capabilities.services`는 선택 필드입니다. 탐지를 다시 하지 않으므로 서버가 기관을 신뢰해야 한다면 `detect`를 직접 호출합니다.

| 메시지 키         | 조건                                                     | 기본 메시지                                       |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------- |
| `institution`     | 허용하지 않은 기관 ID(`institutionIdSchema`도 사용)      | 지원하지 않는 금융기관입니다.                     |
| `accountKind`     | `AccountKind`가 아님(`accountKindSchema`도 사용)         | 지원하지 않는 계좌 종류입니다.                    |
| `subjectCategory` | `SubjectCategory`가 아님(`subjectCategorySchema`도 사용) | 지원하지 않는 과목 분류입니다.                    |
| `confidence`      | `high`·`medium`·`low`가 아님                             | confidence 는 high·medium·low 중 하나여야 합니다. |
| `finiteScore`     | `NaN`·`±Infinity`·음수                                   | score 는 0 이상의 유한한 숫자여야 합니다.         |
| `payload`         | 객체가 아님(standard-schema만)                           | detection payload 형식이 아닙니다.                |
| `invalidValue`    | 필드 타입이 틀림(standard-schema만)                      | 값의 형식이 올바르지 않습니다.                    |

standard-schema 외의 어댑터는 필드 누락과 타입 오류에 각 라이브러리의 기본 메시지를 씁니다.

### 팩토리

| 함수                                          | 반환                                            | 용도                            |
| --------------------------------------------- | ----------------------------------------------- | ------------------------------- |
| `createAccountSchema({ messages })`           | `accountSchema`와 같은 규칙                     | 계좌번호 메시지를 키별로 덮어씀 |
| `createInstitutionIdSchema(ids, { message })` | `ids`만 허용, 출력 타입은 `ids`의 유니온        | 커스텀 detector의 기관 ID       |
| `createDetectionSchema(ids, { messages })`    | `ids`만 허용하는 `DetectionPayload<TId>` 스키마 | 커스텀 detector의 탐지 결과     |

`messages`(`MessageOverrides<...>`)는 생략하거나 `undefined`인 키에 한국어 기본값을 씁니다. 그래서 i18n 함수의 결과를 걸러 내지 않고 그대로 넘길 수 있습니다. `ids`에 리터럴 배열이나 `detector.institutions.map((institution) => institution.id)`를 넘기면 `as const` 없이 출력 타입이 좁혀집니다.

```ts
import { createDetector, kb, shinhan, toDetectionPayload } from "korean-account";
import { createAccountSchema, createDetectionSchema } from "korean-account/zod";

const accountSchemaEn = createAccountSchema({
  messages: { required: "Enter an account number.", minDigits: "Too few digits." },
});
accountSchemaEn.safeParse("12345").error?.issues[0]?.message; // => "Too few digits."

const detector = createDetector([kb, shinhan]);
const payloadSchema = createDetectionSchema(
  detector.institutions.map((institution) => institution.id),
);
const [best] = detector.detect("110-436-387740");
if (best) payloadSchema.parse(toDetectionPayload(best)).institutionId; // => "shinhan" (타입: "kb" | "shinhan")
```

내장 `institutionIdSchema`·`detectionSchema`는 내장 기관 ID만 허용합니다. `extend`로 추가한 기관의 결과는 팩토리로 만든 스키마로 검증합니다.

### 어댑터별 차이

| 어댑터            | 스키마 타입               | `accountSchema` 오류 보고                                       | 비고                                            |
| ----------------- | ------------------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| `standard-schema` | `StandardSchemaV1<T>`     | 첫 오류 하나. `validate`는 동기 함수                            | 모든 필드 오류를 `path`와 함께 한 번에 보고     |
| `zod`             | `ZodString`, `ZodType<T>` | 실패한 규칙 전부(규칙 순서, `issues[0]`이 가장 앞 규칙)         |                                                 |
| `valibot`         | `v.GenericSchema<T>`      | 실패한 규칙 전부(규칙 순서)                                     |                                                 |
| `yup`             | `Schema<T>`               | 첫 오류 하나(`abortEarly: false`면 전부). strict라 형변환 안 함 | `strict: true`로 검증하면 키 정리 변환을 건너뜀 |
| `arktype`         | `Type<T>`                 | 첫 오류 하나. 중첩해도 메시지 앞에 키가 붙지 않음               |                                                 |

- `detectionSchema`는 다섯 어댑터 모두 `DetectionPayload` 밖의 키를 모든 단계에서 지우고, 선택 필드에 명시한 `undefined`를 받습니다. 문자열이 아니거나 `null`인 리터럴 값은 라이브러리 메시지(`MESSAGES`)로 거부합니다.
- zod의 `accountSchema`는 `ZodString`이므로 zod 3·4 모두 `z.input`·`z.infer`가 `string`입니다. 다른 zod 스키마의 타입은 `z.infer`로 읽습니다(zod 4의 `z.input`은 `unknown`).
- zod 3.23은 Standard Schema를 구현하지 않습니다. Standard Schema를 받는 라이브러리(TanStack Form 등)에는 `korean-account/standard-schema`를 씁니다.
- 각 어댑터의 추론 타입은 peer 하한 버전과 최신 버전에서 `pnpm check:consumer`가 검사합니다.

## 상수와 라벨

### 라벨

| `AccountKind`   | 의미                     | `accountKindLabels` | `services` 없는 패턴의 출금 기본값 |
| --------------- | ------------------------ | ------------------- | ---------------------------------- |
| `new`           | 현행 형식                | 신계좌              | 가능                               |
| `old`           | 이전 형식                | 구계좌              | 가능                               |
| `virtual`       | 가상계좌                 | 가상계좌            | 불가                               |
| `lifetime`      | 평생계좌·휴대폰번호 계좌 | 평생계좌            | 불가                               |
| `incoming-only` | 입금 전용 상품           | 입금전용            | 불가                               |
| `merged-legacy` | 합병 전 은행 체계의 형식 | 구통합(합병 전)     | 가능                               |

| `SubjectCategory`   | `subjectCategoryLabels` | `SubjectCategory` | `subjectCategoryLabels` |
| ------------------- | ----------------------- | ----------------- | ----------------------- |
| `ordinary`          | 보통예금                | `yes`             | YES                     |
| `treasury`          | 국고                    | `linked`          | 연계예금                |
| `savings`           | 저축예금                | `installment`     | 적금                    |
| `free-savings`      | 자유저축                | `trust`           | 신탁                    |
| `household-current` | 가계당좌                | `isa`             | ISA                     |
| `current`           | 당좌                    | `other`           | 기타                    |
| `corporate-free`    | 기업자유                |                   |                         |

`installment`·`trust`·`isa`는 PDF의 열이 아니라 입금 전용 상품을 위한 분류입니다.

```ts
import { accountKindLabels, detectBest, subjectCategoryLabels } from "korean-account";

const best = detectBest("1712-3456-7890");
best && accountKindLabels[best.kind]; // => "가상계좌"
subjectCategoryLabels["corporate-free"]; // => "기업자유"
```

### 상수 배열

| 상수                     | 값                                                                                     | 파생 타입             |
| ------------------------ | -------------------------------------------------------------------------------------- | --------------------- |
| `ACCOUNT_KINDS`          | `new`, `old`, `virtual`, `lifetime`, `incoming-only`, `merged-legacy` (동점 정렬 순서) | `AccountKind`         |
| `SUBJECT_CATEGORIES`     | 위 표의 13개(PDF 열 순서, `other`가 마지막)                                            | `SubjectCategory`     |
| `INSTITUTION_CATEGORIES` | `bank`, `non-bank`, `securities`, `clearing`                                           | `InstitutionCategory` |
| `CONFIDENCE_LEVELS`      | `high`, `medium`, `low`                                                                | `Confidence`          |

모두 `as const` 배열이라 `ACCOUNT_KINDS.includes(value)` 같은 런타임 검사와 반복에 씁니다.

## deprecated

1.0에서 제거합니다. 그때까지 동작은 같습니다.

| export                     | 대신 쓸 것                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `kb11FirstDigit`           | `DetectionResult.kind`. 내장 패턴에 붙어 있지 않습니다(국민은행 11자리는 `incoming-only`·`lifetime` 패턴으로 분리) |
| `kbank10First9`            | `pickPattern("kbank", { length: 10 })?.branchRule`                                                                 |
| `kbank14First79`           | `pickPattern("kbank", { length: 14 })?.branchRule`                                                                 |
| `suhyup11BranchToCoop`     | `pickPattern("suhyup", { length: 11 })?.branchRule`                                                                |
| `suhyup12BranchToCoop`     | `pickPattern("suhyup", { length: 12 })?.branchRule`                                                                |
| `suhyup14BranchToCoop`     | `pickPattern("suhyup", { length: 14 })?.branchRule`                                                                |
| `suhyupCoop12BranchToBank` | `pickPattern("suhyup-coop", { length: 12 })?.branchRule`                                                           |
| `toss12First1719`          | `pickPattern("toss", { kind: "virtual" })?.branchRule`                                                             |
| `scoreToConfidence`        | `DetectionResult.confidence`(근거 여부까지 반영)                                                                   |
| `normalizeSubject`         | `DetectionResult.subject`(이미 기본값이 채워짐). 표시명만 필요하면 `subjectCategoryLabels`                         |

`AccountPattern.checkDigitPosition`도 deprecated입니다. 동작에 쓰이지 않습니다.
