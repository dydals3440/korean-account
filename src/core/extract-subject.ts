import type { AccountPattern, Subject } from "../types";

/**
 * Reads the subject code at the pattern's `subjectPosition` and returns the
 * matching `Subject`.
 *
 * Returns `null` when the pattern declares no `subjectPosition` / `subjects`,
 * when digits end before the subject range (mid-input), or when the extracted
 * code matches none of `subjects[].code`.
 *
 * @example
 * const pattern = pickPattern("shinhan", { kind: "new" })!;
 * extractSubject("110436387740", pattern);
 * // → { code: "110", category: "savings", ... }
 */
export function extractSubject(
  digits: string,
  pattern: Pick<AccountPattern, "subjectPosition" | "subjects">,
): Subject | null {
  const pos = pattern.subjectPosition;
  const subjects = pattern.subjects;

  if (!pos || !subjects || subjects.length === 0) {
    return null;
  }

  const end = pos.start + pos.length;

  if (digits.length < end) {
    return null;
  }

  const code = digits.slice(pos.start, end);

  return subjects.find((s) => s.code === code) ?? null;
}
