import type { ScoringWeights } from "../../types";
import { DEFAULT_WEIGHTS, type ResolvedScoringWeights } from "./score";

const DEFAULT_LIMIT = 5;
const DEFAULT_MIN_SCORE = 1;

/**
 * Merges scoring overrides over the defaults; `undefined` keeps the default.
 *
 * @throws {RangeError} When a weight is not a finite number ≥ 0.
 */
export function resolveWeights(scoring: ScoringWeights): ResolvedScoringWeights {
  const resolve = (key: keyof ScoringWeights): number => {
    const weight = scoring[key] ?? DEFAULT_WEIGHTS[key];
    if (!Number.isFinite(weight) || weight < 0) {
      throw new RangeError(
        `korean-account: scoring.${key} must be a finite number >= 0 (received ${weight})`,
      );
    }
    return weight;
  };

  return {
    lengthExact: resolve("lengthExact"),
    lengthNear: resolve("lengthNear"),
    identifierMatch: resolve("identifierMatch"),
    subjectMatch: resolve("subjectMatch"),
    additionalRule: resolve("additionalRule"),
    globalRule: resolve("globalRule"),
    branchRuleMatch: resolve("branchRuleMatch"),
    kindNewBonus: resolve("kindNewBonus"),
  };
}

/** @throws {RangeError} When `limit` is not a non-negative integer or `Infinity`. */
export function resolveLimit(limit: number | undefined): number {
  if (limit === undefined) {
    return DEFAULT_LIMIT;
  }
  const isValid = limit === Number.POSITIVE_INFINITY || (Number.isInteger(limit) && limit >= 0);
  if (!isValid) {
    throw new RangeError(
      `korean-account: limit must be a non-negative integer or Infinity (received ${limit})`,
    );
  }
  return limit;
}

/** @throws {RangeError} When `minScore` is `NaN`. */
export function resolveMinScore(minScore: number | undefined): number {
  if (minScore === undefined) {
    return DEFAULT_MIN_SCORE;
  }
  if (Number.isNaN(minScore)) {
    throw new RangeError("korean-account: minScore must be a number (received NaN)");
  }
  return minScore;
}
