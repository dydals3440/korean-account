import { buildDetectorIndex } from "./detector-index";
import { scoreToConfidence } from "./confidence";
import { normalizeAccount } from "./normalize-account";
import { prevalence } from "./prevalence";
import { DEFAULT_WEIGHTS, scoreInstitution } from "./score";
import { normalizeSubject } from "./subjects";
import type {
  AccountKind,
  AccountPattern,
  CheckDigitVerifier,
  DetectionCapabilities,
  DetectionResult,
  DetectOptions,
  Detector,
  GlobalRule,
  Institution,
  ScoringWeights,
  Subject,
} from "../types";

/** Optional knobs for {@link createDetector}. */
export interface CreateDetectorOptions<I extends Institution = Institution> {
  readonly globalRules?: readonly GlobalRule[];
  /** Partial override of the scoring weights. Missing keys keep their defaults. */
  readonly scoring?: ScoringWeights;
  /**
   * Check-digit verifiers keyed by institution id. When the matched
   * institution has a verifier and the pattern does not opt out with
   * `validatesCheckDigit: false`, the result's
   * `capabilities.validatedCheckDigit` becomes a boolean.
   *
   * The algorithms themselves are user-supplied — they are not published by
   * KFTC and are out of scope for this library.
   */
  readonly checkDigitVerifiers?: Readonly<Partial<Record<I["id"], CheckDigitVerifier>>>;
}

const DEFAULT_LIMIT = 5;
const DEFAULT_MIN_SCORE = 1;

/** Ranking tie-break order between account kinds. */
const KIND_ORDER: Record<AccountKind, number> = {
  new: 6,
  old: 5,
  virtual: 4,
  lifetime: 3,
  "incoming-only": 2,
  "merged-legacy": 1,
};

/**
 * Builds a detector over the given institutions.
 *
 * The element type of `institutions` propagates as the generic `I`, so
 * `detect()` results narrow to exactly the ids you passed in — e.g.
 * `createDetector([kb, shinhan])` yields results whose `institution.id` is
 * `"kb" | "shinhan"`.
 *
 * `extend` / `remove` return new detectors; a detector is never mutated.
 *
 * @example Only the banks you ship with — everything else tree-shakes away
 * import { createDetector, kb, shinhan, toss } from "korean-account";
 * const detector = createDetector([kb, shinhan, toss]);
 * detector.detect("110-436-387740");
 *
 * @example The full registry
 * import { createDetector, institutions } from "korean-account";
 * const detector = createDetector(institutions);
 *
 * @example Custom scoring and extension
 * const strict = createDetector(institutions, { scoring: { identifierMatch: 6 } });
 * const extended = strict.extend({ institutions: [myCustomInstitution] });
 */
