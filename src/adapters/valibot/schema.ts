import * as v from "valibot";

import { ACCOUNT_KINDS, CONFIDENCE_LEVELS, SUBJECT_CATEGORIES } from "../../constants";
import type { InstitutionId } from "../../registry/institution-ids";
import type { AccountKind, SubjectCategory } from "../../types";
import {
  ACCOUNT_INPUT_REGEX,
  ACCOUNT_MAX_DIGITS,
  ACCOUNT_MAX_INPUT_LENGTH,
  ACCOUNT_MIN_DIGITS,
  type DetectionPayload,
  digitCount,
  isFiniteNumber,
  isRegisteredInstitutionId,
  MESSAGES,
} from "../contract";

export type { DetectionPayload } from "../contract";

// `v.GenericSchema<T>` annotations keep valibot-minor-specific pipe generics out of the d.ts.

/** Account number input: digits, spaces and hyphens holding 6–20 digits. Outputs the input unchanged. */
export const accountSchema: v.GenericSchema<string> = v.pipe(
  v.string(MESSAGES.charset),
  v.minLength(1, MESSAGES.required),
  v.maxLength(ACCOUNT_MAX_INPUT_LENGTH, MESSAGES.tooLong),
  v.regex(ACCOUNT_INPUT_REGEX, MESSAGES.charset),
  v.check((input) => digitCount(input) >= ACCOUNT_MIN_DIGITS, MESSAGES.minDigits),
  v.check((input) => digitCount(input) <= ACCOUNT_MAX_DIGITS, MESSAGES.maxDigits),
);

/** Built-in institution id. */
export const institutionIdSchema: v.GenericSchema<InstitutionId> = v.custom<InstitutionId>(
  isRegisteredInstitutionId,
  MESSAGES.institution,
);

/** `AccountKind` literal. */
export const accountKindSchema: v.GenericSchema<AccountKind> = v.picklist(
  ACCOUNT_KINDS,
  MESSAGES.accountKind,
);

/** `SubjectCategory` literal. */
export const subjectCategorySchema: v.GenericSchema<SubjectCategory> = v.picklist(
  SUBJECT_CATEGORIES,
  MESSAGES.subjectCategory,
);

/** Serialized detection result (`DetectionPayload`). */
export const detectionSchema: v.GenericSchema<DetectionPayload> = v.object({
  institutionId: institutionIdSchema,
  kind: accountKindSchema,
  subject: v.optional(
    v.object({
      code: v.string(),
      category: subjectCategorySchema,
      label: v.optional(v.string()),
    }),
  ),
  score: v.pipe(
    v.number(),
    v.minValue(0),
    v.check((score) => isFiniteNumber(score), MESSAGES.finiteScore),
  ),
  confidence: v.picklist(CONFIDENCE_LEVELS),
  formatted: v.string(),
  capabilities: v.object({
    allowsWithdrawal: v.boolean(),
    virtual: v.boolean(),
    validatedCheckDigit: v.nullable(v.boolean()),
  }),
});
