---
"korean-account": minor
---

다섯 검증 어댑터의 detectionSchema.score를 유한한 0 이상 숫자로 통일합니다. 이전에 일부 어댑터가 허용하던 NaN과 무한대는 거부합니다. 0·소수·최대 유한 숫자는 계속 허용하며 다른 형변환·오류 구조는 유지합니다.
