import type { AccountPattern, Subject } from "../types";

/**
 * 정규화된 digits에서 패턴의 `subjectPosition` 자리의 값을 추출해 일치하는
 * `Subject`를 반환한다.
 *
 * - 패턴에 `subjectPosition` / `subjects`가 없으면 `null`.
 * - digits가 subject 위치 끝에 도달하지 못하면 `null` (입력 중).
 * - 추출 값이 `subjects[].code`에 일치하지 않으면 `null`.
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
