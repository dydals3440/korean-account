# korean-account

[English](./README.en.md) · **한국어**

> 한국 금융기관 계좌번호를 식별·분류·검증하는 TypeScript 라이브러리. [금융결제원 CMS 참가기관별 계좌번호체계](https://www.cmsedi.or.kr/cms/board/workdata/cms) (기준일 2026.05.08) 를 단일 출처로 따른다.

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

- **PDF 충실 코어** — KFTC CMS PDF 를 기관 단위로 전수 대조한 57곳 레지스트리 (은행 25 · 비은행 8 · 증권 24)
- **필요한 은행만** — `createDetector([kb, shinhan, toss])` 로 3.6 KB, 전체 레지스트리도 10 KB (min+brotli)
- **밸리데이터 프리** — zod·valibot·yup·arktype 어댑터(전부 optional peer) + 의존성 0 의 Standard Schema 어댑터
- **strict TypeScript** — `getInstitution("shinhan").code` 가 `"088"` literal 로 narrow
- **Universal** — Node 22+ · Bun · Deno · 브라우저 · ESM·CJS 동시 지원

상세 레퍼런스: [DOCS.md](./DOCS.md) · 변경 이력: [CHANGELOG.md](./CHANGELOG.md) · 기여: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 왜 만들었나

계좌번호로 기관을 확인하는 국내 서비스 대부분은 유료 서버 API 를 쓴다 — [금융결제원 오픈뱅킹 계좌실명조회](https://developers.kftc.or.kr/dev/openapi/open-banking/account), 토스페이먼츠·포트원 등 PG 의 예금주 조회가 대표적이고, 전부 **호출당 과금** 이다 (요금은 계약 조건이라 비공개인 곳이 많다 — 참고로 유사한 본인인증류 API 는 [건당 수십 원](https://blog.portone.io/authorization-payment-2/) 수준). 폼에서 "계좌번호를 입력하면 은행이 자동 선택되는" UX 하나를 위해 서버와 과금 계약을 얹는 건 과했다.

korean-account 는 그 추론을 **클라이언트에서 무료로** 한다. [KFTC CMS PDF](https://www.cmsedi.or.kr/cms/board/workdata/cms) 의 기관별 계좌번호 체계(자릿수·식별 코드·과목 코드·분기 규칙)를 데이터로 옮기고 가중치 스코어링으로 후보를 랭킹한다. 실명 확인이 아니라 **체계 기반 추론** 이므로 오차가 있을 수 있고, 그래서 결과에 `confidence` (high/medium/low) 를 함께 준다 — 확정이 필요한 플로우라면 최종 단계에서 실명조회 API 로 검증하고, 그 앞단의 UX 는 이 라이브러리로 공짜로 해결하는 조합을 권한다.

체계와 다른 계좌를 발견하면 [이슈로 제보](https://github.com/dydals3440/korean-account/issues/new/choose)해 달라. PDF 페이지·행 인용과 함께 오면 가장 빠르게 반영된다.

## 빠른 시작

### 1순위만 — 폼 자동 선택, 자동이체 가드

```ts
import { detectBest } from "korean-account";

const top = detectBest("1002-123-456789");
if (top && top.confidence !== "low") {
  console.log(top.institution.nameKo, top.kind);
  // → "우리은행" "new"
}
```

`detectBest` 는 매칭이 없으면 `null` 을 반환한다.

### 여러 후보 + 필터링

```ts
import { detect } from "korean-account";

detect("3333-12-3456789", { categories: ["bank"] });
detect("110-436-387740", { kinds: ["new"] });
detect("110-436-387740", { include: ["shinhan", "kb"] });
detect("110-436-387740", { exclude: ["shinhan"], limit: 3, minScore: 4 });
```

### 필요한 은행만 — tree-shaking

서비스가 다루는 기관이 정해져 있다면 기관 상수를 직접 import 한다. 번들에는 그 기관들만 들어간다.

```ts
import { createDetector, kb, shinhan, toss } from "korean-account";

const detector = createDetector([kb, shinhan, toss]); // ≈ 3.6 KB (min+brotli)
detector.detect("110-436-387740");
// 결과의 institution.id 타입도 "kb" | "shinhan" | "toss" 로 좁혀진다

// 전부 쓰려면
import { createDetector, institutions } from "korean-account";
const all = createDetector(institutions); // ≈ 10 KB
```

`detect` / `detectBest` / `getInstitution` / `searchInstitutions` 는 전체 레지스트리를 쓰는 편의 함수다 — import 하는 순간 57곳 데이터가 번들에 포함된다.

## 점수와 신뢰도

모든 후보는 신호 가중치의 합으로 점수를 얻는다. 기본 가중치 기준:

| 신호             | 점수  | 비고                                      |
| ---------------- | ----- | ----------------------------------------- |
| 자릿수 정확 일치 | +3    | ±1 (입력 중) 은 +1                        |
| 식별 코드 일치   | +4    | 코드가 길수록 +1~3 추가, 부분 입력은 절반 |
| 과목 코드 일치   | +3    | 동일한 길이 보너스·절반 규칙              |
| 분기 규칙 적중   | +2    | 수협 007↔030, 토스 17/19 등 PDF 명시 분기 |
| 패턴 추가 규칙   | +1/건 | 통과 못 하면 후보 탈락 (gate + bonus)     |

score ≥ 7 → `high`, ≥ 4 → `medium`, 그 외 `low`. **동점일 때만** 사전확률 `prevalence` (= 리테일 고객 수 추정 × 카테고리 계수) 로 순서를 정한다 — 증거 신호를 뒤집는 일은 없다. 근거 데이터와 산식은 [DOCS A.4](./DOCS.md) 참고.

> 카카오뱅크 `3333`·`7979` 프리픽스처럼 PDF 미열거라도 실세계에서 확립된 신호는 core 에 반영되어 있다 (`3333-12-3456789` → 카카오뱅크 `high`).

### 원하는 결과가 안 나올 때

```ts
import { createDetector, institutions, getInstitution } from "korean-account";

// 1. 특정 기관만 검사 — 후보 자체를 좁힌다
createDetector([kb, shinhan]).detect(input);
detect(input, { include: ["kb", "shinhan"] });

// 2. 특정 기관 우선 — 동점 시 순서 오버라이드
const boosted = createDetector(institutions).extend({
  institutions: [{ ...getInstitution("busan"), priority: 999 }],
});

// 3. 자체 계좌 체계 추가 — 사내 가상계좌 prefix 등
const extended = createDetector(institutions).extend({
  institutions: [myInstitution], // defineInstitution() 으로 생성
});

// 4. 검증번호 알고리즘 주입 — capabilities.validatedCheckDigit 활성화
createDetector(institutions, { checkDigitVerifiers: { kb: myKbVerifier } });
```

## 지원 금융기관

> **출처**: 아래 모든 코드·자릿수·식별 위치·과목은 [금융결제원 CMS 참가기관별 계좌번호체계 (2026.05.08)](https://www.cmsedi.or.kr/cms/board/workdata/cms) 의 표 행을 그대로 옮긴 것이다. 새 PDF 가 게시되면 라이브러리 코어를 갱신하고, 컨슈머 확장은 그대로 호환된다.

### 은행 (25)

| 코드 | 한글명           | 영문명                   | 자릿수               |
| ---- | ---------------- | ------------------------ | -------------------- |
| 002  | KDB산업은행      | Korea Development Bank   | 11·14                |
| 003  | IBK기업은행      | Industrial Bank of Korea | 10·11·12·14          |
| 004  | KB국민은행       | KB Kookmin Bank          | 10·11·12·14          |
| 005  | 하나은행         | Hana Bank                | 11·12·14             |
| 007  | 수협은행         | Suhyup Bank              | 11·12·14             |
| 011  | NH농협은행       | NongHyup Bank            | 11·12·13·14          |
| 020  | 우리은행         | Woori Bank               | 11·12·13·14          |
| 023  | SC제일은행       | SC First Bank            | 10·14                |
| 027  | 한국씨티은행     | Citibank Korea           | 10·11·12·13          |
| 031  | iM뱅크           | iM Bank                  | 7·8·9·10·11·12·13·14 |
| 032  | 부산은행         | Busan Bank               | 12·13                |
| 034  | 광주은행         | Gwangju Bank             | 12·13                |
| 035  | 제주은행         | Jeju Bank                | 10·12                |
| 037  | 전북은행         | Jeonbuk Bank             | 12·13                |
| 039  | 경남은행         | Gyeongnam Bank           | 12·13                |
| 054  | HSBC은행         | HSBC                     | 12 _(서비스 미참가)_ |
| 055  | 도이치은행       | Deutsche Bank            | 10                   |
| 057  | JP모간체이스은행 | JPMorgan Chase Bank      | 10                   |
| 060  | BOA은행          | Bank of America          | 12·14                |
| 061  | 비엔피파리바은행 | BNP Paribas              | 14 _(서비스 미참가)_ |
| 081  | 하나증권 CMA     | Hana Securities CMA      | 14                   |
| 088  | 신한은행         | Shinhan Bank             | 11·12·13·14          |
| 089  | K뱅크            | K Bank                   | 10·12·13·14          |
| 090  | 카카오뱅크       | KakaoBank                | 13                   |
| 092  | 토스뱅크         | Toss Bank                | 12                   |

### 비은행 (8)

| 코드 | 한글명           | 영문명                                                   | 자릿수         |
| ---- | ---------------- | -------------------------------------------------------- | -------------- |
| 012  | 농협중앙회       | NongHyup Central                                         | 13·14          |
| 030  | 수협중앙회       | Suhyup Central                                           | 12             |
| 045  | 새마을금고중앙회 | Korean Federation of Community Credit Cooperatives       | 13             |
| 048  | 신협중앙회       | Credit Union Central                                     | 10·11·12·13·14 |
| 050  | 상호저축은행     | Mutual Savings Bank                                      | 14             |
| 064  | 산림조합중앙회   | Forestry Cooperatives Central                            | 12·13          |
| 071  | 우체국           | Korea Post                                               | 12·13·14       |
| 099  | 금융결제원       | Korea Financial Telecommunications & Clearings Institute | —              |

<details>
<summary><strong>증권사 (24)</strong> — 펼치기</summary>

| 코드 | 한글명         | 영문명                         | 자릿수             |
| ---- | -------------- | ------------------------------ | ------------------ |
| 209  | 유안타증권     | Yuanta Securities              | 11·12              |
| 218  | KB증권         | KB Securities                  | 9·11               |
| 238  | 미래에셋증권   | Mirae Asset Securities         | 8·9·10·11·12·13·14 |
| 240  | 삼성증권       | Samsung Securities             | 8·10·12·14         |
| 243  | 한국투자증권   | Korea Investment & Securities  | 10·12·14           |
| 247  | NH투자증권     | NH Investment & Securities     | 11                 |
| 261  | 교보증권       | Kyobo Securities               | 11                 |
| 262  | 아이엠증권     | iM Securities                  | 10                 |
| 263  | 현대차증권     | Hyundai Motor Securities       | 8                  |
| 264  | 키움증권       | Kiwoom Securities              | 8·10               |
| 265  | 엘에스투자증권 | LS Securities                  | 9·11               |
| 266  | SK증권         | SK Securities                  | 9·11               |
| 267  | 대신증권       | Daishin Securities             | 9·11               |
| 269  | 한화투자증권   | Hanwha Investment & Securities | 10·11·13·14        |
| 270  | 하나증권       | Hana Securities                | 8·10·11·14         |
| 278  | 신한투자증권   | Shinhan Securities             | 11                 |
| 279  | DB증권         | DB Securities                  | 9·11               |
| 280  | 유진투자증권   | Eugene Investment & Securities | 11                 |
| 287  | 메리츠증권     | Meritz Securities              | 10·11              |
| 288  | 카카오페이증권 | KakaoPay Securities            | 11                 |
| 290  | 부국증권       | Bookook Securities             | 11                 |
| 291  | 신영증권       | Shinyoung Securities           | 9·12               |
| 292  | 케이프투자증권 | Cape Investment & Securities   | 11·14              |
| 294  | 우리투자증권   | Woori Investment & Securities  | 11                 |

</details>

### PDF 에 없는 기관·패턴은?

기본 레지스트리는 위 PDF 표에 적힌 행(+ 명시된 소수의 실세계 확립 신호)만 포함한다. PDF 가 enumerate 하지 않은 케이스 — 저축은행 가상계좌 운영 prefix, 사내 정산 계좌, 파트너사별 특화 prefix 등 — 은 [원하는 결과가 안 나올 때](#원하는-결과가-안-나올-때) 의 `extend` 패턴과 [DOCS Appendix D](./DOCS.md) 레시피로 보강한다.

## 검증 어댑터 (선택)

폼/API 경계 검증용 스키마를 **쓰는 밸리데이터에 맞는 서브패스**로 제공한다 — @hookform/resolvers 처럼 플러그인식으로 갈아끼운다. 다섯 어댑터 모두 같은 5개 스키마(`accountSchema` · `institutionIdSchema` · `accountKindSchema` · `subjectCategorySchema` · `detectionSchema`)를 내보내고, 하나의 계약 테스트가 동작 동일성을 보증한다. peer 는 전부 optional — import 하지 않는 어댑터의 라이브러리는 필요 없다.

| 서브패스                         | peer                                     | 언제                                                                           |
| -------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| `korean-account/zod`             | zod ^3.23 \|\| ^4 (CI 가 두 메이저 검증) | zod 프로젝트                                                                   |
| `korean-account/valibot`         | valibot ^1                               | 번들 민감 프론트엔드                                                           |
| `korean-account/yup`             | yup ^1.4                                 | Formik·구형 RHF 코드베이스                                                     |
| `korean-account/arktype`         | arktype ^2.1                             | arktype 프로젝트                                                               |
| `korean-account/standard-schema` | **없음 (의존성 0)**                      | TanStack Form·tRPC v11 등 [Standard Schema](https://standardschema.dev) 소비자 |

```ts
import { accountSchema } from "korean-account/zod"; // ← 서브패스만 바꾸면 끝

accountSchema.parse("110-436-387740"); // 숫자·하이픈·공백, 정규화 6~20자리
```

```ts
// react-hook-form — resolver 와 어댑터를 세트로 교체
useForm({ resolver: zodResolver(z.object({ account: accountSchema })) }); // korean-account/zod
useForm({ resolver: valibotResolver(v.object({ account: accountSchema })) }); // korean-account/valibot
useForm({ resolver: yupResolver(yup.object({ account: accountSchema })) }); // korean-account/yup

// TanStack Form — 의존성 0 어댑터를 그대로 밸리데이터로
import { accountSchema } from "korean-account/standard-schema";
useForm({ validators: { onChange: accountSchema } });
```

자체 밸리데이터용 어댑터를 추가하고 싶다면 [CONTRIBUTING](./CONTRIBUTING.md) 의 "새 어댑터 3단계" 참고 — shared 술어를 재사용하고 계약 테스트만 통과하면 된다.

## API 한눈에

| 함수                                                                           | 설명                                                             |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `detect(input, opts?)`                                                         | 전체 레지스트리로 후보 랭킹                                      |
| `detectBest(input, opts?)`                                                     | 1순위만, 없으면 `null`                                           |
| `createDetector(institutions, opts?)`                                          | 지정 기관만의 detector (`extend`/`remove` 로 불변 확장)          |
| `getInstitution(idOrCode)`                                                     | id·CMS 코드(별칭 포함) 로 조회 — 등록 literal 은 non-null narrow |
| `searchInstitutions(filter?)`                                                  | 카테고리·kind·id 필터 검색                                       |
| `normalizeAccount` / `formatAccount` / `extractIdentifier` / `extractSubject`  | 정규화·그루핑·부분 추출                                          |
| `defineInstitution` / `defineSubject` / `defineBranchRule` / `patternTemplate` | 커스텀 기관 작성 API                                             |
| 57개 기관 상수 + `banks` / `nonBanks` / `securities` / `institutions`          | tree-shakable 데이터                                             |

전체 시그니처·타입·점수 워크스루, 그리고 **실무 통합 레시피** (React Hook Form·TanStack Form/Query·shadcn/ui) 는 [DOCS.md](./DOCS.md) 에 있다.

## 한계

- **실명 확인이 아니다** — 체계 기반 추론이다. 이체·정산 확정 전에는 실명조회 API 로 검증하라.
- 식별 코드가 없는 체계 (순수 일련번호 증권사 등) 는 길이만으로 경쟁해 `low` 동점이 된다.
- 검증번호 알고리즘은 PDF 비공개라 미구현 — `checkDigitVerifiers` 로 주입 가능.
- PDF 개정 (기관 추가·과목 신설) 은 사람이 반영한다. 어긋남을 보면 이슈로 알려 달라.

## 기여

[CONTRIBUTING.md](./CONTRIBUTING.md) 에 신규 기관 추가 레시피가 있다. 모든 README 예제는 [readme-examples.spec.ts](./src/readme-examples.spec.ts) 가 실행으로 검증한다 — 문서가 거짓말하면 CI 가 깨진다.

## License

[MIT](./LICENSE)
