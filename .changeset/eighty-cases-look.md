---
"korean-account": patch
---

`engines.node` 하한을 `>=22.0.0` 에서 `>=20.19.0` 으로 낮췄습니다.

산출물의 최고 문법은 `??` 와 `?.` (ES2020) 이고 `node:` 내장 모듈을 하나도 쓰지 않습니다. Node 22 하한에는 근거가 없었습니다.

빌드 도구(tsdown)가 `^22.18.0 || >=24.11.0` 을 요구하지만 **그건 툴체인의 제약이지 산출물의 제약이 아닙니다.** CI 에 `runtime` 잡을 두어 Node 22 로 빌드한 `dist` 를 **Node 20 에서 직접 실행** 해 ESM·CJS 양쪽을 검증한 뒤 하한을 낮췄고, 빌드에 `target: "es2020"` 을 명시해 다시 어긋나지 않게 했습니다.

기존 Node 22+ 사용자에게는 영향이 없습니다 (하한을 낮추기만 함).

### 저장소 하드닝

- `.github/dependabot.yml` 신설 — npm · GitHub Actions 주간 갱신.
- GitHub Actions 를 모두 커밋 SHA 로 고정했습니다. `changesets/action@v1` 은 태그가 아니라 force-push 가능한 브랜치를 가리키고 있었습니다.
- `ci.yml` 에 `permissions: contents: read` 를 추가했습니다 (세 워크플로 중 유일하게 없었습니다).
- `.nvmrc` 가 `lts/*` 라 CI 와 조용히 어긋날 수 있었습니다. `22` 로 고정하고 워크플로가 `node-version-file` 로 읽게 했습니다.
- `.gitignore` 에 `.npmrc`, `.env.*`, `*.pem`, `*.key` 를 추가했습니다.
- PR 제목 Conventional Commits 검사 워크플로를 추가했습니다 (`CONTRIBUTING.md` 가 의무화하지만 강제 도구가 없었습니다).
