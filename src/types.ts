/**
 * Pattern template token. Digit slots use `X`; visual grouping uses `-`.
 *
 * @example
 * "XXX-XX-XXXXXX" // 11 digits, 3-2-6 grouping
 */
export type PatternToken = "X";

/** Branded template string. Always construct via `patternTemplate`. */
export type PatternTemplate = string & { readonly __brand: "PatternTemplate" };

/** A 0-indexed span of digits inside a normalized account number. */
export interface DigitSpan {
  readonly start: number;
  /** Number of digits (≥ 1). */
  readonly length: number;
}

/** Financial institution category. */
export type InstitutionCategory = "bank" | "non-bank" | "securities" | "clearing";

/** Confidence band derived from the raw score. */
export type Confidence = "high" | "medium" | "low";

/**
 * Account number generation / purpose.
 *
 * - `new` — current (next-generation) format
 * - `old` — legacy format
 * - `virtual` — virtual account (usually deposit-only)
 * - `lifetime` — lifetime / customer-chosen / phone-number-linked account
 * - `incoming-only` — deposit-only (installment savings, trusts, linked
 *   products; direct-debit withdrawal unavailable)
 * - `merged-legacy` — pre-merger legacy system account (KEB, Chohung, Hanil,
 *   Peace Bank, ...)
 */
export type AccountKind =
  | "new"
  | "old"
  | "virtual"
  | "lifetime"
  | "incoming-only"
  | "merged-legacy";

/**
 * Ledger subject (계정과목) category.
 *
 * The ten standard categories from the KFTC CMS PDF (ordinary / treasury /
 * savings / free-savings / household-current / current / corporate-free /
 * YES / linked / other) plus extensions for deposit-only products
 * (`installment` / `trust` / `isa`).
 */
export type SubjectCategory =
  | "ordinary"
  | "treasury"
  | "savings"
  | "free-savings"
  | "household-current"
  | "current"
  | "corporate-free"
  | "yes"
  | "linked"
  | "installment"
  | "trust"
  | "isa"
  | "other";

/** A ledger subject code declaration. */
export interface Subject {
  /** Zero-padded code matching the subject span width ("01", "611", "301", ...). */
  readonly code: string;
  readonly category: SubjectCategory;
  /** Display label ("정기적금" etc.). Falls back to the category label. */
  readonly label?: string;
  /**
   * Whether direct-debit withdrawal is possible. When unspecified it is
   * derived from the kind — false for `virtual: true` subjects and for
   * `virtual` / `incoming-only` / `lifetime` kinds, true otherwise.
   */
  readonly allowsWithdrawal?: boolean;
  /** Virtual account (behaves deposit-only). */
  readonly virtual?: boolean;
  readonly effectiveFrom?: string;
  readonly note?: string;
}

export type AdditionalRule = (digits: string) => boolean;

/** Detector-level global rule, evaluated only for institutions whose pattern matched. */
export type GlobalRule = (digits: string, institution: Institution) => boolean;

/**
 * Check-digit verifier: receives normalized digits, returns pass/fail.
 *
 * The KFTC PDF does not publish the algorithms, so the library implements
 * none. Consumers who obtain an algorithm can register it per institution id
 * via `createDetector`'s `checkDigitVerifiers` option.
 *
 * The resulting `capabilities.validatedCheckDigit` is:
 * - verifier registered and passed → `true`
 * - verifier registered and failed → `false`
 * - no verifier, or the pattern sets `validatesCheckDigit: false` → `null`
 */
export type CheckDigitVerifier = (digits: string) => boolean;

/**
 * Branch rule — inspects digits and adjusts the result.
 *
 * - Returning `institutionId` reroutes the result to that institution
 *   (e.g. the Suhyup bank/coop split).
 * - Returning `kindOverride` replaces the kind (e.g. K bank / Toss prefixes).
 * - Returning `virtualOverride` replaces `capabilities.virtual`.
 * - Returning `null` leaves the result unchanged.
 */
