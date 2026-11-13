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
 * Creates an account-number schema with custom messages.
 *
 * Accepts a string of digits, whitespace and hyphens (ASCII or full-width, as typed with a
 * Korean IME), at most 40 characters long, that
 * holds 6–20 digits. A valid value is returned unchanged, separators included; call
 * `normalizeAccount` from `korean-account` when you need digits only. Passing is a format check:
 * it does not prove that the account exists.
 *
 * Rules run in order and only the first failure is reported. Messages are raised with
 * `ctx.reject({ message })`, so they read the same when the schema is nested in an object (no
 * key prefix). A non-string value, `null` and `undefined` included, fails with `required`.
 *
 * @param options - `messages` replaces the Korean default per rule; an omitted or `undefined`
 *   key keeps the default.
 * @returns A `Type<string>` with the account-number checks.
 * @example
 * const accountSchemaEn = createAccountSchema({
 *   messages: { required: "Enter an account number.", minDigits: "Too few digits." },
 * });
 * accountSchemaEn("12345").toString(); // => "Too few digits."
 * accountSchemaEn("110-abc").toString();
 * // => "숫자, 공백, 하이픈만 입력해주세요." (charset was not overridden)
 * @see {@link accountSchema} for the schema with the default messages.
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

/**
 * Creates a schema that accepts only the given institution ids.
 *
 * Built for custom detectors: pass the ids of the institutions given to `createDetector`, and
 * the output type narrows to their union. Ids are compared exactly (`"KB"` is not `"kb"`). The
 * message replaces arktype's whole message, so it is not prefixed with a key when nested; a
 * missing key still gets arktype's own message.
 *
 * @typeParam TId - Accepted ids, inferred from `ids`. A literal array, or `.map((i) => i.id)`
 *   over built-in or `defineInstitution` institutions, narrows without `as const`; an array
 *   typed `string[]` gives `string`.
 * @param ids - Ids to accept.
 * @param options - `message` replaces the default `"지원하지 않는 금융기관입니다."`.
 * @returns A `Type<TId>`.
 * @example
 * const detector = createDetector([kb, shinhan]);
 * const bankIdSchema = createInstitutionIdSchema(detector.institutions.map((i) => i.id));
 * type BankId = typeof bankIdSchema.infer; // => "kb" | "shinhan"
 * bankIdSchema("kb"); // => "kb"
 * bankIdSchema("woori").toString(); // => "지원하지 않는 금융기관입니다."
 * @example
 * const bankIdSchema = createInstitutionIdSchema(["kb", "shinhan"], {
 *   message: "Unsupported bank.",
 * });
 * bankIdSchema("woori").toString(); // => "Unsupported bank."
 * @see {@link institutionIdSchema} for every built-in id.
 */