export function createDetector<I extends Institution>(
  institutions: readonly I[],
  options: CreateDetectorOptions<I> = {},
): Detector<I> {
  const globalRules = options.globalRules ?? [];
  const weights = { ...DEFAULT_WEIGHTS, ...options.scoring };
  const byId = new Map<string, I>(institutions.map((institution) => [institution.id, institution]));
  const index = buildDetectorIndex(institutions);
  const verifierByInstitutionId = buildVerifierMap(options.checkDigitVerifiers);

  const detect = (
    raw: string,
    detectOptions: DetectOptions = {},
  ): readonly DetectionResult<I>[] => {
    const digits = normalizeAccount(raw);
    if (digits.length === 0) {
      return [];
    }

    const limit = detectOptions.limit ?? DEFAULT_LIMIT;
    const minScore = detectOptions.minScore ?? DEFAULT_MIN_SCORE;
    const includeSet = detectOptions.include ? new Set<string>(detectOptions.include) : null;
    const excludeSet = detectOptions.exclude ? new Set<string>(detectOptions.exclude) : null;

    const candidateInstitutions = index.byLengthNear(digits.length);
    const results: DetectionResult<I>[] = [];

    for (const institution of candidateInstitutions) {
      if (!passesOptionFilters(institution, detectOptions, includeSet, excludeSet)) {
        continue;
      }

      const {
        score: baseScore,
        matchedPattern,
        formatted,
        subject,
      } = scoreInstitution(digits, institution, globalRules, weights);
      if (matchedPattern === null) {
        continue;
      }

      // The branch-rule bonus applies *before* the minScore cutoff. Branch
      // rules are strong identification signals spelled out by the KFTC PDF,
      // so a candidate that clears minScore thanks to one must not be culled
      // early.
      const branchOutcome = evaluateBranch(
        matchedPattern,
        digits,
        byId,
        institution,
        baseScore,
        weights.branchRuleMatch,
      );
      if (branchOutcome.score < minScore) {
        continue;
      }

      if (detectOptions.kinds && !detectOptions.kinds.includes(branchOutcome.kind)) {
        continue;
      }

      const normalizedSubject = subject ? normalizeSubject(subject, branchOutcome.kind) : undefined;
      const validatedCheckDigit = resolveCheckDigit(
        matchedPattern,
        branchOutcome.routedInstitution.id,
        digits,
        verifierByInstitutionId,
      );
      const capabilities = computeCapabilities(
        branchOutcome.kind,
        normalizedSubject,
        branchOutcome.virtualOverride,
        validatedCheckDigit,
      );

      results.push({
        institution: branchOutcome.routedInstitution,
        matchedPattern,
        kind: branchOutcome.kind,
        subject: normalizedSubject,
        formatted,
        score: branchOutcome.score,
        confidence: scoreToConfidence(branchOutcome.score),
        capabilities,
      });
    }

    results.sort(compareDetections);
    return narrowLowConfidence(results).slice(0, limit);
  };

  const extend = <E extends Institution>(extra: {
    readonly institutions?: readonly E[];
    readonly globalRules?: readonly GlobalRule[];
    readonly scoring?: ScoringWeights;
    readonly checkDigitVerifiers?: Readonly<Partial<Record<(I | E)["id"], CheckDigitVerifier>>>;
  }): Detector<I | E> => {
    // An incoming id replaces the existing institution (prevents silent duplicates).
    const incomingIds = new Set((extra.institutions ?? []).map((institution) => institution.id));
    const merged: readonly (I | E)[] = [
      ...institutions.filter((institution) => !incomingIds.has(institution.id)),
      ...(extra.institutions ?? []),
    ];
    // Both maps' keys are subsets of `(I | E)["id"]`, but TS cannot narrow the
    // spread of a mapped type with a generic key back to that type.
    const checkDigitVerifiers = {
      ...options.checkDigitVerifiers,
      ...extra.checkDigitVerifiers,
    } as Readonly<Partial<Record<(I | E)["id"], CheckDigitVerifier>>>;

    return createDetector<I | E>(merged, {
      globalRules: [...globalRules, ...(extra.globalRules ?? [])],
      scoring: { ...options.scoring, ...extra.scoring },
      checkDigitVerifiers,
    });
  };

  const remove = (target: string | ((institution: Institution) => boolean)): Detector<I> => {
    const matchesRemoval =
      typeof target === "function"
        ? target
        : (institution: Institution) => institution.id === target;
    return createDetector<I>(
      institutions.filter((institution) => !matchesRemoval(institution)),
      {
        globalRules,
        scoring: options.scoring,
        checkDigitVerifiers: options.checkDigitVerifiers,
      },
    );
  };

  return { institutions, detect, extend, remove };
}

function passesOptionFilters(
  institution: Institution,
  options: DetectOptions,
  includeSet: ReadonlySet<string> | null,
  excludeSet: ReadonlySet<string> | null,
): boolean {
  if (options.categories && !options.categories.includes(institution.category)) {
    return false;
  }
  if (includeSet && !includeSet.has(institution.id)) {
    return false;
  }
  if (excludeSet?.has(institution.id)) {
    return false;
  }
  return true;
}

