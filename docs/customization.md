[문서 목록](../DOCS.md) · [빠른 시작](../README.md)

<a id="appendix-b-pdf-vs-컨슈머-책임-모델"></a>

# Appendix B. PDF vs 컨슈머 책임 모델

> 자체 detector 를 만들 사람이라면 한 번 읽고 가야 한다. 라이브러리가 어디까지 책임지고, 어디부터 컨슈머 영역인지의 경계.

<a id="b1-영역별-경계"></a>

## B.1 영역별 경계

| 영역              | PDF 코어 (전체 레지스트리 `institutions`)                                          | 컨슈머 책임                                           |
| ----------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 등록 기관         | 57개 라이브러리 항목 — 공식 참여기관 수와 일대일 대응하지 않음                     | 사내 정산·B2B 가상계좌 발급사·미참가 외국계 활성화 등 |
| 과목 코드         | PDF 표에 enumerate 된 값만 (예: 050 = 13/21/22/23 4개)                             | 실세계 운영 코드 (050 의 11/14/15/17/18/24–28/33 등)  |
| Identifier prefix | PDF 명시 길이/값 + 실세계 확립 신호 (카카오 3333·7979 — 0.2.0 에서 core 로 승격됨) | tightening (토스 3→4자리, K뱅크 100 prefix)           |
| 분기 규칙         | PDF 명시 8건 (수협 4 / KB 1 / K뱅크 2 / 토스 1)                                    | 사내 prefix → kind override, 도메인 규칙 등           |
| 체크디지트        | 값 위치만 명시 — 알고리즘 미구현 (PDF 비공개)                                      | `checkDigitVerifiers` 옵션으로 verifier 등록          |
| 외환 14d 식별     | 기존 보강 8개 prefix (PDF에 열거되지 않음)                                         | 4번째 자리 "9" 광범위 휴리스틱                        |
| 외국계 미참가     | 기본 패턴 등록, 부가서비스 미참가 표시는 별도 해석                                 | 활성화 시 컨슈머가 패턴 추가                          |

<a id="b2-detector-합성-도식"></a>

## B.2 detector 합성 도식

```
        ┌─ createDetector(institutions) (원문 기반 + 기존 보강) ─────┐
        │   57 library entries, provenance documented                       │
        └────────────────────┬─────────────────────────────────┘
                             │ .extend({ institutions: [...] })
                             │   ← replace-on-id 시맨틱
                             ▼
        ┌─ 도메인 detector ────────────────────────────────────┐
        │   + 운영 과목 / tightening / 휴리스틱 / 충돌 가드    │
        └──────────────────────────────────────────────────────┘
```

코어는 새 PDF 가 나오면 라이브러리가 갱신한다. 컨슈머 detector 는 그 위에 얹혀 있어 코어 변경에 대해 _호환성 검증만_ 하면 된다 — 보강이 의존하는 패턴이 살아 있는지는 `pickPattern` 으로 확인한다 (§ D.4).

<a id="b3-code-cms-vs-commoncode-kftc-표준--두-namespace-경계"></a>

## B.3 code (CMS) vs commonCode (KFTC 표준) — 두 namespace 경계

이 문서 § 6 ("CMS code vs 표준은행코드 namespace") 를 참조. 라이브러리는 과거 하나은행 코드 표현을 호환 목적으로 보존한다. 공식 코드표와의 차이는 [PDF 대조 기록](./source-audit.md)에 기록한다.

---

<a id="appendix-d-확장-mechanics"></a>

# Appendix D. 확장 mechanics

기본 레지스트리는 PDF 기반 데이터와 기존 보강을 함께 갖는다. PDF 미명시 영역은 컨슈머가 자체 detector 로 확장하며, 라이브러리는 immutable `extend` / `remove` API 로 이를 지원한다.

**D.1 실사례 카탈로그 8건 → D.2 분류표·결정 트리 → D.3 extend/remove API → D.4 선택자 → D.5 보조 유틸** — 무엇을 보강할지 D.1–D.2 에서 찾고, 어떻게 넣을지는 D.3 이후에서 본다.

