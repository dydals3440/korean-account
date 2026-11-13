---
"korean-account": minor
---

공개 타입의 null·undefined 규칙을 통일하고, 커스텀 기관 정의에서 생기던 타입 구멍을 막았습니다.

- **바뀌는 동작**: `extractIdentifier`가 식별 자리가 없거나 입력이 그 자리에 닿지 않으면 `""` 대신 `null`을 돌려줍니다. 찾지 못하면 `null`을 돌려주는 다른 조회 함수와 같은 규칙입니다.
- `Subject.services`에 `{ directDebit: undefined }`처럼 값을 비워 넘기면 `capabilities.services.directDebit`가 타입은 `boolean`인데 실제로는 `undefined`가 되던 문제를 고쳤습니다. 이제 키마다 병합해서 패턴 값을 유지합니다.
- `Institution`·`AccountPattern`·`Subject`·`BranchRuleResult`의 선택 필드가 `undefined`를 명시적으로 받습니다. `exactOptionalPropertyTypes`를 켠 프로젝트에서도 조건부 값을 그대로 넘길 수 있습니다.
