import type { AccountKind, Confidence, DetectionResult, Institution } from "../../types";
import { prevalence } from "./prevalence";

/** A scored candidate before ranking decides whether it is ambiguous. */
export type RankableDetection<TInstitution extends Institution> = Omit<
  DetectionResult<TInstitution>,
  "ambiguous"
>;

type ComparableDetection = Pick<DetectionResult, "score" | "institution" | "kind">;

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
export function compareDetections(a: ComparableDetection, b: ComparableDetection): number {
  return (
    b.score - a.score ||
    prevalence(b.institution) - prevalence(a.institution) ||
    KIND_RANK[b.kind] - KIND_RANK[a.kind]
  );
}

/**
 * Sorts candidates, drops low-confidence ones when the top result is high or medium,
 * and marks candidates that share their confidence band with another institution.
 */
export function rankDetections<TInstitution extends Institution>(
  candidates: readonly RankableDetection<TInstitution>[],
): readonly DetectionResult<TInstitution>[] {
  // Sorts a copy instead of `toSorted` to keep pre-ES2023 runtimes supported.
  // oxlint-disable-next-line unicorn/no-array-sort
  const sorted = [...candidates].sort(compareDetections);
  const topConfidence = sorted[0]?.confidence;
  const isTopReliable = topConfidence === "high" || topConfidence === "medium";
  const kept = isTopReliable
    ? sorted.filter((candidate) => candidate.confidence !== "low")
    : sorted;

  const institutionIdsByConfidence = new Map<Confidence, Set<string>>();
  for (const candidate of kept) {
    const ids = institutionIdsByConfidence.get(candidate.confidence) ?? new Set<string>();
    ids.add(candidate.institution.id);
    institutionIdsByConfidence.set(candidate.confidence, ids);
  }

  return kept.map((candidate) => ({
    ...candidate,
    ambiguous: (institutionIdsByConfidence.get(candidate.confidence)?.size ?? 0) > 1,
  }));
}
