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
  createLiteralGuard,
  type DetectionPayload,
  type DetectionSchemaOptions,
  digitCount,
  type InstitutionIdSchemaOptions,
  isNonNegativeFiniteNumber,
  isRecord,
  MESSAGES,
  resolveMessages,
  stripUnknownKeys,
} from "../contract";
import type { StandardSchemaV1 } from "./spec";

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
export type { StandardSchemaV1 } from "./spec";

// Hand-written Standard Schema v1 implementation: works with any consumer of the spec
// (TanStack Form, tRPC, Hono, standardSchemaResolver) without a validator library.

const VENDOR = "korean-account";

type Guard<T> = (value: unknown) => value is T;
type Issues = StandardSchemaV1.Issue[];

function ok<T>(value: T): StandardSchemaV1.SuccessResult<T> {
  return { value };
}

function fail(message: string): StandardSchemaV1.FailureResult {
  return { issues: [{ message }] };
}

/** Wraps a synchronous validate function in the Standard Schema v1 interface. */
function createStandardSchema<T>(
  validate: (value: unknown) => StandardSchemaV1.Result<T>,
): StandardSchemaV1<T> {
  return { "~standard": { version: 1, vendor: VENDOR, validate } };
}

/** Passes values the guard accepts and reports `message` for anything else. */
function fromGuard<T>(isValid: Guard<T>, message: string): StandardSchemaV1<T> {
  return createStandardSchema((value) => (isValid(value) ? ok(value) : fail(message)));
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Creates an account-number schema with custom messages.
 *
 * Accepts a string of ASCII digits, whitespace and hyphens, at most 40 characters long, that
 * holds 6–20 digits. A valid value is returned unchanged, separators included; call
 * `normalizeAccount` from `korean-account` when you need digits only. Passing is a format check:
 * it does not prove that the account exists.
 *
 * Rules run in order and only the first failure is reported. Any non-string value, `undefined`
 * included, fails with `required`. `validate` returns its result synchronously, never a
 * Promise; the declared type still includes `Promise` (the spec's signature), so `await` it or
 * narrow it in TypeScript.
 *
 * @param options - `messages` replaces the Korean default per rule; an omitted or `undefined`
 *   key keeps the default.
 * @returns A `StandardSchemaV1<string>` with the account-number checks.
 * @example
 * const accountSchemaEn = createAccountSchema({
 *   messages: { required: "Enter an account number.", minDigits: "Too few digits." },
 * });
 * accountSchemaEn["~standard"].validate("12345");
 * // => { issues: [{ message: "Too few digits." }] }
 * accountSchemaEn["~standard"].validate("110-abc"); // charset was not overridden
 * // => { issues: [{ message: "숫자, 공백, 하이픈만 입력해주세요." }] }
 * @see {@link accountSchema} for the schema with the default messages.
 */
export function createAccountSchema(options: AccountSchemaOptions = {}): StandardSchemaV1<string> {
  const messages = resolveMessages(options.messages);
  return createStandardSchema((value) => {
    if (!isString(value) || value.length === 0) return fail(messages.required);
    if (value.length > ACCOUNT_MAX_INPUT_LENGTH) return fail(messages.tooLong);
    if (!ACCOUNT_INPUT_REGEX.test(value)) return fail(messages.charset);
    const digits = digitCount(value);
    if (digits < ACCOUNT_MIN_DIGITS) return fail(messages.minDigits);
    if (digits > ACCOUNT_MAX_DIGITS) return fail(messages.maxDigits);
    return ok(value);
  });
}

/**
 * Creates a schema that accepts only the given institution ids.
 *
 * Built for custom detectors: pass the ids of the institutions given to `createDetector`, and
 * the output type narrows to their union. Ids are compared exactly (`"KB"` is not `"kb"`); any
 * other value, non-strings included, fails with the message.
 *
 * @typeParam TId - Accepted ids, inferred from `ids`. A literal array, or `.map((i) => i.id)`
 *   over built-in or `defineInstitution` institutions, narrows without `as const`; an array
 *   typed `string[]` gives `string`.
 * @param ids - Ids to accept.
 * @param options - `message` replaces the default `"지원하지 않는 금융기관입니다."`.
 * @returns A `StandardSchemaV1<TId>`.
 * @example
 * const detector = createDetector([kb, shinhan]);
 * const bankIdSchema = createInstitutionIdSchema(detector.institutions.map((i) => i.id));
 * type BankId = StandardSchemaV1.InferOutput<typeof bankIdSchema>; // => "kb" | "shinhan"
 * bankIdSchema["~standard"].validate("kb"); // => { value: "kb" }
 * bankIdSchema["~standard"].validate("woori");
 * // => { issues: [{ message: "지원하지 않는 금융기관입니다." }] }
 * @example
 * const bankIdSchema = createInstitutionIdSchema(["kb", "shinhan"], {
 *   message: "Unsupported bank.",
 * });
 * bankIdSchema["~standard"].validate("woori"); // => { issues: [{ message: "Unsupported bank." }] }
 * @see {@link institutionIdSchema} for every built-in id.
 */
export function createInstitutionIdSchema<const TId extends string>(
  ids: readonly TId[],
  options: InstitutionIdSchemaOptions = {},
): StandardSchemaV1<TId> {
  return fromGuard(createLiteralGuard(ids), options.message ?? MESSAGES.institution);
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
 * @param options - `messages` replaces the Korean default per rule; only the payload keys
 *   apply, `payload` and `invalidValue` included.
 * @returns A `StandardSchemaV1<DetectionPayload<TId>>`.
 * @example
 * const detector = createDetector([kb, shinhan]);
 * const payloadSchema = createDetectionSchema(detector.institutions.map((i) => i.id));
 * type Payload = StandardSchemaV1.InferOutput<typeof payloadSchema>;
 * // => DetectionPayload<"kb" | "shinhan">
 *
 * const result = await payloadSchema["~standard"].validate({ institutionId: "woori" });
 * result.issues?.[0]; // => { message: "지원하지 않는 금융기관입니다.", path: ["institutionId"] }
 */
export function createDetectionSchema<const TId extends string>(
  ids: readonly TId[],
  options: DetectionSchemaOptions = {},
): StandardSchemaV1<DetectionPayloadOf<TId>> {
  const messages = resolveMessages(options.messages);
  const isInstitutionId = createLiteralGuard(ids);
  const isKind = createLiteralGuard(ACCOUNT_KINDS);
  const isCategory = createLiteralGuard(SUBJECT_CATEGORIES);
  const isConfidence = createLiteralGuard(CONFIDENCE_LEVELS);

  function collectSubjectIssues(subject: unknown, issues: Issues): void {
    if (subject === undefined) return;
    if (!isRecord(subject)) {
      issues.push({ message: messages.invalidValue, path: ["subject"] });
      return;
    }
    if (!isString(subject.code)) {
      issues.push({ message: messages.invalidValue, path: ["subject", "code"] });
    }
    if (!isCategory(subject.category)) {
      issues.push({ message: messages.subjectCategory, path: ["subject", "category"] });
    }
    if (subject.label !== undefined && !isString(subject.label)) {
      issues.push({ message: messages.invalidValue, path: ["subject", "label"] });
    }
  }

  function collectCapabilityIssues(capabilities: unknown, issues: Issues): void {
    if (!isRecord(capabilities)) {
      issues.push({ message: messages.invalidValue, path: ["capabilities"] });
      return;
    }
    for (const key of ["allowsWithdrawal", "virtual"] as const) {
      if (!isBoolean(capabilities[key])) {
        issues.push({ message: messages.invalidValue, path: ["capabilities", key] });
      }
    }
    const checkDigit = capabilities.validatedCheckDigit;
    if (checkDigit !== null && !isBoolean(checkDigit)) {
      issues.push({
        message: messages.invalidValue,
        path: ["capabilities", "validatedCheckDigit"],
      });
    }
    collectServiceIssues(capabilities.services, issues);
  }

  function collectServiceIssues(services: unknown, issues: Issues): void {
    if (services === undefined || services === null) return;
    if (!isRecord(services)) {
      issues.push({ message: messages.invalidValue, path: ["capabilities", "services"] });
      return;
    }
    for (const key of ["virtualAccount", "directDebit", "directCredit", "additionalServices"]) {
      if (!isBoolean(services[key])) {
        issues.push({ message: messages.invalidValue, path: ["capabilities", "services", key] });
      }
    }
  }

  /** Collects every issue; an empty list means the value is a valid payload. */
  function isDetectionPayload(value: unknown, issues: Issues): value is DetectionPayloadOf<TId> {
    if (!isRecord(value)) {
      issues.push({ message: messages.payload });
      return false;
    }
    if (!isInstitutionId(value.institutionId)) {
      issues.push({ message: messages.institution, path: ["institutionId"] });
    }
    if (!isKind(value.kind)) issues.push({ message: messages.accountKind, path: ["kind"] });
    collectSubjectIssues(value.subject, issues);
    if (!isNonNegativeFiniteNumber(value.score)) {
      issues.push({ message: messages.finiteScore, path: ["score"] });
    }
    if (!isConfidence(value.confidence)) {
      issues.push({ message: messages.confidence, path: ["confidence"] });
    }
    if (value.ambiguous !== undefined && !isBoolean(value.ambiguous)) {
      issues.push({ message: messages.invalidValue, path: ["ambiguous"] });
    }
    if (!isString(value.formatted)) {
      issues.push({ message: messages.invalidValue, path: ["formatted"] });
    }
    collectCapabilityIssues(value.capabilities, issues);
    return issues.length === 0;
  }

  return createStandardSchema((value) => {
    const issues: Issues = [];
    const payload = stripUnknownKeys(value);
    return isDetectionPayload(payload, issues) ? ok(payload) : { issues };
  });
}

/**
 * Account-number schema with the default Korean messages: a string of digits, whitespace and
 * hyphens holding 6–20 digits, returned unchanged.
 *
 * Passing is a format check: it does not prove that the account exists.
 *
 * @example
 * const result = await accountSchema["~standard"].validate("12345");
 * result.issues?.[0]?.message; // => "계좌번호 자릿수가 부족합니다."
 * accountSchema["~standard"].validate("110-436-387740"); // => { value: "110-436-387740" }
 * @example
 * // TanStack Form takes a Standard Schema as a field validator
 * <form.Field name="account" validators={{ onChange: accountSchema }}>{renderField}</form.Field>
 * @example
 * // react-hook-form: standardSchemaResolver needs a form-level schema, so validate the field
 * register("account", {
 *   validate: async (value) => {
 *     const result = await accountSchema["~standard"].validate(value);
 *     return result.issues?.[0]?.message ?? true;
 *   },
 * });
 * @see {@link createAccountSchema} for the full rules and custom messages.
 */
export const accountSchema: StandardSchemaV1<string> = createAccountSchema();

/**
 * Schema for a built-in institution id (`InstitutionId`), such as `"kb"` or `"shinhan"`.
 *
 * @example
 * institutionIdSchema["~standard"].validate("shinhan"); // => { value: "shinhan" }
 * institutionIdSchema["~standard"].validate("SHINHAN");
 * // => { issues: [{ message: "지원하지 않는 금융기관입니다." }] }
 * @see {@link createInstitutionIdSchema} to accept only a custom detector's institutions.
 */
export const institutionIdSchema: StandardSchemaV1<InstitutionId> =
  createInstitutionIdSchema(INSTITUTION_IDS);

/**
 * Schema for an `AccountKind`: one of `ACCOUNT_KINDS` from `korean-account`.
 *
 * @example
 * accountKindSchema["~standard"].validate("virtual"); // => { value: "virtual" }
 * accountKindSchema["~standard"].validate("New");
 * // => { issues: [{ message: "지원하지 않는 계좌 종류입니다." }] }
 */
export const accountKindSchema: StandardSchemaV1<AccountKind> = fromGuard(
  createLiteralGuard(ACCOUNT_KINDS),
  MESSAGES.accountKind,
);

/**
 * Schema for a `SubjectCategory`: one of `SUBJECT_CATEGORIES` from `korean-account`.
 *
 * @example
 * subjectCategorySchema["~standard"].validate("savings"); // => { value: "savings" }
 * subjectCategorySchema["~standard"].validate("Savings");
 * // => { issues: [{ message: "지원하지 않는 과목 분류입니다." }] }
 */
export const subjectCategorySchema: StandardSchemaV1<SubjectCategory> = fromGuard(
  createLiteralGuard(SUBJECT_CATEGORIES),
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
 * Every invalid field is reported in one pass, each issue with a `path` such as
 * `["capabilities", "virtual"]`. A value that is not an object fails with `payload` and no
 * path; a field of the wrong type fails with `invalidValue`. Unknown keys are kept: on success
 * `value` is the input object itself.
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
 * import { detectionSchema } from "korean-account/standard-schema";
 *
 * const result = await detectionSchema["~standard"].validate(await request.json());
 * if (result.issues) return Response.json({ issues: result.issues }, { status: 400 });
 * result.value.institutionId; // => "shinhan"
 * @example
 * const result = await detectionSchema["~standard"].validate({ institutionId: "x", score: -1 });
 * result.issues?.map((issue) => issue.path);
 * // => [["institutionId"], ["kind"], ["score"], ["confidence"], ["formatted"], ["capabilities"]]
 * @see {@link createDetectionSchema} for a custom detector's institutions.
 */
export const detectionSchema: StandardSchemaV1<DetectionPayload> =
  createDetectionSchema(INSTITUTION_IDS);
