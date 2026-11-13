[문서 목록](./README.md) · [빠른 시작](../README.md)

# 커스텀 detector

내장 레지스트리는 금융결제원 CMS 계좌번호체계 PDF와 출처를 밝힌 일부 보강으로 이루어져 있습니다. PDF에 없는 형식, 사내 계좌, 서비스에 맞춘 우선순위는 `createDetector`와 `extend`로 애플리케이션에서 더합니다. 이 문서는 확장 방법과 실제 보강 사례를 다룹니다. 각 함수의 정확한 시그니처는 [API 레퍼런스](./api.md)에 있습니다.

## 책임 경계

| 영역      | 라이브러리(`institutions`)                                        | 애플리케이션                                                   |
| --------- | ----------------------------------------------------------------- | -------------------------------------------------------------- |
| 기관      | 57개 항목. 공식 참가기관 수와 일대일로 대응하지 않음              | 사내 정산 계좌, 가상계좌 발급사, 미참가 외국계 은행            |
| 과목 코드 | PDF가 나열한 코드(예: 상호저축은행 14자리는 13·21·22·23)          | PDF 밖에서 운영하는 코드                                       |
| 식별자    | PDF가 명시한 자리와 값, 출처를 밝힌 보강(카카오뱅크 3333·7979)    | 더 긴 접두어로 좁히기, 넓은 휴리스틱                           |
| 분기 규칙 | PDF가 명시한 7개(수협 4, 케이뱅크 2, 토스뱅크 1)                  | 사내 접두어별 종류·기관 재배정                                 |
| 서비스 열 | 패턴별 PDF 4열(가상계좌·출금이체·입금이체·부가서비스)과 과목 예외 | 커스텀 패턴의 `services`                                       |
| 검증번호  | 없음. 알고리즘이 공개되지 않음                                    | `checkDigitVerifiers`에 기관별 verifier 등록                   |
| 순위      | 기본 가중치와 `prevalence`                                        | `scoring`, `globalRules`, 기관의 `userBaseMillions`·`priority` |

PDF에 나열되지 않은 접두어는 널리 쓰이더라도 내장 레지스트리에 넣지 않고 애플리케이션 보강으로 둡니다. 판단 근거와 예외는 [PDF 대조 기록](./source-audit.md)에 있습니다.

## detector 합성

```text
createDetector(institutions)            PDF 기반 내장 레지스트리
        │
        │  .extend({ institutions, scoring, globalRules, checkDigitVerifiers })
        │  같은 id는 교체, 새 id는 추가
        ▼
도메인 detector                          운영 과목 · 접두어 좁히기 · 휴리스틱 · 충돌 가드
```

