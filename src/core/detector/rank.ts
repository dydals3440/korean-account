import type { AccountKind, Confidence, DetectionResult, Institution } from "../../types";
import { prevalence } from "./prevalence";

/** A scored candidate before ranking decides whether it is ambiguous. */
export type RankableDetection<TInstitution extends Institution> = Omit<
  DetectionResult<TInstitution>,
  "ambiguous"
>;

type ComparableDetection = Pick<DetectionResult, "confidence" | "score" | "institution" | "kind">;

/** Institution and band of every match, before option filters; decides `ambiguous`. */
export type BandMember = Pick<DetectionResult, "confidence" | "institution">;

const CONFIDENCE_RANK: Readonly<Record<Confidence, number>> = { high: 3, medium: 2, low: 1 };

/** Tie-break order between account kinds; higher ranks first. */
const KIND_RANK: Readonly<Record<AccountKind, number>> = {
  new: 6,
  old: 5,
  virtual: 4,
  lifetime: 3,
  "incoming-only": 2,
  "merged-legacy": 1,
};

/**
 * Orders by confidence band, then score, prevalence prior and kind rank (all descending).
 * The band comes first so an unevidenced `low` match never outranks an evidenced one.
 */
export function compareDetections(a: ComparableDetection, b: ComparableDetection): number {
  return (
    CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence] ||
    b.score - a.score ||
    prevalence(b.institution) - prevalence(a.institution) ||
    KIND_RANK[b.kind] - KIND_RANK[a.kind]
  );
}

/**
 * Sorts candidates, drops low-confidence ones when the top result is high or medium, and marks
 * candidates whose band holds another institution among `bandMembers`.
 */
export function rankDetections<TInstitution extends Institution>(
  candidates: readonly RankableDetection<TInstitution>[],
  bandMembers: readonly BandMember[],
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
  for (const member of bandMembers) {
    const ids = institutionIdsByConfidence.get(member.confidence) ?? new Set<string>();
    ids.add(member.institution.id);
    institutionIdsByConfidence.set(member.confidence, ids);
  }

  return kept.map((candidate) => ({
    ...candidate,
    ambiguous: (institutionIdsByConfidence.get(candidate.confidence)?.size ?? 0) > 1,
  }));
}
