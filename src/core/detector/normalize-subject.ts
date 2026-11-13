import type { AccountKind, ResolvedSubject, Subject } from "../../types";
import { subjectCategoryLabels } from "../labels";

const NON_DEBITABLE_KINDS: ReadonlySet<AccountKind> = new Set([
  "virtual",
  "incoming-only",
  "lifetime",
]);

/** Whether accounts of this kind allow direct debit by default. */
export function isDebitableKind(kind: AccountKind): boolean {
  return !NON_DEBITABLE_KINDS.has(kind);
}

/** Subject with withdrawal, virtual and label defaults resolved. */
export type NormalizedSubject = ResolvedSubject;

/**
 * Fills a subject's label and virtual defaults; withdrawal follows the kind unless the subject
 * sets it. Detection resolves withdrawal with the pattern's services instead (`resolveSubject`).
 *
 * @example
 * normalizeSubject({ code: "01", category: "ordinary" }, "new");
 * // { code: "01", category: "ordinary", allowsWithdrawal: true, virtual: false, label: "보통예금" }
 */
export function normalizeSubject(subject: Subject, kind: AccountKind): NormalizedSubject {
  const virtual = subject.virtual ?? false;
  return resolveSubject(subject, subject.allowsWithdrawal ?? (!virtual && isDebitableKind(kind)));
}

/** Fills a subject's label and virtual defaults with an already resolved withdrawal value. */
export function resolveSubject(subject: Subject, allowsWithdrawal: boolean): NormalizedSubject {
  const virtual = subject.virtual ?? false;
  const label = subject.label ?? subjectCategoryLabels[subject.category];
  return { ...subject, allowsWithdrawal, virtual, label };
}
