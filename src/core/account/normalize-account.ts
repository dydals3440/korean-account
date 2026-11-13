const NON_DIGIT = /[^0-9]/g;
const FULLWIDTH_DIGIT = /[\uFF10-\uFF19]/g;
const FULLWIDTH_TO_ASCII_OFFSET = 0xfee0;

const toAsciiDigit = (digit: string): string =>
  String.fromCharCode(digit.charCodeAt(0) - FULLWIDTH_TO_ASCII_OFFSET);

/**
 * Keeps only digits, in order; full-width digits (０–９) count as ASCII digits.
 * Non-string input returns `""`.
 *
 * @example
 * normalizeAccount("110-436-387740"); // "110436387740"
 * normalizeAccount("１１０-436");      // "110436"
 */
export function normalizeAccount(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  return input.replace(FULLWIDTH_DIGIT, toAsciiDigit).replace(NON_DIGIT, "");
}
