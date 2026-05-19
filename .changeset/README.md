# Changesets

변경 항목 추가:

```bash
pnpm changeset
```

생성된 `.changeset/*.md` 를 PR 에 포함. main 머지 시 Changesets 가 `Version Packages` PR 을 만들고, 머지하면 npm 에 자동 배포된다.

문서: https://github.com/changesets/changesets
