import type { AccountPattern } from "../../types";

/**
 * Returns the digits at `pattern.identifierPosition`, cut short when the input ends early.
 * Returns `""` when the pattern has no identifier position.
 *
 * @example
 * extractIdentifier("110436387740", { identifierPosition: { start: 0, length: 3 } }); // "110"
 */
export function extractIdentifier(
  digits: string,
  pattern: Pick<AccountPattern, "identifierPosition">,
): string {
  const position = pattern.identifierPosition;
  if (position === undefined) {
    return "";
  }
  return digits.slice(position.start, position.start + position.length);
}
