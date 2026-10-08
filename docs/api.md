[문서 목록](../DOCS.md) · [빠른 시작](../README.md)

<a id="appendix-a-api-레퍼런스"></a>

# Appendix A. API 레퍼런스

README 는 가장 흔히 쓰는 `detectBest` / `detect` / `createDetector` 까지만 다룬다. 이 Appendix 는 자체 detector 를 구성하거나 결과 객체를 깊게 활용할 사람을 위한 전체 레퍼런스다.

**A.1 타입 → A.2 스코어링 → A.3 점수 walkthrough → A.4 tie-break `prevalence` → A.5 분기 규칙** 순서로, 결과 객체의 모양 → 점수가 만들어지는 과정 → 동점이 갈리는 기준 → 후처리 분기 순으로 읽으면 된다.

<a id="a1-타입"></a>

## A.1 타입

<a id="institution"></a>

### `Institution`

| 필드                | 타입                                                       | 필수     | 의미                                                                                                                         |
| ------------------- | ---------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `id`                | `string` (literal)                                         | ✓        | 라이브러리 내부 id (예: `"shinhan"`, `"savings-bank"`).                                                                      |
| `code`              | `string` (literal)                                         | ✓        | CMS namespace 3자리 코드 (예: `"088"`).                                                                                      |
| `commonCode`        | `string`                                                   |          | **KFTC 금융공동망 표준은행코드**. CMS `code` 와 다른 경우만 지정. 미지정 시 `code` 와 동일. 두 namespace 의 경계는 § 6 참조. |
| `aliasCodes`        | `readonly string[]`                                        |          | 통합·합병으로 흡수된 CMS 코드 (예: 신한 088 ← 021/026/028).                                                                  |
| `nameKo` / `nameEn` | `string`                                                   | nameKo ✓ | 표시명.                                                                                                                      |
| `category`          | `"bank"` \| `"non-bank"` \| `"securities"` \| `"clearing"` | ✓        |                                                                                                                              |
| `aliases`           | `readonly string[]`                                        | ✓        | 검색 보조 (예: `["국민", "KB"]`).                                                                                            |
| `userBaseMillions`  | `number`                                                   |          | 리테일 고객 규모(백만 명). tie-break prior 의 원천 데이터 — 아래 A.4 표 참고.                                                |
| `priority`          | `number`                                                   |          | tie-break 수동 오버라이드. 지정 시 `prevalence` 계산식을 완전히 대체. `userBaseMillions` 를 우선 사용할 것.                  |
| `patterns`          | `readonly AccountPattern[]` (≥1)                           | ✓        | 자릿수별 variant. 아래 § A.1 `AccountPattern` 참조.                                                                          |
| `successorOf`       | `readonly string[]`                                        |          | 합병 전 기관 id (예: 하나 ← `keb-foreign-exchange`).                                                                         |
| `notes`             | `string`                                                   |          |                                                                                                                              |

<a id="accountpattern"></a>

### `AccountPattern`

| 필드                  | 타입                        | 의미                                                                                                                         |
| --------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `template`            | `PatternTemplate`           | `patternTemplate("XXX-XX-XXXXXX")` 로 만든 브랜드 문자열. `X` = 한 자리, `-` = 시각 그루핑.                                  |
| `kind`                | `AccountKind`               | new / old / virtual / lifetime / incoming-only / merged-legacy.                                                              |
| `identifierPosition`  | `DigitSpan`                 | 0-indexed digit 범위 `{ start, length }`.                                                                                    |
| `identifiers`         | `readonly string[]`         | identifierPosition 자리에 일치해야 할 값들.                                                                                  |
| `identifierRange`     | `{ from, to }`              | identifiers 대신 숫자 range 로 매칭 (수치 비교).                                                                             |
| `subjectPosition`     | `DigitSpan`                 | 과목 코드 위치. identifierPosition 과 같을 수도, 다를 수도.                                                                  |
| `subjects`            | `readonly Subject[]`        | subjectPosition 자리의 값과 매칭.                                                                                            |
| `checkDigitPosition`  | `DigitSpan`                 | 체크디지트 위치. 알고리즘은 PDF 가 비공개이므로 검증 미구현.                                                                 |
| `validatesCheckDigit` | `boolean`                   | `false` 면 명시적 미검증 (광주 12d 731, 수협 분리 이후 등). 미지정 시 알고리즘 자체 미구현.                                  |
| `branchRule`          | `BranchRule`                | 패턴 매칭 후 institution / kind / virtual 을 override 하는 분기 (§ A.5).                                                     |
| `additionalRules`     | `readonly AdditionalRule[]` | **게이트 + 가산**. 자릿수가 일치하는 입력에서 하나라도 false 면 _패턴 자체가 후보에서 제외_. 모두 통과해야 룰 개수만큼 가산. |
| `effectiveFrom`       | `string`                    | 신규 코드 적용일.                                                                                                            |
| `note`                | `string`                    |                                                                                                                              |

