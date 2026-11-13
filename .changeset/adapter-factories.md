---
"korean-account": minor
---

검증 어댑터 5종(zod·valibot·yup·arktype·standard-schema)에 같은 팩토리와 변환 헬퍼를 추가했습니다.

- `createAccountSchema({ messages })`: 계좌번호 메시지를 키별로 덮어씁니다. 생략하거나 `undefined`로 둔 키는 한국어 기본값을 씁니다.
- `createInstitutionIdSchema(ids)`, `createDetectionSchema(ids)`: 커스텀 detector의 기관 ID로 검증하고, 출력 타입도 그 ID 유니온으로 좁혀집니다.
- `toDetectionPayload(result)`(루트): `DetectionResult`를 JSON으로 보낼 수 있는 `DetectionPayload`로 바꿉니다. 모든 어댑터의 `detectionSchema`가 이 결과를 그대로 통과시킵니다.
- `detectionSchema`가 `ambiguous`와 `capabilities.services`를 선택 필드로 받습니다. 기존 payload도 그대로 통과합니다.
- 메시지는 한 곳(`MESSAGES`)에서 관리해 다섯 어댑터의 기본 메시지가 같습니다. standard-schema 어댑터에 흩어져 있던 문구도 이 목록으로 옮겼습니다.
- `accountSchema`가 전각 숫자(`０–９`)와 전각 하이픈을 받습니다. `detect`가 받는 입력과 같습니다.
- 문자열이 아닌 입력(`null`, 숫자 등)은 다섯 어댑터 모두 `required` 메시지로 거부합니다.
- arktype 어댑터를 객체 스키마 안에 넣어도 메시지 앞에 필드 경로가 붙지 않습니다.
- zod `accountSchema`는 `ZodString`이라 zod 3·4 모두에서 `z.input`·`z.infer`가 `string`입니다. 각 어댑터의 추론 타입은 peer 하한 버전에서도 소비자 검사로 확인합니다.
- `detectionSchema`는 다섯 어댑터 모두 `DetectionPayload` 밖의 키를 모든 단계에서 지우고(zod·valibot 기본 동작과 같음), 선택 필드에 명시한 `undefined`를 받습니다. yup은 `strict: true`로 검증하면 변환 단계를 건너뛰므로 키가 남습니다.
- yup `institutionIdSchema`와 리터럴 스키마가 숫자·`null`에도 라이브러리 메시지를 냅니다.
- 크기 예산: yup·arktype 1.75 kB, standard-schema 2 kB(실측 1.67·1.69·1.91 kB). 키 정리 함수가 늘어난 몫입니다.
