# Changelog

이 파일은 [Changesets](https://github.com/changesets/changesets) 가 자동 관리합니다.
새 변경사항은 `pnpm changeset` 으로 추가하세요 ([CONTRIBUTING](./CONTRIBUTING.md)).

---

## 0.1.0 — 미배포 (Unreleased)

### 2026.05.18 — KFTC 표준은행코드 namespace 1급 노출 (9차)

- **`Institution.commonCode?: string` 필드 신설** — CMS `code` 와 다른 표준은행코드를 명시. `hana` 만 `commonCode: "081"` 지정, 다른 13 메이저 은행 + 비은행/증권은 생략 (두 namespace 일치). DOCS.md Appendix B.3 에 두 namespace 경계 설명 추가.
- **동기** — 같은 KFTC 가 운영하는 두 체계 (CMS 자동이체 vs 금융공동망 표준) 가 외환·하나 합병 (2015) 이후 분기. 컨슈머가 표준 namespace 서버를 쓰는 경우 변환 어댑터가 컨슈머마다 분산·재구현되던 한계 해소. PDF 도메인 사실 (같은 institution 이 두 namespace 에서 다른 코드를 가짐) 을 데이터 모델에 직접 반영.
- **컨슈머 사용 패턴** — `bankCodeMap[d.institution.commonCode ?? d.institution.code]` 로 lookup.
- **회귀 가드** — `banks.spec.ts` 신규: 하나 `commonCode === "081"`, 나머지 13 메이저 + `hana-securities-cma` `commonCode === undefined` 검증.

### 2026.05.15 — 추천 품질 정밀화 (8차)

- **identifier·subject 길이 보너스** — 매칭된 prefix 가 길수록 더 높은 신뢰도를 부여하도록 점수식에 `len − 1` 보너스를 도입. 1자리 +4 / 2자리 +5 / 3자리 +6 / 4자리 +7. 실세계 일반 은행 앱과 동일한 직관 — KB 12d 구계좌(2자리 식별자) vs 신한 12d(3자리 식별자) 같은 동률 모호함이 자연 해소.
- **`additionalRules` 게이트 시맨틱** — 자릿수가 일치하는 입력에서 룰이 하나라도 false 면 패턴을 후보에서 제외. 종전엔 점수만 깎이고 매칭은 살아남던 동작이라, 가드를 의도한 패턴(`d[3]==="9"` 외환 14d 신호 등) 이 실제로 가드 역할을 못 했음. 통과 시 룰 1건당 `+1` 가산은 그대로.
- **`branchRuleMatch +2` 가중치 추가** — PDF 가 명시한 분기 규칙이 패턴 매칭 시 *추가적인 강한 식별 신호* 라는 의미. 토스 12d 가상 17·19 vs 신협 12d 적금 170~178 같은 prefix 모호함에서 분기 통과 측을 우선.
- **컨슈머 보강 카탈로그 7건 추가** — 하나(005) 외환 14d 광범위 prefix 휴리스틱 (4번째 자리 "9", PDF 8개 prefix 외 광범위 매칭) + KB / IBK 14d new 패턴에 `d[3]!=="9"` 가드 (외환 14d 흡수 회피) + 저축은행·KB본점·K뱅크·카카오·토스 4자리·농협중앙 11d fallback. 라이브러리 PDF-strict 정책 유지 (DOCS.md Appendix D.1).
- 실 데이터 57건 dry-run: 18건 mismatch → **11건** (61% 감소). 잔여 11건은 PDF 모호 prefix·사용자 오타 케이스로 알고리즘 한계 범위 밖.

### 2026.05.15 — PDF 충실 정합 + 알고리즘 polish (7차)

- PDF 명시 입금전용 패턴 8건 보강 — 농협(011) 13d 적금·신탁, 농협중앙(012) 13d 적금·신탁, 우체국(071) 14d 입금만 기타 코드(05·31~33·40~48·49·80~88), 새마을금고(045) 13d 신 저축·적금, 신협(048) 12d 적금, K뱅크(089) 14d 여신가상.
- `kbank14First79` 가 7/9 외 첫자리를 *여신가상(incoming-only)* 으로 추가 분기.
- 토스 12d 가상에 subject 17·19 등록 — 신협 12d 적금과의 score 동률에서 priority 로 토스가 우선되도록.

### 2026.05.15 — PDF-strict 정책 정착 (6차)

KB 14d 신계좌·카카오 4자리·K뱅크 100·토스 4자리·신한 12d identifier exclusion·농협중앙 11d fallback·케이프 24=ISA·NH투자 effectiveFrom 등 *PDF 외 보강* 9건을 라이브러리에서 제거하고 컨슈머 측 `defaultDetector.extend(...)` 로 이관. `extend()` 가 *같은 id 가 들어오면 replace-on-id* 로 동작하도록 알고리즘 보강.

### 2026.05.15 — 분기 규칙 정정 (1~5차)

수협 11d/12d branchRule 위치·논리 정정, 농협중앙 14d 구가상(66/67) 추가, 광주 12d `716` ISA·13d `109` 보통·신계좌 13자리 자릿수 정합, 신한 14d 가상 561/562 보통 통일, 산림조합 12d / 우체국 14d 자릿수 정합, 아이엠증권 10d 자릿수, 교보·엘에스 증권 입금전용 코드 추가, 농협 13d 끝자리(계좌구분) 분기 제거 (적금/신탁 별도 패턴으로 대체).
