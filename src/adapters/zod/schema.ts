import { type ZodType, z } from "zod";
import { ACCOUNT_KINDS, SUBJECT_CATEGORIES } from "../../shared/constants";
import type { InstitutionId } from "../../registry";
import { INSTITUTION_IDS } from "../../registry/institution-ids";
import type { AccountKind, Confidence, SubjectCategory } from "../../types";

// References the pure id-literal array, not `institutions`, so consumers of
// this sub-entry alone never pull in the full registry.
const ID_SET = /* @__PURE__ */ new Set<string>(INSTITUTION_IDS);

// Every export is annotated `ZodType<T>`. Without it, the generated d.ts
// hardcodes zod v3-only types such as `z.ZodEffects`, and v4 consumers under
// `skipLibCheck: true` silently lose the schema types. The zod CI matrix
// compiles both majors.

/** Serialized detection result — the output type of `detectionSchema`. */
export interface DetectionPayload {
  readonly institutionId: InstitutionId;
  readonly kind: AccountKind;
  readonly subject?: {
    readonly code: string;
    readonly category: SubjectCategory;
    readonly label?: string;
  };
  readonly score: number;
  readonly confidence: Confidence;
  readonly formatted: string;
  readonly capabilities: {
    readonly allowsWithdrawal: boolean;
    readonly virtual: boolean;
    readonly validatedCheckDigit: boolean | null;
  };
}

/**
 * Schema for a raw Korean account-number string.
 *
 * - digits, hyphens, and spaces only
 * - 6–20 digits after normalization
 */
export const accountSchema: ZodType<string> = z
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

/**
 * Schema accepting only registered institution ids.
 *
 * Uses `z.custom`: v3's `.refine((v): v is InstitutionId => …)` narrows the
 * output via the type predicate but v4's `.refine` does not, so the same code
 * would produce different types across majors.
 */
export const institutionIdSchema: ZodType<InstitutionId> = z.custom<InstitutionId>(
  (v) => typeof v === "string" && ID_SET.has(v),
  { message: "지원하지 않는 금융기관입니다." },
);

/** Account kind schema. */
export const accountKindSchema: ZodType<AccountKind> = z.enum(ACCOUNT_KINDS);

/** Subject category schema. */
export const subjectCategorySchema: ZodType<SubjectCategory> = z.enum(SUBJECT_CATEGORIES);

/** Serialized detection result schema. */
export const detectionSchema: ZodType<DetectionPayload> = z.object({
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
