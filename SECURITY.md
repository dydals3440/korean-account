# Security Policy

## 지원 버전

1.0.0 이전에는 **최신 마이너 버전**에만 보안 패치를 제공합니다. 최신 버전은 `npm view korean-account version` 또는 [npm](https://www.npmjs.com/package/korean-account)에서 확인할 수 있습니다.

| 버전                  | 보안 패치 |
| --------------------- | --------- |
| 최신 마이너 (`0.x.y`) | ✅        |
| 이전 마이너           | ❌        |

## 취약점 신고

공개 이슈에 올리지 말고 아래 경로 중 하나로 비공개 신고해 주세요.

- [GitHub Security Advisory](https://github.com/dydals3440/korean-account/security/advisories/new) (권장)
- 이메일: **matthew@redband.co.kr** (GitHub 계정이 없는 경우)

접수 확인은 영업일 기준 3일 안에, 수정 또는 완화 계획 공유는 30일 안에 하는 것을 목표로 합니다.

## 위협 모델

- 런타임 의존성이 없습니다. `zod`·`valibot`·`yup`·`arktype`은 해당 어댑터에서만 쓰는 선택적 peerDependency입니다.
- 네트워크 I/O, 파일 시스템 접근, `node:` 내장 모듈을 쓰지 않습니다(`platform: "neutral"`).
- 입력값을 외부로 보내지 않고 문자열 패턴만 해석합니다.
- npm 배포본은 GitHub Actions의 trusted publishing(OIDC)으로 올리며 [provenance attestation](https://docs.npmjs.com/generating-provenance-statements)이 붙습니다.

## 계좌번호 마스킹

이슈나 PR에 실제 계좌번호가 필요하면 반드시 마스킹해 주세요(예: `110-***-387740`). 재현에는 합성 번호를 권장합니다.

## English

Only the latest minor release receives security fixes before 1.0.0. Please report vulnerabilities privately through a [GitHub Security Advisory](https://github.com/dydals3440/korean-account/security/advisories/new) instead of a public issue. The package has zero runtime dependencies, performs no I/O, and is published from CI via npm trusted publishing with provenance.
