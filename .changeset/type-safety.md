---
"korean-account": minor
---

공개 타입의 null·undefined 규칙을 통일하고, 커스텀 기관 정의에서 생기던 타입 구멍을 막았습니다.

- **바뀌는 동작**: `extractIdentifier`가 식별 자리가 없거나 입력이 그 자리를 다 채우지 못하면 `""`나 일부 숫자 대신 `null`을 돌려줍니다. `extractSubject` 등 찾지 못하면 `null`을 돌려주는 다른 조회 함수와 같은 규칙입니다.
- `Subject.services`에 `{ directDebit: undefined }`처럼 값을 비워 넘기면 `capabilities.services.directDebit`가 타입은 `boolean`인데 실제로는 `undefined`가 되던 문제를 고쳤습니다. 이제 키마다 병합해서 패턴 값을 유지합니다.
- `Institution`·`AccountPattern`·`Subject`·`BranchRuleResult`의 선택 필드가 `undefined`를 명시적으로 받습니다. `exactOptionalPropertyTypes`를 켠 프로젝트에서도 조건부 값을 그대로 넘길 수 있습니다.
- `DetectionResult.subject`가 `ResolvedSubject` 타입입니다. 런타임에 항상 채워져 있던 `label`·`allowsWithdrawal`·`virtual`을 타입에서도 `undefined` 없이 읽을 수 있습니다.
- `patternTemplate`이 하이픈만 있거나(`"---"`), 앞뒤에 붙거나(`"-XXXX"`), 겹친(`"XX--X"`) 템플릿을 `TypeError`로 거부합니다. 이전에는 이런 템플릿이 아무 1자리 입력과 일치했습니다.
- 기관 없이 `extend({ scoring })`만 호출해도 결과의 기관 ID 타입이 `string`으로 넓어지지 않고 기존 유니온을 유지합니다.
