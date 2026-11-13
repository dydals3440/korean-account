import type { InstitutionId } from "../registry/institution-ids";
import type { DetectionPayload as DetectionPayloadOf } from "../types";

// Rules and messages shared by every adapter so the five schema families cannot drift.

// ASCII and full-width digits (U+FF10–FF19), matching what `normalizeAccount` keeps.
const DIGIT = "[0-9\uFF10-\uFF19]";
const NON_DIGIT = "[^0-9\uFF10-\uFF19]";

/**
 * Characters an account-number input may hold: ASCII or full-width digits, whitespace and
 * (full-width) hyphens.
 */
export const ACCOUNT_INPUT_REGEX = new RegExp(String.raw`^(?:${DIGIT}|[\s\-\uFF0D])+$`);
/** Maximum input length in characters, separators included. */
export const ACCOUNT_MAX_INPUT_LENGTH = 40;
/** Minimum digit count of an account-number input. */
export const ACCOUNT_MIN_DIGITS = 6;
/** Maximum digit count of an account-number input. */
export const ACCOUNT_MAX_DIGITS = 20;
/** Matches input with at least `ACCOUNT_MIN_DIGITS` digits. */
export const ACCOUNT_MIN_DIGITS_REGEX = new RegExp(
  String.raw`(?:${NON_DIGIT}*${DIGIT}){${ACCOUNT_MIN_DIGITS}}`,
);
/** Matches input with at most `ACCOUNT_MAX_DIGITS` digits. */
export const ACCOUNT_MAX_DIGITS_REGEX = new RegExp(
  String.raw`^${NON_DIGIT}*(?:${DIGIT}${NON_DIGIT}*){0,${ACCOUNT_MAX_DIGITS}}$`,
);

/**
 * Messages for the account-number rules, one per rule.
 *
 * Rules are checked in the order listed here, and the first issue names the earliest rule that
 * fails.
 */
export interface AccountMessages {
  /** The input is empty. @default "계좌번호를 입력해주세요." */
  readonly required: string;
  /**
   * The input is longer than 40 characters, separators included.
   * @default "너무 긴 입력입니다."
   */
  readonly tooLong: string;
  /**
   * The input holds a character other than an ASCII digit, whitespace or a hyphen; full-width
   * digits such as `１` fail here.
   * @default "숫자, 공백, 하이픈만 입력해주세요."
   */
  readonly charset: string;
  /** The input holds fewer than 6 digits. @default "계좌번호 자릿수가 부족합니다." */
  readonly minDigits: string;
  /** The input holds more than 20 digits. @default "계좌번호 자릿수가 너무 깁니다." */
  readonly maxDigits: string;
}

/**
 * Messages for the detection-payload rules.
 *
 * The keys also serve the standalone schemas: `institution` for `institutionIdSchema`,
 * `accountKind` for `accountKindSchema` and `subjectCategory` for `subjectCategorySchema`.
 */
export interface DetectionMessages {
  /** `institutionId` is not one of the accepted ids. @default "지원하지 않는 금융기관입니다." */
  readonly institution: string;
  /** `kind` is not an `AccountKind`. @default "지원하지 않는 계좌 종류입니다." */
  readonly accountKind: string;
  /** `subject.category` is not a `SubjectCategory`. @default "지원하지 않는 과목 분류입니다." */
  readonly subjectCategory: string;
  /**
   * `confidence` is not `"high"`, `"medium"` or `"low"`.
   * @default "confidence 는 high·medium·low 중 하나여야 합니다."
   */
  readonly confidence: string;
  /**
   * `score` is not a finite number ≥ 0: `NaN`, `±Infinity` or a negative number.
   * @default "score 는 0 이상의 유한한 숫자여야 합니다."
   */
  readonly finiteScore: string;
  /**
   * The payload is `null` or not an object. Standard-schema adapter only; the other adapters
   * report their library's own type message.
   * @default "detection payload 형식이 아닙니다."
   */
  readonly payload: string;
  /**
   * A payload field has the wrong type, e.g. `formatted: 42`. Standard-schema adapter only;
   * the other adapters report their library's own type message.
   * @default "값의 형식이 올바르지 않습니다."
   */
  readonly invalidValue: string;
}

/** Messages for every adapter rule: the account-number rules plus the detection-payload rules. */
export interface ValidationMessages extends AccountMessages, DetectionMessages {}

