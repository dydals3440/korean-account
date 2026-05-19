/**
 * 임의 문자열에서 ASCII 숫자만 순서대로 추출해 반환한다.
 *
 * 하이픈·공백·점·한글 등은 모두 제거된다. 입력이 문자열이 아니면
 * 빈 문자열을 반환한다 (안전).
 *
 * @example
 * normalize("110-436-387740");        // "110436387740"
 * normalize("110 436 387740");        // "110436387740"
 * normalize("한글110과 숫자436");      // "110436"
 * normalize("");                       // ""
 */
const ASCII_DIGIT_ZERO = 48;
const ASCII_DIGIT_NINE = 57;

export function normalize(input: string): string {
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
