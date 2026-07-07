# Contributing

Node 22+ / pnpm 10.

## 셋업

```bash
pnpm install
pnpm test       # 전체 테스트
```

## 작업 흐름

```bash
pnpm test:watch     # 개발 중
pnpm typecheck      # 타입 검증
pnpm lint           # Biome
pnpm build          # tsdown / rolldown
```

브랜치: `feat/...`, `fix/...`, `docs/...`. 커밋은 [Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/).

사용자에게 보이는 변경은 **`pnpm changeset` 으로 변경 항목 기록 필수**. 내부 리팩터/CI 만이면 생략.

## 새 기관 · 패턴 추가

가장 흔한 기여 시나리오.

1. PR 본문에 [금융결제원 CMS PDF](https://www.cmsedi.or.kr/cms/board/workdata/view/1026) 의 페이지·표 행 인용
2. `src/data/<category>.ts` 에 institution / pattern 추가
3. `DOCS.md` 의 매핑 표 갱신
4. `src/_internal/fixtures` 에 fixture 추가 (양·음성 케이스)
5. 회귀용 `.spec.ts` 추가

> "관행적으로 통용되는 prefix" 는 PDF 가 enumerate 한 게 아니면 코어가 아닌 컨슈머 보강 영역. [§ 8. 설계 원칙](./README.md#8-설계-원칙) 참조.

## 코드 규약

- public 타입은 `src/types.ts` 에 모음, 전부 `readonly`
- 새 외부 의존성 추가 금지 — `zod` 가 유일하며 `src/schema/*` 한정
- `node:` / DOM API 금지 (`platform: "neutral"`)

## 릴리스

메인테이너만. main 머지 → Changesets 가 `Version Packages` PR 자동 생성 → 머지 시 npm 배포 + provenance 발급.

## 행동 강령

[Contributor Covenant 2.1](./CODE_OF_CONDUCT.md).
