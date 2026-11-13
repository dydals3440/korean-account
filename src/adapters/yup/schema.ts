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
  stripUnknownKeys,
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

// `Schema<T>` annotations keep yup's churny generics out of the d.ts. Guarded yup traps:
// casting (`.strict(true)`), oneOf accepting `undefined` (`.defined()`, not `.required()`),
// and nested objects defaulting to `{}` (`.default(undefined)`).

/**
 * Creates an account-number schema with custom messages.
 *
 * Accepts a string of digits, whitespace and hyphens (ASCII or full-width, as typed with a
 * Korean IME), at most 40 characters long, that
 * holds 6–20 digits. A valid value is returned unchanged, separators included; call
 * `normalizeAccount` from `korean-account` when you need digits only. Passing is a format check:
 * it does not prove that the account exists.
 *
 * The schema is `.strict(true)`: values are never cast, so the number `1104363877` is rejected
 * rather than turned into a string, and a `.transform()` added on top does not run during
 * validation. Any non-string value, `null` and `undefined` included, fails with `required`.
 * Validation stops at the first failing rule, in rule order, unless
 * `abortEarly: false` is passed.
 *
 * @param options - `messages` replaces the Korean default per rule; an omitted or `undefined`
 *   key keeps the default.
 * @returns A `Schema<string>` with the account-number checks.
 * @example
 * const accountSchemaEn = createAccountSchema({
 *   messages: { required: "Enter an account number.", minDigits: "Too few digits." },
 * });
 * accountSchemaEn.validateSync("12345"); // => throws ValidationError("Too few digits.")
 * accountSchemaEn.validateSync("110-abc");
 * // => throws ValidationError("숫자, 공백, 하이픈만 입력해주세요."); charset was not overridden
 * @see {@link accountSchema} for the schema with the default messages.
 */
export function createAccountSchema(options: AccountSchemaOptions = {}): Schema<string> {
  const messages = resolveMessages(options.messages);
  return string()
    .strict(true)
    .typeError(messages.required)
    .required(messages.required)
    .max(ACCOUNT_MAX_INPUT_LENGTH, messages.tooLong)
    .matches(ACCOUNT_INPUT_REGEX, messages.charset)
    .matches(ACCOUNT_MIN_DIGITS_REGEX, messages.minDigits)
    .matches(ACCOUNT_MAX_DIGITS_REGEX, messages.maxDigits);
}

/**
 * Creates a schema that accepts only the given institution ids.
 *
 * Built for custom detectors: pass the ids of the institutions given to `createDetector`, and
 * the output type narrows to their union. Ids are compared exactly (`"KB"` is not `"kb"`).
 * `undefined` fails with the schema's message (`.defined()` closes the gap where yup's `oneOf`
 * lets `undefined` through); `null` and non-strings fail with yup's own messages.
 *
 * @typeParam TId - Accepted ids, inferred from `ids`. A literal array, or `.map((i) => i.id)`
 *   over built-in or `defineInstitution` institutions, narrows without `as const`; an array
 *   typed `string[]` gives `string`.
 * @param ids - Ids to accept.
 * @param options - `message` replaces the default `"지원하지 않는 금융기관입니다."`.
 * @returns A strict `Schema<TId>`.
 * @example
 * const detector = createDetector([kb, shinhan]);
 * const bankIdSchema = createInstitutionIdSchema(detector.institutions.map((i) => i.id));
 * type BankId = InferType<typeof bankIdSchema>; // => "kb" | "shinhan"
 * bankIdSchema.validateSync("kb"); // => "kb"
 * bankIdSchema.validateSync("woori"); // => throws ValidationError("지원하지 않는 금융기관입니다.")
 * @example
 * const bankIdSchema = createInstitutionIdSchema(["kb", "shinhan"], {
 *   message: "Unsupported bank.",
 * });
 * bankIdSchema.validateSync("woori"); // => throws ValidationError("Unsupported bank.")
 * @see {@link institutionIdSchema} for every built-in id.
 */
export function createInstitutionIdSchema<const TId extends string>(
  ids: readonly TId[],
  options: InstitutionIdSchemaOptions = {},
): Schema<TId> {
  return literalSchema(ids, options.message ?? MESSAGES.institution);
}

/**
 * Creates a detection-payload schema whose `institutionId` must be one of `ids`.
 *
 * Use it instead of {@link detectionSchema} when payloads come from a custom detector. Pass the
 * ids of the institutions given to `createDetector`: a payload naming any other institution is
 * rejected, and the output type narrows to `DetectionPayload<TId>`. Every other field follows
 * {@link detectionSchema}.
 *
 * @typeParam TId - Accepted institution ids, inferred from `ids`; narrows like
 *   {@link createInstitutionIdSchema}.
 * @param ids - Ids `institutionId` may take.
 * @param options - `messages` replaces the Korean default per rule; only the payload keys apply.
 * @returns A strict `Schema<DetectionPayload<TId>>`.
 * @example
 * const detector = createDetector([kb, shinhan]);
 * const payloadSchema = createDetectionSchema(detector.institutions.map((i) => i.id));
 * type Payload = InferType<typeof payloadSchema>; // => DetectionPayload<"kb" | "shinhan">
 *
 * const [best] = detector.detect("110-436-387740");
 * if (best) payloadSchema.validateSync(toDetectionPayload(best)).institutionId; // => "shinhan"
 */
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

  // yup cannot resolve its inferred object type over a generic id, so this one boundary is
  // asserted; the shared contract tests pin the runtime behaviour.
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
  })
    .defined()
    // Strips keys outside DetectionPayload like zod and valibot; skipped under `strict: true`.
    .transform(stripUnknownKeys);
  return schema as unknown as Schema<DetectionPayloadOf<TId>>;
}

