---
"korean-account": patch
---

chore: 개발/CI 툴체인 유지보수 업데이트

- devDependencies: typescript 5.9→6.0, @types/node 22→26, @biomejs/biome 2.4→2.5, tsdown 0.22.4→0.22.8, @arethetypeswrong/core 0.18.4→0.18.5
- GitHub Actions: actions/checkout v5→v7, actions/setup-node v5→v7, pnpm/action-setup v5→v6.0.9, actions/labeler v5→v6.2.0
- dependabot: npm·github-actions 업데이트를 각각 한 그룹으로 묶음 (메이저 포함, zod 메이저는 제외 유지)

소비자 영향 없음: 런타임 의존성 0개이며 typescript/@types/node 는 devDependency 전용이다. 새 툴체인으로 빌드한 `dist/` 는 npm 0.1.2 배포본과 바이트 단위로 동일함(attw strict + publint 통과)을 확인했다. 공개 API·런타임 동작 변화 없음.