<a id="d1-컨슈머-보강-카탈로그"></a>

## D.1 컨슈머 보강 카탈로그

각 사례 양식: **PDF 상태** / **현실** / **보강 전략** / **사이드이펙트**

<a id="d11-050-상호저축은행--과목코드-확장"></a>

### D.1.1 050 상호저축은행 — 과목코드 확장

- **PDF 상태**: 14d 신계좌 과목 4개만 enumerate — 보통:13 / 저축:21 / 자유저축:22 / 기업자유:23.
- **보강 가정 (별도 확인 필요)**: 11·14·15·17·18·19 (보통) / 24·25·28 (저축) / 26·27 (자유저축) / 33 (기업자유) 등 더 넓게 운영.
- **보강 전략**: 같은 patterns 위에 `subjects` 를 PDF 4개 + 도메인 7–10개로 확장.
- **영향**: 추가 과목 가산점으로 후보 점수와 순위가 달라질 수 있다.

```ts
const savingsBankExtended = defineInstitution({
  id: "savings-bank",
  // ... 메타 ...
  patterns: [
    {
      template: T("XXX-XX-XX-XXXXXX-X"),
      kind: "new",
      subjectPosition: { start: 5, length: 2 },
      subjects: [
        defineSubject({ code: "13", category: "ordinary" }),
        defineSubject({ code: "21", category: "savings" }),
        // ... PDF 의 22/23 ...
        ...["11", "14", "15", "17", "18", "19"].map((code) =>
          defineSubject({ code, category: "ordinary" }),
        ),
        // ... 추가 카테고리 ...
      ],
    },
  ],
});
```

<a id="d12-004-kb국민--14d-본점-신계좌-pdf-미명시-패턴-추가"></a>

### D.1.2 004 KB국민 — 14d 본점 신계좌 (PDF 미명시 패턴 추가)

- **PDF 상태**: KB 14d 는 92(가상) 와 (구)주택 14d 만 enumerate. 본점 14d 신계좌 패턴 자체가 PDF 에 없음.
- **보강 가정 (별도 확인 필요)**: `XXXXXX-XX-XXXXXX` 본점 14d 신계좌가 일반적이며 식별자/과목은 6–7번째 자리에 01·03·04·06·11·12·21·25·33·35 등.
- **보강 전략**: 코어 patterns 위에 새 14d 패턴 추가 + `d[3]!=="9"` 가드로 외환 14d (4번째 자리 9) 흡수 회피.
- **사이드이펙트**: 가드 없으면 외환 14d 가 동률로 KB 에 흡수.

```ts
const kbCore = getInstitution("kb"); // 등록 literal → non-null
const kbExtended = defineInstitution({
  id: "kb",
  // ... 메타 ...
  patterns: [
    ...kbCore.patterns,
    {
      template: T("XXXXXX-XX-XXXXXX"),
      kind: "new",
      identifierPosition: { start: 6, length: 2 },
      identifiers: ["01", "03", "04", "06", "11", "12", "21", "25", "33", "35"],
      subjectPosition: { start: 6, length: 2 },
      subjects: [/* ... */],
      additionalRules: [(d) => d[3] !== "9"],
    },
  ],
});
```

<a id="d13-089-k뱅크--13d-100-prefix-narrowing"></a>

### D.1.3 089 K뱅크 — 13d 100 prefix narrowing

- **PDF 상태**: 13d 는 `□□-□□□-□□□□-□□□□` 형 휴대폰번호 연결만 명시, 특정 prefix 없음.
- **보강 가정 (별도 확인 필요)**: 실세계 K뱅크 계좌는 `100...` prefix 가 압도적.
- **보강 전략**: 코어 패턴 의 identifierPosition 을 `{0,3}` 로 좁히고 `identifiers: ["100"]`.
- **사이드이펙트**: 없음 (1자리 첫자리 식별이 3자리로 보강돼 신뢰도 boost).

<a id="d14-090-카카오뱅크--4자리-prefix-tightening-020-에서-core-로-승격됨"></a>

### D.1.4 090 카카오뱅크 — 4자리 prefix tightening (0.2.0 에서 core 로 승격됨)