> **⚠️ `additionalRules` 의 게이트 시맨틱** — 종전엔 점수만 깎고 매칭은 살아남는 동작이라 가드 의도(`d[3]==="9"` 외환 14d 신호 등) 가 가드 역할을 못 했다. 8차 (2026.05.15) 이후 자릿수 일치 입력에서 룰이 false 면 패턴은 제외된다. 부분 입력 (lengthExact / lengthNear 가 아닌 짧은 입력) 에서는 가드를 면제해 점수 인플레이션을 막는다.

<a id="detectionresult--detectioncapabilities"></a>

### `DetectionResult` & `DetectionCapabilities`

| 필드                               | 타입                              | 의미                                                                                                                        |
| ---------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `institution`                      | `Institution`                     | 1순위 institution (literal narrow 유지).                                                                                    |
| `matchedPattern`                   | `AccountPattern`                  | 어느 variant 가 매칭됐는지.                                                                                                 |
| `kind`                             | `AccountKind`                     | branchRule override 가 발생했으면 override 된 값.                                                                           |
| `subject`                          | `Subject?`                        | 과목 매칭이 있었을 때만.                                                                                                    |
| `formatted`                        | `string`                          | template 형식으로 그루핑된 표시값.                                                                                          |
| `score`                            | `number`                          | 점수 (§ A.2).                                                                                                               |
| `confidence`                       | `"high"` \| `"medium"` \| `"low"` | ≥7 / 4–6 / 1–3.                                                                                                             |
| `capabilities.allowsWithdrawal`    | `boolean`                         | 자동이체 출금 가능 여부. virtual/incoming-only/lifetime kind 면 false. subject 의 `allowsWithdrawal` 도 반영.               |
| `capabilities.virtual`             | `boolean`                         | 가상계좌 (입금 전용 가능성 큼).                                                                                             |
| `capabilities.validatedCheckDigit` | `boolean \| null`                 | **3-state**: `true` (verifier 통과) / `false` (verifier 실패) / `null` (verifier 미등록 또는 `validatesCheckDigit: false`). |

<a id="보조-타입"></a>

### 보조 타입

| 타입                     | 의미                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `DigitSpan`              | `{ start: number; length: number }` — 0-indexed digit 범위.                                                      |
| `Subject`                | `{ code, category, label?, allowsWithdrawal?, virtual?, effectiveFrom?, note? }`. 기본 `allowsWithdrawal: true`. |
| `BranchRule`             | `{ describe: string; evaluate: (digits) => BranchRuleResult \| null }`.                                          |
| `BranchRuleResult`       | `{ institutionId?, kindOverride?, virtualOverride? }`.                                                           |
| `AdditionalRule`         | `(digits: string) => boolean`.                                                                                   |
| `GlobalRule`             | `(digits: string, institution: Institution) => boolean`. detector 레벨 전역 룰.                                  |
| `CheckDigitVerifier`     | `(digits: string) => boolean`.                                                                                   |
| `ScoringWeights`         | 점수 가중치 partial — § A.2 참조.                                                                                |
| `Detector<I>`            | `{ institutions; detect(); extend(); remove() }`. immutable.                                                     |
| `InstitutionIdInput<Id>` | `Id \| (string & Record<never, never>)` — autocomplete + widening. 등록 id 자동완성하되 외부 확장 id 도 받음.    |

