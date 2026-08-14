---
"korean-account": minor
---

0.2.0 — 전면 재구조화. 자세한 마이그레이션은 아래 표 참고.

**Breaking (0.x 마이너, semver 상 허용)**

| 이전                                               | 이후                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `detectAccount(input, opts)`                       | `detect(input, opts)`                                                                            |
| `normalize(input)`                                 | `normalizeAccount(input)`                                                                        |
| `createPatternTemplate(t)`                         | `patternTemplate(t)`                                                                             |
| `institutionById(id)` / `institutionByCode(code)`  | `getInstitution(idOrCode)` — 등록 literal 은 non-null 반환                                       |
| `pickInstitutions(f)` / `pickInstitutionsByIds(f)` | `searchInstitutions(f)`                                                                          |
| `createDetector({ institutions, ...opts })`        | `createDetector(institutions, opts?)`                                                            |
| `defaultDetector`                                  | 삭제 — `detect`/`detectBest` 사용, 커스텀은 `createDetector(institutions)`                       |
| `korean-account/schema`                            | `korean-account/zod` (내용 동일)                                                                 |
| `Position` 타입                                    | `DigitSpan`                                                                                      |
| `CreateDetectorInput`                              | `CreateDetectorOptions`                                                                          |
| `PickInstitutionsFilter`                           | `SearchInstitutionsFilter`                                                                       |
| `Institution.priority` (0~100 큐레이션)            | `Institution.userBaseMillions` 기반 `prevalence()` 계산 — `priority` 는 수동 오버라이드로만 유지 |
| `engines.node >= 20.19`                            | `>= 22.12` (Node 20 EOL)                                                                         |

**추가**

- 57개 기관 named export (`kb`, `shinhan`, `toss`, …) + `banks`/`nonBanks`/`securities` — `createDetector([kb, shinhan])` 이 실제로 tree-shake 됨 (3.6 KB vs 전체 10 KB, min+brotli). dist 를 모듈 단위(preserveModules)로 배포.
- `prevalence()` export — 동점 tie-break 사전확률 (실측 고객 수 기반, DOCS A.4).
- 카카오뱅크 `3333`·`7979` 프리픽스를 core 반영 (`3333-…` → 카카오뱅크 high).

**데이터 — CMS PDF (2026.05.08) 전수 대조 감사**

케이뱅크 12d 실계좌·우체국 13d·아이엠뱅크 7~11d·미래에셋 8/9/12/13d 등 누락 패턴 추가, 전북·경남·유안타·KB증권·교보 검증번호 자리 정정, 농협 13d 계좌구분 게이트, 입금전용·가상 플래그 일괄 정정 등 30여 건.
