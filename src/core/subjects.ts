import type { AccountKind, Subject, SubjectCategory } from "../types";

/** 카테고리별 한국어 표시명. UI에서 그대로 사용 가능. */
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

/** 계좌 종류별 한국어 표시명. */
export const accountKindLabels = {
  new: "신계좌",
  old: "구계좌",
  virtual: "가상계좌",
  lifetime: "평생계좌",
  "incoming-only": "입금전용",
  "merged-legacy": "구통합(합병 전)",
} as const satisfies Record<AccountKind, string>;

/**
 * `Subject` 객체에 기본값을 적용해 정규화한다.
 *
 * - `allowsWithdrawal` 은 명시되지 않으면 kind 로부터 유도한다 — `virtual: true`
 *   이거나 kind 가 `virtual` / `incoming-only` / `lifetime` 이면 false.
 *   `createDetector` 의 `computeCapabilities` 와 같은 정의를 쓴다.
 * - `label` 기본은 카테고리 라벨.
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

/** type-safe `Subject` 생성 헬퍼. */
export function defineSubject(input: Subject): Subject {
  return input;
}
