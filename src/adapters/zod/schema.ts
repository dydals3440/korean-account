import { type ZodType, z } from "zod";

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

// `ZodType<T>` annotations keep zod-major-specific types such as `ZodEffects` out of the d.ts.

/** Account number input: digits, spaces and hyphens holding 6–20 digits. Outputs the input unchanged. */
export const accountSchema: ZodType<string> = z
  .string()
  .min(1, MESSAGES.required)
  .max(ACCOUNT_MAX_INPUT_LENGTH, MESSAGES.tooLong)
  .regex(ACCOUNT_INPUT_REGEX, MESSAGES.charset)
  .refine((v) => digitCount(v) >= ACCOUNT_MIN_DIGITS, { message: MESSAGES.minDigits })
  .refine((v) => digitCount(v) <= ACCOUNT_MAX_DIGITS, { message: MESSAGES.maxDigits });

/** Built-in institution id. `z.custom` keeps the output type identical on zod v3 and v4. */
export const institutionIdSchema: ZodType<InstitutionId> = z.custom<InstitutionId>(
  isRegisteredInstitutionId,
  { message: MESSAGES.institution },
);

/** `AccountKind` literal. */
export const accountKindSchema: ZodType<AccountKind> = z.enum(ACCOUNT_KINDS);

/** `SubjectCategory` literal. */
export const subjectCategorySchema: ZodType<SubjectCategory> = z.enum(SUBJECT_CATEGORIES);

/** Serialized detection result (`DetectionPayload`). */
export const detectionSchema: ZodType<DetectionPayload> = z.object({
  institutionId: institutionIdSchema,
  kind: accountKindSchema,
  subject: z
    .object({
      code: z.string(),
      category: subjectCategorySchema,
      label: z.string().optional(),
    })
    .optional(),
  score: z.number().min(0).refine(isFiniteNumber, { message: MESSAGES.finiteScore }),
  confidence: z.enum(CONFIDENCE_LEVELS),
  formatted: z.string(),
  capabilities: z.object({
    allowsWithdrawal: z.boolean(),
    virtual: z.boolean(),
    validatedCheckDigit: z.boolean().nullable(),
  }),
});
