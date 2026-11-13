---
"korean-account": minor
---

평가 기준을 근거 중심으로 바로잡았습니다. 점수·신뢰도·후보 목록이 달라질 수 있으니 [마이그레이션 가이드](https://github.com/dydals3440/korean-account/blob/main/docs/migration.md#04x--050)를 확인하세요.

- 식별자·과목 코드·조건 분기 중 어떤 근거도 없는 후보는 항상 `low`입니다. 무작위 12자리가 수협 `medium`으로 나오던 오탐을 고쳤습니다.
- 같은 자리를 식별자와 과목으로 함께 선언한 패턴은 큰 점수 하나만 더합니다(예: 신한 `110-436-387740` 14점 → 9점, 여전히 `high`).
- 분기 규칙 가산점은 근거 있는 후보에만 붙고, "그 외" 분기는 `BranchRuleResult.isFallback: true`로 근거에서 제외합니다.
- `DetectionResult.ambiguous`: 같은 신뢰도 등급에 다른 기관 후보가 있으면 `true`입니다. 옵션 필터나 `limit`으로 숨긴 기관도 셉니다.
- 후보는 신뢰도 등급을 먼저 보고 정렬합니다. 근거 없는 `low` 후보가 점수만 높아서 근거 있는 후보보다 앞에 오지 않습니다.
- 전각 숫자(`０–９`)를 ASCII 숫자로 인정합니다.
- `scoring` 가중치가 유한한 0 이상 숫자가 아니거나 `limit`이 0 이상 정수·`Infinity`가 아니면 `RangeError`를 던집니다. `undefined`는 기본값으로 처리합니다.
