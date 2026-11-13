import type { Subject } from "../../types";

/**
 * Returns the given ledger subject (계정과목) unchanged, type-checked as a {@link Subject}.
 *
 * List subjects in `pattern.subjects`; one matches when its `code` equals the digits at
 * `pattern.subjectPosition`, so `code` must be zero-padded to that span's length. A match adds
 * `scoring.subjectMatch` points, counts as evidence for `confidence`, and appears as
 * `result.subject` with defaults filled: `label` from the category, and `allowsWithdrawal` from
 * `services.directDebit` of the subject, then of the pattern, then from the account kind.
 *
 * @param subject - Subject data; `services` lists per-code exceptions to the pattern's columns.
 * @returns The same object.
 * @example
 * const savings = defineSubject({ code: "13", category: "savings" });
 * const noDebit = defineSubject({ code: "91", category: "other", allowsWithdrawal: false });
 * // In a pattern: { ..., subjectPosition: { start: 3, length: 2 }, subjects: [savings, noDebit] }
 * // A detector over that institution then reports, for "123-13-456789":
 * // subject => { code: "13", category: "savings", label: "저축예금", allowsWithdrawal: true, ... }
 */
export function defineSubject(subject: Subject): Subject {
  return subject;
}