> **0.2.0 에서 core 로 승격됨** — 이 보강은 이제 라이브러리 기본 동작이다 (`3333-12-3456789` → 카카오뱅크 `high`). 컨슈머 보강이 필요 없으며, 아래 레시피는 같은 기법의 참고용으로만 남긴다.

- **PDF 상태**: `□-□□□-□□□□□□□□□` 업무구분(1) + 상품구분(3) + 일련(9). 4자리 prefix enumerate 없음.
- **보강 가정 (별도 확인 필요)**: 카카오뱅크는 `3333` / `7979` 두 prefix 만 사용.
- **보강 전략**: identifierPosition `{0,4}` + `identifiers: ["3333","7979"]` 로 좁힘.
- **사이드이펙트**: 없음 — 1자리 첫자리만 보면 다른 13d 기관과 동률 나는 모호함이 해소.

<a id="d15-092-토스뱅크--34자리-tightening--additionalrule"></a>

### D.1.5 092 토스뱅크 — 3→4자리 tightening + additionalRule

- **PDF 상태**: `XXX-XXXXXXXX-X` 과목(3) + 일련(8) + 검증(1) — 보통 100 / 기업자유 150.
- **보강 가정 (별도 확인 필요)**: 토스 100·150 은 신한 12d 100·150 과 충돌. 실세계 토스 계좌는 `1000` / `1500` 4자리 prefix 만 발급.
- **보강 전략**: identifierPosition `{0,4}` + `identifiers: ["1000","1500"]` + `additionalRules: [(d) => d.length===12 && (d.startsWith("1000") || d.startsWith("1500"))]` 로 신한과 분리.
- **사이드이펙트**: 없음 (신한 100·150 입력은 토스 후보에서 빠지고 신한이 단독).

<a id="d16-005-하나은행--외환-14d-광범위-휴리스틱"></a>

### D.1.6 005 하나은행 — 외환 14d 광범위 휴리스틱

- **PDF 상태**: 외환 통합 14d (점번호 8개): 117·158·161·162·210·379·600·655.
- **보강 가정 (별도 확인 필요)**: 실제 외환은행 발급 14d 는 더 많은 점번호 (395·427·556·617 등) 를 사용.
- **보강 전략**: 일반 시중은행 앱 휴리스틱 — 4번째 자리 "9" (주민번호 prefix 91/95/...) 를 1자리 identifier 로 등록. 기존 보강 8개 prefix 는 라이브러리 본 패턴이 잡고, 그 외 광범위는 휴리스틱이 잡음.
- **사이드이펙트**: 외환 14d 가 KB·IBK 14d 와 우연히 동률 나서 흡수되던 회귀 — KB / IBK 측에 `d[3]!=="9"` 가드가 짝으로 들어가야 함 (§ D.1.2 · § D.1.7).

