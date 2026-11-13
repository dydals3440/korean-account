# korean-account

**English** · [한국어](https://github.com/dydals3440/korean-account/blob/main/README.md)

**Find which Korean bank or brokerage an account number most likely belongs to, offline.**
The rules come from the KFTC (금융결제원) CMS account-number tables. No network calls, no runtime dependencies, and you can bundle only the institutions you support.

```ts
import { detectBest } from "korean-account";

detectBest("3333-12-3456789");
// => { institution: { id: "kakao", nameEn: "KakaoBank", ... }, confidence: "high", ambiguous: false, ... }
```

## Why

Korean transfer and direct-debit forms ask the user to pick a bank next to the account number, and account-holder lookup APIs ([Bolta](https://docs.bolta.io/docs/api-introduction/bank-account-holder), [PortOne](https://developers.portone.io/api/rest-v2/platform.account), [KFTC Open Banking](https://developers.kftc.or.kr/dev/openapi/open-banking/account)) require that bank code up front. A wrong pick means a failed lookup and a retry. NH NongHyup Bank (011) and the regional NongHyup cooperatives (012) are the classic mix-up; korean-account tells them apart from the account-type digit and subject codes printed in the KFTC tables.

## Features

- **Evidence-based confidence**: `medium` or better requires a matching identifier, subject code or branch condition. A number that only fits the length is always `low`.
- **Ambiguity flag**: `ambiguous: true` when another institution sits in the same confidence band, so you know to ask the user.
- **KFTC service columns**: virtual-account issuance, direct debit, direct credit and additional services via `capabilities.services`.
- **Type-safe**: institution ids are literal unions, and a detector built from a subset narrows its result types to that subset.
- **Small**: 11.6 kB for the full registry, 4.2 kB for `createDetector([kb, shinhan, toss])` (minified + brotli).
- **Validation adapters**: Standard Schema (no dependency), Zod 3/4, Valibot, Yup and ArkType, all with the same rules.

## Install

```sh
pnpm add korean-account
```

Node.js 22.12+ and modern browsers. ESM and CommonJS.

## Quick start

```ts
import { detect } from "korean-account";

for (const candidate of detect("110-436-387740", { limit: 3 })) {
  console.log(candidate.institution.nameEn, candidate.confidence, candidate.ambiguous);
}
// Shinhan Bank high true
// Korea Post high true
// Credit Union Central high true
```

> [!IMPORTANT]
> Results are **candidates that fit the numbering scheme**. They do not prove the account exists or who owns it. Recommended flow: show candidates while the user types → let the user confirm the bank → verify with an account-holder lookup API.

To keep bundles small, pass only the institutions you support:

```ts
import { createDetector, kb, shinhan, toss } from "korean-account";

const detector = createDetector([kb, shinhan, toss]);
detector.detect("110-436-387740")[0]?.institution.id; // "shinhan", typed "kb" | "shinhan" | "toss"
```

## Validation adapters

| Import path                      | Peer       |
| -------------------------------- | ---------- |
| `korean-account/standard-schema` | none       |
| `korean-account/zod`             | Zod 3 or 4 |
| `korean-account/valibot`         | Valibot 1  |
| `korean-account/yup`             | Yup 1      |
| `korean-account/arktype`         | ArkType 2  |

```ts
import { createAccountSchema } from "korean-account/zod";

const accountSchema = createAccountSchema({
  messages: { required: "Enter an account number.", minDigits: "Too few digits." },
});
```

## Limitations

- Institutions that share a numbering scheme cannot be told apart from the number alone; `ambiguous` is `true` then.
- Check-digit algorithms are not public, so none are built in; register your own with `checkDigitVerifiers`.
- Candidates appear once the input is within one digit of a pattern length.
- `capabilities` are static facts from the KFTC tables, not a guarantee for a specific account.

## Documentation

The detailed docs are in Korean: [API](https://github.com/dydals3440/korean-account/blob/main/docs/api.md) · [Scoring](https://github.com/dydals3440/korean-account/blob/main/docs/scoring.md) · [Customization](https://github.com/dydals3440/korean-account/blob/main/docs/customization.md) · [Recipes](https://github.com/dydals3440/korean-account/blob/main/docs/recipes.md) · [Registry](https://github.com/dydals3440/korean-account/blob/main/docs/registry.md) · [Source audit](https://github.com/dydals3440/korean-account/blob/main/docs/source-audit.md) · [Migration](https://github.com/dydals3440/korean-account/blob/main/docs/migration.md). Every public export also carries detailed English JSDoc, so your editor shows usage and examples on hover.

## License

[MIT](https://github.com/dydals3440/korean-account/blob/main/LICENSE)
