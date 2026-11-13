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
  DetectionMessages,
  DetectionPayload,
  DetectionSchemaOptions,
  InstitutionIdSchemaOptions,
  MessageOverrides,
  ValidationMessages,
} from "../contract";

// Annotations name only types that exist in both zod 3 and 4, so the d.ts never pins a major.

/**
 * Creates an account-number schema with custom messages.
 *
 * Accepts a string of ASCII digits, whitespace and hyphens, at most 40 characters long, that
 * holds 6–20 digits. A valid value is returned unchanged, separators included; call
 * `normalizeAccount` from `korean-account` when you need digits only. Passing is a format check:
 * it does not prove that the account exists.
 *
 * Every failing rule is reported, in rule order, so `issues[0]` names the earliest one. A
 * non-string value fails with zod's own type message. The result is a `ZodString`, so string
 * methods stay available and `z.input` and `z.infer` are both `string` on zod 3 and 4.
 *
 * @param options - `messages` replaces the Korean default per rule; an omitted or `undefined`
 *   key keeps the default.
 * @returns A `ZodString` carrying the account-number checks.
 * @example
 * const accountSchemaEn = createAccountSchema({
 *   messages: { required: "Enter an account number.", minDigits: "Too few digits." },
 * });
 * accountSchemaEn.safeParse("12345").error?.issues[0]?.message; // => "Too few digits."
 * accountSchemaEn.safeParse("110-abc").error?.issues[0]?.message;
 * // => "숫자, 공백, 하이픈만 입력해주세요." (charset was not overridden)
 * @see {@link accountSchema} for the schema with the default messages.
 */