```ts
const HANA_FOREIGN_LEGACY_PREFIXES_FOR_HEURISTIC = new Set([
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

<a id="d17-003-ibk기업은행--외환-흡수-회피-가드"></a>

### D.1.7 003 IBK기업은행 — 외환 흡수 회피 가드

- **PDF 상태**: IBK 14d new `XXX-XXXXXX-XX-XX-X` — 식별자/과목이 9–10번째 자리.
- **보강 가정 (별도 확인 필요)**: 4번째 자리 "9" 인 외환 14d 가 우연히 IBK 식별자 영역과 동률.
- **보강 전략**: IBK 14d new 패턴의 `additionalRules` 에 `d[3]!=="9"` 가드만 추가.
- **사이드이펙트**: 없음 (IBK 본점 14d 신계좌의 4번째 자리는 사실상 9 가 아님).

<a id="d18-012-농협중앙회--11d-단위지역농협-fallback"></a>

### D.1.8 012 농협중앙회 — 11d 단위/지역농협 fallback

- **PDF 상태**: 농협은행(011) 11d 만 enumerate, 농협중앙(012) 11d 는 미명시.
- **보강 가정 (별도 확인 필요)**: 단위·지역농협이 실제로 11d 계좌를 발급.
- **보강 전략**: 농협중앙(012) patterns 에 11d fallback 패턴을 추가하되 011 농협은행과 동일한 과목 체계 (보통:01 / 저축:02 / 자유저축:12 / 가계종합:06 / 당좌:05 / 기업자유:17) 로 매핑.
- **영향**: 추가 과목 가산점으로 후보 점수와 순위가 달라질 수 있다.

<a id="d2-보강-분류표--결정-트리"></a>

## D.2 보강 분류표 + 결정 트리

§ D.1 의 8건을 _어떤 신호 → 어떤 기법_ 으로 추상화하면 5가지로 떨어진다.

| 분류                     | 의도                                           | 기법                                               | 사례                                                                     |
| ------------------------ | ---------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| **과목코드 확장**        | PDF 가 enumerate 안 한 운영 과목 추가          | `subjects: [...pdf, ...extra]` (같은 patterns 위)  | savings-bank                                                             |
| **신규 패턴**            | PDF 에 없는 자릿수/형식의 patterns 자체 추가   | `patterns: [...core, newPattern]`                  | kb 본점 14d, nh-coop 11d                                                 |
| **Prefix tightening**    | 1–3자리 → 더 긴 prefix 로 좁힘                 | `identifierPosition.length` ↑ + `identifiers` 좁힘 | kbank 100, toss 1000/1500 (kakao 3333/7979 는 0.2.0 에서 core 로 승격됨) |
| **휴리스틱 광범위 매칭** | PDF 명시 prefix 외 광범위 신호 (4번째 자리 등) | 1자리 identifier + `additionalRules` 게이트        | hana 외환 d[3]="9"                                                       |
| **충돌 가드**            | 다른 기관이 우연 동률로 흡수하는 회귀 차단     | 기존 패턴 `additionalRules` 에 가드 추가           | kb 14d / ibk 14d 의 `d[3]!=="9"`                                         |

<a id="결정-트리"></a>

### 결정 트리

```
PDF 에 코드/패턴이 있는가?
├─ 있는데 enumerate 부족             → 과목코드 확장
├─ 식별이 너무 약함 (1자리 첫자리만)   → Prefix tightening
├─ PDF 외 광범위 prefix 가 실세계 존재 → 휴리스틱 + (인접 기관) 충돌 가드
└─ 자릿수/형식 자체가 PDF 에 없음     → 신규 패턴 (+ 인접 기관 충돌 가드 검토)
```

**경험칙**:

- 휴리스틱을 추가했다면 _반드시 인접 기관 가드 페어_ 를 점검 (외환 14d 휴리스틱 + KB/IBK 14d 가드).
- Prefix tightening 은 신뢰도를 _높이는_ 게 아니라 _혼동을 줄이는_ 도구 — 동률 회피가 1차 목적.
- 신규 패턴은 PDF 갱신 시 가장 깨지기 쉬움 — 새 PDF 가 같은 자릿수에 패턴을 enumerate 했는지 § 5 (최근 추가/변경) 와 코어 diff 로 확인.

<a id="d3-extend--remove-api"></a>

## D.3 extend / remove API

<a id="새-institution-추가"></a>

### 새 institution 추가

```ts
import { createDetector, defineInstitution, institutions, patternTemplate } from "korean-account";

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
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["999"],
    },
  ],
});

const detector = createDetector(institutions).extend({ institutions: [myFintech] });
detector.detect("999-1234-5678");
```

<a id="기존-institution-에-pdf-비표준-패턴-추가-replace-on-id"></a>

### 기존 institution 에 PDF 비표준 패턴 추가 (replace-on-id)

`extend({ institutions: [override] })` 에서 같은 id 의 institution 이 들어오면 _기존 본을 자동 교체_ 한다. `.remove(id).extend(...)` 체인을 강제하지 않는다.

```ts
const base = getInstitution("savings-bank"); // 등록 literal → non-null

