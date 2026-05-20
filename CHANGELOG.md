# Changelog

## 0.0.2

### Patch Changes

- 056ac84: `zod` 를 `peerDependencies` 로 이동 (optional, `^3.23.0 || ^4.0.0`).

  메인 진입점 (`detectAccount` / `detectBest` / `institutionById` 등) 은 zod 를 require 하지 않으므로 컨슈머는 zod 없이도 그대로 사용 가능. `korean-account/schema` 서브엔트리를 쓸 때만 컨슈머 프로젝트에 zod 가 필요.

  배경 — `dependencies` 로 두면 컨슈머 프로젝트의 zod 인스턴스와 우리 라이브러리 안의 zod 인스턴스가 다르게 resolve 될 때 `instanceof z.ZodType` 같은 동일성 검사가 깨지는 위험. `peerDependencies` 로 옮기면 컨슈머의 zod 단일 인스턴스를 공유.

## 0.0.1

초기 publish. 한국 금융기관 계좌번호 식별·과목 추출 코어 (KFTC CMS PDF 충실).
