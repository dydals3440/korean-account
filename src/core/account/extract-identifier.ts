import type { AccountPattern } from "../../types";

/**
 * Returns the digits at `pattern.identifierPosition`, the span that identifies the institution
 * or product line, such as Kakao Bank's leading `3333`.
 *
 * The span is only sliced, not checked against `pattern.identifiers` or `identifierRange`.
 * Positions count digits, so pass {@link normalizeAccount} output; hyphens would shift them.
 * Like {@link extractSubject}, it returns `null` until the input covers the whole span.
 *
 * @param digits - Normalized account digits.
 * @param pattern - Any object with `identifierPosition`, typically an `AccountPattern`.
 * @returns The identifier digits, or `null` when the pattern has no `identifierPosition` or the
 *   input does not cover the whole span yet.
 * @example
 * const pattern = { identifierPosition: { start: 0, length: 4 } };
 * extractIdentifier("3333123456789", pattern); // => "3333"
 * extractIdentifier("333", pattern);           // => null (the span is not complete yet)
 * extractIdentifier("", pattern);              // => null
 */
export function extractIdentifier(
  digits: string,
  pattern: Pick<AccountPattern, "identifierPosition">,
): string | null {
  const position = pattern.identifierPosition;
  if (position === undefined || digits.length < position.start + position.length) {
    return null;
  }
  return digits.slice(position.start, position.start + position.length);
}