const extended = defineInstitution({
  ...base,
  patterns: [
    ...base.patterns,
    {
      template: patternTemplate("XXX-XX-XX-XXXXXX-X"),
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

const detector = createDetector(institutions).extend({ institutions: [extended] });
detector.detect("066-43-15-739026-6");
// → savings-bank, kind: "virtual", subject.code: "15"
```

<a id="분기-규칙-정의"></a>

### 분기 규칙 정의

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

<a id="카테고리기관-일부만-사용"></a>

### 카테고리/기관 일부만 사용

```ts
import { banks, createDetector, institutions } from "korean-account";

const banksOnly = createDetector(banks);

const noForeignBanks = createDetector(institutions).remove((i) =>
  ["hsbc", "deutsche", "jpmc", "boa", "bnp-paribas"].includes(i.id),
);
```

<a id="체크디지트-검증"></a>

### 체크디지트 검증

PDF 가 알고리즘을 비공개하므로 라이브러리 기본은 검증하지 않는다 (`capabilities.validatedCheckDigit = null`). 외부 자료로 알고리즘을 확보한 경우, `createDetector` 의 `checkDigitVerifiers` 옵션에 institution id 별로 verifier 함수를 등록.

```ts
import { createDetector, institutions, type CheckDigitVerifier } from "korean-account";

const verifyShinhan: CheckDigitVerifier = (digits) => {
  // 알고리즘 구현 — 자료 출처 명시 권장
  return /* boolean */ true;
};

const detector = createDetector(institutions, {
  checkDigitVerifiers: {
    shinhan: verifyShinhan,
  },
});

const [r] = detector.detect("110-436-387740");
r?.capabilities.validatedCheckDigit; // true / false / null
```

매칭된 패턴이 `validatesCheckDigit: false` 로 표시되어 있으면 verifier 가 등록되어 있어도 `null` 로 처리된다 (광주은행 12d 과목 731, 수협 신계좌 등).

## 확장 시 보존되는 계약

- 같은 ID를 `extend`하면 기관 전체가 교체된다. 일부 과목만 바꿀 때는 기존 기관과 해당 패턴을 명시적으로 펼친다. 변경하지 않은 기관 뒤에 전달한 기관들이 추가된다.
- scoring은 얕게 병합하고 global rules는 순서대로 이어 붙인다. 같은 기관의 check-digit verifier는 새 함수로 교체한다.
- `extend`와 `remove`는 새 detector를 반환한다. 전달한 기관·배열·설정을 나중에 변경하지 않는다. detector는 데이터를 복제하거나 동결하지 않으므로 외부 변경은 인덱스와 노출된 데이터의 불일치를 만들 수 있다.
- 식별자·과목이 일치하지 않으면 가산점을 받지 않는다. `globalRules`의 false도 후보를 탈락시키지 않는다.
- `additionalRules`는 정확한 길이와 ±1자리의 근접 후보에 gate로 적용된다. 통과하면 정확·근접 길이에서 규칙별 점수를 받는다. 더 짧은 부분 입력에는 이 gate와 가산점이 적용되지 않는다.
- 분기는 선택된 최적 패턴에 적용된다. null은 변경 없음, 미등록 대상은 최초 기관 유지다. null 이외의 분기 결과에는 기존 분기 가산점이 붙는다. 동일 기관으로 분기한 여러 후보는 합치지 않는다.
- `effectiveFrom`은 자동 만료·적용일 필터가 아니다. 등록한 verifier는 `validatesCheckDigit: false`가 아니면 실행되며, false 검증 결과는 후보 제거가 아니라 메타데이터다.
- 종류 기반 capability 제한이 과목의 flag보다 우선할 수 있다. `subject.allowsWithdrawal`과 최종 `capabilities.allowsWithdrawal`을 같은 값으로 가정하지 않는다.

## 커스텀 ID와 검증 어댑터

`createDetector`의 커스텀 ID는 내장 `institutionIdSchema`·`detectionSchema`에 자동 등록되지 않는다. 내장 스키마는 라이브러리 등록 ID만 허용한다. 커스텀 결과를 저장할 때는 애플리케이션의 기관 집합과 반환 형태에 맞춰 스키마를 구성한다.

```ts
import { z } from "zod";

const configuredIds = new Set(["my-bank", "shinhan"]);
const customInstitutionIdSchema = z.string().refine((id) => configuredIds.has(id));
```
