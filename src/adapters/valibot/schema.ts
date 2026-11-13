import * as v from "valibot";

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
  DetectionMessages,
  DetectionPayload,
  DetectionSchemaOptions,
  InstitutionIdSchemaOptions,
  MessageOverrides,
  ValidationMessages,
} from "../contract";

// `v.GenericSchema<T>` annotations keep valibot-minor-specific pipe generics out of the d.ts.

/**
 * Account number input: digits, spaces and hyphens holding 6–20 digits. Outputs the input unchanged.
 *
 * @example
 * createAccountSchema({ messages: { required: "Enter an account number." } });
 */
export function createAccountSchema(options: AccountSchemaOptions = {}): v.GenericSchema<string> {
  const messages = resolveMessages(options.messages);
  return v.pipe(
    v.string(messages.required),
    v.minLength(1, messages.required),
    v.maxLength(ACCOUNT_MAX_INPUT_LENGTH, messages.tooLong),
    v.regex(ACCOUNT_INPUT_REGEX, messages.charset),
    v.regex(ACCOUNT_MIN_DIGITS_REGEX, messages.minDigits),
    v.regex(ACCOUNT_MAX_DIGITS_REGEX, messages.maxDigits),
  );
}

/** Institution id from the given list, e.g. the ids of a custom detector. */
export function createInstitutionIdSchema<const TId extends string>(
  ids: readonly TId[],
  options: InstitutionIdSchemaOptions = {},
): v.GenericSchema<TId> {
  return v.custom<TId>(createLiteralGuard(ids), options.message ?? MESSAGES.institution);
}

/** Serialized detection result for the given institution ids. */
export function createDetectionSchema<const TId extends string>(
  ids: readonly TId[],
  options: DetectionSchemaOptions = {},
): v.GenericSchema<DetectionPayloadOf<TId>> {
  const messages = resolveMessages(options.messages);
  const services = v.object({
    virtualAccount: v.boolean(),
    directDebit: v.boolean(),
    directCredit: v.boolean(),
    additionalServices: v.boolean(),
  });

  return v.object({
    institutionId: createInstitutionIdSchema(ids, { message: messages.institution }),
    kind: v.picklist(ACCOUNT_KINDS, messages.accountKind),
    subject: v.optional(
      v.object({
        code: v.string(),
        category: v.picklist(SUBJECT_CATEGORIES, messages.subjectCategory),
        label: v.optional(v.string()),
      }),
    ),
    score: v.custom<number>(isNonNegativeFiniteNumber, messages.finiteScore),
    confidence: v.picklist(CONFIDENCE_LEVELS, messages.confidence),
    ambiguous: v.optional(v.boolean()),
    formatted: v.string(),
    capabilities: v.object({
      allowsWithdrawal: v.boolean(),
      virtual: v.boolean(),
      validatedCheckDigit: v.nullable(v.boolean()),
      services: v.optional(v.nullable(services)),
    }),
  });
}

/** Account number input with the default Korean messages. */
export const accountSchema: v.GenericSchema<string> = createAccountSchema();

/** Built-in institution id. */
export const institutionIdSchema: v.GenericSchema<InstitutionId> =
  createInstitutionIdSchema(INSTITUTION_IDS);

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

/** Serialized detection result for the built-in institutions. */
export const detectionSchema: v.GenericSchema<DetectionPayload> =
  createDetectionSchema(INSTITUTION_IDS);
