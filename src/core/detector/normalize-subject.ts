import type { AccountKind, CmsServices, Subject } from "../../types";
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

/** Subject with withdrawal and label defaults resolved. */
export type NormalizedSubject = Subject & {
  readonly allowsWithdrawal: boolean;
  readonly label: string;
};

/**
 * Fills a subject's defaults. Withdrawal comes from the subject, then the pattern's PDF
 * `services`, then the kind when the pattern declares no services.
 *
 * @example
 * normalizeSubject({ code: "01", category: "ordinary" }, "new");
 * // { code: "01", category: "ordinary", allowsWithdrawal: true, virtual: false, label: "보통예금" }
 */
export function normalizeSubject(
  subject: Subject,
  kind: AccountKind,
  patternServices?: CmsServices | null,
): NormalizedSubject {
  const virtual = subject.virtual ?? false;
  const allowsWithdrawal =
    subject.allowsWithdrawal ??
    subject.services?.directDebit ??
    patternServices?.directDebit ??
    (!virtual && isDebitableKind(kind));
  const label = subject.label ?? subjectCategoryLabels[subject.category];
  return { ...subject, allowsWithdrawal, virtual, label };
}