<a id="accountkind-6종"></a>

### `AccountKind` (6종)

| `AccountKind`   | 의미                                       | `allowsWithdrawal` 기본      | `virtual` 기본 | 라벨            |
| --------------- | ------------------------------------------ | ---------------------------- | -------------- | --------------- |
| `new`           | 차세대(신) 계좌                            | true (subject override 가능) | false          | 신계좌          |
| `old`           | 구 계좌                                    | true                         | false          | 구계좌          |
| `virtual`       | 가상계좌                                   | **false**                    | **true**       | 가상계좌        |
| `lifetime`      | 평생계좌 / 고객지정 / 핸드폰               | **false**                    | false          | 평생계좌        |
| `incoming-only` | 입금 전용 (적금·신탁·연계)                 | **false**                    | false          | 입금전용        |
| `merged-legacy` | 합병 전 구 시스템 (외환·조흥·한일·평화 등) | true                         | false          | 구통합(합병 전) |

<a id="subjectcategory-13종"></a>

### `SubjectCategory` (13종)

- **PDF 표준 10종**: `ordinary` (보통) · `treasury` (국고) · `savings` (저축) · `free-savings` (자유저축) · `household-current` (가계당좌) · `current` (당좌) · `corporate-free` (기업자유) · `yes` (YES) · `linked` (연계) · `other` (기타)
- **입금전용 분류 확장 3종**: `installment` (적금, 입금만) · `trust` (신탁, 입금만) · `isa` (ISA, 출금이체 제한)

<a id="a2-스코어링"></a>

## A.2 스코어링

```
input
  ↓ normalizeAccount "318-081775-01-014" → "31808177501014"
  ↓ scorePattern     length / identifier / subject / additionalRules 가산
  ↓ branchRule       institution / kind / virtual override
  ↓ filter           categories / kinds / include / exclude / minScore
  ↓ sort             score → prevalence(userBaseMillions × 카테고리 계수) → kindOrder
  ↓ narrow           top 이 high/medium 이면 low 후보 제거
  ↓ limit            기본 5건
DetectionResult[]
```

<a id="점수-가중치-기본값"></a>

### 점수 가중치 (기본값)

| 신호                          |                      점수 |
| ----------------------------- | ------------------------: |
| 자릿수가 템플릿과 정확히 일치 |                        +3 |
| 자릿수가 ±1 (입력 중)         |                        +1 |
| identifier 매칭 (정확 길이)   |    +4 + (식별자 길이 − 1) |
| identifier 매칭 (부분 입력)   |        floor(위 점수 / 2) |
| subject 매칭 (정확 길이)      | +3 + (과목 코드 길이 − 1) |
| subject 매칭 (부분 입력)      |        floor(위 점수 / 2) |
| additionalRule 통과당         |       +1 (가드 통과 필수) |
| branchRule override 발생      |                        +2 |
| globalRule 통과당             |                        +1 |
| kindNewBonus                  |               +0 (옵트인) |

부분 입력 시 절반 점수 — 같은 점수대에서 "정확 길이 기관" 이 우선되도록 보호.

**길이 보너스 (식별자·과목)**: 일반 은행 앱과 동일하게 _더 긴 prefix 매칭에 더 높은 신뢰도_ 를 부여. 1자리 매칭 +4, 2자리 +5, 3자리 +6, 4자리 +7.

**`additionalRules` 게이트**: 자릿수가 일치하는 입력에서 룰이 하나라도 false 면 패턴은 후보에서 제외. 통과한 룰 1건당 +1.

<a id="신뢰도"></a>

### 신뢰도

| score | confidence |
| ----- | ---------- |
| ≥ 7   | high       |
| 4–6   | medium     |
| 1–3   | low        |
| 0     | (제외)     |

1순위가 `high` 또는 `medium` 이면 결과에서 `low` 후보를 자동 제거한다.

