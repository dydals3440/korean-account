import type { ACCOUNT_KINDS, SUBJECT_CATEGORIES } from "../constants";

/** Template character that stands for one digit; `PatternTemplate` separates groups with `-`. */
export type PatternToken = "X";

/**
 * Account-number template such as `"XXX-XX-XXXXXX"`: `X` per digit and `-` between groups.
 *
 * The number of `X`s is the format's digit count; the hyphens only shape
 * `DetectionResult.formatted`. Create one with `patternTemplate`, which validates the syntax.
 *
 * @example
 * const template = patternTemplate("XXX-XXX-XXXXXX"); // 12 digits, grouped 3-3-6
 */
export type PatternTemplate = string & { readonly __brand: "PatternTemplate" };

/**
 * Contiguous run of digits inside a normalized account number (separators removed).
 *
 * @example
 * const span: DigitSpan = { start: 0, length: 3 }; // "110" in "110436387740"
 */
export interface DigitSpan {
  /** Zero-based index of the first digit. */
  readonly start: number;
  /** Number of digits (≥ 1). */
  readonly length: number;
}

/**
 * Generation or purpose of an account format; Korean labels are in `accountKindLabels`.
 *
 * - `new`: current format · `old`: legacy format · `virtual`: virtual account (가상계좌)
 * - `lifetime`: lifetime or phone-number account (평생계좌)
 * - `incoming-only`: deposit-only product (입금전용)
 * - `merged-legacy`: format from a bank's system before a merger
 */
export type AccountKind = (typeof ACCOUNT_KINDS)[number];

/**
 * Ledger subject (계정과목) category: the ten KFTC table columns plus `installment`, `trust` and
 * `isa` for deposit-only products. Korean labels are in `subjectCategoryLabels`.
 */
export type SubjectCategory = (typeof SUBJECT_CATEGORIES)[number];

/**
 * The four KFTC CMS service columns printed for an account format: `true` for ○ (available),
 * `false` for × (not available). Build one with `cmsServices`.
 *
 * @example
 * cmsServices("directDebit", "directCredit", "additionalServices");
 * // { virtualAccount: false, directDebit: true, directCredit: true, additionalServices: true }
 */
export interface CmsServices {
  /**
   * The format can be issued as a virtual account (가상계좌 가능여부). Unlike
   * `DetectionCapabilities.virtual`, it does not mean the account is one.
   */
  readonly virtualAccount: boolean;
  /** CMS direct debit (출금이체): automatic withdrawals from the account. */
  readonly directDebit: boolean;
  /** CMS credit transfer (입금이체): automatic deposits into the account. */
  readonly directCredit: boolean;
  /** CMS additional services (부가서비스). */
  readonly additionalServices: boolean;
}

/** Name of one KFTC CMS service column, as passed to `cmsServices`. */
export type CmsService = keyof CmsServices;

/**
 * Ledger subject (계정과목) code that an account pattern recognizes at its `subjectPosition`.
 *
 * A matching code counts as evidence, adds `ScoringWeights.subjectMatch` and becomes
 * `DetectionResult.subject`. Declare one with `defineSubject`.
 *
 * @example Virtual-account code that blocks direct debit
 * defineSubject({ code: "92", category: "ordinary", virtual: true, allowsWithdrawal: false });
 */
export interface Subject {
  /** Code digits, exactly `subjectPosition.length` long and zero-padded, e.g. `"01"`, `"611"`. */
  readonly code: string;
  /** Subject category. */
  readonly category: SubjectCategory;
  /** Display label; `undefined` uses `subjectCategoryLabels[category]`. */
  readonly label?: string | undefined;
  /**
   * Whether direct debit is allowed, taking precedence over `services.directDebit`;
   * `undefined` derives it as described in `DetectionCapabilities.allowsWithdrawal`.
   */
  readonly allowsWithdrawal?: boolean | undefined;
  /**
   * Per-code exceptions to the pattern's `services`, e.g. for a PDF remark "(91,92 불가)".
   * Applied key by key; an omitted or `undefined` key keeps the pattern's value.
   */
  readonly services?: { readonly [TService in CmsService]?: boolean | undefined } | undefined;
  /**
   * The code identifies a virtual account, so `capabilities.virtual` is `true` unless a branch
   * rule overrides it. `undefined` means `false`.
   */
  readonly virtual?: boolean | undefined;
  /** ISO date (`YYYY-MM-DD`) the code took effect. Informational. */
  readonly effectiveFrom?: string | undefined;
  /** Free-form note, usually the PDF remark. Informational. */
  readonly note?: string | undefined;
}

/**
 * A {@link Subject} as it appears in `DetectionResult.subject`, with every default filled in.
 *
 * @example
 * detectBest("110-436-387740")?.subject;
 * // => { code: "110", category: "savings", label: "저축예금", allowsWithdrawal: true, virtual: false }
 */
export interface ResolvedSubject extends Subject {
  /** The registry label, or the category label from `subjectCategoryLabels` when none is set. */
  readonly label: string;
  /**
   * Whether direct debit (출금이체) is allowed: the subject's own value, then its `services`
   * exception, then the pattern's `services.directDebit`, then the account-kind default.
   */
  readonly allowsWithdrawal: boolean;
  /** Whether this subject marks the account itself as a virtual account. @default false */
  readonly virtual: boolean;
}

