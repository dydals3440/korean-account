import { extractIdentifier } from "../extractIdentifier";
import { extractSubject } from "../extractSubject";
import { formatAccount } from "../formatAccount";
import type { AccountPattern, GlobalRule, Institution, ScoringWeights, Subject } from "../types";
import { templateLength } from "./templateLength";

/** 단일 institution 채점 결과. */
export interface ScoreResult {
  readonly score: number;
  readonly matchedPattern: AccountPattern | null;
  readonly formatted: string;
  readonly subject: Subject | null;
}

/** 기본 가중치. `createDetector({ scoring })` 로 부분 override 할 수 있다. */
export const DEFAULT_WEIGHTS: Required<ScoringWeights> = {
  lengthExact: 3,
  lengthNear: 1,
  identifierMatch: 4,
  subjectMatch: 3,
  additionalRule: 1,
  globalRule: 1,
  branchRuleMatch: 2,
  kindNewBonus: 0,
};

function isIdentifierMatch(identifier: string, pattern: AccountPattern): boolean {
  if (identifier.length === 0) {
    return false;
  }
  const pos = pattern.identifierPosition;
  if (pos && identifier.length < pos.length) {
    return false;
  }
  if (pattern.identifiers?.includes(identifier)) {
    return true;
  }
  if (pattern.identifierRange) {
    const asNumber = Number(identifier);
    if (Number.isFinite(asNumber)) {
      return asNumber >= pattern.identifierRange.from && asNumber <= pattern.identifierRange.to;
    }
  }
  return false;
}

/**
 * 패턴 단위 채점. 부분 입력 (템플릿보다 짧은 digits) 에는 identifier/subject
 * 매치 점수를 절반만 부여해 "정확 길이 일치" 패턴이 우선되게 한다.
 */
function scorePattern(
  digits: string,
  pattern: AccountPattern,
  weights: Required<ScoringWeights>,
): { score: number; subject: Subject | null } {
  if (digits.length === 0) {
    return { score: 0, subject: null };
  }
  const expectedLength = templateLength(pattern.template);
  const lengthExact = digits.length === expectedLength;
  const lengthNear = Math.abs(digits.length - expectedLength) === 1;
  const isLengthCompatible = digits.length <= expectedLength;

  // additionalRules 는 *통과 검증 + 점수 가산* 두 역할을 한다 (PDF·실세계 도메인
  // 제약이 곧 패턴 매칭 조건이므로). 자릿수가 일치하는 입력 (lengthExact 또는
  // lengthNear) 에 한해 가드를 적용 — 사용자가 *입력 중* 일 때도 부적합 패턴을
  // 후보에서 빼되, 더 짧은 부분 입력에는 가드 평가가 불완전하므로 면제한다.
  const rulesApply = lengthExact || lengthNear;
  if (rulesApply && pattern.additionalRules) {
    for (const rule of pattern.additionalRules) {
      if (!rule(digits)) return { score: 0, subject: null };
    }
  }

  let total = 0;
  if (lengthExact) {
    total += weights.lengthExact;
  } else if (lengthNear) {
    total += weights.lengthNear;
  }

  // identifier·subject 매칭 시, *prefix 길이가 길수록 더 정확한 식별* 이라는
  // 직관을 반영해 길이 보너스를 더한다. 1자리 식별자는 보너스 0, 2자리는 +1,
  // 3자리는 +2, 4자리는 +3. 가중치가 0 으로 override 된 경우 (옵트아웃) 에는
  // 보너스도 적용하지 않아 컨슈머가 식별자/과목 점수를 완전히 무력화할 수 있다.
  if (
    isLengthCompatible &&
    pattern.identifierPosition &&
    (pattern.identifiers || pattern.identifierRange)
  ) {
    const id = extractIdentifier(digits, pattern);
    if (isIdentifierMatch(id, pattern)) {
      const base = lengthExact ? weights.identifierMatch : Math.floor(weights.identifierMatch / 2);
      const lengthBonus = weights.identifierMatch > 0 && id.length > 1 ? id.length - 1 : 0;
      total += base + (lengthExact ? lengthBonus : Math.floor(lengthBonus / 2));
    }
  }

  let subject: Subject | null = null;
  if (
    isLengthCompatible &&
    pattern.subjectPosition &&
    pattern.subjects &&
    pattern.subjects.length > 0
  ) {
    subject = extractSubject(digits, pattern);
    if (subject) {
      const base = lengthExact ? weights.subjectMatch : Math.floor(weights.subjectMatch / 2);
      const lengthBonus =
        weights.subjectMatch > 0 && subject.code.length > 1 ? subject.code.length - 1 : 0;
      total += base + (lengthExact ? lengthBonus : Math.floor(lengthBonus / 2));
    }
  }

  // 가드를 통과한 경우 (위에서 모두 true 였음) 룰 개수만큼 가산. 가드가 면제된
  // 부분 입력에서는 가산도 면제해 점수 인플레이션을 막는다.
  if (rulesApply && pattern.additionalRules) {
    total += pattern.additionalRules.length * weights.additionalRule;
  }

  if (total > 0 && pattern.kind === "new") {
    total += weights.kindNewBonus;
  }

  return { score: total, subject };
}

export function scoreInstitution(
  digits: string,
  institution: Institution,
  globalRules: readonly GlobalRule[],
  weights: Required<ScoringWeights> = DEFAULT_WEIGHTS,
): ScoreResult {
  if (digits.length === 0 || institution.patterns.length === 0) {
    return { score: 0, matchedPattern: null, formatted: digits, subject: null };
  }

  let bestScore = 0;
  let bestPattern: AccountPattern | null = null;
  let bestSubject: Subject | null = null;
  for (const pattern of institution.patterns) {
    const { score, subject } = scorePattern(digits, pattern, weights);
    if (score > bestScore) {
      bestScore = score;
      bestPattern = pattern;
      bestSubject = subject;
    }
  }

  if (bestScore > 0) {
    for (const rule of globalRules) {
      if (rule(digits, institution)) bestScore += weights.globalRule;
    }
  }

  const formatted = bestPattern ? formatAccount(digits, bestPattern.template) : digits;

  return {
    score: bestScore,
    matchedPattern: bestPattern,
    formatted,
    subject: bestSubject,
  };
}