<a id="가중치-커스터마이징"></a>

### 가중치 커스터마이징

```ts
import { createDetector, institutions } from "korean-account";

const aggressive = createDetector(institutions, {
  scoring: { identifierMatch: 6, subjectMatch: 4, kindNewBonus: 1 },
});
```

<a id="a3-점수-walkthrough"></a>

## A.3 점수 walkthrough

<a id="case-a-100-123-456789-12자리"></a>

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
  total                 14    → 동률, prevalence 결정

토스 12d (컨슈머 tightening: identifiers ["1000","1500"]):
  identifier "1001" (4자리) → "1000"·"1500" 모두 불일치 → 매치 안 됨
  additionalRule: d.startsWith("1000") || d.startsWith("1500") → false
  rulesApply true (lengthExact), rule false → 패턴 제외
  total                 0
```

**결론**: 신한 우선 — 입력이 `1000` / `1500` 으로 시작하는 경우에만 토스가 후보에 든다.

<a id="case-b-123456-04-789012-14자리-d34"></a>

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
  total                              0
```

**결론**: KB 우선.

<a id="case-c-427-910255-21607-14자리-d39-pdf-외-prefix"></a>

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
```

**결론**: 하나 우선. 가드 두 줄 (KB / IBK) 이 외환 흡수를 차단하고 휴리스틱이 medium 으로 1순위 차지.

<a id="a4-tie-break-prior--prevalence"></a>

## A.4 Tie-break prior — `prevalence`

점수가 동률일 때만 쓰는 사전확률(prior)이다. 증거 점수(자릿수·식별자·과목·규칙)에 절대 더해지지 않고 비교로만 쓰이므로, 실제 매칭 신호를 뒤집을 수 없다.

```
prevalence(i) = i.priority                              // 수동 오버라이드가 있으면 그대로
              ∥ (i.userBaseMillions ?? 0) × 계수(category)

