import { INSTITUTION_IDS, type InstitutionId } from "../registry/institution-ids";
import type { AccountKind, Confidence, SubjectCategory } from "../types";

// Rules and messages shared by every adapter so the five schema families cannot drift.

/** Charset accepted by `accountSchema` before normalization. */
export const ACCOUNT_INPUT_REGEX = /^[\d\-\s]+$/;
export const ACCOUNT_MAX_INPUT_LENGTH = 40;
export const ACCOUNT_MIN_DIGITS = 6;
export const ACCOUNT_MAX_DIGITS = 20;

/** Korean validation messages keyed by rule. */
export const MESSAGES = {
  required: "계좌번호를 입력해주세요.",
  tooLong: "너무 긴 입력입니다.",
  charset: "숫자, 공백, 하이픈만 입력해주세요.",
  minDigits: "계좌번호 자릿수가 부족합니다.",
  maxDigits: "계좌번호 자릿수가 너무 깁니다.",
  institution: "지원하지 않는 금융기관입니다.",
  accountKind: "지원하지 않는 계좌 종류입니다.",
  subjectCategory: "지원하지 않는 과목 분류입니다.",
  finiteScore: "score 는 유한한 숫자여야 합니다.",
} as const;

/** Number of ASCII digits in the input. */
export function digitCount(value: string): number {
  return value.replace(/\D/g, "").length;
}

const ID_SET = new Set<string>(INSTITUTION_IDS);

/** Whether the value is a built-in institution id. */
export function isRegisteredInstitutionId(value: unknown): value is InstitutionId {
  return typeof value === "string" && ID_SET.has(value);
}

/** Serializable detection result validated by every `detectionSchema`. */
export interface DetectionPayload {
  readonly institutionId: InstitutionId;
  readonly kind: AccountKind;
  readonly subject?:
    | {
        readonly code: string;
        readonly category: SubjectCategory;
        readonly label?: string | undefined;
      }
    | undefined;
  readonly score: number;
  readonly confidence: Confidence;
  readonly formatted: string;
  readonly capabilities: {
    readonly allowsWithdrawal: boolean;
    readonly virtual: boolean;
    readonly validatedCheckDigit: boolean | null;
  };
}

/** Whether the value is a finite number. */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
