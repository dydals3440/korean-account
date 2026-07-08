---
"korean-account": patch
---

0.1.0 에서 실수로 제거한 패턴 필드 4개를 되돌립니다.

`identifiers` / `subjects` 배열이 없으면 `identifierPosition` / `subjectPosition` 도 죽은 선언이라고 판단해 지웠습니다. **틀렸습니다.** 점수 가산에는 쓰이지 않지만, 두 필드는

- 공개 API `extractIdentifier(digits, pattern)` · `extractSubject(digits, pattern)` 가 읽고
- `DetectionResult.matchedPattern` 으로 그대로 노출됩니다.

그 결과 12자리 수협 계좌에서 `extractIdentifier` 가 `"965"` 대신 **빈 문자열** 을 반환했습니다.

```ts
// 0.0.3
extractIdentifier("965182960583", result.matchedPattern); // "965"
// 0.1.0  ← 회귀
extractIdentifier("965182960583", result.matchedPattern); // ""
// 0.1.1  ← 복구
extractIdentifier("965182960583", result.matchedPattern); // "965"
```

되돌린 필드: 수협 12자리 `identifierPosition`, HSBC · DB증권 · 우리투자증권의 `subjectPosition`.

**검증**: npm 의 `0.0.3` 을 받아 21,005개 입력에 대해 12가지 옵션 조합으로 `JSON.stringify` 바이트 대조했습니다. `minScore` 를 기본값(1)보다 높게 지정한 경우(0.1.0 의 의도된 `branchRule` 수정)를 제외하면 **차이 0건** 입니다.

원인이 된 데이터 불변식(`position ⟺ 배열`)도 올바른 한 방향(`배열 ⇒ position`)으로 고쳤고, `extractIdentifier` 회귀 테스트를 추가했습니다.