/** Default Korean messages, used for every key a caller leaves out. */
export const MESSAGES: ValidationMessages = {
  required: "계좌번호를 입력해주세요.",
  tooLong: "너무 긴 입력입니다.",
  charset: "숫자, 공백, 하이픈만 입력해주세요.",
  minDigits: "계좌번호 자릿수가 부족합니다.",
  maxDigits: "계좌번호 자릿수가 너무 깁니다.",
  institution: "지원하지 않는 금융기관입니다.",
  accountKind: "지원하지 않는 계좌 종류입니다.",
  subjectCategory: "지원하지 않는 과목 분류입니다.",
  confidence: "confidence 는 high·medium·low 중 하나여야 합니다.",
  finiteScore: "score 는 0 이상의 유한한 숫자여야 합니다.",
  payload: "detection payload 형식이 아닙니다.",
  invalidValue: "값의 형식이 올바르지 않습니다.",
};

/**
 * Messages merged key by key over the Korean defaults.
 *
 * An omitted key and an `undefined` value both keep the default, so a lookup that may miss,
 * such as an i18n `t()` call, can be passed through without filtering.
 *
 * @typeParam TMessages - Message set to override: `AccountMessages` or `ValidationMessages`.
 */
export type MessageOverrides<TMessages> = {
  readonly [TKey in keyof TMessages]?: string | undefined;
};

/** Options for `createAccountSchema`. */
export interface AccountSchemaOptions {
  /** Messages per rule; an omitted or `undefined` key keeps the Korean default. */
  readonly messages?: MessageOverrides<AccountMessages> | undefined;
}

/** Options for `createInstitutionIdSchema`. */
export interface InstitutionIdSchemaOptions {
  /** Message for a value outside the id list. @default "지원하지 않는 금융기관입니다." */
  readonly message?: string | undefined;
}

/** Options for `createDetectionSchema`. */
export interface DetectionSchemaOptions {
  /**
   * Messages per rule; an omitted or `undefined` key keeps the Korean default. `payload` and
   * `invalidValue` are used only by the standard-schema adapter.
   */
  readonly messages?: MessageOverrides<DetectionMessages> | undefined;
}

/**
 * Detection payload of a built-in institution: the output type of the default `detectionSchema`.
 *
 * This is the root package's generic `DetectionPayload<TId>` with `TId` fixed to
 * `InstitutionId`. For a custom detector, use `DetectionPayload<TId>` from `korean-account`,
 * which `createDetectionSchema(ids)` outputs.
 */
export type DetectionPayload = DetectionPayloadOf<InstitutionId>;

/** Merges overrides over `MESSAGES`, skipping `undefined` values. */
export function resolveMessages(
  overrides: MessageOverrides<ValidationMessages> | undefined,
): ValidationMessages {
  const defined = Object.entries(overrides ?? {}).filter((entry) => entry[1] !== undefined);
  return { ...MESSAGES, ...Object.fromEntries(defined) };
}

const DIGIT_PATTERN = new RegExp(DIGIT, "g");

/** Number of ASCII and full-width digits in the input. */
export function digitCount(value: string): number {
  return value.match(DIGIT_PATTERN)?.length ?? 0;
}

/** Type guard that accepts exactly the given strings. */
export function createLiteralGuard<const TLiteral extends string>(
  literals: readonly TLiteral[],
): (value: unknown) => value is TLiteral {
  const allowed = new Set<string>(literals);
  return (value): value is TLiteral => typeof value === "string" && allowed.has(value);
}

/** Whether the value is a non-null object whose keys can be read. */
export function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

const PAYLOAD_KEYS = [
  "institutionId",
  "kind",
  "subject",
  "score",
  "confidence",
  "ambiguous",
  "formatted",
  "capabilities",
];
const SUBJECT_KEYS = ["code", "category", "label"];
const CAPABILITY_KEYS = ["allowsWithdrawal", "virtual", "validatedCheckDigit", "services"];
const SERVICE_KEYS = ["virtualAccount", "directDebit", "directCredit", "additionalServices"];

function pickKeys(
  record: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): Record<string, unknown> {
  return Object.fromEntries(
    keys.filter((key) => record[key] !== undefined).map((key) => [key, record[key]]),
  );
}

/**
 * Copies a payload-shaped value keeping only `DetectionPayload` keys, at every level, so keys a
 * client adds never reach the validated output. Keys set to `undefined` are dropped too, since
 * the payload treats them as omitted. Anything else is returned as is for the schema to reject.
 */
export function stripUnknownKeys(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  const payload = pickKeys(value, PAYLOAD_KEYS);
  if (isRecord(payload.subject)) {
    payload.subject = pickKeys(payload.subject, SUBJECT_KEYS);
  }
  if (isRecord(payload.capabilities)) {
    const capabilities = pickKeys(payload.capabilities, CAPABILITY_KEYS);
    if (isRecord(capabilities.services)) {
      capabilities.services = pickKeys(capabilities.services, SERVICE_KEYS);
    }
    payload.capabilities = capabilities;
  }
  return payload;
}

/** Whether the value is a finite number ≥ 0; `-0` passes. */
export function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && 0 <= value;
}
