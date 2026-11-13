/** Account kinds, newest format first. Source of truth for `AccountKind`. */
export const ACCOUNT_KINDS = [
  "new",
  "old",
  "virtual",
  "lifetime",
  "incoming-only",
  "merged-legacy",
] as const;

/** Ledger subject (계정과목) categories. Source of truth for `SubjectCategory`. */
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

/** Institution categories. Source of truth for `InstitutionCategory`. */
export const INSTITUTION_CATEGORIES = ["bank", "non-bank", "securities", "clearing"] as const;

/** Confidence bands, highest first. Source of truth for `Confidence`. */
export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;