export interface BranchRule {
  readonly describe: string;
  readonly evaluate: (digits: string) => BranchRuleResult | null;
}
export interface BranchRuleResult {
  readonly institutionId?: string;
  readonly kindOverride?: AccountKind;
  readonly virtualOverride?: boolean;
}

/** One account-number format variant of an institution. */
export interface AccountPattern {
  readonly template: PatternTemplate;
  readonly kind: AccountKind;
  readonly identifierPosition?: DigitSpan;
  readonly identifiers?: readonly string[];
  readonly identifierRange?: { readonly from: number; readonly to: number };
  readonly subjectPosition?: DigitSpan;
  readonly subjects?: readonly Subject[];
  /**
   * @deprecated No code path reads this field and none of the 152 built-in
   * patterns set it. A check-digit verifier registered via
   * `checkDigitVerifiers` knows its own digit positions. Removed in the next
   * major.
   */
  readonly checkDigitPosition?: DigitSpan;
  /** `false` opts out explicitly. Default `undefined` = no algorithm available. */
  readonly validatesCheckDigit?: boolean;
  readonly branchRule?: BranchRule;
  /**
   * Gate-and-score rules for the pattern. On a length-matching input, all
   * rules must pass or the pattern is rejected; when all pass, each rule adds
   * to the score. Use for domain constraints the template cannot express
   * (e.g. `d[3] === "9"` as the KEB 14-digit signal, or prefix-collision
   * avoidance).
   */
  readonly additionalRules?: readonly AdditionalRule[];
  readonly effectiveFrom?: string;
  readonly note?: string;
}

/**
 * A financial institution.
 *
 * The generic parameters preserve literals for narrowing:
 * - `Id` — institution id literal such as `"kdb"`
 * - `Code` — CMS representative code literal such as `"002"`
 * - `Category` — category literal such as `"bank"`
 *
 * The `defineInstitution` helper infers all three automatically.
 */
export interface Institution<
  Id extends string = string,
  Code extends string = string,
  Category extends InstitutionCategory = InstitutionCategory,
> {
  readonly id: Id;
  readonly code: Code;
  /**
   * KFTC interbank standard bank code, set only when it differs from the CMS
   * namespace `code`. Both namespaces are operated by KFTC but diverge for
   * institutions with merger/split history.
   *
   * Example: `hana` has `code: "005"` (CMS — inherited the KEB representative
   * code after the merger) and `commonCode: "081"` (standard — kept the Hana
   * representative code). If your backend speaks standard bank codes, read
   * `institution.commonCode ?? institution.code`.
   *
   * When unset, assume it equals `code`.
   */
  readonly commonCode?: string;
  readonly aliasCodes?: readonly string[];
  readonly nameKo: string;
  readonly nameEn?: string;
  readonly category: Category;
  readonly aliases: readonly string[];
  /**
   * Estimated retail customer base in millions. Feeds the tie-break prior
   * (`prevalence = userBaseMillions × category likelihood`); it never adds to
   * the evidence score. Sourced figures and estimates are tabulated in the
   * DOCS scoring appendix.
   */
  readonly userBaseMillions?: number;
  /**
   * Manual tie-break override. When set, it replaces the computed prevalence
   * entirely. Prefer `userBaseMillions`; use this only when the computed
   * ordering is demonstrably wrong for your use case.
   */
  readonly priority?: number;
  readonly patterns: readonly AccountPattern[];
  readonly successorOf?: readonly string[];
  readonly notes?: string;
}

/** Capability metadata attached to each detection result. */
export interface DetectionCapabilities {
  /** Whether direct-debit withdrawal is possible (false for deposit-only / lifetime / virtual). */
  readonly allowsWithdrawal: boolean;
  /** Whether the account is a virtual account. */
  readonly virtual: boolean;
  /**
   * Check-digit verification outcome.
   * - `true` — verified and passed
   * - `false` — verified and failed
   * - `null` — not verified (no algorithm, or `validatesCheckDigit: false`)
   */
  readonly validatedCheckDigit: boolean | null;
}

