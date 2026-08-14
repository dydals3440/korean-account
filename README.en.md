# korean-account

**English** · [한국어](./README.md)

> A TypeScript library that identifies, classifies, and validates Korean financial-institution account numbers. It follows the [KFTC CMS account-number scheme by participating institution](https://www.cmsedi.or.kr/cms/board/workdata/cms) (as of 2026.05.08) as its single source of truth.

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
//   institution: { id: "shinhan", code: "088", nameKo: "신한은행", ... },
//   kind: "new",
//   subject: { code: "110", category: "savings", label: "저축예금" },
//   formatted: "110-436-387740",
//   score: 14,
//   confidence: "high",
//   capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: null },
// }
```

- **PDF-faithful core** — a 57-institution registry cross-checked institution-by-institution against the KFTC CMS PDF (25 banks · 8 non-banks · 24 securities firms)
- **Only the banks you need** — `createDetector([kb, shinhan, toss])` is 3.6 KB; the full registry is 10 KB (min+brotli)
- **Zero runtime dependencies** — zod is an optional peerDep only when you use `korean-account/zod` (both v3 and v4 supported)
- **Strict TypeScript** — `getInstitution("shinhan").code` narrows to the literal `"088"`
- **Universal** — Node 22+ · Bun · Deno · browsers · ESM and CJS

Full reference: [DOCS.md](./DOCS.md) · Changelog: [CHANGELOG.md](./CHANGELOG.md) · Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Why this exists

Most Korean services that identify an institution from an account number use paid server APIs — the [KFTC open-banking account holder inquiry](https://developers.kftc.or.kr/dev/openapi/open-banking/account), or the account-holder lookups offered by PGs such as Toss Payments and PortOne — and all of them **bill per call** (pricing is usually private, negotiated per contract — for reference, comparable identity-verification APIs run at [tens of KRW per call](https://blog.portone.io/authorization-payment-2/)). Adding a server plus a billing contract just for the UX of "type an account number and the bank auto-selects itself" in a form was overkill.

korean-account does that inference **on the client, for free**. It transcribes each institution's account-number scheme from the [KFTC CMS PDF](https://www.cmsedi.or.kr/cms/board/workdata/cms) — digit counts, identifier codes, subject codes, branch rules — into data, and ranks candidates with weighted scoring. This is **scheme-based inference**, not real-name verification, so it can be wrong; that is why every result carries a `confidence` (high/medium/low). If your flow needs certainty, verify with a real-name inquiry API at the final step — and let this library handle the UX in front of it for free.

If you find an account that disagrees with the scheme, please [file an issue](https://github.com/dydals3440/korean-account/issues/new/choose). Reports that cite the PDF page and table row get fixed fastest.

## Quick start

### Top candidate only — form auto-select, auto-debit guard

```ts
import { detectBest } from "korean-account";

const top = detectBest("1002-123-456789");
if (top && top.confidence !== "low") {
  console.log(top.institution.nameKo, top.kind);
  // → "우리은행" "new"
}
```

`detectBest` returns `null` when nothing matches.

### Multiple candidates + filtering

```ts
import { detect } from "korean-account";

detect("3333-12-3456789", { categories: ["bank"] });
detect("110-436-387740", { kinds: ["new"] });
detect("110-436-387740", { include: ["shinhan", "kb"] });
detect("110-436-387740", { exclude: ["shinhan"], limit: 3, minScore: 4 });
```

### Only the banks you need — tree-shaking

If your service handles a fixed set of institutions, import the institution constants directly. Only those institutions end up in your bundle.

```ts
import { createDetector, kb, shinhan, toss } from "korean-account";

const detector = createDetector([kb, shinhan, toss]); // ≈ 3.6 KB (min+brotli)
detector.detect("110-436-387740");
// 결과의 institution.id 타입도 "kb" | "shinhan" | "toss" 로 좁혀진다

// 전부 쓰려면
import { createDetector, institutions } from "korean-account";
const all = createDetector(institutions); // ≈ 10 KB
```

`detect` / `detectBest` / `getInstitution` / `searchInstitutions` are convenience functions over the full registry — the moment you import them, all 57 institutions are included in your bundle.

## Scoring and confidence

Every candidate earns a score as a sum of signal weights. With the default weights:

| Signal                  | Score   | Notes                                                     |
| ----------------------- | ------- | --------------------------------------------------------- |
| Exact digit-count match | +3      | ±1 (while typing) is +1                                   |
| Identifier code match   | +4      | +1–3 extra for longer codes; partial input scores half    |
| Subject code match      | +3      | same length-bonus and half-score rules                    |
| Branch rule hit         | +2      | PDF-specified branches — Suhyup 007↔030, Toss 17/19, etc. |
| Additional pattern rule | +1 each | failing any rule eliminates the candidate (gate + bonus)  |

score ≥ 7 → `high`, ≥ 4 → `medium`, otherwise `low`. **Only on ties** does the prior `prevalence` (= estimated retail user base × category coefficient) decide the order — it never overturns evidence signals. See [DOCS A.4](./DOCS.md) for the underlying data and formula.

> Signals that the PDF does not enumerate but that are established in the real world — like KakaoBank's `3333`·`7979` prefixes — are built into the core (`3333-12-3456789` → KakaoBank `high`).

### When the result is not what you expect

```ts
import { createDetector, institutions, getInstitution } from "korean-account";

// 1. 특정 기관만 검사 — 후보 자체를 좁힌다
createDetector([kb, shinhan]).detect(input);
detect(input, { include: ["kb", "shinhan"] });

// 2. 특정 기관 우선 — 동점 시 순서 오버라이드
const boosted = createDetector(institutions).extend({
  institutions: [{ ...getInstitution("busan"), priority: 999 }],
});

// 3. 자체 계좌 체계 추가 — 사내 가상계좌 prefix 등
const extended = createDetector(institutions).extend({
  institutions: [myInstitution], // defineInstitution() 으로 생성
});

// 4. 검증번호 알고리즘 주입 — capabilities.validatedCheckDigit 활성화
createDetector(institutions, { checkDigitVerifiers: { kb: myKbVerifier } });
```

## Supported institutions

> **Source**: every code, digit count, identifier position, and subject below is transcribed verbatim from the table rows of the [KFTC CMS account-number scheme by participating institution (2026.05.08)](https://www.cmsedi.or.kr/cms/board/workdata/cms). When a new PDF is published, the library core is updated; consumer extensions remain compatible.

### Banks (25)

| Code | Korean name      | English name             | Digit lengths                      |
| ---- | ---------------- | ------------------------ | ---------------------------------- |
| 002  | KDB산업은행      | Korea Development Bank   | 11·14                              |
| 003  | IBK기업은행      | Industrial Bank of Korea | 10·11·12·14                        |
| 004  | KB국민은행       | KB Kookmin Bank          | 10·11·12·14                        |
| 005  | 하나은행         | Hana Bank                | 11·12·14                           |
| 007  | 수협은행         | Suhyup Bank              | 11·12·14                           |
| 011  | NH농협은행       | NongHyup Bank            | 11·12·13·14                        |
| 020  | 우리은행         | Woori Bank               | 11·12·13·14                        |
| 023  | SC제일은행       | SC First Bank            | 10·14                              |
| 027  | 한국씨티은행     | Citibank Korea           | 10·11·12·13                        |
| 031  | iM뱅크           | iM Bank                  | 7·8·9·10·11·12·13·14               |
| 032  | 부산은행         | Busan Bank               | 12·13                              |
| 034  | 광주은행         | Gwangju Bank             | 12·13                              |
| 035  | 제주은행         | Jeju Bank                | 10·12                              |
| 037  | 전북은행         | Jeonbuk Bank             | 12·13                              |
| 039  | 경남은행         | Gyeongnam Bank           | 12·13                              |
| 054  | HSBC은행         | HSBC                     | 12 _(not enrolled in the service)_ |
| 055  | 도이치은행       | Deutsche Bank            | 10                                 |
| 057  | JP모간체이스은행 | JPMorgan Chase Bank      | 10                                 |
| 060  | BOA은행          | Bank of America          | 12·14                              |
| 061  | 비엔피파리바은행 | BNP Paribas              | 14 _(not enrolled in the service)_ |
| 081  | 하나증권 CMA     | Hana Securities CMA      | 14                                 |
| 088  | 신한은행         | Shinhan Bank             | 11·12·13·14                        |
| 089  | K뱅크            | K Bank                   | 10·12·13·14                        |
| 090  | 카카오뱅크       | KakaoBank                | 13                                 |
| 092  | 토스뱅크         | Toss Bank                | 12                                 |

### Non-banks (8)

| Code | Korean name      | English name                                             | Digit lengths  |
| ---- | ---------------- | -------------------------------------------------------- | -------------- |
| 012  | 농협중앙회       | NongHyup Central                                         | 13·14          |
| 030  | 수협중앙회       | Suhyup Central                                           | 12             |
| 045  | 새마을금고중앙회 | Korean Federation of Community Credit Cooperatives       | 13             |
| 048  | 신협중앙회       | Credit Union Central                                     | 10·11·12·13·14 |
| 050  | 상호저축은행     | Mutual Savings Bank                                      | 14             |
| 064  | 산림조합중앙회   | Forestry Cooperatives Central                            | 12·13          |
| 071  | 우체국           | Korea Post                                               | 12·13·14       |
| 099  | 금융결제원       | Korea Financial Telecommunications & Clearings Institute | —              |

<details>
<summary><strong>Securities firms (24)</strong> — expand</summary>

| Code | Korean name    | English name                   | Digit lengths      |
| ---- | -------------- | ------------------------------ | ------------------ |
| 209  | 유안타증권     | Yuanta Securities              | 11·12              |
| 218  | KB증권         | KB Securities                  | 9·11               |
| 238  | 미래에셋증권   | Mirae Asset Securities         | 8·9·10·11·12·13·14 |
| 240  | 삼성증권       | Samsung Securities             | 8·10·12·14         |
| 243  | 한국투자증권   | Korea Investment & Securities  | 10·12·14           |
| 247  | NH투자증권     | NH Investment & Securities     | 11                 |
| 261  | 교보증권       | Kyobo Securities               | 11                 |
| 262  | 아이엠증권     | iM Securities                  | 10                 |
| 263  | 현대차증권     | Hyundai Motor Securities       | 8                  |
| 264  | 키움증권       | Kiwoom Securities              | 8·10               |
| 265  | 엘에스투자증권 | LS Securities                  | 9·11               |
| 266  | SK증권         | SK Securities                  | 9·11               |
| 267  | 대신증권       | Daishin Securities             | 9·11               |
| 269  | 한화투자증권   | Hanwha Investment & Securities | 10·11·13·14        |
| 270  | 하나증권       | Hana Securities                | 8·10·11·14         |
| 278  | 신한투자증권   | Shinhan Securities             | 11                 |
| 279  | DB증권         | DB Securities                  | 9·11               |
| 280  | 유진투자증권   | Eugene Investment & Securities | 11                 |
| 287  | 메리츠증권     | Meritz Securities              | 10·11              |
| 288  | 카카오페이증권 | KakaoPay Securities            | 11                 |
| 290  | 부국증권       | Bookook Securities             | 11                 |
| 291  | 신영증권       | Shinyoung Securities           | 9·12               |
| 292  | 케이프투자증권 | Cape Investment & Securities   | 11·14              |
| 294  | 우리투자증권   | Woori Investment & Securities  | 11                 |

</details>

### What about institutions and patterns not in the PDF?

The built-in registry contains only the rows written in the PDF tables above. Cases the PDF does not enumerate — savings-bank virtual-account operating prefixes, in-house settlement accounts, partner-specific prefixes, broad foreign-exchange 14-digit prefixes, and so on — are covered by the extension mechanics in [DOCS.md Appendix D](./DOCS.md).

## Validation adapters (optional)

Form/API-boundary schemas ship per validator, as separate subpaths — swap them like @hookform/resolvers plugins. All five adapters export the same five schemas (`accountSchema` · `institutionIdSchema` · `accountKindSchema` · `subjectCategorySchema` · `detectionSchema`), and a single contract test enforces identical behavior. Every peer is optional — you only need the library whose adapter you import.

| Subpath                          | Peer                                     | When                                                                                      |
| -------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `korean-account/zod`             | zod ^3.23 \|\| ^4 (CI tests both majors) | zod projects                                                                              |
| `korean-account/valibot`         | valibot ^1                               | bundle-size-sensitive frontends                                                           |
| `korean-account/yup`             | yup ^1.4                                 | Formik / legacy RHF codebases                                                             |
| `korean-account/arktype`         | arktype ^2.1                             | arktype projects                                                                          |
| `korean-account/standard-schema` | **none (zero-dependency)**               | any [Standard Schema](https://standardschema.dev) consumer — TanStack Form, tRPC v11, ... |

```ts
import { accountSchema } from "korean-account/zod"; // ← just switch the subpath

accountSchema.parse("110-436-387740"); // digits/hyphens/spaces, 6–20 digits normalized
```

```ts
// react-hook-form — swap the resolver and the adapter together
useForm({ resolver: zodResolver(z.object({ account: accountSchema })) }); // korean-account/zod
useForm({ resolver: valibotResolver(v.object({ account: accountSchema })) }); // korean-account/valibot
useForm({ resolver: yupResolver(yup.object({ account: accountSchema })) }); // korean-account/yup

// TanStack Form — the zero-dependency adapter is a validator as-is
import { accountSchema } from "korean-account/standard-schema";
useForm({ validators: { onChange: accountSchema } });
```

Want an adapter for another validator? See "Adding a validator adapter" in [CONTRIBUTING](./CONTRIBUTING.md) — reuse the shared predicates and pass the contract test.

## API at a glance

| Function                                                                        | Description                                                                           |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `detect(input, opts?)`                                                          | Rank candidates against the full registry                                             |
| `detectBest(input, opts?)`                                                      | Top candidate only; `null` when nothing matches                                       |
| `createDetector(institutions, opts?)`                                           | Detector over just the given institutions (immutable extension via `extend`/`remove`) |
| `getInstitution(idOrCode)`                                                      | Look up by id or CMS code (aliases included) — registered literals narrow to non-null |
| `searchInstitutions(filter?)`                                                   | Filtered search by category, kind, id                                                 |
| `normalizeAccount` / `formatAccount` / `extractIdentifier` / `extractSubject`   | Normalization, grouping, partial extraction                                           |
| `defineInstitution` / `defineSubject` / `defineBranchRule` / `patternTemplate`  | Authoring API for custom institutions                                                 |
| 57 institution constants + `banks` / `nonBanks` / `securities` / `institutions` | Tree-shakable data                                                                    |

Full signatures, types, and the scoring walkthrough: [DOCS.md](./DOCS.md).

## Limitations

- **This is not real-name verification** — it is scheme-based inference. Verify with a real-name inquiry API before finalizing transfers or settlements.
- Schemes without identifier codes (pure serial-number securities firms, etc.) compete on length alone and tie at `low`.
- Check-digit algorithms are unimplemented — the PDF does not publish them. Inject your own via `checkDigitVerifiers`.
- PDF revisions (new institutions, new subject codes) are applied by humans. If you spot a mismatch, please open an issue.

## Contributing

[CONTRIBUTING.md](./CONTRIBUTING.md) has the recipe for adding a new institution. Every README example is executed and verified by [readme-examples.spec.ts](./src/readme-examples.spec.ts) — if the docs lie, CI breaks.

## License

[MIT](./LICENSE)
