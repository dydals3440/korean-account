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
import { formatAccount } from "../account/format-account";
import { normalizeAccount } from "../account/normalize-account";
import { applyBranchRule } from "./apply-branch-rule";
import {
  resolveCapabilities,
  resolveServices,
  toVerifierMap,
  verifyCheckDigit,
} from "./capabilities";
import { scoreToConfidence } from "./confidence";
import { createLengthIndex } from "./length-index";
import { resolveSubject } from "./normalize-subject";
import { prevalence } from "./prevalence";
import { type BandMember, type RankableCandidate, rankDetections, rankKey } from "./rank";
import { mergeScoring, resolveLimit, resolveMinScore, resolveWeights } from "./resolve-options";
import { scoreInstitution } from "./score";

/** Options resolved once per detector; `extend` merges these instead of raw options. */
interface DetectorConfig {
  readonly globalRules: readonly GlobalRule[];
  readonly scoring: ScoringWeights;
  readonly verifiers: ReadonlyMap<string, CheckDigitVerifier>;
}

/**
 * Returns an immutable detector that infers account candidates from the given institutions.
 *
 * Prefer it over the built-in `detect` when bundle size or behaviour matters: passing only the
 * institutions you support, e.g. `createDetector([kb, shinhan])`, lets bundlers drop the rest
 * of the registry, and results narrow `institution.id` to the ids passed in. Institutions and
 * weights are indexed once here, so create the detector at module scope and reuse it.
 *
 * `detector.detect(input, options)` works like the built-in `detect` over this list: input is
 * normalized, candidates come back ranked (an empty array when nothing matches) with
 * `confidence` (`"high"` at score ≥ 7, `"medium"` at ≥ 4, else `"low"`; always `"low"` without
 * identifier, subject or non-fallback branch evidence) and `ambiguous` (another institution sits
 * in the same band, so ask the user). Results are hints, not proof that an account exists: let
 * the user confirm the institution, then verify it with a paid account-holder lookup API.
 * `extend` and `remove` return new detectors and leave this one unchanged.
 *
 * @typeParam TInstitution - Inferred from `institutions`; registry constants and
 *   {@link defineInstitution} results keep their literal ids.
 * @param institutions - Institutions to detect. Treat them as read-only afterwards.
 * @param options - Detector-wide settings; omitted or `undefined` fields use the defaults.
 *   `scoring` overrides individual weights. Each `globalRules` entry that passes for a matched
 *   institution adds `scoring.globalRule` points. `checkDigitVerifiers` maps an institution id to
 *   a verifier over normalized digits; its outcome is `capabilities.validatedCheckDigit`, which
 *   is `null` when no verifier applies. None are built in, as the algorithms are not published.
 * @returns A detector exposing `institutions`, `detect`, `extend` and `remove`.
 * @throws {RangeError} When a `scoring` weight is not a finite number ≥ 0. The returned
 *   `detect` throws like the built-in one for an invalid `limit` or `minScore`.
 * @example Only the institutions you ship
 * import { createDetector, kb, shinhan, toss } from "korean-account";
 *
 * const detector = createDetector([kb, shinhan, toss]);
 * detector.detect("110-436-387740")[0]?.institution.id;
 * // => "shinhan" (typed as "kb" | "shinhan" | "toss")
 *
 * @example Tuning the full registry
 * const detector = createDetector(institutions, { scoring: { identifierMatch: 6 } }).remove(
 *   (institution) => institution.category === "securities",
 * );
 * detector.detect("110-436-387740").map((result) => [result.institution.id, result.score]);
 * // => [["shinhan", 11], ["post", 11], ["shinhyup", 11]]
 *
 * @example Adding a custom institution and check-digit verifier
 * const detector = createDetector([shinhan]).extend({
 *   institutions: [myBank], // from defineInstitution
 *   checkDigitVerifiers: { "my-bank": verifyMyBankCheckDigit },
 * });
 * detector.detect("999-123-456789")[0]?.capabilities.validatedCheckDigit;
 * // => verifyMyBankCheckDigit("999123456789")
 * @see {@link defineInstitution} for custom institutions and patterns.
 * @see {@link toDetectionPayload} to serialize a result.
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
    const limit = resolveLimit(options.limit);
    const minScore = resolveMinScore(options.minScore);
    const isRequested = createInstitutionFilter<TInstitution>(options);
    const digits = normalizeAccount(input);
    if (digits.length === 0) {
      return [];
    }

    const candidates: RankableCandidate<TInstitution>[] = [];
    const bandMembers: BandMember[] = [];

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
      const confidence = branch.hasEvidence ? scoreToConfidence(score) : "low";
      // Ambiguity describes the input, so it counts matches the options filter out below.
      bandMembers.push({ institution: branch.institution, confidence });

      const isWantedKind = options.kinds?.includes(branch.kind) ?? true;
      if (score < minScore || !isWantedKind || !isRequested(branch.institution)) {
        continue;
      }

      const capabilities = resolveCapabilities({
        kind: branch.kind,
        subject: match.subject,
        services: resolveServices(match.matchedPattern, match.subject),
        virtualOverride: branch.virtualOverride,
        validatedCheckDigit: verifyCheckDigit(
          digits,
          match.matchedPattern,
          branch.institution.id,
          config.verifiers,
        ),
      });
      const subject =
        match.subject === null
          ? null
          : resolveSubject(match.subject, capabilities.allowsWithdrawal);

      candidates.push({
        institution: branch.institution,
        matchedPattern: match.matchedPattern,
        kind: branch.kind,
        subject,
        formatted: formatAccount(digits, match.matchedPattern.template),
        score,
        confidence,
        capabilities,
        rankKey: rankKey(confidence, branch.hasEvidence),
        prior: prevalence(branch.institution),
        isOwnPattern: branch.institution === candidate,
      });
    }

    return rankDetections(candidates, bandMembers, limit);
  };

  const extend = <TExtra extends Institution = never>(
    extension: ExtendDetectorOptions<TInstitution, TExtra>,
  ): Detector<TInstitution | TExtra> => {
    const incoming = extension.institutions ?? [];
    const incomingIds = new Set(incoming.map((institution) => institution.id));
    const kept = institutions.filter((institution) => !incomingIds.has(institution.id));

    return buildDetector<TInstitution | TExtra>([...kept, ...incoming], {
      globalRules: [...config.globalRules, ...(extension.globalRules ?? [])],
      scoring: mergeScoring(config.scoring, extension.scoring),
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
