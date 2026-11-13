import type { AccountPattern, Subject } from "../../types";

/**
 * Returns the pattern's subject whose code sits at `subjectPosition`, or `null`
 * when the pattern declares no subjects, the input is too short, or no code matches.
 *
 * @example
 * extractSubject("110436387740", pickPattern("shinhan", { kind: "new" })!);
 * // { code: "110", category: "savings", ... }
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