계수: bank 1.0 · non-bank 0.6 · securities 0.25 · clearing 0
```

`userBaseMillions` 는 "국내 리테일 고객 수(백만 명)" 이다. 실측치는 출처를 명기했고, 나머지는 공개 순위 조사(컨슈머인사이트 주거래/거래율 순위 등)와 통념적 시장 규모를 근거로 한 **추정치**다 — 추정치의 절대값을 신뢰하지 말 것(서수 관계만 유의미). 값이 실제와 다르다고 판단되면 이슈로 제보하거나 `extend` 로 오버라이드하면 된다.

| 기관                                                                                | 값   | 근거                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 카카오뱅크                                                                          | 26.7 | **실측** — 2,670만 명, [카카오뱅크 4Q25 실적발표](https://www.kakaobank.com/view/report/archive/earnings)                                                                              |
| 케이뱅크                                                                            | 15   | **실측** — 1,500만 명 돌파, [2025.10 보도](https://www.mt.co.kr/finance/2025/10/15/2025101508515560260)                                                                                |
| 토스뱅크                                                                            | 13.8 | **실측** — 1,375만 명, [2025.10 보도](https://www.businesspost.co.kr/BP?command=article_view&num=416146)                                                                               |
| KB국민 32 · NH농협 25 · 신한 24 · 우리 19 · 하나 18                                 | —    | 추정 — [컨슈머인사이트 주거래·거래율 순위](https://m.joseilbo.com/news/view.htm?newsid=505454) (KB > NH > 신한 > 우리/하나) 및 거래율 순위(KB > 카카오뱅크 > NH > 신한) 를 보존하는 값 |
| IBK 8, 지방은행 0.4–3.3, SC 2, 씨티 0.5(2021 소비자금융 철수), KDB 0.5, 외국계 0.01 | —    | 추정 — 영업권 인구·리테일 규모 통념                                                                                                                                                    |
| 새마을금고 17 · 농협중앙회 18 · 우체국 13 · 신협 12 · 저축은행 6 · 산림조합 0.6     | —    | 추정 — 조합원·거래자 규모 통념 (비은행 계수 0.6 적용)                                                                                                                                  |
| 증권사 0.7–14 (키움 14 최상)                                                        | —    | 추정 — 리테일 계좌 규모 순위 보존용 (증권 계수 0.25 적용)                                                                                                                              |

증권사·상호금융의 수치는 **순위 보존용 추정**임을 다시 강조한다. 공식 실측(각 사 IR·중앙회 발표)이 확인되는 대로 값을 교체하고 이 표의 근거를 갱신한다.

<a id="a5-분기-규칙"></a>

## A.5 분기 규칙

분기 규칙은 _패턴 매칭 후_ institution / kind / virtual 을 다시 쓰는 후처리다. PDF 가 명시한 8건만 라이브러리가 가진다.

| 규칙 export                | 자릿수 | 발동 조건                                                   | 분기 의도                                                     |
| -------------------------- | ------ | ----------------------------------------------------------- | ------------------------------------------------------------- |
| `suhyup11BranchToCoop`     | 11     | 4·5번째 자리가 43–45/47/49/59/61–64/66–68/74/75/78/81–85/93 | 수협 007/030 분리 (2025.11.10) — 중앙회로 라우팅              |
| `suhyup12BranchToCoop`     | 12     | 1번째 자리가 2/7/9                                          | 수협 007 → 030 (중앙회)                                       |
| `suhyup14BranchToCoop`     | 14     | 1·2·3번째가 493 또는 481–489                                | 수협 14d 가상 → 030                                           |
| `suhyupCoop12BranchToBank` | 12     | 수협중앙 12d, 1번째가 2/7/9 아니면                          | 중앙회 → 007 (은행) 역라우팅                                  |
| `kb11FirstDigit`           | 11     | d[0]=0 → incoming-only / d[0]=9 → lifetime                  | KB 입금전용/평생계좌 식별                                     |
| `kbank10First9`            | 10     | d[0]=9                                                      | K뱅크 10d 입금전용                                            |
| `kbank14First79`           | 14     | d[0]=7/9 → virtual / 그 외 → incoming-only                  | 간편송금/안심계좌 vs 여신가상                                 |
| `toss12First1719`          | 12     | d[0:2]=17 또는 19                                           | 토스 12d 가상 (신협 12d 적금 170–178 과의 prefix 모호성 해소) |

분기 규칙은 패턴의 `branchRule` 필드로 연결되며, 매칭 시 score 에 `branchRuleMatch` (+2) 가산.

---

<a id="d4-선택자--메타-조회"></a>

## D.4 선택자 & 메타 조회

<a id="getinstitution-literal-narrow"></a>

### `getInstitution` (literal narrow)

id 또는 CMS 코드(별칭 포함) 로 조회한다. 등록된 id / code literal 을 직접 넘기면 반환 타입이 **non-null** 이고 `id` · `code` · `category` 가 literal 로 좁혀진다. 런타임 문자열(비 literal)을 넘기면 `Institution | null` 로 widen 된다.

```ts
import { getInstitution } from "korean-account";

const shinhan = getInstitution("shinhan"); // 등록 literal → non-null
shinhan.id; // "shinhan"
shinhan.code; // "088"
shinhan.category; // "bank"

const ibk = getInstitution("003"); // CMS 코드 literal 도 동일
ibk.id; // "ibk"
```

<a id="searchinstitutions-type-safe-filter"></a>

### `searchInstitutions` (type-safe filter)

`searchInstitutions` 는 `categories` / `include` / `exclude` 를 cross-narrow 한다 (`SearchInstitutionsFilter`). `categories` 가 지정되면 `include` / `exclude` 가 받을 수 있는 id 도 그 카테고리 안의 id 로 제한된다.

```ts
import { searchInstitutions } from "korean-account";

const bankList = searchInstitutions({ categories: ["bank"] });

const major = searchInstitutions({
  categories: ["bank"],
  include: ["kb", "shinhan", "hana"],
});

// ❌ 컴파일 에러: "kiwoom" 은 securities 라 bank 카테고리 안에 없음
// searchInstitutions({ categories: ["bank"], include: ["kiwoom"] });

