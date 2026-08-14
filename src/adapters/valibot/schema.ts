import * as v from "valibot";
import { ACCOUNT_KINDS, CONFIDENCE_LEVELS, SUBJECT_CATEGORIES } from "../../shared/constants";
import type { InstitutionId } from "../../registry";
import type { AccountKind, SubjectCategory } from "../../types";
import {
  ACCOUNT_INPUT_REGEX,
  ACCOUNT_MAX_DIGITS,
  ACCOUNT_MAX_INPUT_LENGTH,
  ACCOUNT_MIN_DIGITS,
  type DetectionPayload,
  digitCount,
  isRegisteredInstitutionId,
  MESSAGES,
} from "../shared";

export type { DetectionPayload } from "../shared";

// Every export is annotated `v.GenericSchema<T>` — valibot's documented alias
// for explicit annotations. Without it, the generated d.ts inlines
// `SchemaWithPipe<[StringSchema<…>, MinLengthAction<…, "메시지">, …]>` — deep
// internal generics (with the message literals as type arguments) pinned to a
// valibot minor. The adapter-compat CI greps dist/valibot.d.ts for them.

/**
 * Schema for a raw Korean account-number string.
 *
 * - digits, hyphens, and spaces only
 * - 6–20 digits after normalization
 */
export const accountSchema: v.GenericSchema<string> = v.pipe(
  v.string(MESSAGES.charset),
  v.minLength(1, MESSAGES.required),
  v.maxLength(ACCOUNT_MAX_INPUT_LENGTH, MESSAGES.tooLong),
  v.regex(ACCOUNT_INPUT_REGEX, MESSAGES.charset),
  v.check((input) => digitCount(input) >= ACCOUNT_MIN_DIGITS, MESSAGES.minDigits),
  v.check((input) => digitCount(input) <= ACCOUNT_MAX_DIGITS, MESSAGES.maxDigits),
);

/** Schema accepting only registered institution ids. */
export const institutionIdSchema: v.GenericSchema<InstitutionId> = v.custom<InstitutionId>(
  isRegisteredInstitutionId,
  MESSAGES.institution,
);

/** Account kind schema. */
export const accountKindSchema: v.GenericSchema<AccountKind> = v.picklist(
  ACCOUNT_KINDS,
  MESSAGES.accountKind,
);

/** Subject category schema. */
export const subjectCategorySchema: v.GenericSchema<SubjectCategory> = v.picklist(
  SUBJECT_CATEGORIES,
  MESSAGES.subjectCategory,
);

/** Serialized detection result schema. */
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
  score: v.pipe(v.number(), v.minValue(0)),
  confidence: v.picklist(CONFIDENCE_LEVELS),
  formatted: v.string(),
  capabilities: v.object({
    allowsWithdrawal: v.boolean(),
    virtual: v.boolean(),
    validatedCheckDigit: v.nullable(v.boolean()),
  }),
});