/**
 * Pattern-level predicate over the normalized digits that both gates and scores the pattern.
 *
 * For input within one digit of the template length, every rule must return `true` or the
 * pattern does not match, and each rule adds `ScoringWeights.additionalRule`. Input two or more
 * digits shorter skips the rules, since an unfinished number cannot be judged yet.
 *
 * @example Reject numbers whose fourth digit is 9
 * const fourthDigitIsNot9: AdditionalRule = (digits) => digits[3] !== "9";
 */
export type AdditionalRule = (digits: string) => boolean;

/**
 * Adjustment returned by {@link BranchRule.evaluate}. Omitted or `undefined` fields leave that
 * part of the match unchanged.
 */
export interface BranchRuleResult {
  /**
   * Id of the institution to attribute the account to instead. Ignored when the detector has
   * no institution with this id.
   */
  readonly institutionId?: string | undefined;
  /** Replaces `matchedPattern.kind` as `DetectionResult.kind`. */
  readonly kindOverride?: AccountKind | undefined;
  /** Replaces the derived `capabilities.virtual`. */
  readonly virtualOverride?: boolean | undefined;
  /**
   * Marks an "otherwise" branch whose condition proves nothing: its adjustments still apply,
   * but it neither counts as evidence nor earns `ScoringWeights.branchRuleMatch`.
   */
  readonly isFallback?: boolean | undefined;
}

/**
 * Digit-based rule that reroutes or reclassifies a match after its pattern is chosen, e.g. the
 * split between Suhyup Bank and Suhyup Central. Declare one with `defineBranchRule`.
 *
 * Runs only on the institution's best pattern. An adjustment adds
 * `ScoringWeights.branchRuleMatch` when the match has evidence, and an adjustment that is not
 * a fallback counts as evidence on its own.
 *
 * @example
 * const routeToCoop = defineBranchRule({
 *   describe: "12 digits starting with 2 belong to the coop",
 *   evaluate: (digits) =>
 *     digits.length === 12 && digits[0] === "2" ? { institutionId: "my-coop" } : null,
 * });
 */
export interface BranchRule {
  /** Human-readable summary of the condition, for docs and debugging. */
  readonly describe: string;
  /**
   * Inspects the normalized digits of the whole input, at any length, and returns an
   * adjustment, or `null` to leave the match unchanged.
   */
  readonly evaluate: (digits: string) => BranchRuleResult | null;
}

/**
 * One account-number format of an institution.
 *
 * `detect` scores a pattern on its digit count, the identifier and subject codes at fixed
 * positions, and its rules; the institution's best-scoring pattern becomes
 * `DetectionResult.matchedPattern`. Optional fields left `undefined` are not declared and add
 * nothing to the score.
 *
 * @example 12-digit format whose first three digits are both identifier and subject code
 * const pattern: AccountPattern = {
 *   template: patternTemplate("XXX-XXX-XXXXXX"),
 *   kind: "new",
 *   services: cmsServices("directDebit", "directCredit", "additionalServices"),
 *   identifierPosition: { start: 0, length: 3 },
 *   identifiers: ["100", "110"],
 *   subjectPosition: { start: 0, length: 3 },
 *   subjects: [
 *     defineSubject({ code: "100", category: "ordinary" }),
 *     defineSubject({ code: "110", category: "savings" }),
 *   ],
 * };
 */
export interface AccountPattern {
  /** Digit layout; its number of `X`s is the expected digit count. */
  readonly template: PatternTemplate;
  /** Kind assigned to matches unless `branchRule` overrides it. */
  readonly kind: AccountKind;
  /**
   * Where the institution identifier sits. Scores only together with `identifiers` or
   * `identifierRange`; on its own it only feeds `extractIdentifier`.
   */
  readonly identifierPosition?: DigitSpan | undefined;
  /** Accepted identifiers, each exactly `identifierPosition.length` digits. */
  readonly identifiers?: readonly string[] | undefined;
  /**
   * Inclusive numeric range accepted at `identifierPosition`, e.g. `{ from: 500, to: 599 }`.
   * A match against either this or `identifiers` counts.
   */
  readonly identifierRange?: { readonly from: number; readonly to: number } | undefined;
  /**
   * Where the ledger subject code sits. It may overlap `identifierPosition`; the shared digits
   * then score once.
   */
  readonly subjectPosition?: DigitSpan | undefined;
  /** Subject codes recognized at `subjectPosition`; the first declaration of a code wins. */
  readonly subjects?: readonly Subject[] | undefined;
  /** @deprecated Unused. A registered `CheckDigitVerifier` knows its own digit positions. */
  readonly checkDigitPosition?: DigitSpan | undefined;
  /**
   * PDF service columns for this format, the basis of `capabilities.services` and
   * `capabilities.allowsWithdrawal`. `undefined` makes `capabilities.services` `null` and
   * derives withdrawal from the kind.
   */
  readonly services?: CmsServices | undefined;
  /**
   * `false` skips any registered `CheckDigitVerifier`, leaving
   * `capabilities.validatedCheckDigit` `null`; `undefined` or `true` runs it.
   */
  readonly validatesCheckDigit?: boolean | undefined;
  /** Rule that reroutes or reclassifies matches of this pattern. */
  readonly branchRule?: BranchRule | undefined;
  /** Predicates that gate and score this pattern; see {@link AdditionalRule}. */
  readonly additionalRules?: readonly AdditionalRule[] | undefined;
  /** ISO date (`YYYY-MM-DD`) the format took effect. Informational. */
  readonly effectiveFrom?: string | undefined;
  /** Free-form note, usually the PDF remark. Informational. */
  readonly note?: string | undefined;
}
