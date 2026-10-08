# korean-account

**English** · [한국어](https://github.com/dydals3440/korean-account/blob/main/README.md)

Identify Korean financial-institution and account-subject candidates from account-number patterns. TypeScript, ESM/CJS, zero runtime dependencies, and a selectable registry.

## Install

```sh
pnpm add korean-account
```

Supports Node.js 22.12+ and browsers.

## Quick start

```ts
import { createDetector, kb, shinhan, toss } from "korean-account";

const detector = createDetector([kb, shinhan, toss]);
const result = detector.detect("110-436-387740")[0];
console.log(result?.institution.id); // "shinhan"
console.log(result?.subject?.category); // "savings"
```

Use `detect` or `detectBest` for the full registry:

```ts
import { detectBest } from "korean-account";

const result = detectBest("1002-123-456789");
console.log(result?.institution.nameEn); // "Woori Bank"
```

<p align="center">
  <img src="https://raw.githubusercontent.com/dydals3440/korean-account/main/showcase.gif" alt="Account candidate suggestions while typing" width="400" />
</p>

## Behavior and limits

- 57 library entries; this is not an official participant count.
- Results include kind, subject, formatting, score, confidence, and static capabilities.
- Confidence measures matching rules. It does not prove account existence, ownership, or completed input.
- Capabilities are library policy, not a guarantee of actual debit eligibility. Confirm the bank and account before submitting a lookup.
- Based on the [KFTC CMS account-number scheme](https://www.cmsedi.or.kr/cms/board/workdata/view/1031), dated 2026.05.08, with historical augmentations and compatibility policies. See the [source audit](https://github.com/dydals3440/korean-account/blob/main/docs/source-audit.md) for evidence and exceptions.

## Customization

Select institutions with `createDetector`, then extend institutions, rules, scoring, or check-digit verifiers. A matching ID replaces the whole institution; preserve existing patterns explicitly.

```ts
import { createDetector, shinhan } from "korean-account";

const detector = createDetector([shinhan]);
const custom = detector.extend({
  institutions: [{ ...shinhan, aliases: [...shinhan.aliases, "My app's Shinhan"] }],
  scoring: { identifierMatch: 6 },
});
```

See [customization](https://github.com/dydals3440/korean-account/blob/main/docs/customization.md) for merge order, custom IDs, and verifier contracts. Treat supplied data and configuration as read-only.

## Optional validation adapters

| Import                           | Peer dependency |
| -------------------------------- | --------------- |
| `korean-account/standard-schema` | None            |
| `korean-account/zod`             | Zod 3 or 4      |
| `korean-account/valibot`         | Valibot 1       |
| `korean-account/yup`             | Yup 1           |
| `korean-account/arktype`         | ArkType 2       |

`accountSchema` checks syntax and returns the original string. `detectionSchema` accepts a serialized payload using registered IDs, not the raw `DetectionResult` object. Custom detector IDs need an application-owned schema.

## Documentation and contributing

[API](https://github.com/dydals3440/korean-account/blob/main/docs/api.md) · [Registry](https://github.com/dydals3440/korean-account/blob/main/docs/registry.md) · [Recipes](https://github.com/dydals3440/korean-account/blob/main/docs/recipes.md) · [Migration](https://github.com/dydals3440/korean-account/blob/main/docs/migration.md) · [Changelog](https://github.com/dydals3440/korean-account/blob/main/CHANGELOG.md)

Detailed reference documents are currently in Korean. English contributions are welcome. Report reproducible behavior with synthetic examples and source evidence; see [CONTRIBUTING](https://github.com/dydals3440/korean-account/blob/main/CONTRIBUTING.md).

## License

[MIT](https://github.com/dydals3440/korean-account/blob/main/LICENSE). See THIRD_PARTY_NOTICES for included third-party code.
