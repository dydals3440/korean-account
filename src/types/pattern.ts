import type { ACCOUNT_KINDS, SUBJECT_CATEGORIES } from "../constants";

/** Template token for one digit. Templates use `X` per digit and `-` for grouping. */
export type PatternToken = "X";

/** Validated template string such as `"XXX-XX-XXXXXX"`. Create with `patternTemplate`. */
export type PatternTemplate = string & { readonly __brand: "PatternTemplate" };

/** Zero-based digit range inside a normalized account number. */
export interface DigitSpan {
  readonly start: number;
  /** Number of digits (≥ 1). */
  readonly length: number;
}

/**
 * Account format generation or purpose.
 *
 * - `new` current format · `old` legacy format · `virtual` virtual account
 * - `lifetime` lifetime or phone-number account · `incoming-only` deposit-only product
 * - `merged-legacy` account from a pre-merger bank system
 */
export type AccountKind = (typeof ACCOUNT_KINDS)[number];

/**
 * Ledger subject (계정과목) category: the ten KFTC columns plus
 * `installment`, `trust` and `isa` for deposit-only products.
 */
export type SubjectCategory = (typeof SUBJECT_CATEGORIES)[number];

/** KFTC CMS service availability printed for an account format. */
export interface CmsServices {
  /** The format can be issued as a virtual account (가상계좌 가능여부). */
  readonly virtualAccount: boolean;
  /** CMS direct debit (출금이체). */
  readonly directDebit: boolean;
  /** CMS credit transfer (입금이체). */
  readonly directCredit: boolean;
  /** CMS additional services (부가서비스). */
  readonly additionalServices: boolean;
}

/** Name of one KFTC CMS service column. */
export type CmsService = keyof CmsServices;

/** Ledger subject code of an account pattern. */
export interface Subject {
  /** Zero-padded code matching the subject span width, e.g. `"01"` or `"611"`. */
  readonly code: string;
  readonly category: SubjectCategory;
  /** Display label. Defaults to the category label. */
  readonly label?: string;
  /** Overrides whether direct debit is allowed for this subject. */
  readonly allowsWithdrawal?: boolean;
  /** Per-code exceptions to the pattern's `services`, e.g. "(91,92 불가)". */
  readonly services?: Partial<CmsServices>;
  /** Marks a virtual-account subject. */
  readonly virtual?: boolean;
  /** ISO date the subject took effect. */
  readonly effectiveFrom?: string;
  readonly note?: string;
}

/** Gate-and-score predicate over normalized digits. */
export type AdditionalRule = (digits: string) => boolean;

/** Adjustment produced by a {@link BranchRule}. */
export interface BranchRuleResult {
  /** Reroutes the result to another institution id. */
  readonly institutionId?: string;
  /** Replaces the matched pattern's kind. */
  readonly kindOverride?: AccountKind;
  /** Replaces `capabilities.virtual`. */
  readonly virtualOverride?: boolean;
  /**
   * Marks an "otherwise" branch. Its condition proves nothing, so it neither counts as
   * evidence nor earns the branch bonus.
   */
  readonly isFallback?: boolean;
}

/** Digit-based rule that reroutes or reclassifies a match, e.g. the Suhyup bank/coop split. */
export interface BranchRule {
  /** Human-readable summary used in docs and debugging. */
  readonly describe: string;
  /** Returns an adjustment, or `null` to leave the match unchanged. */
  readonly evaluate: (digits: string) => BranchRuleResult | null;
}

/** One account-number format of an institution. */
export interface AccountPattern {
  readonly template: PatternTemplate;
  readonly kind: AccountKind;
  readonly identifierPosition?: DigitSpan;
  readonly identifiers?: readonly string[];
  readonly identifierRange?: { readonly from: number; readonly to: number };
  readonly subjectPosition?: DigitSpan;
  readonly subjects?: readonly Subject[];
  /** @deprecated Unused. A registered `CheckDigitVerifier` knows its own digit positions. */
  readonly checkDigitPosition?: DigitSpan;
  /** Service availability printed for this format; drives `capabilities.allowsWithdrawal`. */
  readonly services?: CmsServices;
  /** `false` skips any registered check-digit verifier for this pattern. */
  readonly validatesCheckDigit?: boolean;
  readonly branchRule?: BranchRule;
  /**
   * Rules that must all pass for exact or ±1-length input; each adds the rule bonus.
   * Shorter partial input skips them.
   */
  readonly additionalRules?: readonly AdditionalRule[];
  /** ISO date the format took effect. */
  readonly effectiveFrom?: string;
  readonly note?: string;
}
