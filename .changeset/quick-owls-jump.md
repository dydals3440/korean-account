---
"korean-account": minor
---

`Detector.extend()` 가 `scoring` 과 `checkDigitVerifiers` 를 받습니다.

지금까지 `extend()` 는 `institutions` 와 `globalRules` 만 받았습니다. 커스텀 기관을 추가해도 **그 기관의 체크디지트 verifier 를 등록할 길이 없어** `createDetector` 로 되돌아가야 했습니다.

```ts
defaultDetector.extend({
  institutions: [myBank],
  checkDigitVerifiers: { "my-bank": verifyMyBank },
  scoring: { identifierMatch: 6 },
});
```

`scoring` 은 기존 가중치 위에 얕게 병합되고, `checkDigitVerifiers` 는 기존 맵과 합쳐집니다 (같은 id 는 교체). 둘 다 생략하면 기존 설정이 그대로 이어집니다.

### 내부 정리 (공개 API 불변)

- `_internal/` 이 사실상 공개 API 였습니다 — `kb11FirstDigit`, `toss12First1719` 등 8개 분기 룰과 `scoreToConfidence`, `normalizeSubject` 가 `_internal` 이라는 이름 아래 semver 로 얼어붙어 있었습니다. 파일을 `src/rules/`, `src/subjects/`, `src/confidence/` 로 옮겼습니다. **export 목록은 68개 그대로입니다** (`pnpm check:api` 로 강제).
- 아무도 import 하지 않으면서 테스트 픽스처를 re-export 하던 죽은 배럴 `src/_internal/index.ts` 를 삭제했습니다.
- 구현·반환되지만 한 번도 호출되지 않던 내부 함수 `DetectorIndex.byLength()` 를 제거했습니다.
- `AccountPattern.checkDigitPosition` 을 `@deprecated` 로 표시했습니다. 152개 패턴 중 하나도 채우지 않고 어떤 코드 경로도 읽지 않지만, 커스텀 기관 정의에서 넘기고 있을 수 있어 제거하지 않았습니다.
- `pickInstitutions` / `pickInstitutionsByIds` 의 축자 중복(include/exclude 필터)을 공통 헬퍼로 추출했습니다.
