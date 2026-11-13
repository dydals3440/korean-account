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
 * Creates an account-number schema with custom messages.
 *
 * Accepts a string of digits, whitespace and hyphens (ASCII or full-width, as typed with a
 * Korean IME), at most 40 characters long, that
 * holds 6–20 digits. A valid value is returned unchanged, separators included; call
 * `normalizeAccount` from `korean-account` when you need digits only. Passing is a format check:
 * it does not prove that the account exists.
 *
 * Every failing rule is reported, in rule order, so `issues[0]` names the earliest one. A
 * non-string value, `null` and `undefined` included, fails with `required`.
 *
 * @param options - `messages` replaces the Korean default per rule; an omitted or `undefined`
 *   key keeps the default.
 * @returns A `GenericSchema<string>` with the account-number checks.
 * @example
 * const accountSchemaEn = createAccountSchema({
 *   messages: { required: "Enter an account number.", minDigits: "Too few digits." },
 * });
 * v.safeParse(accountSchemaEn, "12345").issues?.[0].message; // => "Too few digits."
 * v.safeParse(accountSchemaEn, "110-abc").issues?.[0].message;
 * // => "숫자, 공백, 하이픈만 입력해주세요." (charset was not overridden)
 * @see {@link accountSchema} for the schema with the default messages.
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

/**
 * Creates a schema that accepts only the given institution ids.
 *
 * Built for custom detectors: pass the ids of the institutions given to `createDetector`, and
 * the output type narrows to their union. Ids are compared exactly (`"KB"` is not `"kb"`).
 *
 * @typeParam TId - Accepted ids, inferred from `ids`. A literal array, or `.map((i) => i.id)`
 *   over built-in or `defineInstitution` institutions, narrows without `as const`; an array
 *   typed `string[]` gives `string`.
 * @param ids - Ids to accept.
 * @param options - `message` replaces the default `"지원하지 않는 금융기관입니다."`.
 * @returns A `GenericSchema<TId>`.
 * @example
 * const detector = createDetector([kb, shinhan]);
 * const bankIdSchema = createInstitutionIdSchema(detector.institutions.map((i) => i.id));
 * type BankId = v.InferOutput<typeof bankIdSchema>; // => "kb" | "shinhan"
 * v.parse(bankIdSchema, "kb"); // => "kb"
 * v.safeParse(bankIdSchema, "woori").issues?.[0].message; // => "지원하지 않는 금융기관입니다."
 * @example
 * const bankIdSchema = createInstitutionIdSchema(["kb", "shinhan"], {
 *   message: "Unsupported bank.",
 * });
 * v.safeParse(bankIdSchema, "woori").issues?.[0].message; // => "Unsupported bank."
 * @see {@link institutionIdSchema} for every built-in id.
 */
export function createInstitutionIdSchema<const TId extends string>(
  ids: readonly TId[],
  options: InstitutionIdSchemaOptions = {},
): v.GenericSchema<TId> {
  return v.custom<TId>(createLiteralGuard(ids), options.message ?? MESSAGES.institution);
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
 * @returns A `GenericSchema<DetectionPayload<TId>>`.
 * @example
 * const detector = createDetector([kb, shinhan]);
 * const payloadSchema = createDetectionSchema(detector.institutions.map((i) => i.id));
 * type Payload = v.InferOutput<typeof payloadSchema>; // => DetectionPayload<"kb" | "shinhan">
 *
 * const [best] = detector.detect("110-436-387740");
 * if (best) v.parse(payloadSchema, toDetectionPayload(best)).institutionId; // => "shinhan"
 */
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

/**
 * Account-number schema with the default Korean messages: a string of digits, whitespace and
 * hyphens holding 6–20 digits, returned unchanged.
 *
 * Passing is a format check: it does not prove that the account exists.
 *
 * @example
 * v.parse(accountSchema, "110-436-387740"); // => "110-436-387740"
 * v.safeParse(accountSchema, "12345").issues?.[0].message; // => "계좌번호 자릿수가 부족합니다."
 * @example
 * // react-hook-form, with valibotResolver from @hookform/resolvers/valibot
 * const transferSchema = v.object({ account: accountSchema, amount: v.number() });
 * const form = useForm({ resolver: valibotResolver(transferSchema) });
 * @example
 * // Digits only, via `normalizeAccount` from `korean-account`
 * const accountDigitsSchema = v.pipe(accountSchema, v.transform(normalizeAccount));
 * v.parse(accountDigitsSchema, "110-436-387740"); // => "110436387740"
 * @see {@link createAccountSchema} for the full rules and custom messages.
 */
export const accountSchema: v.GenericSchema<string> = createAccountSchema();

/**
 * Schema for a built-in institution id (`InstitutionId`), such as `"kb"` or `"shinhan"`.
 *
 * @example
 * v.parse(institutionIdSchema, "shinhan"); // => "shinhan"
 * v.safeParse(institutionIdSchema, "SHINHAN").issues?.[0].message;
 * // => "지원하지 않는 금융기관입니다."
 * @see {@link createInstitutionIdSchema} to accept only a custom detector's institutions.
 */
export const institutionIdSchema: v.GenericSchema<InstitutionId> =
  createInstitutionIdSchema(INSTITUTION_IDS);

/**
 * Schema for an `AccountKind`: one of `ACCOUNT_KINDS` from `korean-account`.
 *
 * @example
 * v.parse(accountKindSchema, "virtual"); // => "virtual"
 * v.safeParse(accountKindSchema, "New").issues?.[0].message;
 * // => "지원하지 않는 계좌 종류입니다."
 */
export const accountKindSchema: v.GenericSchema<AccountKind> = v.picklist(
  ACCOUNT_KINDS,
  MESSAGES.accountKind,
);

/**
 * Schema for a `SubjectCategory`: one of `SUBJECT_CATEGORIES` from `korean-account`.
 *
 * @example
 * v.parse(subjectCategorySchema, "savings"); // => "savings"
 * v.safeParse(subjectCategorySchema, "Savings").issues?.[0].message;
 * // => "지원하지 않는 과목 분류입니다."
 */
export const subjectCategorySchema: v.GenericSchema<SubjectCategory> = v.picklist(
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
 * Keys outside `DetectionPayload` are removed at every level. A wrong literal or `score` fails
 * with the `ValidationMessages`
 * defaults; a missing key and other type errors use valibot's own messages.
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
 * import { detectionSchema } from "korean-account/valibot";
 *
 * const detection = v.parse(detectionSchema, await request.json());
 * detection.institutionId; // => "shinhan"
 * @see {@link createDetectionSchema} for a custom detector's institutions.
 */
export const detectionSchema: v.GenericSchema<DetectionPayload> =
  createDetectionSchema(INSTITUTION_IDS);
