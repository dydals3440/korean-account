---
"korean-account": patch
---

문서·내부 정비 릴리스 — 공개 API 변경 없음 (0.0.2 와 완전 호환)

- npm 패키지에 `DOCS.md` 포함 — README 의 상세 레퍼런스 링크가 npmjs.com 에서도 동작
- README API 카탈로그에 누락되어 있던 공개 export 보강 (`normalizeSubject`, `RegisteredInstitution`, `InstitutionIdInput`, 선택자 필터 타입 등)
- CONTRIBUTING 의 툴체인 표기를 실제 (Node 22+ / pnpm 10) 와 일치하도록 수정
- 핵심 공개 함수에 `@example` 포함 JSDoc 보강 — 에디터 호버 문서 개선
- 내부 리팩토링: 중복 패턴 가드를 명명 헬퍼로 통합, 채점 함수를 단일 책임 소함수로 분해 (동작·점수 동일)
