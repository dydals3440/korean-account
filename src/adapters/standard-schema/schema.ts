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
  MESSAGES,
  resolveMessages,
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

function createStandardSchema<T>(
  validate: (value: unknown) => StandardSchemaV1.Result<T>,
): StandardSchemaV1<T> {
  return { "~standard": { version: 1, vendor: VENDOR, validate } };
}

function fromGuard<T>(isValid: Guard<T>, message: string): StandardSchemaV1<T> {
  return createStandardSchema((value) => (isValid(value) ? ok(value) : fail(message)));
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Account number input: digits, spaces and hyphens holding 6–20 digits. Outputs the input unchanged.
 *
 * @example
 * createAccountSchema({ messages: { required: "Enter an account number." } });
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

/** Institution id from the given list, e.g. the ids of a custom detector. */
export function createInstitutionIdSchema<const TId extends string>(
  ids: readonly TId[],
  options: InstitutionIdSchemaOptions = {},
): StandardSchemaV1<TId> {
  return fromGuard(createLiteralGuard(ids), options.message ?? MESSAGES.institution);
}

/** Serialized detection result for the given institution ids. */
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
    return isDetectionPayload(value, issues) ? ok(value) : { issues };
  });
}

/** Account number input with the default Korean messages. */
export const accountSchema: StandardSchemaV1<string> = createAccountSchema();

/** Built-in institution id. */
export const institutionIdSchema: StandardSchemaV1<InstitutionId> =
  createInstitutionIdSchema(INSTITUTION_IDS);

/** `AccountKind` literal. */
export const accountKindSchema: StandardSchemaV1<AccountKind> = fromGuard(
  createLiteralGuard(ACCOUNT_KINDS),
  MESSAGES.accountKind,
);

/** `SubjectCategory` literal. */
export const subjectCategorySchema: StandardSchemaV1<SubjectCategory> = fromGuard(
  createLiteralGuard(SUBJECT_CATEGORIES),
  MESSAGES.subjectCategory,
);

/** Serialized detection result for the built-in institutions. */
export const detectionSchema: StandardSchemaV1<DetectionPayload> =
  createDetectionSchema(INSTITUTION_IDS);
