[문서 목록](../DOCS.md) · [빠른 시작](../README.md)

<a id="appendix-e-마이그레이션-가이드--01x--020"></a>

# Appendix E. 마이그레이션 가이드 — 0.1.x → 0.2.0

0.2.0 은 공개 API 를 전면 재설계했다. 아래 표의 rename 만 따라가면 기계적으로 이행된다 — 스코어링·레지스트리 데이터의 동작은 카카오 3333·7979 core 승격 (Appendix D.1.4) 외에 동일하다.

> 아래 표의 왼쪽 열은 **제거된 0.1.x 이름** 이다. 이 문서의 나머지 부분과 코드에는 더 이상 등장하지 않는다.

<a id="e1-함수-rename"></a>

## E.1 함수 rename

| 0.1.x (제거됨)                                                | 0.2.0                                 | 비고                                                                  |
| ------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| `detectAccount(input, opts?)`                                 | `detect(input, opts?)`                | 시그니처 동일                                                         |
| `normalize(input)`                                            | `normalizeAccount(input)`             |                                                                       |
| `createPatternTemplate(tpl)`                                  | `patternTemplate(tpl)`                |                                                                       |
| `institutionById(id)` · `institutionByCode(code)`             | `getInstitution(idOrCode)`            | 하나로 통합. **등록 literal 은 non-null 반환** (`?.` 불필요)          |
| `pickInstitutions(filter?)` · `pickInstitutionsByIds(filter)` | `searchInstitutions(filter?)`         | 하나로 통합                                                           |
| `createDetector({ institutions, ...opts })`                   | `createDetector(institutions, opts?)` | institutions 가 첫 위치 인자                                          |
| `defaultDetector`                                             | **제거**                              | `detect` / `detectBest` 편의 함수 또는 `createDetector(institutions)` |

<a id="e2-서브패스"></a>

## E.2 서브패스

| 0.1.x (제거됨)          | 0.2.0                                                           |
| ----------------------- | --------------------------------------------------------------- |
| `korean-account/schema` | `korean-account/zod` — 내용 동일. zod v3 (≥3.23) · v4 모두 지원 |

<a id="e3-타입-rename"></a>

## E.3 타입 rename

| 0.1.x (제거됨)           | 0.2.0                      |
| ------------------------ | -------------------------- |
| `Position`               | `DigitSpan`                |
| `CreateDetectorInput`    | `CreateDetectorOptions`    |
| `PickInstitutionsFilter` | `SearchInstitutionsFilter` |

<a id="e4-데이터-모델"></a>

## E.4 데이터 모델

| 0.1.x                                    | 0.2.0                                                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Institution.priority` (0–100 수동 지정) | `Institution.userBaseMillions` — 순수 함수 `prevalence()` 가 tie-break prior 를 계산 (Appendix A.4). `priority` 는 수동 오버라이드로만 유지 |

<a id="e5-before--after"></a>

## E.5 Before / After

```ts
// 0.1.x
// import { detectAccount, defaultDetector, institutionById } from "korean-account";
// detectAccount("110-436-387740");
// const detector = defaultDetector.extend({ institutions: [myInst] });
// institutionById("shinhan")?.code;

// 0.2.0
import { createDetector, detect, getInstitution, institutions } from "korean-account";

detect("110-436-387740");
const detector = createDetector(institutions).extend({ institutions: [myInst] });
getInstitution("shinhan").code; // 등록 literal → non-null, "088" 로 narrow
```

<a id="e6-020-신규-마이그레이션-무관-활용-권장"></a>

## E.6 0.2.0 신규 (마이그레이션 무관, 활용 권장)

- **57개 기관 named export** (`kb`, `shinhan`, `toss`, `kbSec`, …) + `banks` / `nonBanks` / `securities` / `institutions` 배열. `createDetector([kb, shinhan])` 은 tree-shake 되어 ≈ 3.6 KB, 전체 레지스트리는 ≈ 10 KB (min+brotli). dist 는 `preserveModules` 로 배포된다.
- 카카오뱅크 `3333` / `7979` prefix tightening 이 core 로 승격 — 기존 컨슈머 보강 (구 Appendix D.1.4 레시피) 은 제거해도 된다.
- Node engines `>= 22.12`.

0.1.x 시절의 문서가 필요하면 npm 의 해당 버전 tarball 또는 저장소 히스토리 (`git log -- DOCS.md`) 에서 볼 수 있다.
