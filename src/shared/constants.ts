import type { AccountKind, Confidence, InstitutionCategory, SubjectCategory } from "../types";

/**
 * `AccountKind` literals as a runtime array.
 *
 * The union in `types.ts` is the single source of truth. Editing only one
 * side is caught both ways: `satisfies` checks array → union, and
 * `toEqualTypeOf` in `constants.types.spec.ts` checks union → array.
 *
 * The zod schema reads this instead of the `.options` accessor — the schema
 * is narrowed to `ZodType<T>` so it works on both zod v3 and v4.
 */
export const ACCOUNT_KINDS = [
  "new",
  "old",
  "virtual",
  "lifetime",
  "incoming-only",
  "merged-legacy",
] as const satisfies readonly AccountKind[];

/** `SubjectCategory` literals as a runtime array. Same contract as [[ACCOUNT_KINDS]]. */
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
] as const satisfies readonly SubjectCategory[];

/** `InstitutionCategory` literals as a runtime array. */
export const INSTITUTION_CATEGORIES = [
  "bank",
  "non-bank",
  "securities",
  "clearing",
] as const satisfies readonly InstitutionCategory[];

/** `Confidence` literals as a runtime array, highest confidence first. */
export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const satisfies readonly Confidence[];