export function createAccountSchema(options: AccountSchemaOptions = {}): ZodString {
  const messages = resolveMessages(options.messages);
  return z
    .string({ message: messages.required })
    .min(1, messages.required)
    .max(ACCOUNT_MAX_INPUT_LENGTH, messages.tooLong)
    .regex(ACCOUNT_INPUT_REGEX, messages.charset)
    .regex(ACCOUNT_MIN_DIGITS_REGEX, messages.minDigits)
    .regex(ACCOUNT_MAX_DIGITS_REGEX, messages.maxDigits);
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
 * @returns A `ZodType<TId>`; read its type with `z.infer`, since `z.input` is `unknown` on zod 4.
 * @example
 * const detector = createDetector([kb, shinhan]);
 * const bankIdSchema = createInstitutionIdSchema(detector.institutions.map((i) => i.id));
 * type BankId = z.infer<typeof bankIdSchema>; // => "kb" | "shinhan"
 * bankIdSchema.parse("kb"); // => "kb"
 * bankIdSchema.safeParse("woori").error?.issues[0]?.message; // => "지원하지 않는 금융기관입니다."
 * @example
 * const bankIdSchema = createInstitutionIdSchema(["kb", "shinhan"], {
 *   message: "Unsupported bank.",
 * });
 * bankIdSchema.safeParse("woori").error?.issues[0]?.message; // => "Unsupported bank."
 * @see {@link institutionIdSchema} for every built-in id.
 */
export function createInstitutionIdSchema<const TId extends string>(
  ids: readonly TId[],
  options: InstitutionIdSchemaOptions = {},
): ZodType<TId> {
  return z.custom<TId>(createLiteralGuard(ids), {
    message: options.message ?? MESSAGES.institution,
  });
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
 * @returns A `ZodType<DetectionPayload<TId>>`; read its type with `z.infer`.
 * @example
 * const detector = createDetector([kb, shinhan]);
 * const payloadSchema = createDetectionSchema(detector.institutions.map((i) => i.id));
 * type Payload = z.infer<typeof payloadSchema>; // => DetectionPayload<"kb" | "shinhan">
 *
 * const [best] = detector.detect("110-436-387740");
 * if (best) payloadSchema.parse(toDetectionPayload(best)).institutionId; // => "shinhan"
 */
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

  const schema = z.object({
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
  // zod 3 cannot relate its inferred object type over a generic id to the payload type, so this
  // one boundary is asserted; the shared contract tests pin the runtime behaviour on zod 3 and 4.
  return schema as unknown as ZodType<DetectionPayloadOf<TId>>;
}

/**
 * Account-number schema with the default Korean messages: a string of digits, whitespace and
 * hyphens holding 6–20 digits, returned unchanged.
 *
 * Passing is a format check: it does not prove that the account exists.
 *
 * @example
 * accountSchema.parse("110-436-387740"); // => "110-436-387740"
 * accountSchema.safeParse("12345").error?.issues[0]?.message; // => "계좌번호 자릿수가 부족합니다."
 * @example
 * // react-hook-form, with zodResolver from @hookform/resolvers/zod
 * const transferSchema = z.object({ account: accountSchema, amount: z.number().positive() });
 * const form = useForm({ resolver: zodResolver(transferSchema) });
 * @example
 * // Digits only, via `normalizeAccount` from `korean-account`
 * accountSchema.transform(normalizeAccount).parse("110-436-387740"); // => "110436387740"
 * @see {@link createAccountSchema} for the full rules and custom messages.
 */
export const accountSchema: ZodString = createAccountSchema();

/**
 * Schema for a built-in institution id (`InstitutionId`), such as `"kb"` or `"shinhan"`.
 *
 * Typed `ZodType<InstitutionId>`: `z.infer` gives `InstitutionId`, while `z.input` is `unknown`
 * on zod 4 (and `InstitutionId` on zod 3).
 *
 * @example
 * institutionIdSchema.parse("shinhan"); // => "shinhan"
 * institutionIdSchema.safeParse("SHINHAN").error?.issues[0]?.message;
 * // => "지원하지 않는 금융기관입니다."
 * @see {@link createInstitutionIdSchema} to accept only a custom detector's institutions.
 */
export const institutionIdSchema: ZodType<InstitutionId> =
  createInstitutionIdSchema(INSTITUTION_IDS);

/**
 * Schema for an `AccountKind`: one of `ACCOUNT_KINDS` from `korean-account`.
 *
 * @example
 * accountKindSchema.parse("virtual"); // => "virtual"
 * accountKindSchema.safeParse("New").error?.issues[0]?.message;
 * // => "지원하지 않는 계좌 종류입니다."
 */
export const accountKindSchema: ZodType<AccountKind> = z.enum(ACCOUNT_KINDS, {
  message: MESSAGES.accountKind,
});

/**
 * Schema for a `SubjectCategory`: one of `SUBJECT_CATEGORIES` from `korean-account`.
 *
 * @example
 * subjectCategorySchema.parse("savings"); // => "savings"
 * subjectCategorySchema.safeParse("Savings").error?.issues[0]?.message;
 * // => "지원하지 않는 과목 분류입니다."
 */
export const subjectCategorySchema: ZodType<SubjectCategory> = z.enum(SUBJECT_CATEGORIES, {
  message: MESSAGES.subjectCategory,
});

/**
 * Schema for the JSON payload that `toDetectionPayload` builds from a `detect` result.
 *
 * Use it where a detection crosses a trust boundary, typically a server that receives one from
 * the client. It checks shape and allowed values (`institutionId` is a built-in id; `kind`,
 * `confidence` and `subject.category` are known literals; `score` is a finite number ≥ 0). It
 * does not re-run detection, so a server that must trust the institution should call `detect`
 * on the account number itself.
 *
 * Unknown keys are stripped. A wrong literal or `score` fails with the `ValidationMessages`
 * defaults; other type errors use zod's own messages. Read the type with `z.infer`, since
 * `z.input` is `unknown` on zod 4.
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
 * import { detectionSchema } from "korean-account/zod";
 *
 * const detection = detectionSchema.parse(await request.json());
 * detection.institutionId; // => "shinhan"
 * @see {@link createDetectionSchema} for a custom detector's institutions.
 */
export const detectionSchema: ZodType<DetectionPayload> = createDetectionSchema(INSTITUTION_IDS);
