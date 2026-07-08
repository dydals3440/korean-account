# korean-account

[English](./README.en.md) · **한국어**

> 한국 금융기관 계좌번호를 식별·분류·검증하는 TypeScript 라이브러리. [금융결제원 CMS 참가기관별 계좌번호체계 (2026.05.08)](https://www.cmsedi.or.kr/cms/board/workdata/view/1026) 을 단일 출처로 따른다.

<p align="center">
  <img src="https://raw.githubusercontent.com/dydals3440/korean-account/main/showcase.gif" alt="korean-account 시연" width="400" />
</p>

[![npm](https://img.shields.io/npm/v/korean-account.svg?style=flat-square)](https://www.npmjs.com/package/korean-account)
[![bundle](https://img.shields.io/bundlephobia/minzip/korean-account?style=flat-square)](https://bundlephobia.com/package/korean-account)
[![license](https://img.shields.io/npm/l/korean-account.svg?style=flat-square)](./LICENSE)
[![ci](https://img.shields.io/github/actions/workflow/status/dydals3440/korean-account/ci.yml?branch=main&style=flat-square&label=ci)](./.github/workflows/ci.yml)

```bash
pnpm add korean-account
# npm i korean-account · yarn add korean-account · bun add korean-account
```

```ts
import { detectBest } from "korean-account";

detectBest("110-436-387740");
// {
//   institution: { id: "shinhan", code: "088", nameKo: "신한은행", ... },
//   kind: "new",
//   subject: { code: "110", category: "savings", label: "저축예금" },
//   formatted: "110-436-387740",
//   score: 14,
//   confidence: "high",
//   capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: null },
// }
```

- **PDF 충실 코어** — KFTC CMS PDF 표 행을 그대로 옮긴 57곳 기관 레지스트리
- **strict TypeScript** — `institutionById("shinhan").code` 가 `"088"` literal 로 narrow
- **런타임 의존성 0** — zod 는 `korean-account/schema` 를 쓸 때만 optional peerDep 로 요구
- **Universal** — Node 20.19+ · Bun · Deno · 브라우저 · ESM·CJS 동시 지원

상세 레퍼런스: [DOCS.md](./DOCS.md) · 변경 이력: [CHANGELOG.md](./CHANGELOG.md) · 기여: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 1. 왜 korean-account 인가

한국 계좌번호 검증은 보기보다 까다롭다. 은행마다 자릿수가 10~16자리로 제각각이고, 식별 코드 위치 (앞 3자리 / 가운데 4자리 / 끝 2자리), 과목 코드, 분기 규칙이 모두 다르다. 정규식 한두 줄로 풀리지 않고, 위키·블로그·SO 답변은 대부분 [KFTC 표준](https://www.cmsedi.or.kr/cms/board/workdata/view/1026) 과 일부 어긋난 상태로 떠돈다.

**기존 접근의 한계**:
- "길이만 검증" — 13자리 입력이 카카오뱅크인지 K뱅크인지 부산은행인지 구분 못 함
- "은행별 정규식 하드코딩" — 신규 코드·합병·가상계좌 prefix 가 나올 때마다 손으로 갱신
- "KFTC PDF 직접 파싱" — PDF 가 표·각주·예외 케이스로 비정형이라 매번 재구현

**korean-account 가 제공하는 것**:
1. [금융결제원 CMS PDF](https://www.cmsedi.or.kr/cms/board/workdata/view/1026) 표 행을 1:1 로 옮긴 단일 출처 레지스트리 (시중·인터넷·외국계 은행 + 비은행 + 증권사 약 57곳)
2. 입력 한 줄로 기관 식별 + 계좌 종류(`new`/`old`/`virtual`/`lifetime`/…) + 과목(`보통예금`/`저축예금`/`자유예금`/…) 추출 + 신뢰도 점수
3. PDF 밖 도메인 — 사내 정산, B2B 가상계좌, 저축은행 운영 코드, 파트너 prefix tightening — 은 `defaultDetector.extend()` 로 컨슈머가 직접 보강

한 줄로: **es-hangeul 이 한글 유틸을 한곳에 모았다면, korean-account 는 한국 계좌번호의 식별·과목·검증을 PDF 충실로 한곳에 모은다.**

## 2. 설치

```bash
pnpm add korean-account
npm  i   korean-account
yarn add korean-account
bun  add korean-account
```

요구사항:
- **Node 20.19+** (`"engines": { "node": ">=20.19.0" }`) — 빌드 타겟은 ES2020 이고 `node:` 내장 모듈을 쓰지 않는다
- **TypeScript** 권장 (literal narrow 의 이점이 큼)
- **zod** 는 *optional peerDependency* — `korean-account/schema` 서브 엔트리를 import 할 때만 컨슈머 프로젝트에 zod 가 필요 (`^3.23.0 || ^4.0.0`)

## 3. 빠른 시작

### 단일 식별 — 1순위만 필요할 때

```ts
import { detectBest } from "korean-account";

const top = detectBest("3333-12-3456789");
if (top) {
  console.log(top.institution.nameKo, top.kind, top.confidence);
  // → "카카오뱅크" "new" "high"
}
```

### 여러 후보 + 필터링

```ts
import { detectAccount } from "korean-account";

// 카테고리 / 종류 / 화이트리스트·블랙리스트 / 결과 개수·최소 점수 조절
detectAccount("3333-12-3456789", { categories: ["bank"] });
detectAccount("110-436-387740", { kinds: ["new"] });
detectAccount("110-436-387740", { include: ["shinhan", "kb"] });
detectAccount("110-436-387740", { exclude: ["shinhan"], limit: 3, minScore: 4 });
```

### 어느 깊이로 쓸지 결정 매트릭스

| 상황 | 진입점 | 예상 코드량 |
|---|---|---|
| 폼에서 1순위만 알면 됨 | `detectBest` | 3줄 |
| 자동완성 후보 N개 | `detectAccount(input, { limit })` | 5줄 |
| 은행/증권 카테고리만 필터 | `pickInstitutions({ categories })` | 8줄 |
| 사내·B2B·파트너 도메인 보강 | `defaultDetector.extend({...})` | 20~30줄 |
| 점수 가중치 / 체크디지트 커스텀 | `createDetector({...})` | 50줄+ |

## 4. 지원 금융기관

> **출처**: 아래 모든 코드·자릿수·식별 위치·과목은 [금융결제원 CMS 참가기관별 계좌번호체계 (2026.05.08)](https://www.cmsedi.or.kr/cms/board/workdata/view/1026) 의 표 행을 그대로 옮긴 것이다. 새 PDF 가 게시되면 라이브러리 코어를 갱신하고, 컨슈머 확장은 그대로 호환된다.

### 4.1 은행 (25)

| 코드 | 한글명 | 영문명 | 자릿수 |
|---|---|---|---|
| 002 | KDB산업은행 | Korea Development Bank | 10·11·14 |
| 003 | IBK기업은행 | Industrial Bank of Korea | 10·11·14 |
| 004 | KB국민은행 | KB Kookmin Bank | 11·14·16 |
| 005 | 하나은행 | Hana Bank | 11·12·14 |
| 007 | 수협은행 | Suhyup Bank | 11·12·14 |
| 011 | NH농협은행 | NongHyup Bank | 11·12·13 |
| 020 | 우리은행 | Woori Bank | 11·13·14 |
| 023 | SC제일은행 | SC First Bank | 10·11 |
| 027 | 한국씨티은행 | Citibank Korea | 12·13·14·15 |
| 031 | iM뱅크 | iM Bank | 11·14 |
| 032 | 부산은행 | Busan Bank | 11·13 |
| 034 | 광주은행 | Gwangju Bank | 11·12·14 |
| 035 | 제주은행 | Jeju Bank | 11·12 |
| 037 | 전북은행 | Jeonbuk Bank | 11·14 |
| 039 | 경남은행 | Gyeongnam Bank | 11·12 |
| 054 | HSBC | HSBC | 14 *(서비스 미참가)* |
| 055 | 도이치은행 | Deutsche Bank | 10 |
| 057 | JP모간체이스 | JPMorgan Chase | 10 |
| 060 | BOA | Bank of America | 13·14 |
| 061 | BNP파리바 | BNP Paribas | 14 *(서비스 미참가)* |
| 081 | 하나증권 CMA | Hana Securities CMA | 14 |
| 088 | 신한은행 | Shinhan Bank | 11·12·14 |
| 089 | K뱅크 | K Bank | 10·13·14 |
| 090 | 카카오뱅크 | KakaoBank | 13 |
| 092 | 토스뱅크 | Toss Bank | 12 |

### 4.2 비은행 (7)

| 코드 | 한글명 | 영문명 |
|---|---|---|
| 012 | NH농협중앙회 | NongHyup Central |
| 030 | 수협중앙회 | Suhyup Central |
| 045 | 새마을금고중앙회 | Korean Federation of Community Credit Cooperatives |
| 048 | 신협중앙회 | Credit Union Central |
| 050 | 상호저축은행 | Mutual Savings Bank |
| 064 | 산림조합중앙회 | Forestry Cooperatives Central |
| 071 | 우체국 | Korea Post |

### 4.3 증권사 (24)

<details>
<summary>전체 목록 펼치기</summary>

| 코드 | 한글명 | 영문명 |
|---|---|---|
| 209 | 유안타증권 | Yuanta Securities |
| 218 | KB증권 | KB Securities |
| 238 | 미래에셋증권 | Mirae Asset Securities |
| 240 | 삼성증권 | Samsung Securities |
| 243 | 한국투자증권 | Korea Investment & Securities |
| 247 | NH투자증권 | NH Investment & Securities |
| 261 | 교보증권 | Kyobo Securities |
| 262 | 아이엠증권 | iM Securities |
| 263 | 현대차증권 | Hyundai Motor Securities |
| 264 | 키움증권 | Kiwoom Securities |
| 265 | 엘에스투자증권 | LS Securities |
| 266 | SK증권 | SK Securities |
| 267 | 대신증권 | Daishin Securities |
| 269 | 한화투자증권 | Hanwha Investment & Securities |
| 270 | 하나증권 | Hana Securities |
| 278 | 신한투자증권 | Shinhan Securities |
| 279 | DB증권 | DB Securities |
| 280 | 유진투자증권 | Eugene Investment & Securities |
| 287 | 메리츠증권 | Meritz Securities |
| 288 | 카카오페이증권 | KakaoPay Securities |
| 290 | 부국증권 | Bookook Securities |
| 291 | 신영증권 | Shinyoung Securities |
| 292 | 케이프투자증권 | Cape Investment & Securities |
| 294 | 우리투자증권 | Woori Investment & Securities |

</details>

### 4.4 청산 기관 (1)

| 코드 | 한글명 | 비고 |
|---|---|---|
| 099 | 금융결제원 (KFTC) | customer-facing 계좌 없음 — 메타 등록만 |

### 4.5 PDF 에 없는 기관·패턴은?

기본 `defaultDetector` 는 위 PDF 표에 적힌 행만 포함한다. PDF 가 enumerate 하지 않은 케이스 — 저축은행 가상계좌 운영 prefix, 사내 정산 계좌, 파트너사별 특화 prefix, 외환 14d 광범위 prefix 등 — 은 § 7 [확장](#7-확장) 에서 다룬다.

## 5. 핵심 API

목적별로 그룹화한 API 카탈로그. 전체 시그니처·옵션·예외 케이스는 [DOCS.md Appendix A–D](./DOCS.md) 참조.

### 5.1 계좌 식별 (Detection)

```ts
import { detectAccount, detectBest, defaultDetector, createDetector } from "korean-account";

detectAccount(input, options?) // → readonly DetectionResult[] (정렬됨, 기본 limit 5)
detectBest(input, options?)    // → DetectionResult | null  (1순위, minScore 미달이면 null)
defaultDetector                // → Detector — PDF-strict immutable 인스턴스
createDetector({ institutions, globalRules?, scoring?, checkDigitVerifiers? }) // 커스텀 detector
```

```ts
interface DetectOptions<Id extends string = string> {
  readonly categories?: readonly InstitutionCategory[];
  readonly kinds?: readonly AccountKind[];
  /** 등록 id 에 autocomplete + 외부 확장 id 도 허용 (widening) */
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
  readonly score: number;                // 0 ~ 약 14
  readonly confidence: "high" | "medium" | "low";  // ≥7 / 4-6 / 1-3
  readonly capabilities: {
    readonly allowsWithdrawal: boolean;
    readonly virtual: boolean;
    readonly validatedCheckDigit: boolean | null;  // null = verifier 미등록
  };
}
```

### 5.2 기관 메타 조회 (Lookup)

```ts
import { institutionById, institutionByCode, institutions } from "korean-account";

const shinhan = institutionById("shinhan");
shinhan?.code;     // "088" (literal)
shinhan?.category; // "bank" (literal)

const ibk = institutionByCode("003");
ibk?.id; // "ibk"

institutions; // readonly RegisteredInstitution[] — 등록 전체 (57곳)
```

### 5.3 선택자 (Selectors)

대량 institution 을 카테고리·종류·과목 유무 등으로 필터링.

```ts
import { pickInstitutions, pickInstitutionsByIds, pickPattern } from "korean-account";

pickInstitutions({ categories: ["bank"], hasSubject: true });
pickInstitutionsByIds({ include: ["kb", "shinhan"], exclude: ["sc"] });
pickPattern("kb", { kind: "new", length: 14 }); // 특정 institution 의 특정 패턴 변형
```

### 5.4 정규화·포맷팅·추출

```ts
import {
  normalize,
  formatAccount,
  createPatternTemplate as T,
  extractIdentifier,
  extractSubject,
} from "korean-account";

normalize(" 110-436-387740 ");                      // "110436387740"
formatAccount("110436387740", T("XXX-XXX-XXXXXX")); // "110-436-387740"

const pattern = pickPattern("shinhan", { kind: "new" })!;
extractIdentifier("110436387740", pattern); // "110"
extractSubject("110436387740", pattern);    // { code: "110", category: "savings", ... }
```

### 5.5 검증 스키마 — `korean-account/schema` (Optional)

zod 기반 런타임 검증이 필요할 때만 서브 엔트리에서 로드. 메인 진입점은 zod 를 require 하지 않는다.

```ts
import {
  accountSchema,
  institutionIdSchema,
  accountKindSchema,
  subjectCategorySchema,
  detectionSchema,
} from "korean-account/schema";

accountSchema.parse("110-436-387740");      // 정규화 후 6~20자리 검증
institutionIdSchema.parse("shinhan");       // 등록된 id 인지
detectionSchema.parse(serializedResult);    // detect 결과 round-trip 검증
```

### 5.6 라벨·헬퍼

```ts
import {
  subjectCategoryLabels,   // 13종 과목 카테고리의 한글 라벨
  accountKindLabels,        // 6종 계좌 종류의 한글 라벨
  scoreToConfidence,        // score → "high"|"medium"|"low"
  normalizeSubject,         // Subject + kind → allowsWithdrawal·label 이 채워진 Subject
  defineSubject,
  defineInstitution,
  defineBranchRule,
} from "korean-account";

// 분기 규칙 프리셋 (PDF 의 라우팅 규칙을 코드화)
import {
  suhyup11BranchToCoop, suhyup12BranchToCoop, suhyup14BranchToCoop,
  suhyupCoop12BranchToBank,
  kb11FirstDigit, kbank10First9, kbank14First79, toss12First1719,
} from "korean-account";
```

## 6. TypeScript 타입

```ts
import type {
  Institution, AccountPattern,
  AccountKind,        // "new" | "old" | "virtual" | "lifetime" | "incoming-only" | "merged-legacy"
  SubjectCategory,    // "ordinary" | "savings" | "free-savings" | ... (13종)
  InstitutionCategory, // "bank" | "non-bank" | "securities" | "clearing"
  Confidence,         // "high" | "medium" | "low"
  Subject, Position, PatternTemplate, // branded
  DetectionResult, DetectionCapabilities, DetectOptions, Detector,
  InstitutionId, InstitutionCode, InstitutionIdByCategory,
  ScoringWeights, BranchRule, CheckDigitVerifier, GlobalRule,
  // 확장·필터용 보조 타입
  RegisteredInstitution,  // 기본 레지스트리에 등록된 institution 의 union
  InstitutionIdInput,     // 등록 id autocomplete + 외부 확장 id widening
  CreateDetectorInput,    // createDetector() 입력
  PickInstitutionsFilter, PickPatternFilter, // 선택자 필터
  PatternToken,           // PatternTemplate 의 토큰 단위
  AdditionalRule,         // 패턴별 커스텀 가드 (digits) => boolean
  BranchRuleResult,       // BranchRule 이 반환하는 라우팅 결과
} from "korean-account";
```

`AccountKind` 6종·`SubjectCategory` 13종의 의미·예시는 [DOCS.md Appendix A.1](./DOCS.md#a1-타입).

## 7. 확장

기본 `defaultDetector` 는 PDF-strict 다. 실세계 도메인을 커버하려면 컨슈머가 직접 확장한다. 세 가지 깊이 중 선택:

| 깊이 | API | 언제 |
|---|---|---|
| 패턴/기관만 추가 | `defaultDetector.extend({ institutions, globalRules? })` | 저축은행 가상계좌, 사내 정산 prefix 등 |
| 기존 기관 제거 | `defaultDetector.remove(id)` | 특정 외국계 은행 제외 등 |
| 점수·체크디지트 커스텀 | `createDetector({ scoring, checkDigitVerifiers })` | 가중치 튜닝, 체크디지트 알고리즘 주입 |

`extend()` 는 **replace-on-id 시맨틱** — 같은 id 가 들어오면 기존 institution 을 자동 교체한다. `.remove(id).extend(...)` 체인을 강제하지 않는다.

```ts
import {
  createPatternTemplate as T,
  defaultDetector,
  defineInstitution,
  defineSubject,
  institutionById,
} from "korean-account";

// 저축은행 가상계좌 — PDF 비명시 패턴 추가
const base = institutionById("savings-bank");
if (!base) throw new Error("savings-bank 누락");

const savingsBankExtended = defineInstitution({
  ...base,
  patterns: [
    ...base.patterns,
    {
      template: T("XXX-XX-XX-XXXXXX-X"),
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

const myDetector = defaultDetector.extend({ institutions: [savingsBankExtended] });

myDetector.detect("066-43-15-739026-6");
// → { institution: { id: "savings-bank", ... }, kind: "virtual", subject.code: "15", ... }
```

체크디지트 알고리즘은 PDF 가 공개하지 않으므로 라이브러리는 **verifier 슬롯만 제공**한다. 외부 자료로 구현한 알고리즘을 `createDetector({ checkDigitVerifiers })` 에 주입하면 `capabilities.validatedCheckDigit` 가 `null` 대신 `boolean` 으로 채워진다.

실세계 보강 카탈로그 8건 (저축은행 / KB 본점 14d / K뱅크 100 / 카카오 3333·7979 / 토스 1000·1500 / 하나 외환 14d 휴리스틱 / IBK 외환 가드 / 농협중앙 11d fallback), 분기 규칙, 점수 walkthrough, Recipes 는 [DOCS.md Appendix D](./DOCS.md#appendix-d-확장-mechanics).

## 8. 설계 원칙

- **PDF 충실 (PDF-faithful)** — 기본 detector 는 [CMS PDF](https://www.cmsedi.or.kr/cms/board/workdata/view/1026) 표 행에 적힌 패턴·과목 코드만 포함한다. 발급 중이거나 관행적으로 통용되는지가 아니라 PDF 가 enumerate 했는지가 기준.
- **확장은 외부에서 (Extension is yours)** — PDF 미명시 영역은 라이브러리에 추가하지 않고 컨슈머가 `defaultDetector.extend` / `remove` / `defineInstitution` 으로 자체 detector 를 구성한다.
- **단일 PDF 버전 = 단일 detector** — 새 CMS PDF 가 나오면 라이브러리 코어를 갱신하고, 컨슈머 확장은 그대로 호환. 마이그레이션 노트는 [DOCS.md Appendix E](./DOCS.md#appendix-e-마이그레이션-가이드).

## 9. 한계

- **PDF 비명시 케이스 미커버** — 기본 detector 는 PDF 에 적힌 코드만 매칭. 보강 패턴은 [DOCS.md Appendix D.1](./DOCS.md#d1-컨슈머-보강-카탈로그) 의 8건 카탈로그 참조.
- **체크디지트 알고리즘 미구현** — PDF 가 알고리즘을 비공개. 라이브러리는 framework 만 제공하며 알고리즘은 컨슈머가 외부 자료로 채워 넣는다 ([DOCS.md Appendix D.3](./DOCS.md#d3-extend--remove-api)).
- **서비스 미참가 외국계** (HSBC 054 / 도이치 055 / JPMC 057 / BNP파리바 061) 는 메타만 등록.
- **Prefix 모호성** — PDF 가 동일 prefix 를 여러 기관에 enumerate 한 경우 점수 동률이면 priority 로 결정. 더 강한 식별이 필요하면 4자리 prefix 등 tightening 으로 컨슈머가 보강.

## 10. 성능

`detectAccount()` 호출당 평균 **~12-20µs** (M-series Mac). 내부적으로 입력 길이에 맞는 institution 만 평가하는 인덱스 (`byLengthNear`) 를 사용해 57곳 × ~3 패턴 ≈ 170 평가를 평균 10~15회로 단축한다.

UI 입력 디바운스에는 `useMemo` / `useDeferredValue` 같은 일반 React 패턴으로 충분히 대응 가능.

## 11. 더 보기

- [DOCS.md](./DOCS.md) — 기관별 계좌 체계 표 (CMS PDF 발췌) + API·확장·Recipes·마이그레이션 레퍼런스
- [CHANGELOG.md](./CHANGELOG.md) — 변경 이력
- [CONTRIBUTING.md](./CONTRIBUTING.md) — 기여 가이드
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) · [SECURITY.md](./SECURITY.md)
- [금융결제원 CMS 참가기관별 계좌번호체계 (2026.05.08)](https://www.cmsedi.or.kr/cms/board/workdata/view/1026) — 단일 출처 원본

## License

MIT © korean-account contributors. 자세한 내용은 [LICENSE](./LICENSE).
