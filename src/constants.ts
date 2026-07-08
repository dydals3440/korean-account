import type { AccountKind, Confidence, InstitutionCategory, SubjectCategory } from "./types";

/**
 * `AccountKind` 리터럴 배열.
 *
 * `types.ts` 의 union 이 단일 진실이고, 이 배열은 그것의 런타임 표현이다. 한쪽만
 * 고치면 `satisfies` 가 (배열 → union) 방향을, `constants.types.spec.ts` 의
 * `toEqualTypeOf` 가 (union → 배열) 방향을 잡는다.
 *
 * zod 스키마가 `.options` 접근자 대신 이걸 쓴다 — v3/v4 어느 쪽에서도 동작하도록
 * 스키마를 `ZodType<T>` 로 좁혀 두었기 때문이다.
 */
export const ACCOUNT_KINDS = [
  "new",
  "old",
  "virtual",
  "lifetime",
  "incoming-only",
  "merged-legacy",
] as const satisfies readonly AccountKind[];

/** `SubjectCategory` 리터럴 배열. [[ACCOUNT_KINDS]] 와 같은 규약. */
export const SUBJECT_CATEGORIES = [
  "ordinary",
  "treasury",
  "savings",
  "free-savings",
  "household-current",
  "current",
  "corporate-free",
  "yes",
  "linked",
  "installment",
  "trust",
  "isa",
  "other",
] as const satisfies readonly SubjectCategory[];

/** `InstitutionCategory` 리터럴 배열. */
export const INSTITUTION_CATEGORIES = [
  "bank",
  "non-bank",
  "securities",
  "clearing",
] as const satisfies readonly InstitutionCategory[];

/** `Confidence` 리터럴 배열. 높은 신뢰도부터. */
export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const satisfies readonly Confidence[];