/** A single detection candidate. */
export interface DetectionResult<I extends Institution = Institution> {
  readonly institution: I;
  readonly matchedPattern: AccountPattern;
  readonly kind: AccountKind;
  readonly subject?: Subject;
  readonly formatted: string;
  readonly score: number;
  readonly confidence: Confidence;
  readonly capabilities: DetectionCapabilities;
}

/**
 * Autocomplete-with-widening: registered `Id` literals surface in the IDE
 * while arbitrary strings stay accepted (for user-extended registries).
 */
export type InstitutionIdInput<Id extends string = string> = Id | (string & Record<never, never>);

export interface DetectOptions<Id extends string = string> {
  readonly categories?: readonly InstitutionCategory[];
  readonly kinds?: readonly AccountKind[];
  readonly include?: readonly InstitutionIdInput<Id>[];
  readonly exclude?: readonly InstitutionIdInput<Id>[];
  readonly limit?: number;
  readonly minScore?: number;
}

/**
 * Scoring weights applied when a pattern matches. Missing keys use
 * `DEFAULT_WEIGHTS` (lengthExact:3 / lengthNear:1 / identifierMatch:4 /
 * subjectMatch:3 / additionalRule:1 / globalRule:1 / branchRuleMatch:2 /
 * kindNewBonus:0).
 *
 * The defaults read intuitively: right length (+3), matching prefix (+4),
 * matching subject (+3) → score 10 → high confidence.
 */
export interface ScoringWeights {
  /** Bonus when the digit count matches the template exactly (default +3). */
  readonly lengthExact?: number;
  /** Bonus when the digit count is within ±1 — user still typing (default +1). */
  readonly lengthNear?: number;
  /** Bonus for an exact identifier match (default +4). Partial input scores half. */
  readonly identifierMatch?: number;
  /** Bonus for a subject (ledger code) match (default +3). Partial input scores half. */
  readonly subjectMatch?: number;
  /**
   * Bonus per passing `additionalRules` entry (default +1).
   *
   * `additionalRules` both gate and score: on a length-matching input, one
   * failing rule rejects the pattern; when all pass, each adds this bonus.
   */
  readonly additionalRule?: number;
  /** Bonus per passing detector-level `globalRules` entry (default +1). */
  readonly globalRule?: number;
  /**
   * Bonus when the pattern's `branchRule` produced a result — a kind /
   * institution / virtual override (default +2). Branch rules are the PDF's
   * strong disambiguation signals: when the same prefix is enumerated by
   * multiple institutions (e.g. Toss 12-digit virtual 17/19 vs Shinhyup
   * 12-digit installment 170–178), the institution whose branch rule fires
   * wins.
   */
  readonly branchRuleMatch?: number;
  /** Bonus when the matched pattern's kind is `"new"` (default 0, opt-in). */
  readonly kindNewBonus?: number;
}

/**
 * A detector instance — immutable; `.extend` / `.remove` return new
 * instances.
 *
 * The generic `I` is the union of registered institutions, so `detect()`
 * results narrow `institution.id` to the ids the detector was built with.
 */
export interface Detector<I extends Institution = Institution> {
  readonly institutions: readonly I[];
  detect(input: string, options?: DetectOptions<I["id"]>): readonly DetectionResult<I>[];
  /**
   * Returns a new detector with added institutions / rules / weights /
   * check-digit verifiers.
   *
   * `scoring` merges shallowly over the current weights;
   * `checkDigitVerifiers` merges over the current map (same id → replaced).
   * An incoming institution id replaces the existing institution.
   */
  extend<E extends Institution>(extra: {
    readonly institutions?: readonly E[];
    readonly globalRules?: readonly GlobalRule[];
    readonly scoring?: ScoringWeights;
    readonly checkDigitVerifiers?: Readonly<Partial<Record<(I | E)["id"], CheckDigitVerifier>>>;
  }): Detector<I | E>;
  /** Returns a new detector with institutions removed by id or predicate. */
  remove(target: string | ((i: Institution) => boolean)): Detector<I>;
}
