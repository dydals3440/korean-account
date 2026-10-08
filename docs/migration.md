# 0.3.1 → 0.4 마이그레이션

0.4는 아직 게시하지 않은 다음 minor다. 공개 함수·export·기관 ID·ESM/CJS·Node 지원과 점수 가중치는 유지한다. 결과 변경과 패키지 내부 파일 변경을 Changesets minor로 관리한다. 실행 결과를 보존하는 문서·PURE·저작권 정리는 별도 0.3 patch 브랜치에서 검토한다.

## 바뀌는 동작

| 대상            | 변경                                                | 소비자 확인 사항                                                                                |
| --------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 기관 필터       | 분기 후 최종 기관에 include·exclude·categories 적용 | 수협 등 분기 결과를 기준으로 ID·category 필터를 구성한다. 제외가 우선이며 중복 후보는 유지된다. |
| 검증 어댑터     | score는 유한한 0 이상 숫자                          | NaN·양/음의 무한대를 전달하지 않는다. 0·소수는 계속 허용한다.                                   |
| SC              | 일반·과목 15를 10→11자리로 정정                     | 이전의 정확 길이·포맷·순위에 의존한 처리를 재검토한다. 과목 16의 14자리는 유지한다.             |
| 제주            | 열거 25개만 식별자 가산                             | 미열거 55개 접두어의 score·confidence·순위를 재검토한다.                                        |
| 교보            | 구 0 / 신 0 이외 조건 추가                          | kind·과목이 달라질 수 있다. 성공 규칙 가산점 +1을 반영한다.                                     |
| 신한 14자리     | 통합 패턴의 901 제외                                | 구계좌 901은 유지된다. 통합 패턴의 성공 규칙 가산점 +1을 반영한다.                              |
| 산업 010        | savings·저축예금                                    | treasury 분류에 의존한 필터·표시를 갱신한다. 출금 flag는 유지한다.                              |
| 광주 13자리 109 | ordinary·보통예금                                   | 12자리 109의 treasury와 구분한다.                                                               |
| 신한 298        | trust·청년희망펀드 공익신탁                         | category·label을 갱신한다. 출금 제한은 유지한다.                                                |
| 신협 110/177    | 출금 false                                          | 기존 안내·자동이체 후보 처리를 재검토한다.                                                      |
| 케이뱅크 13자리 | 2-3-4-4, incoming-only                              | formatted·kind·출금 flag를 갱신한다. virtual은 일괄 true가 아니다.                              |
| HSBC            | 원문 과목 69개 추가                                 | subject·가산점·confidence·순위와 note 변경을 확인한다.                                          |

`additionalRules`는 gate와 가산점 역할을 함께 한다. 따라서 교보·신한 조건 추가는 알려진 과목뿐 아니라 조건을 통과한 일반 길이 후보에도 영향을 준다. 일부 기존 3점 low 후보가 4점 medium이 되어 목록에 새로 나타난다. 이 변경을 숨기기 위해 전역 가중치·confidence 기준·정렬 알고리즘을 조정하지 않았다.

SC의 11자리 과목 15는 하나은행과 동점이 될 수 있다. `123-15-67890-1`은 기존 동점 규칙에 따라 하나은행 다음에 SC가 나온다. 입력 형식만으로 유일한 기관을 확정하지 않는다.

## 문서·패키지 경로

- 상세 문서는 [DOCS 안내](../DOCS.md)를 통해 주제별 파일로 연결된다. 기존 DOCS 앵커는 저장소에서 유지한다.
- npm의 `DOCS.md`는 제외한다. 패키지 내부 파일을 직접 읽던 소비자는 GitHub 문서 URL로 이전한다.
- 영어 본문은 [docs/README.en.md](./README.en.md), 기존 루트 영어 README는 안내 파일이다. npm은 root README 변형을 자동 포함하므로 짧은 안내도 배포된다.
- 시연 이미지의 raw 경로는 `main/showcase.gif`에서 `main/docs/assets/showcase.gif`로 바뀐다. 외부 임베드는 경로를 갱신한다. 이미지는 이전에도 npm·JS 번들에 포함되지 않았다.
- JS 소스맵·라이선스·변경 이력·외부 코드 고지는 유지한다. 공개 subpath와 deprecated 필드를 삭제하지 않는다.

## 유지한 정책

가상·평생계좌 출금 capability, 하나은행의 과거 코드 표현, 기존 보강·중복 후보·모호한 분류 우선순위는 보존한다. capability는 실제 금융기관 거래 가능 보장이 아니며 `effectiveFrom`은 자동 날짜 필터가 아니다. [원문 사실과 호환 예외](./source-audit.md)를 참고한다.

커스텀 확장은 새 API로 이전할 필요가 없다. 같은 ID는 기관 전체 교체이고 입력 데이터는 읽기 전용으로 취급한다. 내장 검증 어댑터에 커스텀 ID가 자동 등록되지는 않는다.

---

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
