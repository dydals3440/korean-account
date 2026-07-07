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

/** 입력 자릿수와 패턴 템플릿 자릿수의 관계. */
interface LengthFit {
  readonly exact: boolean;
  readonly near: boolean;
  readonly compatible: boolean;
}

function assessLengthFit(digitsLength: number, expectedLength: number): LengthFit {
  return {
    exact: digitsLength === expectedLength,
    near: Math.abs(digitsLength - expectedLength) === 1,
    compatible: digitsLength <= expectedLength,
  };
}

/** 부분 입력 (정확 길이 미달) 에는 매치 보너스를 절반 (내림) 만 부여해 "정확 길이 일치" 패턴이 우선되게 한다. */
function scaleForPartialInput(bonus: number, lengthExact: boolean): number {
  return lengthExact ? bonus : Math.floor(bonus / 2);
}

/**
 * *매치된 코드가 길수록 더 정확한 식별* 이라는 직관의 길이 보너스 — 1자리 0,
 * 2자리 +1, 3자리 +2, 4자리 +3. 가중치가 0 으로 override 된 경우 (옵트아웃) 에는
 * 보너스도 0 이라 컨슈머가 식별자/과목 점수를 완전히 무력화할 수 있다.
 */
function matchLengthBonus(codeLength: number, weight: number): number {
  return weight > 0 && codeLength > 1 ? codeLength - 1 : 0;
}

function scoreLengthFit(fit: LengthFit, weights: Required<ScoringWeights>): number {
  if (fit.exact) {
    return weights.lengthExact;
  }
  if (fit.near) {
    return weights.lengthNear;
  }
  return 0;
}

function scoreIdentifierMatch(
  digits: string,
  pattern: AccountPattern,
  fit: LengthFit,
  weights: Required<ScoringWeights>,
): number {
  const hasIdentifierSpec =
    pattern.identifierPosition && (pattern.identifiers || pattern.identifierRange);
  if (!fit.compatible || !hasIdentifierSpec) {
    return 0;
  }
  const identifierDigits = extractIdentifier(digits, pattern);
  if (!isIdentifierMatch(identifierDigits, pattern)) {
    return 0;
  }
  const baseScore = scaleForPartialInput(weights.identifierMatch, fit.exact);
  const lengthBonus = matchLengthBonus(identifierDigits.length, weights.identifierMatch);
  return baseScore + scaleForPartialInput(lengthBonus, fit.exact);
}

function scoreSubjectMatch(
  digits: string,
  pattern: AccountPattern,
  fit: LengthFit,
  weights: Required<ScoringWeights>,
): { score: number; subject: Subject | null } {
  const hasSubjectSpec = pattern.subjectPosition && pattern.subjects && pattern.subjects.length > 0;
  if (!fit.compatible || !hasSubjectSpec) {
    return { score: 0, subject: null };
  }
  const subject = extractSubject(digits, pattern);
  if (!subject) {
    return { score: 0, subject: null };
  }
  const baseScore = scaleForPartialInput(weights.subjectMatch, fit.exact);
  const lengthBonus = matchLengthBonus(subject.code.length, weights.subjectMatch);
  return { score: baseScore + scaleForPartialInput(lengthBonus, fit.exact), subject };
}

/**
 * 패턴 단위 채점 — 길이 적합도, identifier 매치, subject 매치, additionalRule
 * 가산을 조합한다. 부분 입력 (템플릿보다 짧은 digits) 에는 identifier/subject
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
  const fit = assessLengthFit(digits.length, templateLength(pattern.template));

  // additionalRules 는 *통과 검증 + 점수 가산* 두 역할을 한다 (PDF·실세계 도메인
  // 제약이 곧 패턴 매칭 조건이므로). 자릿수가 일치하는 입력 (exact 또는 near) 에
  // 한해 가드를 적용 — 사용자가 *입력 중* 일 때도 부적합 패턴을 후보에서 빼되,
  // 더 짧은 부분 입력에는 가드 평가가 불완전하므로 면제한다.
  const rulesApply = fit.exact || fit.near;
  if (rulesApply && pattern.additionalRules) {
    for (const rule of pattern.additionalRules) {
      if (!rule(digits)) return { score: 0, subject: null };
    }
  }

  const { score: subjectScore, subject } = scoreSubjectMatch(digits, pattern, fit, weights);
  let totalScore =
    scoreLengthFit(fit, weights) +
    scoreIdentifierMatch(digits, pattern, fit, weights) +
    subjectScore;

  // 가드를 통과한 경우 (위에서 모두 true 였음) 룰 개수만큼 가산. 가드가 면제된
  // 부분 입력에서는 가산도 면제해 점수 인플레이션을 막는다.
  if (rulesApply && pattern.additionalRules) {
    totalScore += pattern.additionalRules.length * weights.additionalRule;
  }

  if (totalScore > 0 && pattern.kind === "new") {
    totalScore += weights.kindNewBonus;
  }

  return { score: totalScore, subject };
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
