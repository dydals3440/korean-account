import type {
  CheckDigitVerifier,
  CreateDetectorOptions,
  DetectionResult,
  DetectOptions,
  Detector,
  ExtendDetectorOptions,
  GlobalRule,
  Institution,
  InstitutionIdInput,
  ScoringWeights,
} from "../../types";
import { normalizeAccount } from "../account/normalize-account";
import { applyBranchRule } from "./apply-branch-rule";
import { resolveCapabilities, toVerifierMap, verifyCheckDigit } from "./capabilities";
import { scoreToConfidence } from "./confidence";
import { createLengthIndex } from "./length-index";
import { normalizeSubject } from "./normalize-subject";
import { type RankableDetection, rankDetections } from "./rank";
import { resolveLimit, resolveMinScore, resolveWeights } from "./resolve-options";
import { scoreInstitution } from "./score";

/** Options resolved once per detector; `extend` merges these instead of raw options. */
interface DetectorConfig {
  readonly globalRules: readonly GlobalRule[];
  readonly scoring: ScoringWeights;
  readonly verifiers: ReadonlyMap<string, CheckDigitVerifier>;
}

/**
 * Creates an immutable detector over the given institutions.
 * Results narrow `institution.id` to the ids you pass in.
 *
 * @throws {RangeError} When a `scoring` weight is not a finite number ≥ 0.
 * @example Only the institutions you ship
 * const detector = createDetector([kb, shinhan, toss]);
 * detector.detect("110-436-387740")[0]?.institution.id; // "shinhan"
 *
 * @example Custom weights and institutions
 * const custom = createDetector(institutions, { scoring: { identifierMatch: 6 } })
 *   .extend({ institutions: [myInstitution] });
 */
export function createDetector<TInstitution extends Institution>(
  institutions: readonly TInstitution[],
  options: CreateDetectorOptions<TInstitution> = {},
): Detector<TInstitution> {
  return buildDetector(institutions, {
    globalRules: options.globalRules ?? [],
    scoring: options.scoring ?? {},
    verifiers: toVerifierMap(options.checkDigitVerifiers),
  });
}

function buildDetector<TInstitution extends Institution>(
  institutions: readonly TInstitution[],
  config: DetectorConfig,
): Detector<TInstitution> {
  const weights = resolveWeights(config.scoring);
  const institutionById = new Map(institutions.map((institution) => [institution.id, institution]));
  const lengthIndex = createLengthIndex(institutions);

  const detect = (
    input: string,
    options: DetectOptions<TInstitution["id"]> = {},
  ): readonly DetectionResult<TInstitution>[] => {
    const digits = normalizeAccount(input);
    if (digits.length === 0) {
      return [];
    }

    const limit = resolveLimit(options.limit);
    const minScore = resolveMinScore(options.minScore);
    const isRequested = createInstitutionFilter<TInstitution>(options);
    const candidates: RankableDetection<TInstitution>[] = [];

    for (const candidate of lengthIndex.candidatesNear(digits.length)) {
      const match = scoreInstitution(digits, candidate, config.globalRules, weights);
      if (match.matchedPattern === null) {
        continue;
      }

      const branch = applyBranchRule(digits, match.matchedPattern, candidate, {
        institutionById,
        bonus: weights.branchRuleMatch,
        hasPatternEvidence: match.hasEvidence,
      });
      const score = match.score + branch.bonus;
      const isWantedKind = options.kinds?.includes(branch.kind) ?? true;
      if (score < minScore || !isWantedKind || !isRequested(branch.institution)) {
        continue;
      }

      const subject = match.subject ? normalizeSubject(match.subject, branch.kind) : undefined;
      const validatedCheckDigit = verifyCheckDigit(
        digits,
        match.matchedPattern,
        branch.institution.id,
        config.verifiers,
      );

      candidates.push({
        institution: branch.institution,
        matchedPattern: match.matchedPattern,
        kind: branch.kind,
        ...(subject && { subject }),
        formatted: match.formatted,
        score,
        confidence: branch.hasEvidence ? scoreToConfidence(score) : "low",
        capabilities: resolveCapabilities({
          kind: branch.kind,
          subject,
          virtualOverride: branch.virtualOverride,
          validatedCheckDigit,
        }),
      });
    }

    return rankDetections(candidates).slice(0, limit);
  };

  const extend = <TExtra extends Institution>(
    extension: ExtendDetectorOptions<TInstitution, TExtra>,
  ): Detector<TInstitution | TExtra> => {
    const incoming = extension.institutions ?? [];
    const incomingIds = new Set(incoming.map((institution) => institution.id));
    const kept = institutions.filter((institution) => !incomingIds.has(institution.id));

    return buildDetector<TInstitution | TExtra>([...kept, ...incoming], {
      globalRules: [...config.globalRules, ...(extension.globalRules ?? [])],
      scoring: { ...config.scoring, ...extension.scoring },
      verifiers: new Map([...config.verifiers, ...toVerifierMap(extension.checkDigitVerifiers)]),
    });
  };

  const remove = (
    target: InstitutionIdInput<TInstitution["id"]> | ((institution: TInstitution) => boolean),
  ): Detector<TInstitution> => {
    const shouldRemove =
      typeof target === "function"
        ? target
        : (institution: TInstitution) => institution.id === target;

    return buildDetector(
      institutions.filter((institution) => !shouldRemove(institution)),
      config,
    );
  };

  return { institutions, detect, extend, remove };
}

/** Builds the category/include/exclude predicate for one `detect` call; `exclude` wins. */
function createInstitutionFilter<TInstitution extends Institution>(
  options: DetectOptions<TInstitution["id"]>,
): (institution: TInstitution) => boolean {
  const includedIds = options.include ? new Set<string>(options.include) : null;
  const excludedIds = options.exclude ? new Set<string>(options.exclude) : null;

  return (institution) => {
    const isInCategory = options.categories?.includes(institution.category) ?? true;
    const isIncluded = includedIds?.has(institution.id) ?? true;
    const isExcluded = excludedIds?.has(institution.id) ?? false;
    return isInCategory && isIncluded && !isExcluded;
  };
}
