# korean-account

> 한국 금융기관 계좌번호 식별 라이브러리. [금융결제원 CMS PDF](https://www.cmsedi.or.kr/cms/board/workdata/view/1026) 단일 출처.

[![npm](https://img.shields.io/npm/v/korean-account.svg?style=flat-square)](https://www.npmjs.com/package/korean-account)
[![bundle](https://img.shields.io/bundlephobia/minzip/korean-account?style=flat-square)](https://bundlephobia.com/package/korean-account)
[![license](https://img.shields.io/npm/l/korean-account.svg?style=flat-square)](./LICENSE)
[![ci](https://img.shields.io/github/actions/workflow/status/dydals3440/korean-account/ci.yml?branch=main&style=flat-square&label=ci)](./.github/workflows/ci.yml)

```bash
pnpm add korean-account
```

```ts
import { detectBest } from "korean-account";

detectBest("318-081775-01-014");
// { institution: { id: "ibk", ... }, kind: "new", confidence: "high", ... }
```

- PDF 표 행을 그대로 옮긴 코어 + `defaultDetector.extend()` 로 자유 보강
- strict TypeScript — `institutionById("ibk").code` 가 `"003"` literal 로 narrow
- 런타임 의존성은 `zod` 단 1개, 그것도 검증을 쓸 때만 (`korean-account/schema`)
- Node 20.11+ · Bun · Deno · 브라우저 (ESM + CJS)

문서: [API](#4-api) · [동작 원리](#6-동작-원리) · [PDF vs 컨슈머](#7-pdf-vs-컨슈머-책임-모델) · [DOCS.md](./DOCS.md) · [CONTRIBUTING](./CONTRIBUTING.md)

---

## 1. 설계 원칙

- **PDF 충실 (PDF-faithful)** — 라이브러리 기본 detector(`defaultDetector`) 는 CMS PDF *표 행에 적힌 패턴·과목 코드만* 포함한다. 발급 중이거나 관행적으로 통용되는지가 아니라 PDF 가 enumerate 했는지가 기준.
- **확장은 외부에서 (Extension is yours)** — PDF 미명시 영역 (저축은행의 운영 과목 코드, 사내 정산 계좌, B2B 가상계좌 발급사 prefix, 외환 14d 광범위 prefix 등) 은 라이브러리에 추가하지 않고 컨슈머가 `defaultDetector.extend` / `remove` / `defineInstitution` 으로 자체 detector 를 구성한다.
- **단일 PDF 버전 = 단일 detector** — 새 CMS PDF 가 나오면 라이브러리 코어를 갱신하고, 컨슈머 확장은 그대로 호환 (마이그레이션 가이드는 [§ 14](#14-마이그레이션-가이드) 참조).

```ts
import { detectAccount } from "korean-account";

detectAccount("318-081775-01-014");
// [{
//   institution: { id: "ibk", code: "003", nameKo: "IBK기업은행", ... },
//   kind: "new",
//   subject: { code: "01", category: "ordinary", label: "보통예금" },
//   formatted: "318-081775-01-01-4",
//   score: 14,
//   confidence: "high",
//   capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: null },
// }]
```

## 2. 한눈에

| 항목 | 값 |
|---|---|
| 등록 기관 | 시중·인터넷·외국계 은행 + 비은행 + 증권사 ~60곳 |
| 계좌 종류 | `new` / `old` / `virtual` / `lifetime` / `incoming-only` / `merged-legacy` |
| 식별 위치 (PDF 4종) | Front (앞 1~3) / Middle (가운데 4~7) / End (끝 2~3) / None |
| 분기 규칙 | 수협 007/030 분리(4건), KB 11d, K뱅크 10·14d, 토스 12d 가상 — 8건 |
| 점수 범위 | 0 ~ 약 14, 신뢰도: ≥7 high / 4~6 medium / 1~3 low |
| 정책 | **PDF-strict 코어 + 컨슈머 보강** (라이브러리 본판은 PDF 표 행만, 도메인 실세계는 `extend` 로) |
| 의존성 | `zod` 1개. 검증을 쓸 때만 `korean-account/schema` 서브 엔트리에서 로드 |
| 런타임 | Node / Bun / Deno / 브라우저 (Zero React·DOM 의존) |
| TypeScript | strict, 모든 export 타입 노출 |

## 3. 시작하기

```ts
import { detectAccount } from "korean-account";
```

**어느 깊이로 쓸지 의사결정 매트릭스**:

| 상황 | 진입점 | 예상 코드량 | 참조 |
|---|---|---|---|
| 폼에서 1순위만 알면 됨 | `detectBest` | 3줄 | [§ 4.1](#41-핵심-api) |
| 자동완성 후보 N개 | `detectAccount(input, { limit })` | 5줄 | [§ 4.1](#41-핵심-api) |
| 은행/증권 카테고리 필터 | `pickInstitutions({ categories })` | 8줄 | [§ 4.3](#43-선택자--메타) |
| 도메인 보강 (사내·B2B·tightening) | `defaultDetector.extend({...})` | 20~30줄 | [§ 12](#12-컨슈머-보강-카탈로그-실세계-패턴-라이브러리) · [§ 13](#13-보강-분류표--결정-트리) |
| PDF 코어 fork (가중치 튜닝) | `createDetector(...)` | 50줄+ | [§ 4.2](#42-detector-구성) |

---

## 4. API

### 4.1 핵심 API

#### `detectAccount(input, options?)`

```ts
interface DetectOptions<Id extends string = string> {
  readonly categories?: readonly InstitutionCategory[];
  readonly kinds?: readonly AccountKind[];
  /** 등록된 id 에 autocomplete + widening 동시 지원 (외부 확장 id 도 허용). */
  readonly include?: readonly InstitutionIdInput<Id>[];
  readonly exclude?: readonly InstitutionIdInput<Id>[];
  readonly limit?: number;     // default 5
  readonly minScore?: number;  // default 1
}

interface DetectionResult {
  readonly institution: Institution;
  readonly matchedPattern: AccountPattern;
  readonly kind: AccountKind;
  readonly subject?: Subject;
  readonly formatted: string;
  readonly score: number;
  readonly confidence: "high" | "medium" | "low";
  readonly capabilities: {
    readonly allowsWithdrawal: boolean;
    readonly virtual: boolean;
    readonly validatedCheckDigit: boolean | null;
  };
}
```

```ts
detectAccount("110-436-387740");
detectAccount("3333-12-3456789", { categories: ["bank"] });
detectAccount("110-436-387740", { kinds: ["new"] });
detectAccount("110-436-387740", { include: ["shinhan", "kb"] });
detectAccount("110-436-387740", { exclude: ["shinhan"], limit: 3 });
```

#### `detectBest(input, options?)`

1순위 후보 하나만 필요할 때 단축형. 매칭 없으면 `null`.

```ts
import { detectBest } from "korean-account";

const top = detectBest("110-436-387740");
if (top) {
  console.log(top.institution.id, top.kind, top.subject?.category);
}
```

#### `defaultDetector`

기본 레지스트리(PDF 충실 본) 로 생성된 immutable `Detector`. `detectAccount` / `detectBest` 는 내부적으로 이 인스턴스를 사용한다. 직접 참조해서 `.detect(input, options)` 를 부르거나 `.extend(...)` / `.remove(...)` 로 새 detector 를 만들 수 있다.

### 4.2 Detector 구성

#### `createDetector` / `Detector.extend` / `Detector.remove`

immutable detector. `defaultDetector` 는 기본 레지스트리 (PDF 충실 본) 로 생성된다.

> **`extend()` 의 replace-on-id 시맨틱** — `extend({ institutions: [override] })` 에서 *같은 id 의 institution 이 들어오면 기존 본을 자동 교체* 한다. PDF-strict 본을 컨슈머 도메인에 맞게 보강할 때 `.remove(id).extend(...)` 체인을 강제하지 않으려는 의도. 새 institution(추가) 과 기존 institution(보강) 을 한 호출에서 함께 다룰 수 있다.

```ts
import {
  createDetector,
  defaultDetector,
  defineInstitution,
  createPatternTemplate as T,
  institutionById,
  pickInstitutions,
} from "korean-account";

// 새 institution 추가
const myCorp = defineInstitution({
  id: "my-corp",
  code: "777",
  nameKo: "사내정산",
  category: "non-bank",
  aliases: [],
  patterns: [
    {
      template: T("XXXX-XXXX-XXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["7777"],
    },
  ],
});

// 기존 institution 보강 — PDF 본 patterns 위에 도메인 보강 추가
const tossCore = institutionById("toss");
const tossExtended = defineInstitution({
  id: "toss",
  code: "092",
  nameKo: "토스뱅크",
  category: "bank",
  aliases: ["토스"],
  priority: 75,
  patterns: [
    ...(tossCore?.patterns ?? []),
    // 도메인 보강 patterns ...
  ],
});

const myDetector = defaultDetector.extend({
  institutions: [myCorp, tossExtended],
});

// 또는 카테고리/조건 기반 제거
const banksOnly = createDetector({
  institutions: pickInstitutions({ categories: ["bank"] }),
  scoring: { identifierMatch: 6, kindNewBonus: 1 },
});
defaultDetector.remove("hsbc");
defaultDetector.remove((i) => i.category === "securities");
```

### 4.3 선택자 & 메타

#### Institution 메타 조회 (literal narrow)

`institutionById` / `institutionByCode` 에 등록된 id / code literal 을 직접 넘기면 반환 institution 의 `id` · `code` · `category` 가 모두 literal 로 좁혀진다. 컨슈머 코드가 "있는 줄 알았는데 없네" 회귀를 컴파일 타임에 잡는다.

```ts
import {
  institutionById,
  institutionByCode,
  institutions,
} from "korean-account";

const shinhan = institutionById("shinhan");
shinhan?.id;        // "shinhan"
shinhan?.code;      // "088"
shinhan?.category;  // "bank"

const ibk = institutionByCode("003");
ibk?.id;            // "ibk"

institutions.filter((i) => i.category === "bank");
```

#### `pickInstitutions` / `pickInstitutionsByIds` (type-safe filter)

`pickInstitutions` 는 `categories` / `include` / `exclude` 를 cross-narrow 한다. `categories` 가 지정되면 `include` / `exclude` 가 받을 수 있는 id 도 그 카테고리 안의 id 로 제한된다 (autocomplete + 컴파일 검증).

```ts
import { pickInstitutions, pickInstitutionsByIds } from "korean-account";

// 은행만 — 반환 institution union 이 bank 카테고리로 narrow
const banks = pickInstitutions({ categories: ["bank"] });

// 은행 ∩ kb·shinhan — include 가 bank 안에서만 선택 가능
const major = pickInstitutions({
  categories: ["bank"],
  include: ["kb", "shinhan", "hana"],
});

// ❌ 컴파일 에러: "kiwoom" 은 securities 라 bank 카테고리 안에 없음
pickInstitutions({ categories: ["bank"], include: ["kiwoom"] });

// 외국계 은행 4개 제외
const noForeign = pickInstitutions({
  categories: ["bank"],
  exclude: ["hsbc", "deutsche", "jpmc", "bnp-paribas"],
});

// id 만으로 narrow 하고 싶을 때 — 반환 union 이 그 id 들로 좁혀짐
const big5 = pickInstitutionsByIds({
  include: ["kb", "shinhan", "hana", "woori", "nh"],
});
// big5: readonly (Institution<"kb"> | Institution<"shinhan"> | ...)[]
```

#### `pickPattern`

특정 institution 의 단일 패턴을 자릿수·kind 로 골라온다. 컨슈머 보강이 코어 패턴 위에 spread 할 때 *건드릴 패턴이 살아 있는지* 마이그레이션 검증에 유용 ([§ 14](#14-마이그레이션-가이드)).

```ts
import { pickPattern } from "korean-account";

pickPattern("kb", { kind: "new", length: 14 });
```

### 4.4 보조

#### 라벨

```ts
import { accountKindLabels, subjectCategoryLabels } from "korean-account";

accountKindLabels.virtual;          // "가상계좌"
accountKindLabels["incoming-only"]; // "입금전용"
subjectCategoryLabels.ordinary;     // "보통예금"
subjectCategoryLabels.savings;      // "저축예금"
```

#### 저수준 유틸

```ts
import {
  normalize,
  formatAccount,
  extractIdentifier,
  extractSubject,
  createPatternTemplate,
  scoreToConfidence,
  defineSubject,
  defineBranchRule,
} from "korean-account";

normalize("110-436-387740");                                            // "110436387740"
formatAccount("110436387740", createPatternTemplate("XXX-XXX-XXXXXX")); // "110-436-387740"
```

#### zod 스키마 (`korean-account/schema`)

검증이 필요한 경우에만 서브 엔트리에서 가져온다. 메인 진입점은 zod 를 require 하지 않는다.

```ts
import {
  accountSchema,
  institutionIdSchema,
  detectionSchema,
  accountKindSchema,
  subjectCategorySchema,
} from "korean-account/schema";

accountSchema.parse("110-436-387740");
```

---

## 5. 타입 레퍼런스

> 이 섹션은 라이브러리 export 타입을 직접 다뤄 보강 detector 를 만들거나 결과 객체를 깊게 활용할 사람을 위한 레퍼런스. 단순 사용자는 [§ 4](#4-api) 만 봐도 충분하다.

### 5.1 `Institution`

| 필드 | 타입 | 필수 | 의미 |
|---|---|---|---|
| `id` | `string` (literal) | ✓ | 라이브러리 내부 id (예: `"shinhan"`, `"savings-bank"`). |
| `code` | `string` (literal) | ✓ | CMS namespace 3자리 코드 (예: `"088"`). |
| `commonCode` | `string` | | **KFTC 금융공동망 표준은행코드**. CMS `code` 와 다른 경우만 지정. 미지정 시 `code` 와 동일. 예: `hana.code="005"` (CMS, 외환·하나 통합 후 외환 대표코드 승계), `hana.commonCode="081"` (표준, 하나은행 대표코드 유지). 컨슈머가 표준은행코드 기반 서버를 쓴다면 `institution.commonCode ?? institution.code` 로 접근. |
| `aliasCodes` | `readonly string[]` | | 통합·합병으로 흡수된 CMS 코드 (예: 신한 088 ← 021/026/028). |
| `nameKo` / `nameEn` | `string` | nameKo ✓ | 표시명. |
| `category` | `"bank"` \| `"non-bank"` \| `"securities"` \| `"clearing"` | ✓ | |
| `aliases` | `readonly string[]` | ✓ | 검색 보조 (예: `["국민", "KB"]`). |
| `priority` | `number` | | 점수 동률 시 tie-break. 시중 은행 80~100, 인터넷전문 60~90, 비은행 25~70 권장. |
| `patterns` | `readonly AccountPattern[]` (≥1) | ✓ | 자릿수별 variant. [§ 5.2](#52-accountpattern) 참조. |
| `successorOf` | `readonly string[]` | | 합병 전 기관 id (예: 하나 ← `keb-foreign-exchange`). |
| `notes` | `string` | | |

### 5.2 `AccountPattern`

| 필드 | 타입 | 의미 |
|---|---|---|
| `template` | `PatternTemplate` | `createPatternTemplate("XXX-XX-XXXXXX")` 로 만든 브랜드 문자열. `X` = 한 자리, `-` = 시각 그루핑. |
| `kind` | `AccountKind` | new / old / virtual / lifetime / incoming-only / merged-legacy. |
| `identifierPosition` | `Position` | 0-indexed digit 범위 `{ start, length }`. |
| `identifiers` | `readonly string[]` | identifierPosition 자리에 일치해야 할 값들. |
| `identifierRange` | `{ from, to }` | identifiers 대신 숫자 range 로 매칭 (수치 비교). |
| `subjectPosition` | `Position` | 과목 코드 위치. identifierPosition 과 같을 수도, 다를 수도. |
| `subjects` | `readonly Subject[]` | subjectPosition 자리의 값과 매칭. |
| `checkDigitPosition` | `Position` | 체크디지트 위치. 알고리즘은 PDF 가 비공개이므로 검증 미구현 ([§ 11.6](#116-체크디지트-검증) 참조). |
| `validatesCheckDigit` | `boolean` | `false` 면 명시적 미검증 (광주 12d 731, 수협 분리 이후 등). 미지정 시 알고리즘 자체 미구현. |
| `branchRule` | `BranchRule` | 패턴 매칭 후 institution / kind / virtual 을 override 하는 분기 ([§ 9](#9-분기-규칙) 참조). |
| `additionalRules` | `readonly AdditionalRule[]` | **게이트 + 가산**. 자릿수가 일치하는 입력에서 하나라도 false 면 *패턴 자체가 후보에서 제외*. 모두 통과해야 룰 개수만큼 가산. |
| `effectiveFrom` | `string` | 신규 코드 적용일. |
| `note` | `string` | |

> **⚠️ `additionalRules` 의 게이트 시맨틱** — 종전엔 점수만 깎고 매칭은 살아남는 동작이라 가드 의도(`d[3]==="9"` 외환 14d 신호 등) 가 가드 역할을 못 했다. 2026.05.15 변경(8차) 이후 자릿수 일치 입력에서 룰이 false 면 패턴은 제외된다. 부분 입력 (lengthExact / lengthNear 가 아닌 짧은 입력) 에서는 가드를 면제해 점수 인플레이션을 막는다.

### 5.3 `DetectionResult` & `DetectionCapabilities`

| 필드 | 타입 | 의미 |
|---|---|---|
| `institution` | `Institution` | 1순위 institution (literal narrow 유지). |
| `matchedPattern` | `AccountPattern` | 어느 variant 가 매칭됐는지. |
| `kind` | `AccountKind` | branchRule override 가 발생했으면 override 된 값. |
| `subject` | `Subject?` | 과목 매칭이 있었을 때만. |
| `formatted` | `string` | template 형식으로 그루핑된 표시값. |
| `score` | `number` | 점수 ([§ 6](#6-동작-원리)). |
| `confidence` | `"high"` \| `"medium"` \| `"low"` | ≥7 / 4~6 / 1~3. |
| `capabilities.allowsWithdrawal` | `boolean` | 자동이체 출금 가능 여부. virtual/incoming-only/lifetime kind 면 false. subject 의 `allowsWithdrawal` 도 반영. |
| `capabilities.virtual` | `boolean` | 가상계좌 (입금 전용 가능성 큼). |
| `capabilities.validatedCheckDigit` | `boolean \| null` | **3-state**: `true` (verifier 통과) / `false` (verifier 실패) / `null` (verifier 미등록 또는 `validatesCheckDigit: false`). |

### 5.4 보조 타입

| 타입 | 의미 |
|---|---|
| `Position` | `{ start: number; length: number }` — 0-indexed digit 범위. |
| `Subject` | `{ code, category, label?, allowsWithdrawal?, virtual?, effectiveFrom?, note? }`. 기본 `allowsWithdrawal: true`. |
| `BranchRule` | `{ describe: string; evaluate: (digits) => BranchRuleResult \| null }`. |
| `BranchRuleResult` | `{ institutionId?, kindOverride?, virtualOverride? }`. |
| `AdditionalRule` | `(digits: string) => boolean`. |
| `GlobalRule` | `(digits: string, institution: Institution) => boolean`. detector 레벨 전역 룰. |
| `CheckDigitVerifier` | `(digits: string) => boolean`. |
| `ScoringWeights` | 점수 가중치 partial — [§ 6.2](#62-점수-가중치) 참조. |
| `Detector<I>` | `{ institutions; detect(); extend(); remove() }`. immutable. |
| `InstitutionIdInput<Id>` | `Id \| (string & Record<never, never>)` — autocomplete + widening. 등록 id 자동완성하되 외부 확장 id 도 받음. |

### 5.5 `AccountKind` (6종)

| `AccountKind` | 의미 | `allowsWithdrawal` 기본 | `virtual` 기본 | 라벨 |
|---|---|---|---|---|
| `new` | 차세대(신) 계좌 | true (subject override 가능) | false | 신계좌 |
| `old` | 구 계좌 | true | false | 구계좌 |
| `virtual` | 가상계좌 | **false** | **true** | 가상계좌 |
| `lifetime` | 평생계좌 / 고객지정 / 핸드폰 | **false** | false | 평생계좌 |
| `incoming-only` | 입금 전용 (적금·신탁·연계) | **false** | false | 입금전용 |
| `merged-legacy` | 합병 전 구 시스템 (외환·조흥·한일·평화 등) | true | false | 구통합(합병 전) |

### 5.6 `SubjectCategory` (13종)

**PDF 표준 10종**: `ordinary` (보통) · `treasury` (국고) · `savings` (저축) · `free-savings` (자유저축) · `household-current` (가계당좌) · `current` (당좌) · `corporate-free` (기업자유) · `yes` (YES) · `linked` (연계) · `other` (기타)

**입금전용 분류 확장 3종**: `installment` (적금, 입금만) · `trust` (신탁, 입금만) · `isa` (ISA, 출금이체 제한)

---

## 6. 동작 원리

```
input
  ↓ normalize        "318-081775-01-014" → "31808177501014"
  ↓ scorePattern     length / identifier / subject / additionalRules 가산
  ↓ branchRule       institution / kind / virtual override
  ↓ filter           categories / kinds / include / exclude / minScore
  ↓ sort             score → priority → kindOrder
  ↓ narrow           top 이 high/medium 이면 low 후보 제거
  ↓ limit            기본 5건
DetectionResult[]
```

### 6.1 점수 가중치 (기본값)

| 신호 | 점수 |
|---|---:|
| 자릿수가 템플릿과 정확히 일치 | +3 |
| 자릿수가 ±1 (입력 중) | +1 |
| identifier 매칭 (정확 길이) | +4 + (식별자 길이 − 1) |
| identifier 매칭 (부분 입력) | floor(위 점수 / 2) |
| subject 매칭 (정확 길이) | +3 + (과목 코드 길이 − 1) |
| subject 매칭 (부분 입력) | floor(위 점수 / 2) |
| additionalRule 통과당 | +1 (가드 통과 필수) |
| branchRule override 발생 | +2 |
| globalRule 통과당 | +1 |
| kindNewBonus | +0 (옵트인) |

부분 입력 시 절반 점수 — 같은 점수대에서 "정확 길이 기관" 이 우선되도록 보호.

**길이 보너스 (식별자·과목)**: 일반 은행 앱과 동일하게 *더 긴 prefix 매칭에 더 높은 신뢰도* 를 부여. 1자리 매칭 +4, 2자리 +5, 3자리 +6, 4자리 +7. PDF 가 식별자/과목을 더 길게 enumerate 했다 = 그만큼 더 정확한 prefix.

**`additionalRules` 게이트**: 자릿수가 일치하는 입력에서 룰이 하나라도 false 면 패턴은 후보에서 제외 — PDF·실세계 도메인 제약 (예: `d[3]==="9"` 외환 14d 신호) 을 패턴 매칭 조건으로 표현. 통과한 룰 1건당 +1.

### 6.2 신뢰도

| score | confidence |
|---|---|
| ≥ 7 | high |
| 4–6 | medium |
| 1–3 | low |
| 0 | (제외) |

1순위가 `high` 또는 `medium` 이면 결과에서 `low` 후보를 자동 제거한다.

### 6.3 가중치 커스터마이징

```ts
const aggressive = createDetector({
  institutions: pickInstitutions(),
  scoring: { identifierMatch: 6, subjectMatch: 4, kindNewBonus: 1 },
});
```

---

## 7. PDF vs 컨슈머 책임 모델

> 이 섹션은 자체 detector 를 만들 사람이라면 반드시 한 번 읽고 가야 한다. 라이브러리가 어디까지 책임지고, 어디부터 컨슈머 영역인지를 명확히 한다.

### 7.1 영역별 경계

| 영역 | PDF 코어 (`defaultDetector`) | 컨슈머 책임 |
|---|---|---|
| 등록 기관 | ~60곳 — CMS PDF 표 행에 명시된 모든 참가기관 | 사내 정산·B2B 가상계좌 발급사·미참가 외국계 활성화 등 |
| 과목 코드 | PDF 표에 enumerate 된 값만 (예: 050 = 13/21/22/23 4개) | 실세계 운영 코드 (050 의 11/14/15/17/18/24~28/33 등) |
| Identifier prefix | PDF 명시 길이/값만 (예: K뱅크 13d 첫 자리 미명시) | tightening (카카오 1→4자리, 토스 3→4자리, K뱅크 100 prefix) |
| 분기 규칙 | PDF 명시 8건 (수협 4 / KB 1 / K뱅크 2 / 토스 1) | 사내 prefix → kind override, 도메인 규칙 등 |
| 체크디지트 | 값 위치만 명시 — 알고리즘 미구현 (PDF 비공개) | `checkDigitVerifiers` 옵션으로 verifier 등록 |
| 외환 14d 식별 | PDF 8개 prefix (117/158/161/162/210/379/600/655) | 4번째 자리 "9" 광범위 휴리스틱 |
| 외국계 미참가 | 메타만 등록 (HSBC 054 / 도이치 055 / JPMC 057 / BNP 061) | 활성화 시 컨슈머가 패턴 추가 |

### 7.2 detector 합성 도식

```
        ┌─ defaultDetector (PDF-strict 코어, 라이브러리 본판) ─┐
        │   ~60 institutions, PDF 표 행만                      │
        └────────────────────┬──────────────────────────────────┘
                             │ .extend({ institutions: [...] })
                             │   ← replace-on-id 시맨틱
                             ▼
        ┌─ teacherDetector (도메인 보강 detector) ────────────┐
        │   + 운영 과목 / tightening / 휴리스틱 / 충돌 가드    │
        └──────────────────────────────────────────────────────┘
```

코어는 새 PDF 가 나오면 라이브러리가 갱신한다. 컨슈머 detector 는 그 위에 얹혀 있어 코어 변경에 대해 *호환성 검증만* 하면 된다 (마이그레이션은 [§ 14](#14-마이그레이션-가이드)).

### 7.3 `code` (CMS) vs `commonCode` (KFTC 표준은행코드) — 두 namespace 의 경계

라이브러리는 CMS 참가기관 코드를 `Institution.code` 로 노출한다 (PDF 가 단일 진실 원본). 그러나 일반 송금/이체 시스템 (대부분의 결제 서버) 은 *금융공동망 표준은행코드* (KFTC 공동코드) 를 쓴다. 두 체계는 **같은 KFTC 가 운영하지만 별도 namespace** 라 한쪽으로 통일 불가 — 합병 이력 때문에 14 메이저 은행 중 1건이 어긋난다.

| 항목 | `Institution.code` (CMS) | `Institution.commonCode` (KFTC 표준) |
|---|---|---|
| 출처 | 금융결제원 CMS EDI PDF | 금융공동망 공동코드 |
| 용도 | CMS 자동이체·공과금 시스템 식별 | 일반 송금/이체 시스템 식별 |
| 하나은행 | `"005"` (외환·하나 통합 후 외환 대표코드 승계) | `"081"` (하나은행 대표코드 유지) |
| 그 외 13 메이저 은행 | `"088"`/`"004"`/... | (생략 — `code` 와 동일) |

**컨슈머 사용 패턴**:
```ts
// 표준은행코드 기반 서버를 쓰는 경우
const bankCode = institution.commonCode ?? institution.code;
```

`commonCode` 가 optional 이므로 CMS namespace 기반 컨슈머는 영향 없이 `institution.code` 만 쓰면 된다. 새 표준 mismatch (예: 잠재 후속 — 농협중앙, 수협 분리, 외국계 미참가) 가 발견되면 같은 필드로 흡수.

---

## 8. 점수 Walkthrough

> 이 섹션은 점수 가중치 표가 실제 입력에서 어떻게 풀리는지 직관을 잡으려는 사람을 위한 것이다. 표만으로는 충돌·동률 케이스의 결과를 예측하기 어렵다.

### Case A. `100-123-456789` (12자리)

신한 12d 신계좌 vs 토스 12d (PDF 명시 100/150) vs 토스 컨슈머 tightening (1000/1500).

```
정규화: "100123456789", length 12.

신한 12d new:
  lengthExact          +3
  identifier "100" (3자리)  +4 + 2  = +6
  subject "100" (3자리)     +3 + 2  = +5
  ─────────────────────────────────
  total                 14    → high

토스 12d (라이브러리 PDF 본판):
  lengthExact          +3
  identifier "100" (3자리)  +6
  subject "100" (3자리)     +5
  total                 14    → 동률, priority 결정

토스 12d (teacher-web 컨슈머 tightening: identifiers ["1000","1500"]):
  identifier "1001" (4자리) → "1000"·"1500" 모두 불일치 → 매치 안 됨
  additionalRule: d.startsWith("1000") || d.startsWith("1500") → false
  rulesApply true (lengthExact), rule false → 패턴 제외
  total                 0
```

**결론**: 신한 우선 — 입력이 `1000` / `1500` 으로 시작하는 경우에만 토스가 후보에 든다. 컨슈머 tightening 한 줄로 신한 vs 토스 모호함 해소.

### Case B. `123456-04-789012` (14자리, d[3]=4)

KB 본점 14d 신계좌 (컨슈머 보강) vs 하나 외환 14d 광범위 휴리스틱 (컨슈머 보강).

```
정규화: "12345604789012", length 14, d[3]="4".

KB 14d new (컨슈머: identifierPosition {6,2} identifiers ["01"…"35"]):
  lengthExact                       +3
  identifier "04" (2자리)              +4 + 1  = +5
  subject "04" free-savings (2자리)     +3 + 1  = +4
  additionalRule d[3]!=="9" → true     +1
  ───────────────────────────────────────
  total                              13    → high

하나 외환 14d 휴리스틱 (컨슈머: identifierPosition {3,1} identifiers ["9"]):
  identifier d[3]="4" → "9" 불일치 → 매치 안 됨
  additionalRules [length===14, prefix 미명시 set] → 둘 다 통과 +2
  lengthExact                       +3
  total                              5    → medium
```

**결론**: KB 우선. 하나 외환 휴리스틱은 medium 으로 후보에 남지만 KB high 가 1순위.

### Case C. `427-910255-21607` (14자리, d[3]=9, PDF 외 prefix)

KB 14d 가드 vs IBK 14d 가드 vs 하나 외환 휴리스틱 — PDF prefix 8개 (117/158/161/162/210/379/600/655) 에 없는 외환 14d.

```
정규화: "42791025521607", length 14, d[0:3]="427", d[3]="9".

KB 14d (컨슈머 보강에 가드 `d[3]!=="9"`):
  rulesApply true, 가드 false → 패턴 제외 (외환 14d 흡수 회피)
  total                              0

IBK 14d new (컨슈머 보강에 가드 `d[3]!=="9"`):
  rulesApply true, 가드 false → 패턴 제외
  total                              0

하나 외환 14d 휴리스틱:
  lengthExact                       +3
  identifier d[3]="9" (1자리)           +4
  additionalRule length===14            +1
  additionalRule prefix "427" PDF 외      +1
  ───────────────────────────────────────
  total                              9    → medium
  (priority 80, hana-CMA 25 보다 우선)
```

**결론**: 하나 우선. 가드 두 줄 (KB / IBK) 이 외환 흡수를 차단하고 휴리스틱이 medium 으로 1순위 차지. PDF 가 명시한 8개 prefix 입력은 라이브러리 본판 패턴 (3자리 identifier, score 13+) 이 잡으므로 휴리스틱은 PDF 외 케이스만 보완.

---

## 9. 분기 규칙

> 분기 규칙은 *패턴 매칭 후* institution / kind / virtual 을 다시 쓰는 후처리다. PDF 가 명시한 8건만 라이브러리가 가진다.

| 규칙 export | 자릿수 | 발동 조건 | 분기 의도 |
|---|---|---|---|
| `suhyup11BranchToCoop` | 11 | 4·5번째 자리가 43~45/47/49/59/61~64/66~68/74/75/78/81~85/93 | 수협 007/030 분리 (2025.11.10) — 중앙회로 라우팅 |
| `suhyup12BranchToCoop` | 12 | 1번째 자리가 2/7/9 | 수협 007 → 030 (중앙회) |
| `suhyup14BranchToCoop` | 14 | 1·2·3번째가 493 또는 481~489 | 수협 14d 가상 → 030 |
| `suhyupCoop12BranchToBank` | 12 | 수협중앙 12d, 1번째가 2/7/9 아니면 | 중앙회 → 007 (은행) 역라우팅 |
| `kb11FirstDigit` | 11 | d[0]=0 → incoming-only / d[0]=9 → lifetime | KB 입금전용/평생계좌 식별 |
| `kbank10First9` | 10 | d[0]=9 | K뱅크 10d 입금전용 |
| `kbank14First79` | 14 | d[0]=7/9 → virtual / 그 외 → incoming-only | 간편송금/안심계좌 vs 여신가상 |
| `toss12First1719` | 12 | d[0:2]=17 또는 19 | 토스 12d 가상 (신협 12d 적금 170~178 과의 prefix 모호성 해소) |

분기 규칙은 패턴의 `branchRule` 필드로 연결되며, 매칭 시 score 에 `branchRuleMatch` (+2) 가산.

---

## 10. Recipes

### 10.1 폼 검증

```ts
import { detectBest } from "korean-account";

function validateAccount(input: string): string | undefined {
  if (!input) return "계좌번호를 입력해주세요.";
  const top = detectBest(input);
  if (!top) return "올바른 계좌번호가 아닙니다.";
  if (!top.capabilities.allowsWithdrawal) {
    return `${top.institution.nameKo} ${top.subject?.label ?? top.kind} 는 자동이체 등록이 불가합니다.`;
  }
  if (top.confidence === "low") return "기관을 특정할 수 없습니다.";
  return undefined;
}
```

### 10.2 자동이체 등록 전 출금 가능 검증

```ts
import { detectBest } from "korean-account";

function canRegisterAutoDebit(input: string) {
  const top = detectBest(input);
  if (!top) return { ok: false, reason: "계좌 식별 불가" };
  if (!top.capabilities.allowsWithdrawal) {
    return { ok: false, reason: `${top.kind} 계좌는 자동이체 불가` };
  }
  return { ok: true };
}
```

### 10.3 입력 디바운싱 + 자동완성

```tsx
import { useDeferredValue, useMemo, useState } from "react";
import { detectAccount, type DetectionResult } from "korean-account";

function AccountInput() {
  const [raw, setRaw] = useState("");
  const deferred = useDeferredValue(raw);
  const candidates = useMemo<readonly DetectionResult[]>(
    () => detectAccount(deferred, { limit: 3 }),
    [deferred],
  );

  return (
    <>
      <input value={raw} onChange={(e) => setRaw(e.target.value)} />
      <ul>
        {candidates.map((c) => (
          <li key={c.institution.id}>
            {c.institution.nameKo} · {c.subject?.label ?? c.kind} · {c.confidence}
          </li>
        ))}
      </ul>
    </>
  );
}
```

### 10.4 도메인 보강 detector 만들기

라이브러리 본판 위에 도메인 보강 patterns 를 얹어 자체 detector 를 만든다 (8건의 실제 보강 사례는 [§ 12 컨슈머 보강 카탈로그](#12-컨슈머-보강-카탈로그-실세계-패턴-라이브러리)).

```ts
import {
  createPatternTemplate as T,
  defaultDetector,
  defineInstitution,
  defineSubject,
  institutionById,
} from "korean-account";

const kakaoCore = institutionById("kakao");
const kakaoExtended = defineInstitution({
  id: "kakao",
  code: "090",
  nameKo: "카카오뱅크",
  category: "bank",
  aliases: ["카카오"],
  priority: 90,
  patterns:
    kakaoCore?.patterns.map((p) =>
      p.kind === "new" && !p.identifiers
        ? { ...p, identifierPosition: { start: 0, length: 4 }, identifiers: ["3333", "7979"] }
        : p,
    ) ?? [],
});

export const myDetector = defaultDetector.extend({
  institutions: [kakaoExtended],
});
```

---

## 11. 확장 — Mechanics

기본 detector 는 PDF 에 명시된 패턴만 갖는다. PDF 미명시 영역은 컨슈머가 자체 detector 로 확장한다. 라이브러리는 immutable extend / remove API 로 이를 지원한다.

### 11.1 새 institution 추가

```ts
import {
  createPatternTemplate,
  defaultDetector,
  defineBranchRule,
  defineInstitution,
  defineSubject,
} from "korean-account";

const myFintech = defineInstitution({
  id: "my-fintech",
  code: "999",
  nameKo: "마이핀테크",
  category: "non-bank",
  aliases: [],
  patterns: [
    {
      template: createPatternTemplate("XXX-XXXX-XXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["999"],
    },
  ],
});

const detector = defaultDetector.extend({ institutions: [myFintech] });
detector.detect("999-1234-5678");
```

### 11.2 기존 institution 에 PDF 비표준 패턴 추가하기 ⭐

PDF 에는 없지만 실제로 통용되는 패턴이 있을 때. 예: **상호저축은행(050) 의 가상계좌** — PDF 는 가상 미명시지만 현실에서는 가상 코드가 운영됨.

```ts
import {
  createPatternTemplate,
  defaultDetector,
  defineInstitution,
  defineSubject,
  institutionById,
} from "korean-account";

const base = institutionById("savings-bank");
if (!base) throw new Error("savings-bank 누락");

const extended = defineInstitution({
  ...base,
  patterns: [
    ...base.patterns,
    {
      template: createPatternTemplate("XXX-XX-XX-XXXXXX-X"),
      kind: "virtual",
      subjectPosition: { start: 5, length: 2 },
      subjects: [
        defineSubject({
          code: "15",
          category: "ordinary",
          virtual: true,
          label: "저축은행 가상계좌",
        }),
      ],
    },
  ],
});

// `extend` 는 같은 id 가 들어오면 기존 institution 을 자동 교체 (replace-on-id) —
// `.remove(id)` 를 먼저 부를 필요 없다.
const detector = defaultDetector.extend({ institutions: [extended] });

detector.detect("066-43-15-739026-6");
// → savings-bank, kind: "virtual", subject.code: "15"
```

### 11.3 분기 규칙

```ts
const rule = defineBranchRule({
  describe: "사내 prefix 999 → virtual",
  evaluate: (digits) =>
    digits.length === 14 && digits.startsWith("999")
      ? { kindOverride: "virtual", virtualOverride: true }
      : null,
});

// 패턴 정의 시 branchRule: rule 로 첨부
```

### 11.4 카테고리/기관 일부만 사용

```ts
import { createDetector, pickInstitutions } from "korean-account";

const banksOnly = createDetector({
  institutions: pickInstitutions({ categories: ["bank"] }),
});

const noForeignBanks = defaultDetector.remove((i) =>
  ["hsbc", "deutsche", "jpmc", "boa", "bnp-paribas"].includes(i.id),
);
```

### 11.5 가중치 튜닝

```ts
const aggressive = createDetector({
  institutions: pickInstitutions(),
  scoring: { identifierMatch: 6, subjectMatch: 4, kindNewBonus: 1 },
});
```

### 11.6 체크디지트 검증

PDF 가 알고리즘을 비공개하므로 라이브러리 기본은 검증하지 않는다 (`capabilities.validatedCheckDigit = null`). 외부 자료로 알고리즘을 확보한 경우, `createDetector` 의 `checkDigitVerifiers` 옵션에 institution id 별로 verifier 함수를 등록하면 detect 결과에 자동으로 반영된다.

```ts
import { createDetector, institutions, type CheckDigitVerifier } from "korean-account";

const verifyShinhan: CheckDigitVerifier = (digits) => {
  // 알고리즘 구현 — 자료 출처 명시 권장
  return /* boolean */;
};

const detector = createDetector({
  institutions,
  checkDigitVerifiers: {
    shinhan: verifyShinhan,
    // kb: verifyKb,
    // hana: verifyHana, ...
  },
});

const [r] = detector.detect("110-436-387740");
r?.capabilities.validatedCheckDigit; // true / false / null
```

매칭된 패턴이 `validatesCheckDigit: false` 로 표시되어 있으면 verifier 가 등록되어 있어도 `null` 로 처리된다 (광주은행 12d 과목 731, 수협 신계좌 등).

---

## 12. 컨슈머 보강 카탈로그 (실세계 패턴 라이브러리)

> 이 섹션은 자체 사내 정산 계좌·B2B 가상계좌 발급 도메인을 가진 팀, 그리고 *교육 결제* 같은 폼 신뢰도를 끌어 올리려는 팀을 위한 것이다. `apps/teacher-web/src/features/academy/presentations/constants/bank-detection.ts` 의 8건이 사실상 *재사용 가능한 패턴 라이브러리* — 각 사례가 어떤 종류의 보강인지 분류는 [§ 13 보강 분류표](#13-보강-분류표--결정-트리).

각 사례 양식: **PDF 상태** / **현실** / **보강 전략** / **코드 스니펫** / **사이드이펙트**

### 12.1 050 상호저축은행 — 과목코드 확장

- **PDF 상태**: 14d 신계좌 과목 4개만 enumerate — 보통:13 / 저축:21 / 자유저축:22 / 기업자유:23.
- **현실**: 11·14·15·17·18·19 (보통) / 24·25·28 (저축) / 26·27 (자유저축) / 33 (기업자유) 등 더 넓게 운영.
- **보강 전략**: 같은 patterns 위에 `subjects` 를 PDF 4개 + 도메인 7~10개로 확장.
- **사이드이펙트**: 없음.

```ts
const savingsBankExtended = defineInstitution({
  id: "savings-bank",
  // ... 메타 ...
  patterns: [{
    template: T("XXX-XX-XX-XXXXXX-X"),
    kind: "new",
    subjectPosition: { start: 5, length: 2 },
    subjects: [
      defineSubject({ code: "13", category: "ordinary" }),
      defineSubject({ code: "21", category: "savings" }),
      // ... PDF 의 22/23 ...
      ...["11","14","15","17","18","19"].map((code) => defineSubject({ code, category: "ordinary" })),
      // ... 추가 카테고리 ...
    ],
  }],
});
```

### 12.2 004 KB국민 — 14d 본점 신계좌 (PDF 미명시 패턴 추가)

- **PDF 상태**: KB 14d 는 92(가상) 와 (구)주택 14d 만 enumerate. 본점 14d 신계좌 패턴 자체가 PDF 에 없음.
- **현실**: `XXXXXX-XX-XXXXXX` 본점 14d 신계좌가 일반적이며 식별자/과목은 6~7번째 자리에 01·03·04·06·11·12·21·25·33·35 등.
- **보강 전략**: 코어 patterns 위에 새 14d 패턴 추가 + `d[3]!=="9"` 가드로 외환 14d (4번째 자리 9) 흡수 회피.
- **사이드이펙트**: 가드 없으면 외환 14d 가 동률로 KB 에 흡수.

```ts
const kbCore = institutionById("kb");
const kbExtended = defineInstitution({
  id: "kb",
  // ... 메타 ...
  patterns: [
    ...(kbCore?.patterns ?? []),
    {
      template: T("XXXXXX-XX-XXXXXX"),
      kind: "new",
      identifierPosition: { start: 6, length: 2 },
      identifiers: ["01","03","04","06","11","12","21","25","33","35"],
      subjectPosition: { start: 6, length: 2 },
      subjects: [/* ... */],
      additionalRules: [(d) => d[3] !== "9"],
    },
  ],
});
```

### 12.3 089 K뱅크 — 13d 100 prefix narrowing

- **PDF 상태**: 13d 는 `□□-□□□-□□□□-□□□□` 형 휴대폰번호 연결만 명시, 특정 prefix 없음.
- **현실**: 실세계 K뱅크 계좌는 `100...` prefix 가 압도적.
- **보강 전략**: 코어 패턴 의 identifierPosition 을 `{0,3}` 로 좁히고 `identifiers: ["100"]`.
- **사이드이펙트**: 없음 (1자리 첫자리 식별이 3자리로 보강돼 신뢰도 boost).

```ts
const kbankExtended = defineInstitution({
  id: "kbank",
  // ... 메타 ...
  patterns: kbankCore?.patterns.map((p) =>
    p.kind === "new" && !p.identifiers
      ? { ...p, identifierPosition: { start: 0, length: 3 }, identifiers: ["100"] }
      : p,
  ) ?? [],
});
```

### 12.4 090 카카오뱅크 — 4자리 prefix tightening

- **PDF 상태**: `□-□□□-□□□□□□□□□` 업무구분(1) + 상품구분(3) + 일련(9). 4자리 prefix enumerate 없음.
- **현실**: 카카오뱅크는 `3333` / `7979` 두 prefix 만 사용.
- **보강 전략**: identifierPosition `{0,4}` + `identifiers: ["3333","7979"]` 로 좁힘.
- **사이드이펙트**: 없음 — 1자리 첫자리만 보면 다른 13d 기관과 동률 나는 모호함이 해소.

### 12.5 092 토스뱅크 — 3→4자리 tightening + additionalRule

- **PDF 상태**: `XXX-XXXXXXXX-X` 과목(3) + 일련(8) + 검증(1) — 보통 100 / 기업자유 150.
- **현실**: 토스 100·150 은 신한 12d 100·150 과 충돌. 실세계 토스 계좌는 `1000` / `1500` 4자리 prefix 만 발급.
- **보강 전략**: identifierPosition `{0,4}` + `identifiers: ["1000","1500"]` + `additionalRules: [(d) => d.length===12 && (d.startsWith("1000") || d.startsWith("1500"))]` 로 신한과 분리.
- **사이드이펙트**: 없음 (신한 100·150 입력은 토스 후보에서 빠지고 신한이 단독).

### 12.6 005 하나은행 — 외환 14d 광범위 휴리스틱

- **PDF 상태**: 외환 통합 14d (점번호 8개): 117·158·161·162·210·379·600·655.
- **현실**: 실제 외환은행 발급 14d 는 더 많은 점번호 (395·427·556·617 등) 를 사용.
- **보강 전략**: 일반 시중은행 앱 휴리스틱 — 4번째 자리 "9" (주민번호 prefix 91/95/...) 를 1자리 identifier 로 등록. PDF 8개 prefix 는 라이브러리 본 패턴이 잡고, 그 외 광범위는 휴리스틱이 잡음.
- **사이드이펙트**: 외환 14d 가 KB·IBK 14d 와 우연히 동률 나서 흡수되던 회귀가 있음 — KB / IBK 측에 `d[3]!=="9"` 가드가 짝으로 들어가야 함 ([§ 12.2](#122-004-kb국민--14d-본점-신계좌-pdf-미명시-패턴-추가) · [§ 12.7](#127-003-ibk기업은행--외환-흡수-회피-가드)).

```ts
const HANA_FOREIGN_LEGACY_PREFIXES_FOR_HEURISTIC = new Set([
  "117","158","161","162","210","379","600","655",
]);
const hanaExtended = defineInstitution({
  id: "hana",
  // ... 메타, successorOf: ["keb-foreign-exchange"] ...
  patterns: [
    ...(hanaCore?.patterns ?? []),
    {
      template: T("XXX-XXXXXX-XXXXX"),
      kind: "merged-legacy",
      identifierPosition: { start: 3, length: 1 },
      identifiers: ["9"],
      additionalRules: [
        (d) => d.length === 14,
        (d) => !HANA_FOREIGN_LEGACY_PREFIXES_FOR_HEURISTIC.has(d.slice(0, 3)),
      ],
    },
  ],
});
```

### 12.7 003 IBK기업은행 — 외환 흡수 회피 가드

- **PDF 상태**: IBK 14d new `XXX-XXXXXX-XX-XX-X` — 식별자/과목이 9~10번째 자리.
- **현실**: 4번째 자리 "9" 인 외환 14d 가 우연히 IBK 식별자 영역과 동률.
- **보강 전략**: IBK 14d new 패턴의 `additionalRules` 에 `d[3]!=="9"` 가드만 추가.
- **사이드이펙트**: 없음 (IBK 본점 14d 신계좌의 4번째 자리는 사실상 9 가 아님).

```ts
const ibkExtended = defineInstitution({
  id: "ibk",
  // ... 메타 ...
  patterns: ibkCore?.patterns.map((p) =>
    p.kind === "new" && p.template === T("XXX-XXXXXX-XX-XX-X")
      ? { ...p, additionalRules: [...(p.additionalRules ?? []), (d: string) => d[3] !== "9"] }
      : p,
  ) ?? [],
});
```

### 12.8 012 농협중앙회 — 11d 단위/지역농협 fallback

- **PDF 상태**: 농협은행(011) 11d 만 enumerate, 농협중앙(012) 11d 는 미명시.
- **현실**: 단위·지역농협이 실제로 11d 계좌를 발급.
- **보강 전략**: 농협중앙(012) patterns 에 11d fallback 패턴을 추가하되 011 농협은행과 동일한 과목 체계 (보통:01 / 저축:02 / 자유저축:12 / 가계종합:06 / 당좌:05 / 기업자유:17) 로 매핑.
- **사이드이펙트**: 없음.

---

## 13. 보강 분류표 + 결정 트리

[§ 12](#12-컨슈머-보강-카탈로그-실세계-패턴-라이브러리) 의 8건을 *어떤 신호 → 어떤 기법* 으로 추상화하면 5가지로 떨어진다.

| 분류 | 의도 | 기법 | 사례 |
|---|---|---|---|
| **과목코드 확장** | PDF 가 enumerate 안 한 운영 과목 추가 | `subjects: [...pdf, ...extra]` (같은 patterns 위) | savings-bank |
| **신규 패턴** | PDF 에 없는 자릿수/형식의 patterns 자체 추가 | `patterns: [...core, newPattern]` | kb 본점 14d, nh-coop 11d |
| **Prefix tightening** | 1~3자리 → 더 긴 prefix 로 좁힘 | `identifierPosition.length` ↑ + `identifiers` 좁힘 | kbank 100, kakao 3333/7979, toss 1000/1500 |
| **휴리스틱 광범위 매칭** | PDF 명시 prefix 외 광범위 신호 (4번째 자리 등) | 1자리 identifier + `additionalRules` 게이트 | hana 외환 d[3]="9" |
| **충돌 가드** | 다른 기관이 우연 동률로 흡수하는 회귀 차단 | 기존 패턴 `additionalRules` 에 가드 추가 | kb 14d / ibk 14d 의 `d[3]!=="9"` |

### 결정 트리

```
PDF 에 코드/패턴이 있는가?
├─ 있는데 enumerate 부족             → 과목코드 확장
├─ 식별이 너무 약함 (1자리 첫자리만)   → Prefix tightening
├─ PDF 외 광범위 prefix 가 실세계 존재 → 휴리스틱 + (인접 기관) 충돌 가드
└─ 자릿수/형식 자체가 PDF 에 없음     → 신규 패턴 (+ 인접 기관 충돌 가드 검토)
```

**경험칙**:
- 휴리스틱을 추가했다면 *반드시 인접 기관 가드 페어* 를 점검 (외환 14d 휴리스틱 + KB/IBK 14d 가드).
- Prefix tightening 은 신뢰도를 *높이는* 게 아니라 *혼동을 줄이는* 도구 — 동률 회피가 1차 목적.
- 신규 패턴은 PDF 갱신 시 가장 깨지기 쉬움 — 새 PDF 가 같은 자릿수에 패턴을 enumerate 했는지 [§ 14 마이그레이션](#14-마이그레이션-가이드) 에서 확인.

---

## 14. 마이그레이션 가이드

> 이 섹션은 라이브러리 코어가 갱신될 때 컨슈머 보강 detector 를 어떻게 rebase 하는지의 체크리스트. 새 CMS PDF 가 나오거나 라이브러리 minor 가 올라갈 때 참조.

### 14.1 코어 진단

`defaultDetector.institutions` 의 변화를 진단. id 가 새로 추가됐거나 삭제됐는지, code 가 바뀌었는지.

```ts
import { defaultDetector } from "korean-account";
const ids = new Set(defaultDetector.institutions.map((i) => i.id));
console.log([...ids]);
// 기존 컨슈머 보강 id 들이 모두 있는지 diff
```

### 14.2 보강 충돌 확인

컨슈머가 `institutionById(id)?.patterns` 로 spread 했던 모양이 신코어와 호환되는지 검증. `pickPattern(id, { kind, length })` 로 *건드릴 패턴이 살아 있는지* 확인.

```ts
import { pickPattern } from "korean-account";
// teacher-web 의 IBK 가드는 14d new 패턴에 의존
pickPattern("ibk", { kind: "new", length: 14 });
// → null 이면 코어 변경으로 패턴이 사라진 것 — 가드 보강 재설계 필요
```

### 14.3 분기 규칙 변경 흡수

컨슈머가 자체 분기 규칙을 썼다면 신 코어 분기와 충돌이 없는지 확인. 라이브러리 분기 8건과 컨슈머 분기를 함께 정렬해 같은 자릿수·prefix 에 두 규칙이 동시에 발동하지 않도록.

### 14.4 휴리스틱 재검증

PDF 가 새 prefix 를 enumerate 했다면 (예: 외환 8개 → 12개) 컨슈머 휴리스틱의 제외 set (예: `HANA_FOREIGN_LEGACY_PREFIXES_FOR_HEURISTIC`) 을 갱신. 그래야 PDF 본 패턴이 잡을 케이스를 휴리스틱이 medium 으로 깎지 않는다.

### 14.5 회귀 dry-run

실 데이터 N건을 신코어 + 컨슈머 보강 detector 에 흘려 mismatch 추적. 라이브러리 변경이력 8차의 "57건 dry-run → 18→11건 mismatch" 가 표준 패턴.

```ts
import { detectBest } from "korean-account";
const cases: ReadonlyArray<{ input: string; expected: string }> = [...];
const mismatches = cases.filter((c) => detectBest(c.input)?.institution.code !== c.expected);
console.log(mismatches.length, mismatches);
```

---

## 15. 한계

- **PDF 비명시 케이스 미커버** — 기본 detector 는 PDF 에 적힌 코드만 매칭. 컨슈머가 자체 도메인 보강을 [§ 12](#12-컨슈머-보강-카탈로그-실세계-패턴-라이브러리) · [§ 13](#13-보강-분류표--결정-트리) 패턴으로 더한다.
  - 상호저축은행(050) 실세계 과목 코드, KB 본점 14d, 카카오 4자리, 토스 4자리, K뱅크 100, 농협중앙 11d fallback, 외환 14d 광범위 등.
  - 각 은행 내부 운영 특수 가상/상품 코드, B2B 가상계좌 발급사 prefix 등.
- **체크디지트 알고리즘 미구현** — PDF 가 알고리즘을 비공개. 라이브러리는 [§ 11.6](#116-체크디지트-검증) 의 framework 만 제공하며 알고리즘은 컨슈머가 외부 자료로 채워 넣는다.
- **서비스 미참가 외국계** (HSBC 054 / 도이치 055 / JPMC 057 / BNP파리바 061) 는 메타만 등록.
- **Prefix 모호성** — PDF 가 동일 prefix 를 여러 기관에 enumerate 한 경우 (예: 토스 12d 가상 17·19 vs 신협 12d 적금 170~178, 신한 12d 100·150 vs 토스 12d 신계좌 100·150). 라이브러리는 score 동률 시 priority 로 결정 — 더 강한 식별이 필요하면 컨슈머가 4자리 prefix 등 tightening 으로 보강.

## 16. 성능

`detect()` 호출당 평균 ~12-20µs (M-series Mac). 내부적으로 입력 길이에 맞는 institution 만 평가하는 인덱스 (`byLengthNear`) 를 사용해 ~60곳 × ~3 패턴 ≈ 180 평가를 평균 10~15회로 단축한다.

가속이 더 필요하면 `useMemo` / `useDeferredValue` 같은 일반적인 React 디바운스 패턴으로 충분히 대응 가능.

## 17. 참고

- [DOCS.md](./DOCS.md) — CMS 표준 (2026.05.08) 발췌 정리 (60곳 표 행 직접 인용).
- [금융결제원 PDF 원본](https://www.cmsedi.or.kr/cms/board/workdata/view/1026).
- 컨슈머 보강 예시: `apps/teacher-web/src/features/academy/presentations/constants/bank-detection.ts` — 8건 사례 진실 원본.

## 18. 변경 이력

<details open>
<summary><strong>2026.05.18 — KFTC 표준은행코드 namespace 1급 노출 (9차)</strong></summary>

- **`Institution.commonCode?: string` 필드 신설** — CMS `code` 와 다른 표준은행코드를 명시. `hana` 만 `commonCode: "081"` 지정, 다른 13 메이저 은행 + 비은행/증권은 생략 (두 namespace 일치). README § 7.3 에 두 namespace 경계 설명 추가.
- **동기** — 같은 KFTC 가 운영하는 두 체계 (CMS 자동이체 vs 금융공동망 표준) 가 외환·하나 합병 (2015) 이후 분기. 컨슈머가 표준 namespace 서버를 쓰는 경우 변환 어댑터가 컨슈머마다 분산·재구현되던 한계 해소. PDF 도메인 사실 (같은 institution 이 두 namespace 에서 다른 코드를 가짐) 을 데이터 모델에 직접 반영.
- **teacher-web 컨슈머** — `BANK_MAP[d.institution.commonCode ?? d.institution.code]` 로 lookup. `BANK_LIST` 하나 code `"005"` → `"081"` 복원 (서버 `BankCodeSchema` enum 과 정합). 8차의 *bank.constant 005 정정* 은 컨슈머 lookup 직접 변환으로 대체.
- **회귀 가드** — `banks.spec.ts` 신규: 하나 `commonCode === "081"`, 나머지 13 메이저 + `hana-securities-cma` `commonCode === undefined` 검증. `bank-detection.spec.ts` 하나 회귀 케이스 `expectedCode` 005 → 081 갱신.

</details>

<details>
<summary><strong>2026.05.15 — 추천 품질 정밀화 (8차)</strong></summary>

- **identifier·subject 길이 보너스** — 매칭된 prefix 가 길수록 더 높은 신뢰도를 부여하도록 점수식에 `len − 1` 보너스를 도입. 1자리 +4 / 2자리 +5 / 3자리 +6 / 4자리 +7. 실세계 일반 은행 앱과 동일한 직관 — KB 12d 구계좌(2자리 식별자) vs 신한 12d(3자리 식별자) 같은 동률 모호함이 자연 해소.
- **`additionalRules` 게이트 시맨틱** — 자릿수가 일치하는 입력에서 룰이 하나라도 false 면 패턴을 후보에서 제외. 종전엔 점수만 깎이고 매칭은 살아남던 동작이라, 가드를 의도한 패턴(`d[3]==="9"` 외환 14d 신호 등) 이 실제로 가드 역할을 못 했음. 통과 시 룰 1건당 `+1` 가산은 그대로.
- **`branchRuleMatch +2` 가중치 추가** — PDF 가 명시한 분기 규칙이 패턴 매칭 시 *추가적인 강한 식별 신호* 라는 의미. 토스 12d 가상 17·19 vs 신협 12d 적금 170~178 같은 prefix 모호함에서 분기 통과 측을 우선.
- **컨슈머 (teacher-web) 보강 7건** — 하나(005) 외환 14d 광범위 prefix 휴리스틱 (4번째 자리 "9", PDF 8개 prefix 외 광범위 매칭) + KB / IBK 14d new 패턴에 `d[3]!=="9"` 가드 (외환 14d 흡수 회피) + 저축은행·KB본점·K뱅크·카카오·토스 4자리·농협중앙 11d fallback. 라이브러리 PDF-strict 정책 유지.
- **`bank.constant.ts` 하나은행 코드 정정** — `code: "081"` (하나증권 CMA) → `"005"` (하나은행) 로 교정. detector 가 하나(005) 를 1순위로 잡아도 `BANK_MAP` 매핑이 없어 candidates 에서 누락되던 회귀를 차단.
- 실 데이터 57건 dry-run: 18건 mismatch → **11건** (61% 감소). 잔여 11건은 PDF 모호 prefix·사용자 오타 케이스로 알고리즘 한계 범위 밖.

</details>

<details>
<summary><strong>2026.05.15 — PDF 충실 정합 + 알고리즘 polish (7차)</strong></summary>

- PDF 명시 입금전용 패턴 8건 보강 — 농협(011) 13d 적금·신탁, 농협중앙(012) 13d 적금·신탁, 우체국(071) 14d 입금만 기타 코드(05·31~33·40~48·49·80~88), 새마을금고(045) 13d 신 저축·적금, 신협(048) 12d 적금, K뱅크(089) 14d 여신가상.
- `kbank14First79` 가 7/9 외 첫자리를 *여신가상(incoming-only)* 으로 추가 분기.
- 토스 12d 가상에 subject 17·19 등록 — 신협 12d 적금과의 score 동률에서 priority 로 토스가 우선되도록.

</details>

<details>
<summary><strong>2026.05.15 — PDF-strict 정책 정착 (6차)</strong></summary>

KB 14d 신계좌·카카오 4자리·K뱅크 100·토스 4자리·신한 12d identifier exclusion·농협중앙 11d fallback·케이프 24=ISA·NH투자 effectiveFrom 등 *PDF 외 보강* 9건을 라이브러리에서 제거하고 컨슈머(teacher-web) 측 `defaultDetector.extend(...)` 로 이관. `extend()` 가 *같은 id 가 들어오면 replace-on-id* 로 동작하도록 알고리즘 보강.

</details>

<details>
<summary><strong>2026.05.15 — 분기 규칙 정정 (1~5차)</strong></summary>

수협 11d/12d branchRule 위치·논리 정정, 농협중앙 14d 구가상(66/67) 추가, 광주 12d `716` ISA·13d `109` 보통·신계좌 13자리 자릿수 정합, 신한 14d 가상 561/562 보통 통일, 산림조합 12d / 우체국 14d 자릿수 정합, 아이엠증권 10d 자릿수, 교보·엘에스 증권 입금전용 코드 추가, 농협 13d 끝자리(계좌구분) 분기 제거 (적금/신탁 별도 패턴으로 대체).

</details>

## License

MIT.
