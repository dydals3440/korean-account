import type { AccountPattern, Subject } from "../../types";

/**
 * Returns the ledger subject (계정과목) declared on the pattern whose `code` equals the digits at
 * `pattern.subjectPosition`.
 *
 * The subject is returned as declared, without the `label` and `allowsWithdrawal` defaults that
 * detection results fill in; read `result.subject` from a detection for those. When several
 * subjects share a code, the first wins. Positions count digits, so pass
 * {@link normalizeAccount} output.
 *
 * @param digits - Normalized account digits.
 * @param pattern - Any object with `subjectPosition` and `subjects`, typically from
 *   {@link pickPattern}.
 * @returns The subject, or `null` when the pattern declares no subjects, the input ends before
 *   the span does, or no code matches.
 * @example
 * const shinhanNew = pickPattern("shinhan", { kind: "new" });
 * if (shinhanNew !== null) {
 *   extractSubject("110436387740", shinhanNew); // => { code: "110", category: "savings" }
 *   extractSubject("999436387740", shinhanNew); // => null
 * }
 */
export function extractSubject(
  digits: string,
  pattern: Pick<AccountPattern, "subjectPosition" | "subjects">,
): Subject | null {
  const { subjectPosition: position, subjects } = pattern;
  if (position === undefined || subjects === undefined) {
    return null;
  }

  const end = position.start + position.length;
  if (digits.length < end) {
    return null;
  }

  const code = digits.slice(position.start, end);
  return subjects.find((subject) => subject.code === code) ?? null;
}
