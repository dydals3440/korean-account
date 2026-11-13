const NON_DIGIT = /[^0-9]/g;

/**
 * Keeps only ASCII digits, in order. Non-string input returns `""`.
 *
 * @example
 * normalizeAccount("110-436-387740"); // "110436387740"
 * normalizeAccount("acct 110 436");   // "110436"
 */
export function normalizeAccount(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  return input.replace(NON_DIGIT, "");
}
