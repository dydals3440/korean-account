import type { AccountPattern } from "../../types";

/**
 * Returns the digits at `pattern.identifierPosition`, cut short when the input ends early.
 * Returns `null` when the pattern has no identifier position or the input stops before it.
 *
 * @example
 * extractIdentifier("110436387740", { identifierPosition: { start: 0, length: 3 } }); // "110"
 */
export function extractIdentifier(
  digits: string,
  pattern: Pick<AccountPattern, "identifierPosition">,
): string | null {
  const position = pattern.identifierPosition;
  if (position === undefined || digits.length <= position.start) {
    return null;
  }
  return digits.slice(position.start, position.start + position.length);
}
