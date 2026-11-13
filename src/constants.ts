/**
 * Every account kind, for runtime checks and iteration; `AccountKind` is derived from it.
 * When score and `prevalence` tie, `detect` ranks kinds in this order.
 */
export const ACCOUNT_KINDS = [
  "new",
  "old",
  "virtual",
  "lifetime",
  "incoming-only",
  "merged-legacy",
] as const;

/**
 * Every ledger subject (계정과목) category, for runtime checks and iteration; `SubjectCategory`
 * is derived from it. The KFTC table columns come in their printed order, with the deposit-only
 * `installment`, `trust` and `isa` placed before `other`.
 */
export const SUBJECT_CATEGORIES = [
  "ordinary",
  "treasury",
  "savings",
  "free-savings",
  "household-current",
  "current",
  "corporate-free",
  "yes",
  "linked",
  "installment",
  "trust",
  "isa",
  "other",
] as const;

/**
 * Every institution category, for runtime checks and iteration; `InstitutionCategory` is
 * derived from it.
 */
export const INSTITUTION_CATEGORIES = ["bank", "non-bank", "securities", "clearing"] as const;

/** Every confidence band, highest first; `Confidence` is derived from it. */
export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;
