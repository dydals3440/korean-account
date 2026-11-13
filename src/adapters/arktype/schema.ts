import { type } from "arktype";

import { ACCOUNT_KINDS, SUBJECT_CATEGORIES } from "../../constants";
import { INSTITUTION_IDS, type InstitutionId } from "../../registry/institution-ids";
import type { AccountKind, SubjectCategory } from "../../types";
import {
  ACCOUNT_INPUT_REGEX,
  ACCOUNT_MAX_DIGITS,
  ACCOUNT_MAX_INPUT_LENGTH,
  ACCOUNT_MIN_DIGITS,
  type DetectionPayload,
  digitCount,
  isFiniteNumber,
  MESSAGES,
} from "../contract";

// ArkType is ESM-only; the inline import keeps `resolution-mode` in emitted CJS declarations.
// oxlint-disable-next-line typescript/consistent-type-imports
type Type<T> = import("arktype", { with: { "resolution-mode": "import" } }).Type<T>;

export type { DetectionPayload } from "../contract";

// `Type<T>` annotations keep d.ts stable across arktype 2.x. Account rules use one `.narrow`
// because `ctx.reject({ problem })` is the only way to replace arktype's English messages.

/** Account number input: digits, spaces and hyphens holding 6–20 digits. Outputs the input unchanged. */
export const accountSchema: Type<string> = type("string").narrow((value, ctx) => {
  if (value.length === 0) return ctx.reject({ problem: MESSAGES.required });
  if (value.length > ACCOUNT_MAX_INPUT_LENGTH) return ctx.reject({ problem: MESSAGES.tooLong });
  if (!ACCOUNT_INPUT_REGEX.test(value)) return ctx.reject({ problem: MESSAGES.charset });
  const digits = digitCount(value);
  if (digits < ACCOUNT_MIN_DIGITS) return ctx.reject({ problem: MESSAGES.minDigits });
  if (digits > ACCOUNT_MAX_DIGITS) return ctx.reject({ problem: MESSAGES.maxDigits });
  return true;
});

/** Built-in institution id. */
export const institutionIdSchema: Type<InstitutionId> = type
  .enumerated(...INSTITUTION_IDS)
  .configure({ message: MESSAGES.institution });

/** `AccountKind` literal. */
export const accountKindSchema: Type<AccountKind> = type.enumerated(...ACCOUNT_KINDS);

/** `SubjectCategory` literal. */
export const subjectCategorySchema: Type<SubjectCategory> = type.enumerated(...SUBJECT_CATEGORIES);

/** Serialized detection result (`DetectionPayload`). */
export const detectionSchema: Type<DetectionPayload> = type({
  institutionId: institutionIdSchema,
  kind: accountKindSchema,
  "subject?": {
    code: "string",
    category: subjectCategorySchema,
    "label?": "string",
  },
  score: type("number >= 0").narrow(isFiniteNumber),
  confidence: "'high' | 'medium' | 'low'",
  formatted: "string",
  capabilities: {
    allowsWithdrawal: "boolean",
    virtual: "boolean",
    validatedCheckDigit: "boolean | null",
  },
}) as Type<DetectionPayload>;
