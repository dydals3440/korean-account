---
"korean-account": patch
---

영문 README 추가 및 문서 정확도 수정.

- **`README.en.md` 신설** + 양쪽 README 상단에 언어 스위처. npm 키워드는 영문(`korean`, `fintech`, `kftc`)인데 문서는 한국어 전용이라, 확장 모델·PDF 충실성 원칙·한계 섹션을 외국인 사용자가 읽을 수 없었습니다.
- `CODE_OF_CONDUCT.md` 가 스스로를 Contributor Covenant **2.1** 이라 밝히면서 실제로는 1.4 구조(4단계 시행 지침 없음)였고, "비공개 채널로 신고" 라고 쓰면서 그 채널을 정의하지 않았습니다. 진짜 2.1 로 교체하고 신고 이메일을 명시했습니다.
- `SECURITY.md` 에 지원 버전 표, 응답 목표, 위협 모델(런타임 의존성 0 · 네트워크 I/O 없음 · provenance)을 추가했습니다.
- JSDoc 드리프트 수정:
  - `ScoringWeights` 의 기본 가중치 목록에서 `branchRuleMatch: 2` 가 빠져 있었습니다.
  - `Subject.allowsWithdrawal` 이 "기본 true" 라고 적혀 있었지만, 실제로는 kind 에서 유도됩니다.
- README 의 `Node 22+` 표기를 `Node 20.19+` 로, 기관 수 `~57곳` 을 `57곳` 으로 정정했습니다.
