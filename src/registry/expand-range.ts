/** Expands a two-digit numeric code range into 0-padded strings (e.g. 60~69 → ["60",...,"69"]). */
export function expandTwoDigitRange(from: number, to: number): readonly string[] {
  const codes: string[] = [];
  for (let n = from; n <= to; n += 1) {
    codes.push(n.toString().padStart(2, "0"));
  }
  return codes;
}
