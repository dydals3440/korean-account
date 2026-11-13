---
"korean-account": minor
---

내부 구조를 계층별 모듈로 재편했습니다. 공개 export 목록은 그대로입니다.

- `detect()`의 반환 타입을 `readonly DetectionResult<RegisteredInstitution>[]`로 명시해 타입 선언과 IDE 표시가 짧아졌습니다.
- 어댑터(`korean-account/zod` 등)의 타입 선언이 더 이상 기관 레지스트리 선언을 포함하지 않습니다.
- `Detector.remove`가 등록된 기관 id를 자동완성하고, `extend` 옵션 타입을 `ExtendDetectorOptions`로 공개합니다.
- `patternTemplate`이 잘못된 템플릿에 `TypeError`를 던지고, 메시지가 `korean-account:`로 시작합니다.
- 탐지 결과에 과목이 없으면 `subject` 키를 생략합니다(이전에는 `undefined` 값으로 존재).
- 분기 규칙 상수 8개(`kb11FirstDigit` 등), `scoreToConfidence`, `normalizeSubject`를 deprecated 처리했습니다. 1.0에서 제거합니다.
