import type { AccountPattern } from "../types";

/**
 * Slices the pattern's `identifierPosition` range out of normalized digits.
 *
 * - Returns an empty string when the pattern has no `identifierPosition`.
 * - Returns the reachable prefix when digits end inside the identifier range
 *   (mid-input).
 *
 * @example
 * extractIdentifier("110436387740", {
 *   identifierPosition: { start: 0, length: 3 },
 * }); // "110"
 *
 * @example Identifier in the middle of the number
 * extractIdentifier("00197202762901013", {
 *   identifierPosition: { start: 3, length: 2 },
 * }); // "97"
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
