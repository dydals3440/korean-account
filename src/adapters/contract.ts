import type { InstitutionId } from "../registry/institution-ids";
import type { DetectionPayload as DetectionPayloadOf } from "../types";

// Rules and messages shared by every adapter so the five schema families cannot drift.

// ASCII and full-width digits (U+FF10–FF19), matching what `normalizeAccount` keeps.
const DIGIT = "[0-9\uFF10-\uFF19]";
const NON_DIGIT = "[^0-9\uFF10-\uFF19]";

/** Characters accepted by `accountSchema`: digits, whitespace and (full-width) hyphens. */
export const ACCOUNT_INPUT_REGEX = new RegExp(String.raw`^(?:${DIGIT}|[\s\-\uFF0D])+$`);
export const ACCOUNT_MAX_INPUT_LENGTH = 40;
export const ACCOUNT_MIN_DIGITS = 6;
export const ACCOUNT_MAX_DIGITS = 20;
/** Matches input with at least `ACCOUNT_MIN_DIGITS` digits. */
export const ACCOUNT_MIN_DIGITS_REGEX = new RegExp(
  String.raw`(?:${NON_DIGIT}*${DIGIT}){${ACCOUNT_MIN_DIGITS}}`,
);
/** Matches input with at most `ACCOUNT_MAX_DIGITS` digits. */
export const ACCOUNT_MAX_DIGITS_REGEX = new RegExp(
  String.raw`^${NON_DIGIT}*(?:${DIGIT}${NON_DIGIT}*){0,${ACCOUNT_MAX_DIGITS}}$`,
);

/** Messages for the account-number rules. */
export interface AccountMessages {
  readonly required: string;
  readonly tooLong: string;
  readonly charset: string;
  readonly minDigits: string;
  readonly maxDigits: string;
}

/** Messages for the detection payload rules. */
export interface DetectionMessages {
  readonly institution: string;
  readonly accountKind: string;
  readonly subjectCategory: string;
  readonly confidence: string;
  readonly finiteScore: string;
  /** Used by the standard-schema adapter, which has no library type messages to fall back on. */
  readonly payload: string;
  /** Used by the standard-schema adapter for a field of the wrong primitive type. */
  readonly invalidValue: string;
}

/** Messages for every adapter rule. */
export interface ValidationMessages extends AccountMessages, DetectionMessages {}

/** Default Korean messages. */
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

/** Per-key message overrides; an omitted or `undefined` key keeps the Korean default. */
export type MessageOverrides<TMessages> = {
  readonly [TKey in keyof TMessages]?: string | undefined;
};

/** Options for `createAccountSchema`. */
export interface AccountSchemaOptions {
  readonly messages?: MessageOverrides<AccountMessages> | undefined;
}

/** Options for `createInstitutionIdSchema`. */
export interface InstitutionIdSchemaOptions {
  readonly message?: string | undefined;
}

/** Options for `createDetectionSchema`. */
export interface DetectionSchemaOptions {
  readonly messages?: MessageOverrides<DetectionMessages> | undefined;
}

/** Built-in institution payload validated by the default `detectionSchema`. */
export type DetectionPayload = DetectionPayloadOf<InstitutionId>;

/** Merges message overrides over the defaults. */
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

/** Type guard for one of the given string literals. */
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

/** Whether the value is a finite number ≥ 0. */
export function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && 0 <= value;
}
