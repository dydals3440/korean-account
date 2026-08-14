import { ACCOUNT_KINDS, CONFIDENCE_LEVELS, SUBJECT_CATEGORIES } from "../../shared/constants";
import type { InstitutionId } from "../../registry";
import type { AccountKind, SubjectCategory } from "../../types";
import {
  ACCOUNT_INPUT_REGEX,
  ACCOUNT_MAX_DIGITS,
  ACCOUNT_MAX_INPUT_LENGTH,
  ACCOUNT_MIN_DIGITS,
  type DetectionPayload,
  digitCount,
  isRegisteredInstitutionId,
  MESSAGES,
} from "../shared";
import type { StandardSchemaV1 } from "./spec";

export type { DetectionPayload } from "../shared";
export type { StandardSchemaV1 } from "./spec";

// The dependency-free adapter: implements the Standard Schema interface by
// hand, so anything that consumes StandardSchemaV1 (TanStack Form, tRPC v11,
// Hono, @hookform/resolvers' standardSchemaResolver, ...) works without zod,
// valibot, yup, or arktype installed. Every validate is synchronous.

const VENDOR = "korean-account";

function ok<T>(value: T): StandardSchemaV1.SuccessResult<T> {
  return { value };
}

function fail(message: string, path?: readonly PropertyKey[]): StandardSchemaV1.FailureResult {
  return path ? { issues: [{ message, path }] } : { issues: [{ message }] };
}

function createStandardSchema<T>(
  validate: (value: unknown) => StandardSchemaV1.Result<T>,
): StandardSchemaV1<T> {
  return { "~standard": { version: 1, vendor: VENDOR, validate } };
}

function picklist<T extends string>(options: readonly T[], message: string): StandardSchemaV1<T> {
  const set = new Set<string>(options);
  return createStandardSchema((value) =>
    typeof value === "string" && set.has(value) ? ok(value as T) : fail(message),
  );
}

/**
 * Schema for a raw Korean account-number string.
 *
 * - digits, hyphens, and spaces only
 * - 6–20 digits after normalization
 */
export const accountSchema: StandardSchemaV1<string> = createStandardSchema((value) => {
  if (typeof value !== "string" || value.length === 0) return fail(MESSAGES.required);
  if (value.length > ACCOUNT_MAX_INPUT_LENGTH) return fail(MESSAGES.tooLong);
  if (!ACCOUNT_INPUT_REGEX.test(value)) return fail(MESSAGES.charset);
  const digits = digitCount(value);
  if (digits < ACCOUNT_MIN_DIGITS) return fail(MESSAGES.minDigits);
  if (digits > ACCOUNT_MAX_DIGITS) return fail(MESSAGES.maxDigits);
  return ok(value);
});

/** Schema accepting only registered institution ids. */
export const institutionIdSchema: StandardSchemaV1<InstitutionId> = createStandardSchema((value) =>
  isRegisteredInstitutionId(value) ? ok(value) : fail(MESSAGES.institution),
);

/** Account kind schema. */
export const accountKindSchema: StandardSchemaV1<AccountKind> = picklist(
  ACCOUNT_KINDS,
  MESSAGES.accountKind,
);

/** Subject category schema. */
export const subjectCategorySchema: StandardSchemaV1<SubjectCategory> = picklist(
  SUBJECT_CATEGORIES,
  MESSAGES.subjectCategory,
);

const CONFIDENCE_SET = /* @__PURE__ */ new Set<string>(CONFIDENCE_LEVELS);
const KIND_SET = /* @__PURE__ */ new Set<string>(ACCOUNT_KINDS);
const CATEGORY_SET = /* @__PURE__ */ new Set<string>(SUBJECT_CATEGORIES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Serialized detection result schema. */
export const detectionSchema: StandardSchemaV1<DetectionPayload> = createStandardSchema((value) => {
  if (!isRecord(value)) return fail("detection payload 형식이 아닙니다.");
  const issues: StandardSchemaV1.Issue[] = [];
  const push = (message: string, ...path: PropertyKey[]) => issues.push({ message, path });

  if (!isRegisteredInstitutionId(value.institutionId)) {
    push(MESSAGES.institution, "institutionId");
  }
  if (typeof value.kind !== "string" || !KIND_SET.has(value.kind)) {
    push(MESSAGES.accountKind, "kind");
  }
  if (typeof value.score !== "number" || value.score < 0) {
    push("score 는 0 이상의 숫자여야 합니다.", "score");
  }
  if (typeof value.confidence !== "string" || !CONFIDENCE_SET.has(value.confidence)) {
    push("confidence 는 high·medium·low 중 하나여야 합니다.", "confidence");
  }
  if (typeof value.formatted !== "string") {
    push("formatted 는 문자열이어야 합니다.", "formatted");
  }

  const subject = value.subject;
  if (subject !== undefined) {
    if (!isRecord(subject)) {
      push("subject 형식이 아닙니다.", "subject");
    } else {
      if (typeof subject.code !== "string") push("code 는 문자열이어야 합니다.", "subject", "code");
      if (typeof subject.category !== "string" || !CATEGORY_SET.has(subject.category)) {
        push(MESSAGES.subjectCategory, "subject", "category");
      }
      if (subject.label !== undefined && typeof subject.label !== "string") {
        push("label 은 문자열이어야 합니다.", "subject", "label");
      }
    }
  }

  const capabilities = value.capabilities;
  if (!isRecord(capabilities)) {
    push("capabilities 가 필요합니다.", "capabilities");
  } else {
    if (typeof capabilities.allowsWithdrawal !== "boolean") {
      push("allowsWithdrawal 은 boolean 이어야 합니다.", "capabilities", "allowsWithdrawal");
    }
    if (typeof capabilities.virtual !== "boolean") {
      push("virtual 은 boolean 이어야 합니다.", "capabilities", "virtual");
    }
    const checkDigit = capabilities.validatedCheckDigit;
    if (checkDigit !== null && typeof checkDigit !== "boolean") {
      push(
        "validatedCheckDigit 은 boolean 또는 null 이어야 합니다.",
        "capabilities",
        "validatedCheckDigit",
      );
    }
  }

  return issues.length > 0 ? { issues } : ok(value as unknown as DetectionPayload);
});
