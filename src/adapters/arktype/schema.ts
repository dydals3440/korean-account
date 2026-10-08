import { type } from "arktype";
import { ACCOUNT_KINDS, SUBJECT_CATEGORIES } from "../../shared/constants";
import type { InstitutionId } from "../../registry";
import { INSTITUTION_IDS } from "../../registry/institution-ids";
import type { AccountKind, SubjectCategory } from "../../types";
import {
  ACCOUNT_INPUT_REGEX,
  ACCOUNT_MAX_DIGITS,
  ACCOUNT_MAX_INPUT_LENGTH,
  ACCOUNT_MIN_DIGITS,
  type DetectionPayload,
  digitCount,
  isFiniteNumber,
  MESSAGES,
} from "../shared";

// ArkType is ESM-only. CJS declarations must resolve its types as imports,
// including consumers using TypeScript's frozen Node16 module model.
// The inline query preserves resolution-mode in tsdown's TS7 declarations.
type Type<T> = import("arktype", { with: { "resolution-mode": "import" } }).Type<T>;

export type { DetectionPayload } from "../shared";

// Exports are annotated `Type<T>` (stable across arktype 2.x; its `out t`
// variance makes narrowed results assignable). All account rules live in one
// `.narrow` instead of native length/regex constraints: `ctx.reject({ problem })`
// is arktype's only mechanism that replaces the composed English
// "must be … (was …)" sentence with our exact Korean messages.
// Known deviation (documented): nested `detectionSchema` field errors keep
// arktype's default English composition — the contract tests assert
// accept/reject behavior only.

/**
 * Schema for a raw Korean account-number string.
 *
 * - digits, hyphens, and spaces only
 * - 6–20 digits after normalization
 */
export const accountSchema: Type<string> = type("string").narrow((value, ctx) => {
  if (value.length === 0) return ctx.reject({ problem: MESSAGES.required });
  if (value.length > ACCOUNT_MAX_INPUT_LENGTH) return ctx.reject({ problem: MESSAGES.tooLong });
  if (!ACCOUNT_INPUT_REGEX.test(value)) return ctx.reject({ problem: MESSAGES.charset });
  const digits = digitCount(value);
  if (digits < ACCOUNT_MIN_DIGITS) return ctx.reject({ problem: MESSAGES.minDigits });
  if (digits > ACCOUNT_MAX_DIGITS) return ctx.reject({ problem: MESSAGES.maxDigits });
  return true;
});

/** Schema accepting only registered institution ids. */
export const institutionIdSchema: Type<InstitutionId> = type
  .enumerated(...INSTITUTION_IDS)
  .configure({ message: () => MESSAGES.institution });

/** Account kind schema. */
export const accountKindSchema: Type<AccountKind> = type.enumerated(...ACCOUNT_KINDS);

/** Subject category schema. */
export const subjectCategorySchema: Type<SubjectCategory> = type.enumerated(...SUBJECT_CATEGORIES);

/** Serialized detection result schema. */
export const detectionSchema: Type<DetectionPayload> = type({
  institutionId: institutionIdSchema,
  kind: accountKindSchema,
  "subject?": {
    code: "string",
    category: subjectCategorySchema,
    "label?": "string",
  },
  score: type("number >= 0").narrow(isFiniteNumber),
  confidence: "'high' | 'medium' | 'low'",
  formatted: "string",
  capabilities: {
    allowsWithdrawal: "boolean",
    virtual: "boolean",
    validatedCheckDigit: "boolean | null",
  },
}) as Type<DetectionPayload>;
