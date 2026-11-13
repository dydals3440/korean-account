import { boolean, number, object, type Schema, string } from "yup";

import { ACCOUNT_KINDS, CONFIDENCE_LEVELS, SUBJECT_CATEGORIES } from "../../constants";
import { INSTITUTION_IDS, type InstitutionId } from "../../registry/institution-ids";
import type { AccountKind, Confidence, SubjectCategory } from "../../types";
import {
  ACCOUNT_INPUT_REGEX,
  ACCOUNT_MAX_DIGITS,
  ACCOUNT_MAX_INPUT_LENGTH,
  ACCOUNT_MIN_DIGITS,
  type DetectionPayload,
  digitCount,
  isFiniteNumber,
  MESSAGES,
} from "../contract";

export type { DetectionPayload } from "../contract";

// `Schema<T>` annotations keep yup's churny generics out of the d.ts. Guarded yup traps:
// casting (`.strict(true)`), oneOf accepting `undefined` (`.defined()`, not `.required()`),
// and nested objects defaulting to `{}` (`.default(undefined)`).

/** Account number input: digits, spaces and hyphens holding 6–20 digits. Outputs the input unchanged. */
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

/** Built-in institution id. */
export const institutionIdSchema: Schema<InstitutionId> = string<InstitutionId>()
  .strict(true)
  .defined(MESSAGES.institution)
  .oneOf(INSTITUTION_IDS, MESSAGES.institution);

/** `AccountKind` literal. */
export const accountKindSchema: Schema<AccountKind> = string<AccountKind>()
  .strict(true)
  .defined(MESSAGES.accountKind)
  .oneOf(ACCOUNT_KINDS, MESSAGES.accountKind);

/** `SubjectCategory` literal. */
export const subjectCategorySchema: Schema<SubjectCategory> = string<SubjectCategory>()
  .strict(true)
  .defined(MESSAGES.subjectCategory)
  .oneOf(SUBJECT_CATEGORIES, MESSAGES.subjectCategory);

/** Serialized detection result (`DetectionPayload`). */
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
  score: number()
    .strict(true)
    .defined()
    .min(0)
    .test("finite", MESSAGES.finiteScore, isFiniteNumber),
  confidence: string<Confidence>().strict(true).defined().oneOf(CONFIDENCE_LEVELS),
  formatted: string().strict(true).defined(),
  capabilities: object({
    allowsWithdrawal: boolean().strict(true).defined(),
    virtual: boolean().strict(true).defined(),
    // `.defined().nullable()` in this order: boolean | null with undefined rejected.
    validatedCheckDigit: boolean().strict(true).defined().nullable(),
  }).defined(),
}).defined() as Schema<DetectionPayload>;