interface BranchOutcome<I extends Institution> {
  readonly kind: AccountKind;
  readonly virtualOverride: boolean | null;
  readonly routedInstitution: I;
  readonly score: number;
}

/**
 * Evaluates the matched pattern's `branchRule` to adjust kind / institution /
 * virtual flag / score. A passing branch rule is an *additional* strong
 * identification signal from the KFTC PDF, so it adds `branchRuleMatch`.
 */
function evaluateBranch<I extends Institution>(
  matchedPattern: AccountPattern,
  digits: string,
  byId: ReadonlyMap<string, I>,
  initialInstitution: I,
  baseScore: number,
  branchRuleMatchWeight: number,
): BranchOutcome<I> {
  const branchResult = matchedPattern.branchRule?.evaluate(digits) ?? null;
  if (branchResult === null) {
    return {
      kind: matchedPattern.kind,
      virtualOverride: null,
      routedInstitution: initialInstitution,
      score: baseScore,
    };
  }

  const overriddenKind = branchResult.kindOverride ?? matchedPattern.kind;
  const overriddenVirtual =
    branchResult.virtualOverride !== undefined ? branchResult.virtualOverride : null;
  const routedInstitution = branchResult.institutionId
    ? (byId.get(branchResult.institutionId) ?? initialInstitution)
    : initialInstitution;

  return {
    kind: overriddenKind,
    virtualOverride: overriddenVirtual,
    routedInstitution,
    score: baseScore + branchRuleMatchWeight,
  };
}

function computeCapabilities(
  kind: AccountKind,
  normalizedSubject: Subject | undefined,
  virtualOverride: boolean | null,
  validatedCheckDigit: boolean | null,
): DetectionCapabilities {
  const subjectAllowsWithdrawal = normalizedSubject
    ? (normalizedSubject.allowsWithdrawal ?? true)
    : true;
  const subjectIsVirtual = normalizedSubject?.virtual ?? false;
  const kindBlocksWithdrawal =
    kind === "virtual" || kind === "incoming-only" || kind === "lifetime";
  const virtual = virtualOverride ?? (subjectIsVirtual || kind === "virtual");
  const allowsWithdrawal = subjectAllowsWithdrawal && !kindBlocksWithdrawal && !virtual;

  return { allowsWithdrawal, virtual, validatedCheckDigit };
}

/** Runs the institution's check-digit verifier; null when the pattern opts out. */
function resolveCheckDigit(
  matchedPattern: AccountPattern,
  institutionId: string,
  digits: string,
  verifierByInstitutionId: ReadonlyMap<string, CheckDigitVerifier>,
): boolean | null {
  if (matchedPattern.validatesCheckDigit === false) {
    return null;
  }
  const verifier = verifierByInstitutionId.get(institutionId);
  if (verifier === undefined) {
    return null;
  }
  return verifier(digits);
}

/** Sort by score (desc), then prevalence prior (desc), then kind order (desc). */
function compareDetections(a: DetectionResult, b: DetectionResult): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  const aPrevalence = prevalence(a.institution);
  const bPrevalence = prevalence(b.institution);
  if (bPrevalence !== aPrevalence) {
    return bPrevalence - aPrevalence;
  }
  return KIND_ORDER[b.kind] - KIND_ORDER[a.kind];
}

/** Drops low-confidence candidates when the top result is high/medium. */
function narrowLowConfidence<I extends Institution>(
  results: readonly DetectionResult<I>[],
): readonly DetectionResult<I>[] {
  const topConfidence = results[0]?.confidence;
  if (topConfidence !== "high" && topConfidence !== "medium") {
    return results;
  }
  return results.filter((result) => result.confidence !== "low");
}

function buildVerifierMap<I extends Institution>(
  verifiers: CreateDetectorOptions<I>["checkDigitVerifiers"],
): Map<string, CheckDigitVerifier> {
  const entries = Object.entries(verifiers ?? {}).filter(
    (entry): entry is [string, CheckDigitVerifier] => entry[1] !== undefined,
  );
  return new Map(entries);
}
