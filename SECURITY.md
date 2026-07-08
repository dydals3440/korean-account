# Security Policy

## 지원 버전

| 버전 | 보안 패치 |
| --- | --- |
| 0.1.x | ✅ |
| 0.0.x | ❌ |

1.0.0 이전에는 최신 마이너 버전만 보안 패치를 제공합니다.

## 취약점 신고

[GitHub Security Advisory](https://github.com/dydals3440/korean-account/security/advisories/new) 를 통해 비공개로 신고해 주세요. 공개 이슈는 사용하지 마세요.

응답 목표: 영업일 기준 3일 이내 접수 확인, 30일 이내 수정 또는 완화 계획 공유.

## 이 라이브러리의 위협 모델

- 런타임 의존성이 **0개** 입니다 (`zod` 는 선택적 peerDependency).
- 네트워크 I/O, 파일 시스템 접근, `node:` 내장 모듈 사용이 없습니다 (`platform: "neutral"`).
- 입력값을 외부로 전송하지 않고 문자열 패턴 인식만 수행합니다.
- npm 배포본에는 [provenance attestation](https://docs.npmjs.com/generating-provenance-statements) 이 첨부됩니다.

## 계좌번호 마스킹

이슈/PR 본문에 실제 계좌번호를 첨부할 때는 반드시 마스킹해 주세요 (예: `110-***-387740`).
