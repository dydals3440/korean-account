# korean-account

[English](https://github.com/dydals3440/korean-account/blob/main/README.en.md) · **한국어**

한국 금융기관의 계좌번호 체계로 기관·과목 후보를 찾는 TypeScript 라이브러리입니다. 런타임 의존성 없이 ESM/CJS를 지원하며, 필요한 기관만 골라 사용할 수 있습니다.

## 설치

```sh
pnpm add korean-account
```

Node.js 22.12 이상을 지원합니다. 브라우저에서도 사용할 수 있습니다.

## 빠른 시작

```ts
import { createDetector, kb, shinhan, toss } from "korean-account";

const detector = createDetector([kb, shinhan, toss]);
const result = detector.detect("110-436-387740")[0];

console.log(result?.institution.id); // "shinhan"
console.log(result?.subject?.category); // "savings"
```

전체 레지스트리가 필요하면 `detect` 또는 `detectBest`를 사용합니다.

```ts
import { detectBest } from "korean-account";

const result = detectBest("1002-123-456789");
console.log(result?.institution.nameKo); // "우리은행"
```

<p align="center">
  <img src="https://raw.githubusercontent.com/dydals3440/korean-account/main/showcase.gif" alt="계좌번호 입력에 따른 후보 표시 시연" width="400" />
</p>

## 기능과 한계

- 57개 라이브러리 항목을 제공하며, 공식 참여기관 수와 일대일 대응하지 않습니다.
- 계좌 종류·과목·포맷·점수·confidence·정적 capability를 반환합니다.
- confidence는 규칙의 일치 수준입니다. 실제 계좌의 존재·예금주·입력 완료를 보장하지 않습니다.
- capability는 라이브러리 정책에 따른 안내입니다. 실제 자동이체 가능 여부는 별도로 확인해야 합니다.
- 자료는 [금융결제원 CMS 계좌번호체계](https://www.cmsedi.or.kr/cms/board/workdata/view/1031) 2026.05.08 판본을 기반으로 하며 기존 보강과 호환 정책을 포함합니다. [PDF 대조 기록](https://github.com/dydals3440/korean-account/blob/main/docs/source-audit.md)에 차이와 근거를 공개합니다.

## 커스텀 detector

`createDetector`에 기관을 선택해서 전달하고 `extend`로 규칙·기관을 보강합니다. 같은 ID는 기관 전체를 교체하므로 기존 패턴을 남기려면 명시적으로 펼칩니다.

```ts
import { createDetector, shinhan } from "korean-account";

const detector = createDetector([shinhan]);
const custom = detector.extend({
  institutions: [{ ...shinhan, aliases: [...shinhan.aliases, "내 앱의 신한"] }],
  scoring: { identifierMatch: 6 },
});
```

[확장 계약과 예제](https://github.com/dydals3440/korean-account/blob/main/docs/customization.md)에서 병합 순서·커스텀 ID·검증 함수를 확인할 수 있습니다.

## 검증 어댑터

선택한 검증 라이브러리만 설치하면 됩니다.

| import 경로                      | 필요한 peer  |
| -------------------------------- | ------------ |
| `korean-account/standard-schema` | 없음         |
| `korean-account/zod`             | Zod 3 또는 4 |
| `korean-account/valibot`         | Valibot 1    |
| `korean-account/yup`             | Yup 1        |
| `korean-account/arktype`         | ArkType 2    |

`accountSchema`는 입력 구문을 검사하고 원래 문자열을 반환합니다. `detectionSchema`는 등록 기관 ID를 사용하는 직렬화 payload용입니다. 실제 계좌 조회 기능은 제공하지 않습니다.

## 문서와 기여

[API](https://github.com/dydals3440/korean-account/blob/main/docs/api.md) · [기관 목록](https://github.com/dydals3440/korean-account/blob/main/docs/registry.md) · [통합 예제](https://github.com/dydals3440/korean-account/blob/main/docs/recipes.md) · [마이그레이션](https://github.com/dydals3440/korean-account/blob/main/docs/migration.md) · [변경 이력](https://github.com/dydals3440/korean-account/blob/main/CHANGELOG.md)

문제 신고에는 기관·예상 동작·재현 가능한 가상 번호·원문 근거를 포함해주세요. 실제 계좌번호는 공개하지 않아도 됩니다. [기여 안내](https://github.com/dydals3440/korean-account/blob/main/CONTRIBUTING.md)를 참고해주세요.

## License

[MIT](https://github.com/dydals3440/korean-account/blob/main/LICENSE). 포함된 외부 코드의 고지는 THIRD_PARTY_NOTICES를 참고합니다.
