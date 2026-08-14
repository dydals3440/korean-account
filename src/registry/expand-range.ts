/** 2자리 숫자 코드 범위를 0-padded 문자열 배열로 펼친다 (e.g. 60~69 → ["60",...,"69"]). */
export function expandTwoDigitRange(from: number, to: number): readonly string[] {
  const codes: string[] = [];
  for (let n = from; n <= to; n += 1) {
    codes.push(n.toString().padStart(2, "0"));
  }
  return codes;
}
