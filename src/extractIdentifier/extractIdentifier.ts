import type { AccountPattern } from "../types";

/**
 * 정규화된 digits에서 패턴의 `identifierPosition` 범위 부분을 잘라 반환한다.
 *
 * - 패턴에 `identifierPosition`이 없으면 빈 문자열.
 * - digits가 식별 위치 끝에 도달하지 못하면 도달한 부분까지만 (입력 중간 단계).
 *
 * @example
 * extractIdentifier("110436387740", {
 *   template,
 *   kind: "new",
 *   identifierPosition: { start: 0, length: 3 },
 * }); // "110"
 *
 * @example 중간 식별
 * extractIdentifier("00197202762901013", {
 *   identifierPosition: { start: 3, length: 2 },
 *   ...
 * }); // "02"
 */
export function extractIdentifier(
  digits: string,
  pattern: Pick<AccountPattern, "identifierPosition">,
): string {
  const pos = pattern.identifierPosition;
  if (!pos) {
    return "";
  }

  const { start, length } = pos;

  if (start >= digits.length) {
    return "";
  }

  return digits.slice(start, Math.min(start + length, digits.length));
}
