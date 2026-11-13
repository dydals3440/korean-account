import { type } from "arktype";

import { ACCOUNT_KINDS, CONFIDENCE_LEVELS, SUBJECT_CATEGORIES } from "../../constants";
import { INSTITUTION_IDS, type InstitutionId } from "../../registry/institution-ids";
import type {
  AccountKind,
  DetectionPayload as DetectionPayloadOf,
  SubjectCategory,
} from "../../types";
import {
  ACCOUNT_INPUT_REGEX,
  ACCOUNT_MAX_DIGITS,
  ACCOUNT_MAX_INPUT_LENGTH,
  ACCOUNT_MIN_DIGITS,
  type AccountSchemaOptions,
  type DetectionPayload,
  type DetectionSchemaOptions,
  digitCount,
  type InstitutionIdSchemaOptions,
  isNonNegativeFiniteNumber,
  MESSAGES,
  resolveMessages,
  stripUnknownKeys,
} from "../contract";

// ArkType is ESM-only; the inline import keeps `resolution-mode` in emitted CJS declarations.
// oxlint-disable-next-line typescript/consistent-type-imports
type Type<T> = import("arktype", { with: { "resolution-mode": "import" } }).Type<T>;

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

// `Type<T>` annotations keep d.ts stable across arktype 2.x. Rules use `.narrow` with
// `ctx.reject({ message })`, which replaces arktype's English text without a path prefix.

/**
 * Account number input: digits, spaces and hyphens holding 6–20 digits. Outputs the input unchanged.
 *
 * @example
 * createAccountSchema({ messages: { required: "Enter an account number." } });
 */
export function createAccountSchema(options: AccountSchemaOptions = {}): Type<string> {
  const messages = resolveMessages(options.messages);
  return type("string")
    .configure({ message: messages.required })
    .narrow((value, ctx) => {
      if (value.length === 0) return ctx.reject({ message: messages.required });
      if (value.length > ACCOUNT_MAX_INPUT_LENGTH) return ctx.reject({ message: messages.tooLong });
      if (!ACCOUNT_INPUT_REGEX.test(value)) return ctx.reject({ message: messages.charset });
      const digits = digitCount(value);
      if (digits < ACCOUNT_MIN_DIGITS) return ctx.reject({ message: messages.minDigits });
      if (digits > ACCOUNT_MAX_DIGITS) return ctx.reject({ message: messages.maxDigits });
      return true;
    });
}

/** Institution id from the given list, e.g. the ids of a custom detector. */
export function createInstitutionIdSchema<const TId extends string>(
  ids: readonly TId[],
  options: InstitutionIdSchemaOptions = {},
): Type<TId> {
  return literalSchema(ids, options.message ?? MESSAGES.institution);
}

/** Serialized detection result for the given institution ids. */
export function createDetectionSchema<const TId extends string>(
  ids: readonly TId[],
  options: DetectionSchemaOptions = {},
): Type<DetectionPayloadOf<TId>> {
  const messages = resolveMessages(options.messages);
  // arktype cannot resolve its inferred object type over a generic id, so this one boundary is
  // asserted; the shared contract tests pin the runtime behaviour.
  const schema = type({
    institutionId: createInstitutionIdSchema(ids, { message: messages.institution }),
    kind: literalSchema(ACCOUNT_KINDS, messages.accountKind),
    "subject?": {
      code: "string",
      category: literalSchema(SUBJECT_CATEGORIES, messages.subjectCategory),
      "label?": "string",
    },
    score: type("number").narrow(
      (value, ctx) =>
        isNonNegativeFiniteNumber(value) || ctx.reject({ message: messages.finiteScore }),
    ),
    confidence: literalSchema(CONFIDENCE_LEVELS, messages.confidence),
    "ambiguous?": "boolean",
    formatted: "string",
    capabilities: {
      allowsWithdrawal: "boolean",
      virtual: "boolean",
      validatedCheckDigit: "boolean | null",
      "services?": type({
        virtualAccount: "boolean",
        directDebit: "boolean",
        directCredit: "boolean",
        additionalServices: "boolean",
      }).or("null"),
    },
  });
  // The copy drops keys outside DetectionPayload and explicit `undefined`s, matching zod and
  // valibot, before the shape is checked.
  return type("unknown").pipe(stripUnknownKeys, schema) as unknown as Type<DetectionPayloadOf<TId>>;
}

/** One of the given string literals. */
function literalSchema<const TLiteral extends string>(
  literals: readonly TLiteral[],
  message: string,
): Type<TLiteral> {
  // arktype cannot configure a `Type` over an unresolved generic, so the list is widened and the
  // result narrowed back; the values themselves are exactly `literals`.
  const values: readonly string[] = literals;
  return type.enumerated(...values).configure({ message }) as Type<TLiteral>;
}

/** Account number input with the default Korean messages. */
export const accountSchema: Type<string> = createAccountSchema();

/** Built-in institution id. */
export const institutionIdSchema: Type<InstitutionId> = createInstitutionIdSchema(INSTITUTION_IDS);

/** `AccountKind` literal. */
export const accountKindSchema: Type<AccountKind> = literalSchema(
  ACCOUNT_KINDS,
  MESSAGES.accountKind,
);

/** `SubjectCategory` literal. */
export const subjectCategorySchema: Type<SubjectCategory> = literalSchema(
  SUBJECT_CATEGORIES,
  MESSAGES.subjectCategory,
);

/** Serialized detection result for the built-in institutions. */
export const detectionSchema: Type<DetectionPayload> = createDetectionSchema(INSTITUTION_IDS);
