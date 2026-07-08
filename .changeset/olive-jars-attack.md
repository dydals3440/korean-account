---
"korean-account": minor
---

zod v4 지원을 실제로 성립하게 만들고, 배포되던 깨진 타입 선언을 고쳤습니다.

### 배포되던 `.d.ts` 가 깨져 있었습니다

`index.d.ts` / `schema.d.ts` 가 끝내 emit 되지 않는 `helpers-*.d.ts` 청크를 import 하고 있었습니다. 소비자는 `Cannot find module './helpers-CHbaQZwO.js'` 를 만났을 것입니다. `publint` 는 이걸 잡지 못합니다.

원인은 tsdown 이 d.ts 를 ESM 패스 안에서 생성하면서 `codeSplitting.groups` 를 d.ts 에도 적용하는 것이었습니다 (0.22.0 · 0.22.4 모두 재현). JS 와 d.ts 를 별도 빌드로 분리했습니다.

이제 `pnpm build` 가 **attw(strict) + publint** 를 관문으로 실행합니다.

### `zod@^4` 는 타입 레벨에서 거짓이었습니다

`peerDependencies` 는 `^3.23.0 || ^4.0.0` 을 광고했지만, 생성된 `dist/schema.d.ts` 가 v3 전용 타입을 하드코딩했습니다 — `z.ZodEffects` ×4 (v4 에서 제거됨), 튜플형 `z.ZodEnum`. devDep 이 zod v3 이라 CI 가 구조적으로 잡을 수 없었습니다.

증상은 시끄러운 에러가 아니라 **조용한 붕괴** 였습니다. 대부분의 소비자가 쓰는 `skipLibCheck: true` 아래서 `tsc` 는 통과하지만 스키마 타입이 `any` 로 무너져 검증 기능을 잃습니다.

- 모든 스키마 export 에 버전 중립 타입(`ZodType<T>`)을 명시했습니다.
- `institutionIdSchema` 은 `z.custom` 으로 바꿨습니다. v3 의 `.refine((v): v is InstitutionId => …)` 는 타입 서술로 출력을 좁히지만 v4 의 `.refine` 은 좁히지 않아, 같은 코드가 두 메이저에서 다른 타입을 냅니다.
- CI 에 zod v3 / v4 매트릭스를 추가했습니다. 광고한 것을 실제로 검증합니다.

### 추가된 것 (additive)

`.options` / `.enum` 접근자가 타입 표면에서 사라진 것을 상쇄하고, 리터럴 유니온의 이중 정의를 컴파일 타임에 결박합니다.

- `ACCOUNT_KINDS`, `SUBJECT_CATEGORIES`, `INSTITUTION_CATEGORIES`, `CONFIDENCE_LEVELS` — `as const satisfies readonly X[]` + 양방향 exhaustiveness 테스트.
- `korean-account/schema` 에 `DetectionPayload` 타입.
- `typesVersions` — `moduleResolution: "node"` (node10) 소비자가 `korean-account/schema` 타입을 해석할 수 있게. attw strict 가 이 갭을 잡아냈습니다.

### 하위호환

공개 export 는 **5개 추가, 0개 제거** 입니다. 런타임 동작은 불변입니다.

타입 표면에서 유일한 변화는 zod 스키마의 선언 타입입니다 (`z.ZodEffects<…>` → `ZodType<string>`). `accountKindSchema.options` 처럼 zod 고유 접근자에 의존하던 코드는 새로 export 된 `ACCOUNT_KINDS` 를 쓰면 됩니다.
