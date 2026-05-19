import { scoreToConfidence } from "../_internal/confidence";
import { buildDetectorIndex } from "../_internal/detectorIndex";
import { DEFAULT_WEIGHTS, scoreInstitution } from "../_internal/score";
import { normalizeSubject } from "../_internal/subjects";
import { normalize } from "../normalize";
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

export interface CreateDetectorInput<I extends Institution = Institution> {
  readonly institutions: readonly I[];
  readonly globalRules?: readonly GlobalRule[];
  /** 점수 가중치 override. 누락된 키는 기본값. */
  readonly scoring?: ScoringWeights;
  /**
   * institution id 별 체크디지트 verifier. 매칭된 institution 의 verifier 가
   * 등록되어 있고 패턴이 `validatesCheckDigit: false` 가 아니면, detect 결과의
   * `capabilities.validatedCheckDigit` 가 boolean 으로 채워진다.
   *
   * 알고리즘 자체는 외부 자료에서 가져와 사용자가 정의한다.
   */
  readonly checkDigitVerifiers?: Readonly<Partial<Record<I["id"], CheckDigitVerifier>>>;
}

const DEFAULT_LIMIT = 5;
const DEFAULT_MIN_SCORE = 1;

/** kind 우선순위 (랭킹 tie-break). */
const KIND_ORDER: Record<AccountKind, number> = {
  new: 6,
  old: 5,
  virtual: 4,
  lifetime: 3,
  "incoming-only": 2,
  "merged-legacy": 1,
};

/**
 * institution 집합과 globalRule 을 받아 detector 를 만든다.
 *
 * 입력 `institutions` 의 element 타입이 generic `I` 로 전파되어 `detect()`
 * 반환의 `DetectionResult<I>` 까지 좁혀진다. 예를 들어 기본 레지스트리를 그대로
 * 넘기면 `defaultDetector` 의 결과는 `institution.id` 가 `InstitutionId`
 * literal union 으로 추론된다.
 *
 * `extend` / `remove` 는 새 detector 를 반환한다.
 * `scoring` 으로 점수 가중치를 부분 override 할 수 있다.
 */
export function createDetector<I extends Institution>(input: CreateDetectorInput<I>): Detector<I> {
  const institutions = input.institutions;
  const globalRules = input.globalRules ?? [];
  const weights = { ...DEFAULT_WEIGHTS, ...(input.scoring ?? {}) };
  const byId = new Map<string, I>(institutions.map((institution) => [institution.id, institution]));
  const index = buildDetectorIndex(institutions);
  const verifierByInstitutionId = buildVerifierMap(input.checkDigitVerifiers);

  const detect = (raw: string, options: DetectOptions = {}): readonly DetectionResult<I>[] => {
    const digits = normalize(raw);
    if (digits.length === 0) {
      return [];
    }

    const limit = options.limit ?? DEFAULT_LIMIT;
    const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
    const includeSet = options.include ? new Set<string>(options.include) : null;
    const excludeSet = options.exclude ? new Set<string>(options.exclude) : null;

    const candidateInstitutions = index.byLengthNear(digits.length);
    const results: DetectionResult<I>[] = [];

    for (const institution of candidateInstitutions) {
      if (!passesOptionFilters(institution, options, includeSet, excludeSet)) {
        continue;
      }

      const {
        score: baseScore,
        matchedPattern,
        formatted,
        subject,
      } = scoreInstitution(digits, institution, globalRules, weights);
      if (baseScore < minScore || matchedPattern === null) {
        continue;
      }

      const branchOutcome = evaluateBranch(
        matchedPattern,
        digits,
        byId,
        institution,
        baseScore,
        weights.branchRuleMatch,
      );

      if (options.kinds && !options.kinds.includes(branchOutcome.kind)) {
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
  }): Detector<I | E> => {
    // 같은 id 가 들어오면 기존을 새 institution 으로 교체 (silent duplicate 방지).
    const incomingIds = new Set((extra.institutions ?? []).map((institution) => institution.id));
    const merged: readonly (I | E)[] = [
      ...institutions.filter((institution) => !incomingIds.has(institution.id)),
      ...(extra.institutions ?? []),
    ];
    return createDetector<I | E>({
      institutions: merged,
      globalRules: [...globalRules, ...(extra.globalRules ?? [])],
      scoring: input.scoring,
      checkDigitVerifiers: input.checkDigitVerifiers,
    });
  };

  const remove = (target: string | ((institution: Institution) => boolean)): Detector<I> => {
    const matchesRemoval =
      typeof target === "function"
        ? target
        : (institution: Institution) => institution.id === target;
    return createDetector<I>({
      institutions: institutions.filter((institution) => !matchesRemoval(institution)),
      globalRules,
      scoring: input.scoring,
      checkDigitVerifiers: input.checkDigitVerifiers,
    });
  };

  return { institutions, detect, extend, remove };
}

// ─── Helpers (module-level, pure) ─────────────────────────────────────────

/** detect() 의 옵션 필터를 한 곳에 모아 evaluating 순서를 명시. */
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
 * 매칭된 패턴의 `branchRule` 을 평가해 kind / institution / virtual / score 를
 * 보정한다. PDF 가 명시한 분기 규칙은 *추가적인 강한 식별 신호* 이므로 통과 시
 * score 에 `branchRuleMatch` 만큼 가산.
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

/** kind + subject + override 조합에서 출금·가상 가능 여부를 계산. */
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

/** institution id 별 체크디지트 verifier 호출. 패턴이 명시적으로 미검증이면 null. */
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

/** score (desc) → priority (desc) → kindOrder (desc) 로 정렬. */
function compareDetections(a: DetectionResult, b: DetectionResult): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  const aPriority = a.institution.priority ?? 0;
  const bPriority = b.institution.priority ?? 0;
  if (bPriority !== aPriority) {
    return bPriority - aPriority;
  }
  return KIND_ORDER[b.kind] - KIND_ORDER[a.kind];
}

/** 1순위가 high / medium 이면 low 후보를 제거 — noise filtering. */
function narrowLowConfidence<I extends Institution>(
  results: readonly DetectionResult<I>[],
): readonly DetectionResult<I>[] {
  const topConfidence = results[0]?.confidence;
  if (topConfidence !== "high" && topConfidence !== "medium") {
    return results;
  }
  return results.filter((result) => result.confidence !== "low");
}

/** 입력 verifier 맵에서 undefined 를 걸러 비-옵셔널 Map 으로 변환. */
function buildVerifierMap<I extends Institution>(
  verifiers: CreateDetectorInput<I>["checkDigitVerifiers"],
): Map<string, CheckDigitVerifier> {
  const entries = Object.entries(verifiers ?? {}).filter(
    (entry): entry is [string, CheckDigitVerifier] => entry[1] !== undefined,
  );
  return new Map(entries);
}