/** One of the given string literals. */
function literalSchema<TLiteral extends string>(
  literals: readonly TLiteral[],
  message: string,
): Schema<TLiteral> {
  return mixed<TLiteral>()
    .strict(true)
    .defined(message)
    .oneOf(literals, message)
    .nonNullable(message);
}

/**
 * Account-number schema with the default Korean messages: a string of digits, whitespace and
 * hyphens holding 6–20 digits, returned unchanged.
 *
 * Passing is a format check: it does not prove that the account exists.
 *
 * @example
 * accountSchema.validateSync("110-436-387740"); // => "110-436-387740"
 * accountSchema.isValidSync(1104363877); // => false (strict: never cast to a string)
 * accountSchema.validateSync("12345");
 * // => throws ValidationError("계좌번호 자릿수가 부족합니다.")
 * @example
 * // react-hook-form, with yupResolver from @hookform/resolvers/yup
 * const transferSchema = object({ account: accountSchema, amount: number().required() });
 * const form = useForm({ resolver: yupResolver(transferSchema) });
 * @example
 * // Digits only: normalize after validating (strict mode skips transforms)
 * normalizeAccount(accountSchema.validateSync("110-436-387740")); // => "110436387740"
 * @see {@link createAccountSchema} for the full rules and custom messages.
 */
export const accountSchema: Schema<string> = createAccountSchema();

/**
 * Schema for a built-in institution id (`InstitutionId`), such as `"kb"` or `"shinhan"`.
 *
 * @example
 * institutionIdSchema.validateSync("shinhan"); // => "shinhan"
 * institutionIdSchema.validateSync("SHINHAN");
 * // => throws ValidationError("지원하지 않는 금융기관입니다.")
 * @see {@link createInstitutionIdSchema} to accept only a custom detector's institutions.
 */
export const institutionIdSchema: Schema<InstitutionId> =
  createInstitutionIdSchema(INSTITUTION_IDS);

/**
 * Schema for an `AccountKind`: one of `ACCOUNT_KINDS` from `korean-account`.
 *
 * `undefined` fails with the same message as an unknown value; `null` fails with yup's own.
 *
 * @example
 * accountKindSchema.validateSync("virtual"); // => "virtual"
 * accountKindSchema.validateSync("New");
 * // => throws ValidationError("지원하지 않는 계좌 종류입니다.")
 */
export const accountKindSchema: Schema<AccountKind> = literalSchema(
  ACCOUNT_KINDS,
  MESSAGES.accountKind,
);

/**
 * Schema for a `SubjectCategory`: one of `SUBJECT_CATEGORIES` from `korean-account`.
 *
 * `undefined` fails with the same message as an unknown value; `null` fails with yup's own.
 *
 * @example
 * subjectCategorySchema.validateSync("savings"); // => "savings"
 * subjectCategorySchema.validateSync("Savings");
 * // => throws ValidationError("지원하지 않는 과목 분류입니다.")
 */
export const subjectCategorySchema: Schema<SubjectCategory> = literalSchema(
  SUBJECT_CATEGORIES,
  MESSAGES.subjectCategory,
);

/**
 * Schema for the JSON payload that `toDetectionPayload` builds from a `detect` result.
 *
 * Use it where a detection crosses a trust boundary, typically a server that receives one from
 * the client. It checks shape and allowed values (`institutionId` is a built-in id; `kind`,
 * `confidence` and `subject.category` are known literals; `score` is a finite number ≥ 0). It
 * does not re-run detection, so a server that must trust the institution should call `detect`
 * on the account number itself.
 *
 * Every field is strict, so `score: "14"` is rejected rather than cast. Unknown keys are kept.
 * A wrong literal or a numeric `score` out of range fails with the `ValidationMessages`
 * defaults; other type errors use yup's own messages. An omitted `subject` or
 * `capabilities.services` stays omitted after `cast()`.
 *
 * @example
 * // client.ts
 * import { detectBest, toDetectionPayload } from "korean-account";
 *
 * const best = detectBest("110-436-387740");
 * if (best) {
 *   await fetch("/api/accounts", {
 *     method: "POST",
 *     headers: { "content-type": "application/json" },
 *     body: JSON.stringify(toDetectionPayload(best)),
 *   });
 * }
 *
 * // server.ts
 * import { detectionSchema } from "korean-account/yup";
 *
 * const detection = detectionSchema.validateSync(await request.json());
 * detection.institutionId; // => "shinhan"
 * @see {@link createDetectionSchema} for a custom detector's institutions.
 */
export const detectionSchema: Schema<DetectionPayload> = createDetectionSchema(INSTITUTION_IDS);