라이브러리를 갱신하면 내장 레지스트리가 바뀌고, 도메인 detector는 그 위에 다시 만들어집니다. 보강이 의존하는 패턴이 갱신 후에도 남아 있는지는 [`pickPattern`](./api.md#pickpattern)으로 테스트합니다.

```ts
import { pickPattern } from "korean-account";
import { expect, test } from "vitest";

test("보강하는 케이뱅크 12자리 패턴이 그대로 있다", () => {
  const pattern = pickPattern("kbank", { kind: "new", length: 12 });

  expect(pattern?.template).toBe("XXX-XXX-XXXXXX");
  // 내장 레지스트리가 식별자를 갖게 되면 보강을 다시 검토합니다.
  expect(pattern?.identifiers).toBeUndefined();
});
```

## 확장 API

### 기관 추가

[`defineInstitution`](./api.md#defineinstitution)은 `id`·`code`·`category`를 리터럴 타입으로 유지합니다. 식별자나 과목 코드 없이 길이만 맞는 패턴은 항상 `"low"`이므로, 기관을 구분할 수 있는 자리를 선언합니다.

```ts
import {
  cmsServices,
  createDetector,
  defineInstitution,
  institutions,
  patternTemplate,
} from "korean-account";

const myFintech = defineInstitution({
  id: "my-fintech",
  code: "999",
  nameKo: "마이핀테크",
  category: "non-bank",
  aliases: [],
  patterns: [
    {
      template: patternTemplate("XXX-XXXX-XXXX"),
      kind: "new",
      services: cmsServices("directDebit", "directCredit"),
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["999"],
    },
  ],
});

const detector = createDetector(institutions).extend({ institutions: [myFintech] });
detector
  .detect("999-1234-5678")
  .map((result) => [result.institution.id, result.score, result.ambiguous]);
// => [["my-fintech", 9, true], ["kb", 7, true], ["nh", 7, true], ["shinhan", 7, true], ["kb-sec", 7, true]]
```

커스텀 기관도 내장 기관과 같은 기준으로 채점하므로, 같은 자릿수의 다른 형식과 같은 등급이면 `ambiguous`가 됩니다.

### 기존 기관에 패턴 추가

`extend`에 같은 `id`의 기관을 넘기면 기관 전체를 교체합니다. 기존 패턴을 유지하려면 내장 상수를 펼칩니다.

```ts
import {
  cmsServices,
  createDetector,
  defineInstitution,
  defineSubject,
  institutions,
  patternTemplate,
  savingsBank,
} from "korean-account";

const savingsBankWithVirtual = defineInstitution({
  ...savingsBank,
  patterns: [
    ...savingsBank.patterns,
    {
      template: patternTemplate("XXX-XX-XX-XXXXXX-X"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directCredit"),
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

const detector = createDetector(institutions).extend({ institutions: [savingsBankWithVirtual] });
const [best] = detector.detect("066-43-15-739026-6");
// best: savings-bank, kind "virtual", subject.label "저축은행 가상계좌", confidence "high",
//       capabilities { allowsWithdrawal: false, virtual: true, ... }
```

### 서비스 열과 출금 가능 여부

패턴의 `services`는 PDF 표의 서비스 4열입니다. [`cmsServices`](./api.md#cmsservices)에 ○인 열을 나열합니다. `capabilities.allowsWithdrawal`은 다음과 같이 정해집니다.

- `services`가 있으면 과목의 `allowsWithdrawal` → 과목의 `services.directDebit` → 패턴의 `services.directDebit` 순으로 처음 정의된 값입니다. 가상계좌라도 출금이체 열이 ○면 `true`입니다.
- `services`가 없으면 `capabilities.services`는 `null`이고, 종류로 판단합니다. `virtual`·`incoming-only`·`lifetime` 종류와 가상계좌는 `false`, 나머지는 과목의 `allowsWithdrawal`(없으면 `true`)입니다.

PDF 비고처럼 일부 코드만 예외라면 과목에 `services`를 둡니다. 키별로 적용되며 생략한 키는 패턴 값을 따릅니다. 내장 광주은행 13자리 패턴의 과목 716(ISA, 출금이체 불가)이 이 방식입니다.

```ts
import { cmsServices, defineSubject, patternTemplate, type AccountPattern } from "korean-account";

const pattern = {
  template: patternTemplate("XXX-XXX-XXXXX-X"),
  kind: "old",
  services: cmsServices("directDebit", "directCredit", "additionalServices"),
  subjectPosition: { start: 3, length: 3 },
  subjects: [
    defineSubject({ code: "107", category: "ordinary" }),
    // 이 코드만 패턴의 출금이체 ○를 뒤집습니다.
    defineSubject({ code: "716", category: "isa", services: { directDebit: false } }),
  ],
} satisfies AccountPattern;
// 과목 716이 일치하면 capabilities.allowsWithdrawal: false, services.directDebit: false
```

### 분기 규칙

[`defineBranchRule`](./api.md#definebranchrule)은 패턴이 일치한 뒤 기관을 재배정하거나 종류를 바꿉니다. 조건이 실제로 무언가를 증명하면 그 자체로 근거가 되어 `"medium"` 이상이 될 수 있습니다. "그 외" 분기는 아무것도 증명하지 않으므로 `isFallback: true`를 반환합니다.

```ts
import {
  cmsServices,
  createDetector,
  defineBranchRule,
  defineInstitution,
  patternTemplate,
} from "korean-account";

const splitBankAndCoop = defineBranchRule({
  describe: "12자리: 첫 자리가 2면 조합, 그 외는 은행",
  evaluate: (digits) => {
    if (digits.length !== 12) return null;
    return digits[0] === "2" ? { institutionId: "my-coop" } : { isFallback: true };
  },
});

const myBank = defineInstitution({
  id: "my-bank",
  code: "998",
  nameKo: "마이은행",
  category: "bank",
  aliases: [],
  patterns: [
    {
      template: patternTemplate("XXX-XXX-XXXXXX"),
      kind: "new",
      services: cmsServices("directDebit", "directCredit"),
      branchRule: splitBankAndCoop,
    },
  ],
});
const myCoop = defineInstitution({
  id: "my-coop",
  code: "997",
  nameKo: "마이조합",
  category: "non-bank",
  aliases: [],
  patterns: [],
});

const detector = createDetector([myBank, myCoop]);
detector.detect("212-345-678901")[0]; // my-coop, score 5, "medium" (분기 조건이 근거)
detector.detect("312-345-678901")[0]; // my-bank, score 3, "low" (그 외 분기는 근거가 아님)
```

재배정 대상 ID가 detector에 없으면 원래 기관을 유지합니다. `categories`·`include`·`exclude`는 재배정된 기관을 기준으로 거릅니다.

### 일부 기관만 사용

```ts
import { banks, createDetector, institutions, kb, shinhan, toss } from "korean-account";

const mainBanks = createDetector([kb, shinhan, toss]); // 나머지 레지스트리는 번들에서 빠짐
const banksOnly = createDetector(banks);
const withoutForeignBanks = createDetector(institutions).remove((institution) =>
  ["hsbc", "deutsche", "jpmc", "boa", "bnp-paribas"].includes(institution.id),
);
```

`detect(input, { categories: ["bank"] })`와 달리 detector에서 빼면 그 기관은 `ambiguous` 판정에도 들어가지 않습니다. 지원하지 않는 기관이라도 사용자의 계좌일 수 있다면 detector에는 남기고 옵션으로 숨깁니다.

### 가중치와 전역 규칙

`scoring`은 가중치를 키별로 덮어쓰고, `globalRules`는 패턴이 일치한 기관마다 실행되어 `true`면 `scoring.globalRule`(기본 1)을 더합니다. 둘 다 점수와 순서를 바꿀 뿐 근거는 아니므로, 등급과 `ambiguous`는 쉽게 바뀌지 않습니다.

```ts
const bankFirst = createDetector(institutions, {
  globalRules: [(digits, institution) => institution.category === "bank"],
});
bankFirst
  .detect("110-436-387740")
  .map((result) => [result.institution.id, result.score, result.ambiguous]);
// => [["shinhan", 10, true], ["post", 9, true], ["shinhyup", 9, true]]
```

신뢰도 기준(7·4)은 고정이므로 가중치를 키우면 같은 입력이 더 높은 등급으로 이동합니다. 가중치는 0 이상의 유한한 수여야 합니다.

### 검증번호 verifier

금융결제원이 검증번호 알고리즘을 공개하지 않아 내장 verifier는 없고, `capabilities.validatedCheckDigit`은 기본적으로 `null`입니다. 알고리즘을 확보했다면 기관 ID별로 등록합니다.

```ts
import { createDetector, institutions, type CheckDigitVerifier } from "korean-account";

const verifyShinhan: CheckDigitVerifier = (digits) => {
  // 출처를 밝힌 알고리즘을 구현합니다. 입력 중인 짧은 숫자열도 들어옵니다.
  return digits.length === 12 && myShinhanChecksum(digits);
};

const detector = createDetector(institutions, { checkDigitVerifiers: { shinhan: verifyShinhan } });
detector.detect("110-436-387740")[0]?.capabilities.validatedCheckDigit; // => true 또는 false
```

- verifier는 분기 후 기관의 ID로 찾습니다. 다른 기관 후보의 `validatedCheckDigit`은 `null`입니다.
- 패턴이 `validatesCheckDigit: false`(광주은행 12자리 과목 731, 수협은행·수협중앙회)면 등록해도 실행하지 않고 `null`입니다.
- 결과는 메타데이터입니다. `false`여도 후보를 지우거나 점수를 바꾸지 않습니다.

### 커스텀 ID 검증

내장 `institutionIdSchema`·`detectionSchema`는 내장 기관 ID만 허용합니다. 커스텀 detector의 결과는 각 어댑터의 팩토리로 만든 스키마로 검증합니다.

```ts
import { createDetector, institutions, toDetectionPayload } from "korean-account";
import { createDetectionSchema, createInstitutionIdSchema } from "korean-account/zod";

const detector = createDetector(institutions).extend({ institutions: [myFintech] }); // 위 "기관 추가"의 myFintech
const ids = detector.institutions.map((institution) => institution.id);

const institutionIdSchema = createInstitutionIdSchema(ids); // 출력 타입: InstitutionId | "my-fintech"
const detectionSchema = createDetectionSchema(ids);

const [best] = detector.detect("999-1234-5678");
if (best) detectionSchema.parse(toDetectionPayload(best)).institutionId; // => "my-fintech"
```

## 보강 사례

실제로 쓰이는 보강 유형입니다. **가정**은 PDF에 없는 운영 지식이므로 적용 전에 직접 확인합니다. 결과는 현재 내장 레지스트리 기준입니다.

### 상호저축은행 과목 코드 확장

- **PDF**: 14자리 신계좌의 과목은 보통 13, 저축 21, 자유저축 22, 기업자유 23만 나열합니다.
- **가정**: 11·14·15·17·18·19(보통) 등 더 많은 코드를 운영합니다.
- **방법**: 같은 패턴의 `subjects`에 코드를 더합니다.
- **영향**: 내장 레지스트리에서 `050-12-11-123456-7`은 길이만 맞는 `"low"` 후보들뿐이고 상호저축은행은 기본 `limit`(5) 안에 들지 못합니다. 보강하면 상호저축은행이 7점 `"high"` 단독 후보가 됩니다.

```ts
const savingsBankExtended = defineInstitution({
  ...savingsBank,
  patterns: savingsBank.patterns.map((pattern) =>
    pattern.kind === "new"
      ? {
          ...pattern,
          subjects: [
            ...(pattern.subjects ?? []),
            ...["11", "14", "15", "17", "18", "19"].map((code) =>
              defineSubject({ code, category: "ordinary" }),
            ),
          ],
        }
      : pattern,
  ),
});
```

### 국민은행 14자리 본점 신계좌 추가

- **PDF**: 국민은행 14자리는 가상계좌(과목 92)와 (구)주택은행 형식만 나열합니다.
- **가정**: `XXXXXX-XX-XXXXXX` 형식의 신계좌가 있고, 7·8번째 자리가 01·03·04·06·11·12·21·25·33·35 등입니다.
- **방법**: 새 패턴을 추가하고, 4번째 자리가 9인 구 외환은행 14자리를 흡수하지 않도록 가드를 둡니다.
- **영향**: `123456-04-789012`가 국민은행 9점 `"high"` 단독 후보가 됩니다. 가드가 없으면 아래 하나은행 휴리스틱과 같은 점수가 되어 `123956-04-789012`가 국민은행으로 먼저 나옵니다.

```ts
const isNotForeignExchange14 = (digits: string): boolean => digits[3] !== "9";

const kbExtended = defineInstitution({
  ...kb,
  patterns: [
    ...kb.patterns,
    {
      template: patternTemplate("XXXXXX-XX-XXXXXX"),
      kind: "new",
      services: cmsServices("directDebit", "directCredit", "additionalServices"),
      identifierPosition: { start: 6, length: 2 },
      identifiers: ["01", "03", "04", "06", "11", "12", "21", "25", "33", "35"],
      additionalRules: [isNotForeignExchange14],
    },
  ],
});
```

### 케이뱅크 12자리 상품 코드 좁히기

- **PDF**: 12자리 `XXX-XXX-XXXXXX`의 앞자리가 상품구분이지만 코드를 나열하지 않습니다. 그래서 내장 패턴은 길이만 맞고 항상 `"low"`입니다.
- **가정**: 실제 계좌는 대부분 `100`으로 시작합니다.
- **방법**: 그 패턴에 식별자 `100`을 선언합니다.
- **영향**: `100-123-456789`에서 케이뱅크가 9점 `"high"` 후보가 되지만, 같은 `100`을 쓰는 신한은행·토스뱅크·우체국과 동점이라 `ambiguous`입니다. 이런 번호는 사용자 확인이 필요합니다.

```ts
const kbankExtended = defineInstitution({
  ...kbank,
  patterns: kbank.patterns.map((pattern) =>
    pattern.kind === "new" && pattern.template === "XXX-XXX-XXXXXX"
      ? { ...pattern, identifierPosition: { start: 0, length: 3 }, identifiers: ["100"] }
      : pattern,
  ),
});
```

### 토스뱅크 4자리 상품 코드 좁히기

- **PDF**: 12자리 과목(3자리) 보통 100, 기업자유 150. 신한은행 12자리의 100·150과 겹칩니다.
- **가정**: 실제 토스뱅크 계좌는 `1000`·`1500`으로 시작합니다.
- **방법**: 식별자를 4자리로 늘리고, 다른 접두어는 패턴에서 제외하는 규칙을 둡니다.
- **영향**: `1001-2345-6789`에서 토스뱅크가 빠집니다. `1000-2345-6789`는 토스뱅크 11점이 1순위가 되지만 신한은행·우체국도 `"high"`이므로 여전히 `ambiguous`입니다.

```ts
const startsWithTossProduct = (digits: string): boolean =>
  digits.startsWith("1000") || digits.startsWith("1500");

const tossExtended = defineInstitution({
  ...toss,
  patterns: toss.patterns.map((pattern) =>
    pattern.kind === "new"
      ? {
          ...pattern,
          identifierPosition: { start: 0, length: 4 },
          identifiers: ["1000", "1500"],
          additionalRules: [startsWithTossProduct],
        }
      : pattern,
  ),
});
```

### 하나은행 구 외환 14자리 넓게 잡기

- **PDF**: 구 외환은행 통합 14자리의 점번호 8개(117·158·161·162·210·379·600·655)를 나열합니다. 내장 패턴이 이 8개를 식별자로 갖습니다.
- **가정**: 실제로는 더 많은 점번호(395·427·556·617 등)를 썼고, 4번째 자리가 9입니다.
- **방법**: 4번째 자리 `9`를 1자리 식별자로 하는 패턴을 추가하고, 이미 내장 패턴이 잡는 8개 점번호는 제외합니다.
- **영향**: `427-910255-21607`에 하나은행 8점 `"high"` 후보가 생깁니다. 하나증권 CMA(과목 07, 9점)·아이엠뱅크(8점)도 같은 등급이므로 `ambiguous`입니다. 4번째 자리가 9인 다른 14자리 형식과 동점이 되므로 인접 기관에 가드를 함께 둡니다(국민은행 위, 기업은행 아래).

```ts
const HANA_FOREIGN_EXCHANGE_BRANCHES = new Set([
  "117",
  "158",
  "161",
  "162",
  "210",
  "379",
  "600",
  "655",
]);

const hanaExtended = defineInstitution({
  ...hana,
  patterns: [
    ...hana.patterns,
    {
      template: patternTemplate("XXX-XXXXXX-XXXXX"),
      kind: "merged-legacy",
      identifierPosition: { start: 3, length: 1 },
      identifiers: ["9"],
      additionalRules: [(digits) => !HANA_FOREIGN_EXCHANGE_BRANCHES.has(digits.slice(0, 3))],
    },
  ],
});
```

### 기업은행 14자리 충돌 가드

- **PDF**: 기업은행 14자리 신계좌 `XXX-XXXXXX-XX-XX-X`는 10·11번째 자리가 식별자이자 과목입니다.
- **가정**: 이 형식의 4번째 자리는 사실상 9가 아닙니다.
- **방법**: 하나은행 휴리스틱을 쓸 때 기업은행 14자리 신계좌에 같은 가드를 더합니다.
- **영향**: 휴리스틱만 있으면 `123-956789-01-23-4`에서 하나은행(8점)과 기업은행(8점)이 동점이고 사전확률 때문에 하나은행이 앞섭니다. 가드를 두면 기업은행 후보가 빠집니다. 가정이 틀리면 실제 기업은행 계좌를 놓치므로 신중히 적용합니다.

```ts
const ibkGuarded = defineInstitution({
  ...ibk,
  patterns: ibk.patterns.map((pattern) =>
    pattern.kind === "new" && pattern.template === "XXX-XXXXXX-XX-XX-X"
      ? {
          ...pattern,
          additionalRules: [...(pattern.additionalRules ?? []), isNotForeignExchange14],
        }
      : pattern,
  ),
});
```

### 지역 농·축협 11자리 추가

- **PDF**: 11자리 구계좌는 농협은행(011)만 나열하고 지역 농·축협(012)은 나열하지 않습니다.
- **가정**: 지역 농·축협도 같은 과목 체계의 11자리 계좌를 발급했습니다.
- **방법**: 농협은행 11자리 패턴을 복사해 지역 농·축협에 추가합니다.
- **영향**: 두 기관이 항상 같은 점수가 되어 11자리 농협 번호는 모두 `ambiguous`입니다. 정렬은 사전확률에 따라 농협은행이 앞섭니다. 번호만으로는 구분할 수 없다는 사실을 UI에 그대로 드러내는 보강입니다.

```ts
const nhOld11 = pickPattern("nh", { kind: "old", length: 11 });
const nhCoopExtended = defineInstitution({
  ...nhCoop,
  patterns: nhOld11 === null ? nhCoop.patterns : [...nhCoop.patterns, nhOld11],
});
```

## 보강 분류와 결정 트리

| 분류           | 의도                                          | 방법                                                      | 사례                                 |
| -------------- | --------------------------------------------- | --------------------------------------------------------- | ------------------------------------ |
| 과목 코드 확장 | PDF가 나열하지 않은 운영 코드 추가            | 같은 패턴의 `subjects`에 코드 추가                        | 상호저축은행                         |
| 새 패턴        | PDF에 없는 자릿수·형식 추가                   | `patterns: [...core.patterns, newPattern]`                | 국민은행 14자리, 지역 농·축협 11자리 |
| 접두어 좁히기  | 다른 기관과 겹치는 짧은 식별자를 길게         | `identifierPosition.length`를 늘리고 `identifiers`를 좁힘 | 케이뱅크 100, 토스뱅크 1000·1500     |
| 넓은 휴리스틱  | PDF 밖의 넓은 신호로 후보 추가                | 1자리 식별자 + `additionalRules`                          | 하나은행 구 외환 14자리              |
| 충돌 가드      | 다른 기관이 우연히 같은 점수가 되는 것을 막음 | 기존 패턴의 `additionalRules`에 가드 추가                 | 국민·기업은행 14자리                 |

```text
PDF에 그 형식이 있는가?
├─ 있지만 코드 나열이 부족함         → 과목 코드 확장
├─ 식별이 너무 약함(길이만, 1자리)   → 접두어 좁히기
├─ PDF 밖의 넓은 접두어가 실제로 쓰임 → 넓은 휴리스틱 + 인접 기관 충돌 가드
└─ 자릿수·형식 자체가 없음           → 새 패턴(+ 인접 기관 충돌 가드 검토)
```

- 휴리스틱을 더했다면 같은 자릿수의 다른 기관에 가드가 필요한지 확인합니다.
- 접두어 좁히기는 신뢰도를 올리는 도구가 아니라 혼동을 줄이는 도구입니다. 겹침이 실제로 남아 있다면 `ambiguous`가 그대로인 것이 맞습니다.
- 새 패턴은 PDF가 갱신될 때 가장 먼저 깨집니다. 갱신마다 [기관 데이터](./registry.md)의 최근 변경과 `pickPattern` 테스트로 확인합니다.

## 확장 시 지켜지는 계약

- `extend`와 `remove`는 새 detector를 반환하고 원래 detector를 바꾸지 않습니다. detector는 넘겨받은 기관·배열·설정을 복사하거나 동결하지 않으므로, 넘긴 뒤에는 바꾸지 않습니다.
- 같은 `id`를 `extend`하면 기관 전체가 교체됩니다. 일부 과목만 바꿀 때도 기존 기관과 패턴을 명시적으로 펼칩니다.
- `scoring`은 키별로, `checkDigitVerifiers`는 기관 ID별로 덮어쓰고, `globalRules`는 뒤에 이어 붙입니다.
- 식별자·과목 코드가 맞지 않으면 그 점수를 받지 않습니다. 근거(식별자·과목·`isFallback`이 아닌 분기)가 없는 후보는 점수와 관계없이 `"low"`입니다.
- `globalRules`가 `false`를 반환해도 후보를 지우지 않습니다. `additionalRules`는 입력이 템플릿과 1자리 이내일 때 하나라도 `false`면 패턴을 제외하고, 더 짧은 입력에는 적용하지 않습니다.
- 분기 규칙은 기관의 최고 점수 패턴에만 적용합니다. `null`은 변경 없음이고, 없는 기관으로 재배정하면 원래 기관을 유지합니다. 가산점은 근거가 있을 때만 붙고, 같은 기관으로 재배정된 여러 후보를 합치지 않습니다.
- `effectiveFrom`은 정보용입니다. 날짜로 후보를 거르지 않습니다.
- 패턴에 `services`가 없으면 `subject.allowsWithdrawal`이 `true`여도 종류 때문에 `capabilities.allowsWithdrawal`이 `false`일 수 있습니다. 출금 여부는 항상 `capabilities.allowsWithdrawal`을 읽습니다.
- `categories`·`include`·`exclude`는 분기 후의 기관에 적용하고 `exclude`가 우선합니다. 옵션으로 숨긴 기관도 `ambiguous`에는 들어갑니다.

## CMS 코드와 표준은행코드

`Institution.code`는 CMS 참가기관 코드이고 `commonCode`는 금융공동망 표준은행코드입니다. 대부분 같지만 하나은행은 `code: "005"`, `commonCode: "081"`입니다. 실명조회처럼 표준은행코드를 받는 API에는 `commonCode ?? code`를 넘깁니다. 커스텀 기관도 두 코드가 다를 때만 `commonCode`를 지정합니다. 자세한 대응표는 [기관 데이터](./registry.md#6-kftc-표준은행코드-vs-cms-참가기관-코드)에 있습니다.