export function createInstitutionIdSchema<const TId extends string>(
  ids: readonly TId[],
  options: InstitutionIdSchemaOptions = {},
): Type<TId> {
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
 * @returns A `Type<DetectionPayload<TId>>`.
 * @example
 * const detector = createDetector([kb, shinhan]);
 * const payloadSchema = createDetectionSchema(detector.institutions.map((i) => i.id));
 * type Payload = typeof payloadSchema.infer; // => DetectionPayload<"kb" | "shinhan">
 *
 * const [best] = detector.detect("110-436-387740");
 * if (best) payloadSchema.assert(toDetectionPayload(best)).institutionId; // => "shinhan"
 */
export function createDetectionSchema<const TId extends string>(
  ids: readonly TId[],
  options: DetectionSchemaOptions = {},
): Type<DetectionPayloadOf<TId>> {
  const messages = resolveMessages(options.messages);
  // arktype cannot resolve its inferred object type over a generic id, so this one boundary is
  // asserted; the shared contract tests pin the runtime behaviour.
  const subject = type({
    code: "string",
    category: literalSchema(SUBJECT_CATEGORIES, messages.subjectCategory),
    "label?": "string | undefined",
  });
  const services = type({
    virtualAccount: "boolean",
    directDebit: "boolean",
    directCredit: "boolean",
    additionalServices: "boolean",
  });
  // The id check is typed over `string` so the object type stays concrete: arktype 2.1 cannot call
  // `.pipe` on an object type that depends on the generic `TId`. The values checked are the same.
  const schema = type({
    institutionId: literalSchema<string>(ids, messages.institution),
    kind: literalSchema(ACCOUNT_KINDS, messages.accountKind),
    "subject?": [subject, "|", "undefined"],
    score: type("number").narrow(
      (value, ctx) =>
        isNonNegativeFiniteNumber(value) || ctx.reject({ message: messages.finiteScore }),
    ),
    confidence: literalSchema(CONFIDENCE_LEVELS, messages.confidence),
    "ambiguous?": "boolean | undefined",
    formatted: "string",
    capabilities: {
      allowsWithdrawal: "boolean",
      virtual: "boolean",
      validatedCheckDigit: "boolean | null",
      "services?": [services, "|", "null | undefined"],
    },
  });
  // Validate first so `.allows()` checks the real shape, then copy only DetectionPayload keys,
  // as zod and valibot do.
  return schema.pipe(stripUnknownKeys) as unknown as Type<DetectionPayloadOf<TId>>;
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

/**
 * Account-number schema with the default Korean messages: a string of digits, whitespace and
 * hyphens holding 6–20 digits, returned unchanged.
 *
 * Passing is a format check: it does not prove that the account exists.
 *
 * @example
 * accountSchema("110-436-387740"); // => "110-436-387740"
 * const out = accountSchema("12345");
 * if (out instanceof type.errors) out.summary; // => "계좌번호 자릿수가 부족합니다."
 * @example
 * // Nested: `message` carries the key, `problem` does not
 * const transferSchema = type({ account: accountSchema, amount: "number > 0" });
 * const errors = transferSchema({ account: "12345", amount: 1 });
 * if (errors instanceof type.errors) errors[0]?.problem; // => "계좌번호 자릿수가 부족합니다."
 * @example
 * // Digits only, via `normalizeAccount` from `korean-account`
 * accountSchema.pipe(normalizeAccount)("110-436-387740"); // => "110436387740"
 * @see {@link createAccountSchema} for the full rules and custom messages.
 */
export const accountSchema: Type<string> = createAccountSchema();

/**
 * Schema for a built-in institution id (`InstitutionId`), such as `"kb"` or `"shinhan"`.
 *
 * @example
 * institutionIdSchema("shinhan"); // => "shinhan"
 * institutionIdSchema("SHINHAN").toString(); // => "지원하지 않는 금융기관입니다."
 * @see {@link createInstitutionIdSchema} to accept only a custom detector's institutions.
 */
export const institutionIdSchema: Type<InstitutionId> = createInstitutionIdSchema(INSTITUTION_IDS);

/**
 * Schema for an `AccountKind`: one of `ACCOUNT_KINDS` from `korean-account`.
 *
 * @example
 * accountKindSchema("virtual"); // => "virtual"
 * accountKindSchema("New").toString(); // => "지원하지 않는 계좌 종류입니다."
 */
export const accountKindSchema: Type<AccountKind> = literalSchema(
  ACCOUNT_KINDS,
  MESSAGES.accountKind,
);

/**
 * Schema for a `SubjectCategory`: one of `SUBJECT_CATEGORIES` from `korean-account`.
 *
 * @example
 * subjectCategorySchema("savings"); // => "savings"
 * subjectCategorySchema("Savings").toString(); // => "지원하지 않는 과목 분류입니다."
 */
export const subjectCategorySchema: Type<SubjectCategory> = literalSchema(
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
 * Unknown keys are kept. A wrong literal fails with its `ValidationMessages` default as is; the
 * `finiteScore` message comes from `ctx.reject`, so arktype prefixes it with `score` (read
 * `ArkError.problem` for the message alone). A missing key, a non-number `score` and other type
 * errors use arktype's own messages.
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
 * import { detectionSchema } from "korean-account/arktype";
 *
 * const detection = detectionSchema.assert(await request.json());
 * detection.institutionId; // => "shinhan"
 * @see {@link createDetectionSchema} for a custom detector's institutions.
 */
export const detectionSchema: Type<DetectionPayload> = createDetectionSchema(INSTITUTION_IDS);