const big5 = searchInstitutions({
  include: ["kb", "shinhan", "hana", "woori", "nh"],
});
```

<a id="pickpattern"></a>

### `pickPattern`

특정 institution 의 단일 패턴을 자릿수·kind 로 골라온다. 컨슈머 보강이 코어 패턴 위에 spread 할 때, 코어 갱신 후에도 _건드릴 패턴이 살아 있는지_ 검증하는 데 유용하다.

```ts
import { pickPattern } from "korean-account";

pickPattern("kb", { kind: "new", length: 14 });
```

<a id="d5-보조--라벨--저수준-유틸--zod-스키마"></a>

## D.5 보조 — 라벨 · 저수준 유틸 · zod 스키마

<a id="라벨"></a>

### 라벨

```ts
import { accountKindLabels, subjectCategoryLabels } from "korean-account";

accountKindLabels.virtual; // "가상계좌"
accountKindLabels["incoming-only"]; // "입금전용"
subjectCategoryLabels.ordinary; // "보통예금"
subjectCategoryLabels.savings; // "저축예금"
```

<a id="저수준-유틸"></a>

### 저수준 유틸

```ts
import {
  normalizeAccount,
  formatAccount,
  extractIdentifier,
  extractSubject,
  patternTemplate,
  scoreToConfidence,
  defineSubject,
  defineBranchRule,
} from "korean-account";

normalizeAccount("110-436-387740"); // "110436387740"
formatAccount("110436387740", patternTemplate("XXX-XXX-XXXXXX")); // "110-436-387740"
```

<a id="검증-어댑터-5종--동일-계약"></a>

### 검증 어댑터 5종 — 동일 계약

`korean-account/{zod,valibot,yup,arktype,standard-schema}` 는 전부 같은 5개 스키마를 내보낸다: `accountSchema` · `institutionIdSchema` · `accountKindSchema` · `subjectCategorySchema` · `detectionSchema`. 규칙·한국어 메시지의 단일 출처는 `src/adapters/shared.ts` 이고, `adapter-contract.fixtures.ts` 의 계약 표를 다섯 어댑터가 각자의 parse 로 실행해 동작 동일성을 CI 에서 강제한다. peer 는 전부 optional (standard-schema 는 peer 없음 — 의존성 0). 새 어댑터 추가 절차는 CONTRIBUTING "새 밸리데이터 어댑터 추가" 참고.

알려진 편차: arktype 의 `detectionSchema` 중첩 필드 에러 메시지는 arktype 기본(영어 조합) — 통과/거부 동작은 동일하다.

<a id="zod-스키마-korean-accountzod"></a>

### zod 스키마 (`korean-account/zod`)

검증이 필요한 경우에만 서브 엔트리에서 가져온다. 메인 진입점은 zod 를 require 하지 않으며, zod v3 (≥3.23) 과 v4 를 모두 지원한다.

```ts
import {
  accountSchema,
  institutionIdSchema,
  detectionSchema,
  accountKindSchema,
  subjectCategorySchema,
} from "korean-account/zod";

accountSchema.parse("110-436-387740");
```

---

## 검증 어댑터의 입출력

`accountSchema`는 정규화한 숫자 개수와 입력 문자를 검사하지만 반환값은 원래 문자열이다. 정규화가 필요하면 별도로 `normalizeAccount`를 호출한다.

`detectionSchema`는 직렬화용 `DetectionPayload`를 검사한다. `institution` 객체가 있는 `DetectionResult`를 그대로 전달하는 API가 아니다. `institutionId` 등 필요한 필드를 명시적으로 변환한다. 내장 기관 ID 스키마는 등록 ID만 허용한다.

confidence는 계좌 실재·예금주·입력 완료 확률이 아니다. capability도 정적 규칙에 따른 안내이며 은행의 실제 자동이체 가능 여부를 보장하지 않는다. 상세 근거와 알려진 차이는 [PDF 대조 기록](./source-audit.md)에 있다.
