const ASCII_DIGIT_ZERO = 48;
const ASCII_DIGIT_NINE = 57;

/**
 * Extracts ASCII digits from an arbitrary string, preserving order.
 *
 * Hyphens, spaces, dots, Hangul, and any other non-digit characters are
 * removed. Non-string input returns an empty string.
 *
 * @example
 * normalizeAccount("110-436-387740"); // "110436387740"
 * normalizeAccount("110 436 387740"); // "110436387740"
 * normalizeAccount("acct 110-436");   // "110436"
 * normalizeAccount("");               // ""
 */
export function normalizeAccount(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  let normalized = "";

  for (let index = 0; index < input.length; index += 1) {
    const charCode = input.charCodeAt(index);
    const isAsciiDigit = charCode >= ASCII_DIGIT_ZERO && charCode <= ASCII_DIGIT_NINE;

    if (isAsciiDigit) {
      normalized += input[index];
    }
  }

  return normalized;
}
