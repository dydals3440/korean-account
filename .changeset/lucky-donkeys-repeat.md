---
"korean-account": minor
---

분기 규칙(`branchRule`)이 적중한 후보가 `minScore` 컷오프에 조기 탈락하던 문제를 고쳤습니다.

> ⚠️ **BREAKING CHANGE (동작)** — `detectAccount` / `detectBest` 에 `options.minScore` 를 기본값(1)보다 높게 지정한 경우 결과가 달라집니다. 기본 옵션 사용자는 영향이 없습니다 (아래 실측 표 참조).

`branchRuleMatch` 보너스(+2)가 `minScore` 검사 **뒤에** 적용되고 있었습니다. 그래서 "분기 규칙 덕에 `minScore` 를 넘겼어야 할 후보" 가 보너스를 받아보지도 못하고 잘려 나갔습니다. 분기 규칙은 PDF 가 명시한 강한 식별 신호이므로, 보너스를 먼저 얹고 자릅니다.

**영향 범위 — 24,000 케이스 코퍼스로 실측했습니다.**

| 옵션 | 변경된 결과 |
| --- | ---: |
| 기본값 (`minScore` 미지정) | **0건** |
| `minScore: 0` | **0건** |
| `minScore: 5` | 875건 |
| `minScore: 8` | 48건 |

**후보 920건이 복구되고 사라진 후보는 0건** 입니다. `limit` 에 걸린 꼬리에서 동점 후보가 교체된 3건을 제외하면 상위 후보 순서는 그대로입니다.

### 함께 고친 것

- `normalizeSubject` 가 `lifetime` kind 를 출금 차단으로 보지 않아, `subject.allowsWithdrawal` 은 `true` 인데 `capabilities.allowsWithdrawal` 은 `false` 인 모순이 났습니다. 이제 `computeCapabilities` 와 같은 정의를 씁니다. 기본 레지스트리에는 `lifetime` + `subjects` 를 동시에 가진 패턴이 없어 **출력 변화는 0건** 이며, 커스텀 기관에만 영향이 있습니다.
- 아무 효과도 없던 죽은 선언 4개를 제거했습니다 — `subjects` 없는 `subjectPosition` 3개(HSBC, DB증권, 우리투자증권), `identifiers` 없는 `identifierPosition` 1개(수협 12자리). 런타임 동작은 그대로입니다.
- 데이터 레지스트리 불변식 테스트 923개를 추가했습니다. 위 죽은 선언들은 이 테스트가 없어 아무 신호 없이 존재했습니다.
