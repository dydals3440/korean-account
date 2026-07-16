---
"korean-account": patch
---

chore: 개발 툴체인 메이저 업데이트 (typescript 7, vitest 4)

- typescript 6.0.3 → 7.0.2
- vitest 2.1.9 → 4.1.10, @vitest/coverage-v8 2.1.9 → 4.1.10
- vite ^7.3.6 를 devDependency 로 추가 — vitest 4 는 vite 를 peerDependency 로 요구한다(vitest 2 에서는 직접 의존이었음). 이 peer 미충족이 `ERR_PACKAGE_PATH_NOT_EXPORTED: vite/module-runner` 실패의 원인이었다.
- @changesets/cli 2.31.0 → 2.31.1

소비자 영향 없음(비파괴적): 런타임 `dist/*.js`·`*.cjs` 는 npm 0.1.3 과 바이트 동일. typescript 7 이 생성 `index.d.ts`/`index.d.cts` 의 union 멤버를 알파벳순으로 정렬해 방출하지만(0.1.3 은 레지스트리 선언순), 멤버 집합은 62개로 완전히 동일하며 TypeScript 에서 union 순서는 타입 정체성에 영향이 없다(동일 타입). 공개 API 계약·런타임 동작 변화 없음. attw(strict)+publint 통과, 테스트 1354개 통과.
