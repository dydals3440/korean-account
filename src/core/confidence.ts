import type { Confidence } from "../types";

/**
 * 점수를 신뢰도 문자열로 변환한다.
 * - score ≥ 7 → high
 * - 4 ≤ score < 7 → medium
 * - 그 외 → low
 *
 * 임계값 (7 / 4) 은 기본 가중치 (`DEFAULT_WEIGHTS`) 기준으로 보정된 값이다.
 * `createDetector({ scoring })` 으로 가중치를 크게 바꾸면 밴드 의미가 달라질 수
 * 있으므로, 그 경우 confidence 대신 raw `score` 로 직접 판단하는 것을 권장한다.
 *
 * @example
 * scoreToConfidence(9); // "high"
 * scoreToConfidence(5); // "medium"
 * scoreToConfidence(2); // "low"
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
