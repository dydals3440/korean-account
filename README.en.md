# korean-account

**English** · [한국어](./README.md)

> A TypeScript library that identifies, classifies, and validates Korean bank account numbers. Its single source of truth is the [KFTC CMS account-number scheme by participating institution (2026.05.08)](https://www.cmsedi.or.kr/cms/board/workdata/view/1026).

<p align="center">
  <img src="https://raw.githubusercontent.com/dydals3440/korean-account/main/showcase.gif" alt="korean-account demo" width="400" />
</p>

[![npm](https://img.shields.io/npm/v/korean-account.svg?style=flat-square)](https://www.npmjs.com/package/korean-account)
[![bundle](https://img.shields.io/bundlephobia/minzip/korean-account?style=flat-square)](https://bundlephobia.com/package/korean-account)
[![license](https://img.shields.io/npm/l/korean-account.svg?style=flat-square)](./LICENSE)
[![ci](https://img.shields.io/github/actions/workflow/status/dydals3440/korean-account/ci.yml?branch=main&style=flat-square&label=ci)](./.github/workflows/ci.yml)

```bash
pnpm add korean-account
# npm i korean-account · yarn add korean-account · bun add korean-account
```

```ts
import { detectBest } from "korean-account";

detectBest("110-436-387740");
// {
//   institution: { id: "shinhan", code: "088", nameKo: "신한은행", nameEn: "Shinhan Bank", ... },
//   kind: "new",
//   subject: { code: "110", category: "savings", label: "저축예금" },
//   formatted: "110-436-387740",
//   score: 14,
//   confidence: "high",
//   capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: null },
// }
```

- **Faithful to the PDF** — a registry of 57 institutions transcribed row-by-row from the KFTC CMS document
- **Strict TypeScript** — `institutionById("shinhan").code` narrows to the literal `"088"`
- **Zero runtime dependencies** — `zod` is an optional peer dependency, required only for `korean-account/schema`
- **Universal** — Node 20.19+ · Bun · Deno · browsers · ESM and CJS

Full reference: [DOCS.md](./DOCS.md) · Changelog: [CHANGELOG.md](./CHANGELOG.md) · Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 1. Why korean-account

Validating Korean account numbers is harder than it looks. Length varies from 10 to 16 digits by bank; the identifier code sits in different places (first 3 digits, middle 4, last 2); subject codes and branch rules all differ. A regex or two will not cover it, and most of what circulates on wikis, blogs, and Stack Overflow has drifted away from the [KFTC standard](https://www.cmsedi.or.kr/cms/board/workdata/view/1026).

This library takes the KFTC CMS PDF as its single source of truth. Every pattern in `src/data/` corresponds to a row in that document. Contributions that add an institution [must cite the PDF page and table row](./.github/ISSUE_TEMPLATE/new_institution.yml).

**What it deliberately does not do:** check digits. The PDF does not publish the algorithms, so the library ships a `CheckDigitVerifier` hook instead of guessing. See [Limitations](#9-limitations).

## 2. Installation

```bash
pnpm add korean-account
```

Requirements:

- **Node 20.19+** (also runs on Bun, Deno, and browsers — the build targets ES2020 and imports no `node:` builtins)
- TypeScript recommended, but not required
- `zod@^3.23.0 || ^4.0.0` only if you import `korean-account/schema`

## 3. Quick start

### Single result — when you only need the top candidate

```ts
import { detectBest } from "korean-account";

const result = detectBest("3333-12-3456789");
result?.institution.nameEn; // "KakaoBank"
result?.confidence;         // "high"
```

`detectBest` returns `null` when nothing matches.

### Multiple candidates with filters

```ts
import { detectAccount } from "korean-account";

detectAccount("110-436-387740", {
  categories: ["bank"],   // banks only
  exclude: ["hsbc"],      // minus HSBC
  limit: 3,
  minScore: 5,
});
```

Results are sorted by score (descending), then by institution `priority`, then by account-kind order. When the top candidate is `high` or `medium` confidence, `low` candidates are dropped as noise.

### Choosing a depth

| You want | Use |
| --- | --- |
| One answer | `detectBest(input)` |
| Ranked candidates | `detectAccount(input, options)` |
| Your own registry / rules / weights | `createDetector({ ... })` |
| Add to the default registry | `defaultDetector.extend({ ... })` |
| Form validation | `korean-account/schema` |

## 4. Supported institutions

57 institutions: 25 banks, 7 non-banks, 24 securities firms, 1 clearing house. See the [Korean README](./README.md#4-지원-금융기관) for the full table with codes, names, and digit counts, or query it at runtime:

```ts
import { institutions, pickInstitutions } from "korean-account";

institutions.length;                        // 57
pickInstitutions({ categories: ["bank"] }); // narrowed to bank institutions
```

If an institution or pattern is not in the PDF, it is not in the core registry. Add it yourself with `defineInstitution` + `extend` — see [Extending](#7-extending).

## 5. Core API

### 5.1 Detection

```ts
detectAccount(input: string, options?: DetectOptions): readonly DetectionResult[]
detectBest(input: string, options?: DetectOptions): DetectionResult | null
createDetector(input: CreateDetectorInput): Detector
defaultDetector: Detector
```

```ts
interface DetectOptions {
  readonly categories?: readonly InstitutionCategory[];
  readonly kinds?: readonly AccountKind[];
  readonly include?: readonly InstitutionId[];
  readonly exclude?: readonly InstitutionId[];
  readonly limit?: number;    // default 5
  readonly minScore?: number; // default 1
}

interface DetectionResult {
  readonly institution: Institution;
  readonly matchedPattern: AccountPattern;
  readonly kind: AccountKind;
  readonly subject?: Subject;
  readonly formatted: string;
  readonly score: number;
  readonly confidence: "high" | "medium" | "low";
  readonly capabilities: {
    readonly allowsWithdrawal: boolean;
    readonly virtual: boolean;
    readonly validatedCheckDigit: boolean | null;
  };
}
```

### 5.2 Lookup

```ts
institutionById("shinhan"); // narrowed: code is the literal "088"
institutionByCode("088");
institutionByCode("078");   // alias code → widened to Institution | null
```

Note: `institution.code` is the **CMS** code. Some institutions carry a different KFTC common bank code — read `institution.commonCode ?? institution.code` if your backend uses the standard code. (`hana` is `code: "005"` but `commonCode: "081"`.)

### 5.3 Selectors

```ts
pickInstitutions({ categories: ["bank"], exclude: ["hsbc"] });
pickInstitutionsByIds({ include: ["kb", "shinhan", "hana"] });
pickPattern("shinhan", { kind: "new" });
```

### 5.4 Normalize · format · extract

```ts
normalize("110-436-387740");                                    // "110436387740"
formatAccount("110436387740", createPatternTemplate("XXX-XXX-XXXXXX"));
extractIdentifier(digits, pattern);
extractSubject(digits, pattern);
scoreToConfidence(9);                                           // "high"
```

### 5.5 Constants and labels

```ts
import { ACCOUNT_KINDS, SUBJECT_CATEGORIES, accountKindLabels } from "korean-account";

ACCOUNT_KINDS;              // ["new", "old", "virtual", "lifetime", "incoming-only", "merged-legacy"]
accountKindLabels.virtual;  // "가상계좌"
```

### 5.6 Validation schemas — `korean-account/schema`

Requires `zod` (v3 or v4 — both are tested in CI).

```ts
import { accountSchema, institutionIdSchema, detectionSchema } from "korean-account/schema";

accountSchema.safeParse("110-436-387740").success; // true
institutionIdSchema.safeParse("nope").success;     // false
```

This subpath does **not** pull in the institution registry — importing it costs about 1 KB gzipped.

## 6. Exported types

`AccountKind`, `AccountPattern`, `AdditionalRule`, `BranchRule`, `BranchRuleResult`, `CheckDigitVerifier`, `Confidence`, `CreateDetectorInput`, `DetectOptions`, `DetectionCapabilities`, `DetectionResult`, `Detector`, `GlobalRule`, `Institution`, `InstitutionCategory`, `InstitutionCode`, `InstitutionId`, `InstitutionIdByCategory`, `InstitutionIdInput`, `PatternTemplate`, `PatternToken`, `PickInstitutionsFilter`, `PickPatternFilter`, `Position`, `RegisteredInstitution`, `ScoringWeights`, `Subject`, `SubjectCategory` — plus `DetectionPayload` from `korean-account/schema`.

## 7. Extending

Detectors are immutable. `extend` and `remove` return new instances.

```ts
import { createPatternTemplate, defaultDetector, defineInstitution } from "korean-account";

const myBank = defineInstitution({
  id: "my-bank",
  code: "999",
  nameKo: "커스텀은행",
  nameEn: "My Bank",
  category: "bank",
  aliases: [],
  patterns: [
    {
      template: createPatternTemplate("XXX-XXXXXXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["999"],
    },
  ],
});

const detector = defaultDetector.extend({
  institutions: [myBank],
  checkDigitVerifiers: { "my-bank": (digits) => luhn(digits) },
  scoring: { identifierMatch: 6 },
});
```

| Goal | Call |
| --- | --- |
| Add or replace an institution | `extend({ institutions })` |
| Remove one | `remove("hsbc")` or `remove(predicate)` |
| Register a check-digit verifier | `extend({ checkDigitVerifiers })` |
| Tune scoring weights | `extend({ scoring })` |
| Start from scratch | `createDetector({ institutions: [...] })` |

Give custom institutions an `identifier` where you can. Without one a pattern scores 3 (length only), lands in `low` confidence, and gets filtered out whenever a real bank matches at `high`.

See [DOCS.md → Appendix D](./DOCS.md) for the full extension mechanics.

## 8. Design principles

1. **The PDF is the source of truth.** No pattern enters the core registry without a citation.
2. **Never guess.** Check digits are unimplemented rather than approximated. `validatedCheckDigit: null` means "not checked", not "valid".
3. **Types carry the domain.** Institution ids, codes, and categories are literal unions, not `string`.
4. **Pay only for what you import.** The registry lives in its own chunk; `normalize` alone costs 169 bytes gzipped.
5. **Immutable detectors.** Extension returns new instances; nothing is mutated globally.

## 9. Limitations

- **No check-digit algorithms.** The KFTC PDF does not publish them. Register your own via `checkDigitVerifiers`.
- **Detection is probabilistic.** Several institutions share digit counts and prefixes. That is why results are a ranked list with a score, not a single boolean. A `high` confidence result is not proof the account exists.
- **Deposit-only detection is metadata-driven.** `capabilities.allowsWithdrawal` reflects the account-number scheme and subject code, not the live account state.
- **Not a bank API.** This library never contacts a network.

## 10. Performance

About **12–20 µs** per `detect()` call on an M-series Mac. Internally an index maps input length to candidate institutions, cutting roughly 170 pattern evaluations down to 10–15.

## 11. Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md). In short: Conventional Commits, a `.spec.ts` for every change, a `pnpm changeset` for anything user-facing, and a PDF citation for any registry change.

Bug reports and new-institution requests use [issue forms](./.github/ISSUE_TEMPLATE). Please mask real account numbers (e.g. `110-***-387740`).

## License

[MIT](./LICENSE)
