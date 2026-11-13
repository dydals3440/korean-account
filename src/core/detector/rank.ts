import type { AccountKind, DetectionResult, Institution } from "../../types";
import { prevalence } from "./prevalence";

/** Tie-break order between account kinds; higher ranks first. */
const KIND_RANK: Readonly<Record<AccountKind, number>> = {
  new: 6,
  old: 5,
  virtual: 4,
  lifetime: 3,
  "incoming-only": 2,
  "merged-legacy": 1,
};

/** Orders by score, then prevalence prior, then kind rank (all descending). */
export function compareDetections(a: DetectionResult, b: DetectionResult): number {
  return (
    b.score - a.score ||
    prevalence(b.institution) - prevalence(a.institution) ||
    KIND_RANK[b.kind] - KIND_RANK[a.kind]
  );
}

/** Sorts candidates and drops low-confidence ones when the top result is high or medium. */
export function rankDetections<TInstitution extends Institution>(
  results: readonly DetectionResult<TInstitution>[],
): readonly DetectionResult<TInstitution>[] {
  // Sorts a copy instead of `toSorted` to keep pre-ES2023 runtimes supported.
  // oxlint-disable-next-line unicorn/no-array-sort
  const sorted = [...results].sort(compareDetections);
  const topConfidence = sorted[0]?.confidence;
  if (topConfidence === "high" || topConfidence === "medium") {
    return sorted.filter((result) => result.confidence !== "low");
  }
  return sorted;
}
