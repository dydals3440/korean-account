import type { AccountKind, Subject, SubjectCategory } from "../types";

/** Korean display names per subject category, ready for UI use. */
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

/** Korean display names per account kind. */
export const accountKindLabels = {
  new: "신계좌",
  old: "구계좌",
  virtual: "가상계좌",
  lifetime: "평생계좌",
  "incoming-only": "입금전용",
  "merged-legacy": "구통합(합병 전)",
} as const satisfies Record<AccountKind, string>;

/**
 * Applies defaults to a `Subject`.
 *
 * - `allowsWithdrawal` is derived from the kind when unspecified — false for
 *   `virtual: true` subjects and for `virtual` / `incoming-only` / `lifetime`
 *   kinds. Uses the same definition as the detector's capability computation.
 * - `label` defaults to the category label.
 */
export function normalizeSubject(
  subject: Subject,
  kind: AccountKind,
): Subject & { readonly allowsWithdrawal: boolean; readonly label: string } {
  const virtual = subject.virtual ?? false;
  const allowsWithdrawal =
    subject.allowsWithdrawal ??
    (!virtual && kind !== "incoming-only" && kind !== "virtual" && kind !== "lifetime");
  const label = subject.label ?? subjectCategoryLabels[subject.category];
  return { ...subject, allowsWithdrawal, virtual, label };
}

/** Type-safe `Subject` construction helper. */
export function defineSubject(input: Subject): Subject {
  return input;
}
