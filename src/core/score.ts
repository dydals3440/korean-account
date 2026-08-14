import { extractIdentifier } from "./extract-identifier";
import { extractSubject } from "./extract-subject";
import { formatAccount } from "./format-account";
import type { AccountPattern, GlobalRule, Institution, ScoringWeights, Subject } from "../types";
import { templateLength } from "./template-length";

/** Scoring outcome for a single institution. */
export interface ScoreResult {
  readonly score: number;
  readonly matchedPattern: AccountPattern | null;
  readonly formatted: string;
  readonly subject: Subject | null;
}

/** Default weights. Partially overridable via `createDetector(institutions, { scoring })`. */
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

/** Relation between the input digit count and the pattern template length. */
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

/** Partial input earns half the match bonus (floored), so exact-length patterns rank first. */
function scaleForPartialInput(bonus: number, lengthExact: boolean): number {
  return lengthExact ? bonus : Math.floor(bonus / 2);
}

/**
 * Length bonus for "a longer matched code identifies more precisely" — 1 digit
 * +0, 2 digits +1, 3 digits +2, 4 digits +3. When the weight is overridden to
 * 0 (opt-out) the bonus is 0 too, so consumers can fully disable
 * identifier/subject scoring.
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
 * Per-pattern scoring — combines length fit, identifier match, subject match,
 * and additionalRule bonuses. Partial input (digits shorter than the
 * template) earns half the identifier/subject bonuses so exact-length
 * patterns rank first.
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

  // additionalRules both gate and score (real-world domain constraints double
  // as matching conditions). The gate applies only to length-matching input
  // (exact or near) — unfit patterns drop out even mid-typing, but shorter
  // partial input is exempt because the guard cannot evaluate completely.
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

  // All rules passed above, so add the per-rule bonus. Guard-exempt partial
  // input earns no bonus either, preventing score inflation.
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
