import { type ZodType, z } from "zod";
import { ACCOUNT_KINDS, SUBJECT_CATEGORIES } from "../constants";
import type { InstitutionId } from "../data";
import { INSTITUTION_IDS } from "../data/institutionIds";
import type { AccountKind, Confidence, SubjectCategory } from "../types";

// `institutions` 가 아니라 id 리터럴 배열을 참조한다 — 이 서브엔트리만 쓰는
// 소비자에게 94 KB 레지스트리가 딸려 가지 않도록.
const ID_SET = /* @__PURE__ */ new Set<string>(INSTITUTION_IDS);

// 모든 export 에 `ZodType<T>` 를 명시한다. 없으면 생성된 d.ts 가 `z.ZodEffects` 같은
// zod v3 전용 타입을 하드코딩해, v4 소비자가 `skipLibCheck: true` 아래서 조용히
// 스키마 타입을 잃는다. CI 의 zod 매트릭스가 두 메이저를 모두 컴파일한다.

/** 직렬화된 detection 결과. `detectionSchema` 의 출력 타입. */
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
 * 한국 계좌번호 raw 문자열 스키마.
 *
 * - 숫자/하이픈/공백만 허용
 * - 정규화된 숫자 길이 6~20
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
 * 레지스트리에 등록된 institution id만 허용하는 스키마.
 *
 * `z.custom` 을 쓴다. v3 의 `.refine((v): v is InstitutionId => …)` 는 타입 서술로
 * 출력을 좁히지만 v4 의 `.refine` 은 좁히지 않아, 같은 코드가 두 메이저에서 다른
 * 타입을 낸다.
 */
export const institutionIdSchema: ZodType<InstitutionId> = z.custom<InstitutionId>(
  (v) => typeof v === "string" && ID_SET.has(v),
  { message: "지원하지 않는 금융기관입니다." },
);

/** 계좌 종류 스키마. */
export const accountKindSchema: ZodType<AccountKind> = z.enum(ACCOUNT_KINDS);

/** 계정과목 카테고리 스키마. */
export const subjectCategorySchema: ZodType<SubjectCategory> = z.enum(SUBJECT_CATEGORIES);

/** 직렬화된 detection 결과 스키마. */
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
