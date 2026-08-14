import type { Confidence } from "../types";

/**
 * Maps a raw score onto a confidence band.
 * - score ≥ 7 → high
 * - 4 ≤ score < 7 → medium
 * - otherwise → low
 *
 * The thresholds (7 / 4) are calibrated against the default weights
 * (`DEFAULT_WEIGHTS`). If you override `scoring` heavily via
 * `createDetector`, the bands lose their meaning — judge by the raw `score`
 * instead.
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
