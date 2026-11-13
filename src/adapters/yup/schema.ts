import { boolean, mixed, number, object, type Schema, string } from "yup";

import { ACCOUNT_KINDS, CONFIDENCE_LEVELS, SUBJECT_CATEGORIES } from "../../constants";
import { INSTITUTION_IDS, type InstitutionId } from "../../registry/institution-ids";
import type {
  AccountKind,
  Confidence,
  DetectionPayload as DetectionPayloadOf,
  SubjectCategory,
} from "../../types";
import {
  ACCOUNT_INPUT_REGEX,
  ACCOUNT_MAX_DIGITS_REGEX,
  ACCOUNT_MAX_INPUT_LENGTH,
  ACCOUNT_MIN_DIGITS_REGEX,
  type AccountSchemaOptions,
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

// `Schema<T>` annotations keep yup's churny generics out of the d.ts. Guarded yup traps:
// casting (`.strict(true)`), oneOf accepting `undefined` (`.defined()`, not `.required()`),
// and nested objects defaulting to `{}` (`.default(undefined)`).

/**
 * Account number input: digits, spaces and hyphens holding 6–20 digits. Outputs the input unchanged.
 *
 * @example
 * createAccountSchema({ messages: { required: "Enter an account number." } });
 */
export function createAccountSchema(options: AccountSchemaOptions = {}): Schema<string> {
  const messages = resolveMessages(options.messages);
  return string()
    .strict(true)
    .required(messages.required)
    .max(ACCOUNT_MAX_INPUT_LENGTH, messages.tooLong)
    .matches(ACCOUNT_INPUT_REGEX, messages.charset)
    .matches(ACCOUNT_MIN_DIGITS_REGEX, messages.minDigits)
    .matches(ACCOUNT_MAX_DIGITS_REGEX, messages.maxDigits);
}

/** Institution id from the given list, e.g. the ids of a custom detector. */
export function createInstitutionIdSchema<const TId extends string>(
  ids: readonly TId[],
  options: InstitutionIdSchemaOptions = {},
): Schema<TId> {
  const message = options.message ?? MESSAGES.institution;
  return string<TId>().strict(true).defined(message).oneOf(ids, message);
}

/** Serialized detection result for the given institution ids. */
export function createDetectionSchema<const TId extends string>(
  ids: readonly TId[],
  options: DetectionSchemaOptions = {},
): Schema<DetectionPayloadOf<TId>> {
  const messages = resolveMessages(options.messages);
  const services = object({
    virtualAccount: boolean().strict(true).defined(),
    directDebit: boolean().strict(true).defined(),
    directCredit: boolean().strict(true).defined(),
    additionalServices: boolean().strict(true).defined(),
  })
    .nullable()
    .optional()
    .default(undefined);

  // yup cannot resolve its inferred object type over a generic id, so this one boundary is asserted;
  // the shared contract tests pin the runtime behaviour.
  const schema = object({
    institutionId: createInstitutionIdSchema(ids, { message: messages.institution }),
    kind: literalSchema(ACCOUNT_KINDS, messages.accountKind),
    subject: object({
      code: string().strict(true).defined(),
      category: literalSchema(SUBJECT_CATEGORIES, messages.subjectCategory),
      label: string().strict(true).optional(),
    })
      .optional()
      .default(undefined),
    score: number()
      .strict(true)
      .defined(messages.finiteScore)
      .test("finite-score", messages.finiteScore, isNonNegativeFiniteNumber),
    confidence: literalSchema<Confidence>(CONFIDENCE_LEVELS, messages.confidence),
    ambiguous: boolean().strict(true).optional(),
    formatted: string().strict(true).defined(),
    capabilities: object({
      allowsWithdrawal: boolean().strict(true).defined(),
      virtual: boolean().strict(true).defined(),
      // `.defined().nullable()` in this order: boolean | null with undefined rejected.
      validatedCheckDigit: boolean().strict(true).defined().nullable(),
      services,
    }).defined(),
  }).defined();
  return schema as unknown as Schema<DetectionPayloadOf<TId>>;
}

/** One of the given string literals. */
function literalSchema<TLiteral extends string>(
  literals: readonly TLiteral[],
  message: string,
): Schema<TLiteral> {
  return mixed<TLiteral>().strict(true).defined(message).oneOf(literals, message);
}

/** Account number input with the default Korean messages. */
export const accountSchema: Schema<string> = createAccountSchema();

/** Built-in institution id. */
export const institutionIdSchema: Schema<InstitutionId> =
  createInstitutionIdSchema(INSTITUTION_IDS);

/** `AccountKind` literal. */
export const accountKindSchema: Schema<AccountKind> = literalSchema(
  ACCOUNT_KINDS,
  MESSAGES.accountKind,
);

/** `SubjectCategory` literal. */
export const subjectCategorySchema: Schema<SubjectCategory> = literalSchema(
  SUBJECT_CATEGORIES,
  MESSAGES.subjectCategory,
);

/** Serialized detection result for the built-in institutions. */
export const detectionSchema: Schema<DetectionPayload> = createDetectionSchema(INSTITUTION_IDS);
