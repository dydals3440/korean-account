const NON_DIGIT = /[^0-9]/g;
const FULLWIDTH_DIGIT = /[\uFF10-\uFF19]/g;
const FULLWIDTH_TO_ASCII_OFFSET = 0xfee0;

const toAsciiDigit = (digit: string): string =>
  String.fromCharCode(digit.charCodeAt(0) - FULLWIDTH_TO_ASCII_OFFSET);

/**
 * Returns the digits of an account number in order, with full-width digits (０–９) converted to
 * ASCII.
 *
 * Hyphens, spaces, letters and every other character are dropped, so formatted or pasted input
 * normalizes to the same string; leading zeros are kept and the length is not checked. Every
 * detection API applies this to its input. Call it yourself before storing an account number
 * or before the position-based helpers {@link extractIdentifier}, {@link extractSubject} and
 * {@link formatAccount}.
 *
 * @param input - Raw account number. A non-string value from untyped callers yields `""`.
 * @returns The digit string, or `""` when the input has no digits.
 * @example
 * normalizeAccount("110-436-387740");     // => "110436387740"
 * normalizeAccount("１１０-436");          // => "110436"
 * normalizeAccount("신한 110 436 387740"); // => "110436387740"
 */
export function normalizeAccount(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  return input.replace(FULLWIDTH_DIGIT, toAsciiDigit).replace(NON_DIGIT, "");
}
