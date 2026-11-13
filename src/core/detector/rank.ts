import type {
  AccountKind,
  AccountPattern,
  Confidence,
  DetectionCapabilities,
  DetectionResult,
  Institution,
  ResolvedSubject,
} from "../../types";
import { CONFIDENCE_RANK } from "./confidence";

/**
 * A scored candidate with the ranking facts that stay out of the public result. One fixed shape
 * (`subject` is `null` when absent) keeps the per-candidate objects on V8's fast path.
 */
export interface RankableCandidate<TInstitution extends Institution> {
  readonly institution: TInstitution;
  readonly matchedPattern: AccountPattern;
  readonly kind: AccountKind;
  readonly subject: ResolvedSubject | null;
  readonly formatted: string;
  readonly score: number;
  readonly confidence: Confidence;
  readonly capabilities: DetectionCapabilities;
  /** Primary sort key from {@link rankKey}: confidence band, then evidence. */
  readonly rankKey: number;
  /** `prevalence(institution)`, computed once instead of per comparison. */
  readonly prior: number;
  /** The matched pattern belongs to `institution` rather than being rerouted to it. */
  readonly isOwnPattern: boolean;
}

/**
 * Combines band and evidence into one number: a higher band always wins, and within a band a
 * match backed by an identifier, subject code or branch condition beats one backed by length.
 */
export function rankKey(confidence: Confidence, hasEvidence: boolean): number {
  return CONFIDENCE_RANK[confidence] * 2 + (hasEvidence ? 1 : 0);
}

/** Institution and band of every match, before option filters; decides `ambiguous`. */
export type BandMember = Pick<DetectionResult, "confidence" | "institution">;

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
 * Orders by confidence band, then evidence, score, prevalence prior, kind rank and finally the
 * institution's own pattern over a rerouted one (all descending). Band and evidence come first
 * so a match backed only by length never outranks one backed by its digits.
 */
function compareCandidates<TInstitution extends Institution>(
  a: RankableCandidate<TInstitution>,
  b: RankableCandidate<TInstitution>,
): number {
  return (
    b.rankKey - a.rankKey ||
    b.score - a.score ||
    b.prior - a.prior ||
    KIND_RANK[b.kind] - KIND_RANK[a.kind] ||
    Number(b.isOwnPattern) - Number(a.isOwnPattern)
  );
}

/** The public result without the ranking fields; `subject` is omitted rather than `null`. */
function toDetectionResult<TInstitution extends Institution>(
  candidate: RankableCandidate<TInstitution>,
  ambiguous: boolean,
): DetectionResult<TInstitution> {
  const {
    subject,
    rankKey: _rankKey,
    prior: _prior,
    isOwnPattern: _isOwnPattern,
    ...result
  } = candidate;
  return subject === null ? { ...result, ambiguous } : { ...result, subject, ambiguous };
}

/**
 * Sorts candidates, keeps the best one per institution, drops low-confidence ones when the top
 * result is high or medium, cuts to `limit`, and marks a result ambiguous when another
 * institution's strongest band among `bandMembers` equals the result's band.
 */
export function rankDetections<TInstitution extends Institution>(
  candidates: readonly RankableCandidate<TInstitution>[],
  bandMembers: readonly BandMember[],
  limit: number,
): readonly DetectionResult<TInstitution>[] {
  // Sorts a copy instead of `toSorted` to keep pre-ES2023 runtimes supported.
  // oxlint-disable-next-line unicorn/no-array-sort
  const sorted = [...candidates].sort(compareCandidates);
  const seenIds = new Set<string>();
  const unique = sorted.filter((candidate) => {
    const isFirst = !seenIds.has(candidate.institution.id);
    seenIds.add(candidate.institution.id);
    return isFirst;
  });

  const topConfidence = unique[0]?.confidence;
  const isTopReliable = topConfidence === "high" || topConfidence === "medium";
  const kept = isTopReliable
    ? unique.filter((candidate) => candidate.confidence !== "low")
    : unique;

  const bestBandById = new Map<string, number>();
  for (const { institution, confidence } of bandMembers) {
    const band = CONFIDENCE_RANK[confidence];
    bestBandById.set(institution.id, Math.max(band, bestBandById.get(institution.id) ?? band));
  }
  const hasRivalInBand = (institutionId: string, band: number): boolean => {
    for (const [id, bestBand] of bestBandById) {
      if (bestBand === band && id !== institutionId) {
        return true;
      }
    }
    return false;
  };

  return kept
    .slice(0, limit)
    .map((candidate) =>
      toDetectionResult(
        candidate,
        hasRivalInBand(candidate.institution.id, CONFIDENCE_RANK[candidate.confidence]),
      ),
    );
}
