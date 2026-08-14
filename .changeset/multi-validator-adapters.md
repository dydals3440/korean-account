---
"korean-account": minor
---

검증 어댑터 패밀리 — valibot · yup · arktype · standard-schema 추가.

- `korean-account/valibot` (peer `^1.0.0`) · `korean-account/yup` (peer `^1.4.0`) · `korean-account/arktype` (peer `^2.1.0`) — 기존 `korean-account/zod` 와 동일한 5개 스키마(`accountSchema`/`institutionIdSchema`/`accountKindSchema`/`subjectCategorySchema`/`detectionSchema`)를 내보낸다. peer 는 전부 optional.
- `korean-account/standard-schema` — StandardSchemaV1 을 의존성 0 으로 직접 구현. TanStack Form·tRPC v11 등 Standard Schema 를 받는 모든 프레임워크에서 peer 설치 없이 동작.
- 하나의 계약 테스트가 다섯 어댑터의 통과/거부 동작 동일성을 강제한다. 검증 규칙·한국어 메시지는 `adapters/shared` 단일 출처.
- 어댑터별 번들 실측 (min+brotli, registry 미포함): valibot 1.19KB · yup 0.99KB · arktype 0.99KB · standard-schema 1.51KB.
- 기존 API 변경 없음.
