# korean-account

> 한국 금융기관 계좌번호 식별 라이브러리. [금융결제원 CMS PDF](https://www.cmsedi.or.kr/cms/board/workdata/view/1026) 단일 출처.

<p align="center">
  <img src="https://raw.githubusercontent.com/dydals3440/korean-account/main/showcase.gif" alt="korean-account 시연" width="400" />
</p>

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
// { institution: { id: "ibk", code: "003", ... }, kind: "new", confidence: "high", ... }
```

- PDF 표 행을 그대로 옮긴 코어 + `defaultDetector.extend()` 로 자유 보강
- strict TypeScript — `institutionById("ibk").code` 가 `"003"` literal 로 narrow
- 런타임 의존성은 `zod` 단 1개, 그것도 검증을 쓸 때만 (`korean-account/schema`)
- Node 22+ · Bun · Deno · 브라우저 (ESM + CJS)

상세 문서: [DOCS.md](./DOCS.md) · 변경 이력: [CHANGELOG.md](./CHANGELOG.md) · 기여: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 1. 설계 원칙

- **PDF 충실 (PDF-faithful)** — 라이브러리 기본 detector(`defaultDetector`) 는 CMS PDF *표 행에 적힌 패턴·과목 코드만* 포함한다. 발급 중이거나 관행적으로 통용되는지가 아니라 PDF 가 enumerate 했는지가 기준.
- **확장은 외부에서 (Extension is yours)** — PDF 미명시 영역 (저축은행의 운영 과목 코드, 사내 정산 계좌, B2B 가상계좌 발급사 prefix, 외환 14d 광범위 prefix 등) 은 라이브러리에 추가하지 않고 컨슈머가 `defaultDetector.extend` / `remove` / `defineInstitution` 으로 자체 detector 를 구성한다.
- **단일 PDF 버전 = 단일 detector** — 새 CMS PDF 가 나오면 라이브러리 코어를 갱신하고, 컨슈머 확장은 그대로 호환 (마이그레이션 가이드는 [DOCS.md Appendix E](./DOCS.md#appendix-e-마이그레이션-가이드) 참조).

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
| 런타임 | Node 22+ / Bun / Deno / 브라우저 (Zero React·DOM 의존) |
| TypeScript | strict, 모든 export 타입 노출 |

## 3. 빠른 시작

**어느 깊이로 쓸지 의사결정 매트릭스**:

| 상황 | 진입점 | 예상 코드량 |
|---|---|---|
| 폼에서 1순위만 알면 됨 | `detectBest` | 3줄 |
| 자동완성 후보 N개 | `detectAccount(input, { limit })` | 5줄 |
| 은행/증권 카테고리 필터 | `pickInstitutions({ categories })` | 8줄 |
| 도메인 보강 (사내·B2B·tightening) | `defaultDetector.extend({...})` | 20~30줄 |
| PDF 코어 fork (가중치 튜닝) | `createDetector(...)` | 50줄+ |

### 단일 식별

```ts
import { detectBest } from "korean-account";

const top = detectBest("110-436-387740");
if (top) {
  console.log(top.institution.id, top.kind, top.subject?.category);
}
```

### 여러 후보 + 필터

```ts
import { detectAccount } from "korean-account";

detectAccount("3333-12-3456789", { categories: ["bank"] });
detectAccount("110-436-387740", { kinds: ["new"] });
detectAccount("110-436-387740", { include: ["shinhan", "kb"] });
detectAccount("110-436-387740", { exclude: ["shinhan"], limit: 3 });
```

## 4. 핵심 API

```ts
detectAccount(input, options?) => readonly DetectionResult[]
detectBest(input, options?)    => DetectionResult | null
defaultDetector                => Detector // immutable, PDF-strict
```

### `detectAccount` 옵션 / 결과 (요약)

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

전체 타입 레퍼런스 (`Institution` · `AccountPattern` · `AccountKind` 6종 · `SubjectCategory` 13종 · `DetectionCapabilities` 의 3-state 등) 는 [DOCS.md Appendix A.1](./DOCS.md#a1-타입).

### Institution 메타 조회 (literal narrow)

```ts
import { institutionById, institutionByCode } from "korean-account";

const shinhan = institutionById("shinhan");
shinhan?.code;     // "088" (literal)
shinhan?.category; // "bank" (literal)

const ibk = institutionByCode("003");
ibk?.id; // "ibk"
```

`pickInstitutions` / `pickInstitutionsByIds` / `pickPattern` 등 선택자 API 는 [DOCS.md Appendix D.4](./DOCS.md#d4-선택자--메타-조회).

### zod 스키마 (옵션)

검증이 필요할 때만 서브 엔트리에서 가져온다. 메인 진입점은 zod 를 require 하지 않는다.

```ts
import { accountSchema } from "korean-account/schema";
accountSchema.parse("110-436-387740");
```

## 5. 확장

기본 detector 는 PDF-strict 다. 실세계 도메인 (사내 정산, B2B 가상계좌, 저축은행 운영 코드, 외환 14d 광범위 prefix 등) 은 컨슈머가 `defaultDetector.extend()` 로 보강한다. `extend()` 는 *같은 id 가 들어오면 기존 institution 을 자동 교체* 하는 replace-on-id 시맨틱 — `.remove(id).extend(...)` 체인을 강제하지 않는다.

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
// → savings-bank, kind: "virtual", subject.code: "15"
```

실세계 보강 카탈로그 8건 (저축은행 / KB 본점 14d / K뱅크 100 / 카카오 3333·7979 / 토스 1000·1500 / 하나 외환 14d 휴리스틱 / IBK 외환 가드 / 농협중앙 11d fallback), 보강 분류표·결정 트리, 분기 규칙, 점수 walkthrough, Recipes, 체크디지트 verifier 등록 — [DOCS.md Appendix D](./DOCS.md#appendix-d-확장-mechanics).

## 6. 한계

- **PDF 비명시 케이스 미커버** — 기본 detector 는 PDF 에 적힌 코드만 매칭. 컨슈머 보강 패턴은 [DOCS.md Appendix D.1](./DOCS.md#d1-컨슈머-보강-카탈로그) 의 8건 카탈로그 참조.
- **체크디지트 알고리즘 미구현** — PDF 가 알고리즘을 비공개. 라이브러리는 framework 만 제공하며 알고리즘은 컨슈머가 외부 자료로 채워 넣는다 ([DOCS.md Appendix D.3](./DOCS.md#d3-extend--remove-api) 의 "체크디지트 검증" 절).
- **서비스 미참가 외국계** (HSBC 054 / 도이치 055 / JPMC 057 / BNP파리바 061) 는 메타만 등록.
- **Prefix 모호성** — PDF 가 동일 prefix 를 여러 기관에 enumerate 한 경우 score 동률 시 priority 로 결정. 더 강한 식별이 필요하면 컨슈머가 4자리 prefix 등 tightening 으로 보강.

## 7. 성능

`detect()` 호출당 평균 ~12-20µs (M-series Mac). 내부적으로 입력 길이에 맞는 institution 만 평가하는 인덱스 (`byLengthNear`) 를 사용해 ~60곳 × ~3 패턴 ≈ 180 평가를 평균 10~15회로 단축한다.

가속이 더 필요하면 `useMemo` / `useDeferredValue` 같은 일반적인 React 디바운스 패턴으로 충분히 대응 가능.

## 8. 더 보기

- [DOCS.md](./DOCS.md) — 기관별 계좌 체계 표 (CMS PDF 발췌) + API/확장/Recipes/마이그레이션 레퍼런스
- [CHANGELOG.md](./CHANGELOG.md) — 변경 이력
- [CONTRIBUTING.md](./CONTRIBUTING.md) — 기여 가이드
- [금융결제원 CMS PDF 원본](https://www.cmsedi.or.kr/cms/board/workdata/view/1026)

## License

MIT.
