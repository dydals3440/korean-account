import { boolean, number, object, type Schema, string } from "yup";
import { ACCOUNT_KINDS, CONFIDENCE_LEVELS, SUBJECT_CATEGORIES } from "../../shared/constants";
import type { InstitutionId } from "../../registry";
import { INSTITUTION_IDS } from "../../registry/institution-ids";
import type { AccountKind, Confidence, SubjectCategory } from "../../types";
import {
  ACCOUNT_INPUT_REGEX,
  ACCOUNT_MAX_DIGITS,
  ACCOUNT_MAX_INPUT_LENGTH,
  ACCOUNT_MIN_DIGITS,
  type DetectionPayload,
  digitCount,
  MESSAGES,
} from "../shared";

export type { DetectionPayload } from "../shared";

// Exports are annotated with yup's stable `Schema<T>` base — `ObjectSchema`'s
// extra TContext/TDefault/TFlags generics are exactly the churny surface the
// d.ts must not print. The adapter-compat CI greps dist/yup.d.ts for leaks.
//
// yup traps this file must not regress on (each has a contract-test case):
// 1. yup CASTS by default — string().validateSync(123) returns "123". Every
//    leaf bakes .strict(true) so consumers get contract behavior by default.
// 2. yup is "optional unless required": oneOf() passes `undefined`. Every
//    non-optional field carries .defined() (NOT .required() — that also
//    rejects "" for strings, which only accountSchema wants).
// 3. A nested object schema defaults to {} — a missing `subject` would be
//    cast to {} and then fail on `code`. `.default(undefined)` restores
//    "absent means absent" even in non-strict use.

/**
 * Schema for a raw Korean account-number string.
 *
 * - digits, hyphens, and spaces only
 * - 6–20 digits after normalization
 */
export const accountSchema: Schema<string> = string()
  .strict(true)
  .required(MESSAGES.required)
  .max(ACCOUNT_MAX_INPUT_LENGTH, MESSAGES.tooLong)
  .matches(ACCOUNT_INPUT_REGEX, MESSAGES.charset)
  .test(
    "min-digits",
    MESSAGES.minDigits,
    (value) => value === undefined || digitCount(value) >= ACCOUNT_MIN_DIGITS,
  )
  .test(
    "max-digits",
    MESSAGES.maxDigits,
    (value) => value === undefined || digitCount(value) <= ACCOUNT_MAX_DIGITS,
  );

/** Schema accepting only registered institution ids. */
export const institutionIdSchema: Schema<InstitutionId> = string<InstitutionId>()
  .strict(true)
  .defined(MESSAGES.institution)
  .oneOf(INSTITUTION_IDS, MESSAGES.institution);

/** Account kind schema. */
export const accountKindSchema: Schema<AccountKind> = string<AccountKind>()
  .strict(true)
  .defined(MESSAGES.accountKind)
  .oneOf(ACCOUNT_KINDS, MESSAGES.accountKind);

/** Subject category schema. */
export const subjectCategorySchema: Schema<SubjectCategory> = string<SubjectCategory>()
  .strict(true)
  .defined(MESSAGES.subjectCategory)
  .oneOf(SUBJECT_CATEGORIES, MESSAGES.subjectCategory);

/** Serialized detection result schema. */
export const detectionSchema: Schema<DetectionPayload> = object({
  institutionId: institutionIdSchema,
  kind: accountKindSchema,
  subject: object({
    code: string().strict(true).defined(),
    category: subjectCategorySchema,
    label: string().strict(true).optional(),
  })
    .optional()
    .default(undefined),
  score: number().strict(true).defined().min(0),
  confidence: string<Confidence>().strict(true).defined().oneOf(CONFIDENCE_LEVELS),
  formatted: string().strict(true).defined(),
  capabilities: object({
    allowsWithdrawal: boolean().strict(true).defined(),
    virtual: boolean().strict(true).defined(),
    // `.defined().nullable()` in this order: boolean | null with undefined rejected.
    validatedCheckDigit: boolean().strict(true).defined().nullable(),
  }).defined(),
}).defined() as Schema<DetectionPayload>;
