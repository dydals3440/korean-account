import type { AccountKind, SubjectCategory } from "../types";

/**
 * Korean display label per `SubjectCategory`; the default for `Subject.label`.
 *
 * @example
 * subjectCategoryLabels.ordinary; // "보통예금"
 * subjectCategoryLabels["corporate-free"]; // "기업자유"
 */
export const subjectCategoryLabels = {
  ordinary: "보통예금",
  treasury: "국고",
  savings: "저축예금",
  "free-savings": "자유저축",
  "household-current": "가계당좌",
  current: "당좌",
  "corporate-free": "기업자유",
  yes: "YES",
  linked: "연계예금",
  installment: "적금",
  trust: "신탁",
  isa: "ISA",
  other: "기타",
} as const satisfies Record<SubjectCategory, string>;

/**
 * Korean display label per `AccountKind`.
 *
 * @example
 * const best = detectBest("1712-3456-7890");
 * best && accountKindLabels[best.kind]; // "가상계좌"
 */
export const accountKindLabels = {
  new: "신계좌",
  old: "구계좌",
  virtual: "가상계좌",
  lifetime: "평생계좌",
  "incoming-only": "입금전용",
  "merged-legacy": "구통합(합병 전)",
} as const satisfies Record<AccountKind, string>;
