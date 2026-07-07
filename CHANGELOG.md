# Changelog

## 0.0.3

### Patch Changes

- f11f8d0: 문서·내부 정비 릴리스 — 공개 API 변경 없음 (0.0.2 와 완전 호환)

  - npm 패키지에 `DOCS.md` 포함 — README 의 상세 레퍼런스 링크가 npmjs.com 에서도 동작
  - README API 카탈로그에 누락되어 있던 공개 export 보강 (`normalizeSubject`, `RegisteredInstitution`, `InstitutionIdInput`, 선택자 필터 타입 등)
  - CONTRIBUTING 의 툴체인 표기를 실제 (Node 22+ / pnpm 10) 와 일치하도록 수정
  - 핵심 공개 함수에 `@example` 포함 JSDoc 보강 — 에디터 호버 문서 개선
  - 내부 리팩토링: 중복 패턴 가드를 명명 헬퍼로 통합, 채점 함수를 단일 책임 소함수로 분해 (동작·점수 동일)

## 0.0.2

### Patch Changes

- 056ac84: `zod` 를 `peerDependencies` 로 이동 (optional, `^3.23.0 || ^4.0.0`).

  메인 진입점 (`detectAccount` / `detectBest` / `institutionById` 등) 은 zod 를 require 하지 않으므로 컨슈머는 zod 없이도 그대로 사용 가능. `korean-account/schema` 서브엔트리를 쓸 때만 컨슈머 프로젝트에 zod 가 필요.

  배경 — `dependencies` 로 두면 컨슈머 프로젝트의 zod 인스턴스와 우리 라이브러리 안의 zod 인스턴스가 다르게 resolve 될 때 `instanceof z.ZodType` 같은 동일성 검사가 깨지는 위험. `peerDependencies` 로 옮기면 컨슈머의 zod 단일 인스턴스를 공유.

## 0.0.1

초기 publish. 한국 금융기관 계좌번호 식별·과목 추출 코어 (KFTC CMS PDF 충실).
