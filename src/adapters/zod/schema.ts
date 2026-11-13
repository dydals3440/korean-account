import { type ZodString, type ZodType, z } from "zod";

import { ACCOUNT_KINDS, CONFIDENCE_LEVELS, SUBJECT_CATEGORIES } from "../../constants";
import { INSTITUTION_IDS, type InstitutionId } from "../../registry/institution-ids";
import type {
  AccountKind,
  DetectionPayload as DetectionPayloadOf,
  SubjectCategory,
} from "../../types";
import {
  ACCOUNT_INPUT_REGEX,
  ACCOUNT_MAX_DIGITS_REGEX,
  ACCOUNT_MAX_INPUT_LENGTH,
  ACCOUNT_MIN_DIGITS_REGEX,
  type AccountSchemaOptions,
  createLiteralGuard,
  type DetectionPayload,
  type DetectionSchemaOptions,
  type InstitutionIdSchemaOptions,
  isNonNegativeFiniteNumber,
  MESSAGES,
  resolveMessages,
} from "../contract";

export type {
  AccountMessages,
  AccountSchemaOptions,
  DetectionPayload,
  DetectionSchemaOptions,
  InstitutionIdSchemaOptions,
  MessageOverrides,
  ValidationMessages,
} from "../contract";

// Annotations name only types that exist in both zod 3 and 4, so the d.ts never pins a major.

/**
 * Account number input: digits, spaces and hyphens holding 6–20 digits. Outputs the input unchanged.
 * Built only from string checks, so `z.input` and `z.infer` are `string` on zod 3 and 4.
 *
 * @example
 * createAccountSchema({ messages: { required: "Enter an account number." } });
 */
export function createAccountSchema(options: AccountSchemaOptions = {}): ZodString {
  const messages = resolveMessages(options.messages);
  return z
    .string()
    .min(1, messages.required)
    .max(ACCOUNT_MAX_INPUT_LENGTH, messages.tooLong)
    .regex(ACCOUNT_INPUT_REGEX, messages.charset)
    .regex(ACCOUNT_MIN_DIGITS_REGEX, messages.minDigits)
    .regex(ACCOUNT_MAX_DIGITS_REGEX, messages.maxDigits);
}

/** Institution id from the given list, e.g. the ids of a custom detector. */
export function createInstitutionIdSchema<const TId extends string>(
  ids: readonly TId[],
  options: InstitutionIdSchemaOptions = {},
): ZodType<TId> {
  return z.custom<TId>(createLiteralGuard(ids), {
    message: options.message ?? MESSAGES.institution,
  });
}

/** Serialized detection result for the given institution ids. */
export function createDetectionSchema<const TId extends string>(
  ids: readonly TId[],
  options: DetectionSchemaOptions = {},
): ZodType<DetectionPayloadOf<TId>> {
  const messages = resolveMessages(options.messages);
  const services = z.object({
    virtualAccount: z.boolean(),
    directDebit: z.boolean(),
    directCredit: z.boolean(),
    additionalServices: z.boolean(),
  });

  return z.object({
    institutionId: createInstitutionIdSchema(ids, { message: messages.institution }),
    kind: z.enum(ACCOUNT_KINDS, { message: messages.accountKind }),
    subject: z
      .object({
        code: z.string(),
        category: z.enum(SUBJECT_CATEGORIES, { message: messages.subjectCategory }),
        label: z.string().optional(),
      })
      .optional(),
    score: z.custom<number>(isNonNegativeFiniteNumber, { message: messages.finiteScore }),
    confidence: z.enum(CONFIDENCE_LEVELS, { message: messages.confidence }),
    ambiguous: z.boolean().optional(),
    formatted: z.string(),
    capabilities: z.object({
      allowsWithdrawal: z.boolean(),
      virtual: z.boolean(),
      validatedCheckDigit: z.boolean().nullable(),
      services: services.nullable().optional(),
    }),
  });
}

/** Account number input with the default Korean messages. */
export const accountSchema: ZodString = createAccountSchema();

/** Built-in institution id. */
export const institutionIdSchema: ZodType<InstitutionId> =
  createInstitutionIdSchema(INSTITUTION_IDS);

/** `AccountKind` literal. */
export const accountKindSchema: ZodType<AccountKind> = z.enum(ACCOUNT_KINDS, {
  message: MESSAGES.accountKind,
});

/** `SubjectCategory` literal. */
export const subjectCategorySchema: ZodType<SubjectCategory> = z.enum(SUBJECT_CATEGORIES, {
  message: MESSAGES.subjectCategory,
});

/** Serialized detection result for the built-in institutions. */
export const detectionSchema: ZodType<DetectionPayload> = createDetectionSchema(INSTITUTION_IDS);
