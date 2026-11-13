import type { Confidence } from "../../types";

/** Order of confidence bands; higher is stronger. */
export const CONFIDENCE_RANK: Readonly<Record<Confidence, number>> = { high: 3, medium: 2, low: 1 };

const HIGH_CONFIDENCE_MIN_SCORE = 7;
const MEDIUM_CONFIDENCE_MIN_SCORE = 4;

/** Maps a score to a confidence band calibrated for the default weights. */
export function scoreToConfidence(score: number): Confidence {
  if (score >= HIGH_CONFIDENCE_MIN_SCORE) {
    return "high";
  }
  if (score >= MEDIUM_CONFIDENCE_MIN_SCORE) {
    return "medium";
  }
  return "low";
}
