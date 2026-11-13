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

/** Ledger subject code of an account pattern. */
export interface Subject {
  /** Zero-padded code matching the subject span width, e.g. `"01"` or `"611"`. */
  readonly code: string;
  readonly category: SubjectCategory;
  /** Display label. Defaults to the category label. */
  readonly label?: string;
  /** Overrides whether direct debit is allowed for this subject. */
  readonly allowsWithdrawal?: boolean;
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
