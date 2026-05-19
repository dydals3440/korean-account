import { z } from "zod";
import { type InstitutionId, institutions } from "../data";

const ID_SET = new Set<string>(institutions.map((i) => i.id));

/**
 * 한국 계좌번호 raw 문자열 스키마.
 *
 * - 숫자/하이픈/공백만 허용
 * - 정규화된 숫자 길이 6~20
 */
export const accountSchema = z
  .string()
  .min(1, "계좌번호를 입력해주세요.")
  .max(40, "너무 긴 입력입니다.")
  .regex(/^[\d\-\s]+$/, "숫자와 하이픈만 입력해주세요.")
  .refine((v) => v.replace(/\D/g, "").length >= 6, {
    message: "계좌번호 자릿수가 부족합니다.",
  })
  .refine((v) => v.replace(/\D/g, "").length <= 20, {
    message: "계좌번호 자릿수가 너무 깁니다.",
  });

/** 레지스트리에 등록된 institution id만 허용하는 스키마. */
export const institutionIdSchema = z.string().refine((v): v is InstitutionId => ID_SET.has(v), {
  message: "지원하지 않는 금융기관입니다.",
});

/** 계좌 종류 스키마. */
export const accountKindSchema = z.enum([
  "new",
  "old",
  "virtual",
  "lifetime",
  "incoming-only",
  "merged-legacy",
]);

/** 계정과목 카테고리 스키마. */
export const subjectCategorySchema = z.enum([
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
]);

/** 직렬화된 detection 결과 스키마. */
export const detectionSchema = z.object({
  institutionId: institutionIdSchema,
  kind: accountKindSchema,
  subject: z
    .object({
      code: z.string(),
      category: subjectCategorySchema,
      label: z.string().optional(),
    })
    .optional(),
  score: z.number().min(0),
  confidence: z.enum(["high", "medium", "low"]),
  formatted: z.string(),
  capabilities: z.object({
    allowsWithdrawal: z.boolean(),
    virtual: z.boolean(),
    validatedCheckDigit: z.boolean().nullable(),
  }),
});
