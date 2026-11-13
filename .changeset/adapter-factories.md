---
"korean-account": minor
---

검증 어댑터 5종(zod·valibot·yup·arktype·standard-schema)에 같은 팩토리와 변환 헬퍼를 추가했습니다.

- `createAccountSchema({ messages })`: 계좌번호 메시지를 키별로 덮어씁니다. 생략하거나 `undefined`로 둔 키는 한국어 기본값을 씁니다.
- `createInstitutionIdSchema(ids)`, `createDetectionSchema(ids)`: 커스텀 detector의 기관 ID로 검증하고, 출력 타입도 그 ID 유니온으로 좁혀집니다.
- `toDetectionPayload(result)`(루트): `DetectionResult`를 JSON으로 보낼 수 있는 `DetectionPayload`로 바꿉니다. 모든 어댑터의 `detectionSchema`가 이 결과를 그대로 통과시킵니다.
- `detectionSchema`가 `ambiguous`와 `capabilities.services`를 선택 필드로 받습니다. 기존 payload도 그대로 통과합니다.
- 메시지는 한 곳(`MESSAGES`)에서 관리해 다섯 어댑터의 기본 메시지가 같습니다. standard-schema 어댑터에 흩어져 있던 문구도 이 목록으로 옮겼습니다.
- zod `accountSchema`는 `ZodString`이라 zod 3·4 모두에서 `z.input`·`z.infer`가 `string`입니다. 각 어댑터의 추론 타입은 peer 하한 버전에서도 소비자 검사로 확인합니다.
- yup·arktype 어댑터의 크기 예산을 1.25 kB에서 1.5 kB로 맞췄습니다(실측 1.42 kB·1.44 kB).
