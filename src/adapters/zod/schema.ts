import { type ZodType, z } from "zod";
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

// Every export is annotated `ZodType<T>`. Without it, the generated d.ts
// hardcodes zod v3-only types such as `z.ZodEffects`, and v4 consumers under
// `skipLibCheck: true` silently lose the schema types. The zod CI matrix
// compiles both majors.

/**
 * Schema for a raw Korean account-number string.
 *
 * - digits, hyphens, and spaces only
 * - 6–20 digits after normalization
 */
export const accountSchema: ZodType<string> = z
  .string()
  .min(1, MESSAGES.required)
  .max(ACCOUNT_MAX_INPUT_LENGTH, MESSAGES.tooLong)
  .regex(ACCOUNT_INPUT_REGEX, MESSAGES.charset)
  .refine((v) => digitCount(v) >= ACCOUNT_MIN_DIGITS, { message: MESSAGES.minDigits })
  .refine((v) => digitCount(v) <= ACCOUNT_MAX_DIGITS, { message: MESSAGES.maxDigits });

/**
 * Schema accepting only registered institution ids.
 *
 * Uses `z.custom`: v3's `.refine((v): v is InstitutionId => …)` narrows the
 * output via the type predicate but v4's `.refine` does not, so the same code
 * would produce different types across majors.
 */
export const institutionIdSchema: ZodType<InstitutionId> = z.custom<InstitutionId>(
  isRegisteredInstitutionId,
  { message: MESSAGES.institution },
);

/** Account kind schema. */
export const accountKindSchema: ZodType<AccountKind> = z.enum(ACCOUNT_KINDS);

/** Subject category schema. */
export const subjectCategorySchema: ZodType<SubjectCategory> = z.enum(SUBJECT_CATEGORIES);

/** Serialized detection result schema. */
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
  score: z.number().min(0),
  confidence: z.enum(CONFIDENCE_LEVELS),
  formatted: z.string(),
  capabilities: z.object({
    allowsWithdrawal: z.boolean(),
    virtual: z.boolean(),
    validatedCheckDigit: z.boolean().nullable(),
  }),
});
