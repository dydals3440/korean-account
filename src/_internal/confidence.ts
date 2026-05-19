import type { Confidence } from "../types";

/**
 * 점수를 신뢰도 문자열로 변환한다.
 * - score ≥ 7 → high
 * - 4 ≤ score < 7 → medium
 * - 그 외 → low
 */
export function scoreToConfidence(score: number): Confidence {
  if (score >= 7) {
    return "high";
  }
  if (score >= 4) {
    return "medium";
  }
  return "low";
}
