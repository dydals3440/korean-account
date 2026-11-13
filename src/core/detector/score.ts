import type { AccountPattern, GlobalRule, Institution, ScoringWeights, Subject } from "../../types";
import { extractIdentifier } from "../account/extract-identifier";
import { extractSubject } from "../account/extract-subject";
import { formatAccount } from "../account/format-account";
import { templateLength } from "../account/template-length";

/** Default scoring weights; see `ScoringWeights` for what each one rewards. */
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

/** Best-scoring pattern of one institution. */
export interface InstitutionScore {
  readonly score: number;
  readonly matchedPattern: AccountPattern | null;
  readonly formatted: string;
  readonly subject: Subject | null;
}

interface PatternScore {
  readonly score: number;
  readonly subject: Subject | null;
}

interface LengthFit {
  readonly isExact: boolean;
  readonly isNear: boolean;
  /** Input is not longer than the template, so positional codes can be read. */
  readonly isWithinTemplate: boolean;
}

const NO_PATTERN_MATCH: PatternScore = { score: 0, subject: null };

/**
 * Scores every pattern of an institution and keeps the best one (first wins ties).
 * Global rules add their bonus only when some pattern matched.
 */
export function scoreInstitution(
  digits: string,
  institution: Institution,
  globalRules: readonly GlobalRule[],
  weights: Required<ScoringWeights> = DEFAULT_WEIGHTS,
): InstitutionScore {
  let bestPattern: AccountPattern | null = null;
  let best = NO_PATTERN_MATCH;

  if (digits.length > 0) {
    for (const pattern of institution.patterns) {
      const candidate = scorePattern(digits, pattern, weights);
      if (candidate.score > best.score) {
        bestPattern = pattern;
        best = candidate;
      }
    }
  }

  if (bestPattern === null) {
    return { score: 0, matchedPattern: null, formatted: digits, subject: null };
  }

  const passedGlobalRules = globalRules.filter((rule) => rule(digits, institution)).length;
  return {
    score: best.score + passedGlobalRules * weights.globalRule,
    matchedPattern: bestPattern,
    formatted: formatAccount(digits, bestPattern.template),
    subject: best.subject,
  };
}

function scorePattern(
  digits: string,
  pattern: AccountPattern,
  weights: Required<ScoringWeights>,
): PatternScore {
  const fit = measureLengthFit(digits.length, templateLength(pattern.template));
  const rules = pattern.additionalRules ?? [];

  // Shorter partial input cannot be judged by the rules yet, so they neither gate nor score it.
  const isRuleCheckable = fit.isExact || fit.isNear;
  if (isRuleCheckable && !rules.every((rule) => rule(digits))) {
    return NO_PATTERN_MATCH;
  }

  const subjectMatch = scoreSubject(digits, pattern, fit, weights);
  const ruleBonus = isRuleCheckable ? rules.length * weights.additionalRule : 0;
  const score =
    scoreLength(fit, weights) +
    scoreIdentifier(digits, pattern, fit, weights) +
    subjectMatch.score +
    ruleBonus;

  const newKindBonus = score > 0 && pattern.kind === "new" ? weights.kindNewBonus : 0;
  return { score: score + newKindBonus, subject: subjectMatch.subject };
}

function measureLengthFit(digitCount: number, templateDigits: number): LengthFit {
  return {
    isExact: digitCount === templateDigits,
    isNear: Math.abs(digitCount - templateDigits) === 1,
    isWithinTemplate: digitCount <= templateDigits,
  };
}

function scoreLength(fit: LengthFit, weights: Required<ScoringWeights>): number {
  if (fit.isExact) {
    return weights.lengthExact;
  }
  if (fit.isNear) {
    return weights.lengthNear;
  }
  return 0;
}

function scoreIdentifier(
  digits: string,
  pattern: AccountPattern,
  fit: LengthFit,
  weights: Required<ScoringWeights>,
): number {
  const hasIdentifierRule =
    pattern.identifierPosition !== undefined &&
    (pattern.identifiers !== undefined || pattern.identifierRange !== undefined);
  if (!fit.isWithinTemplate || !hasIdentifierRule) {
    return 0;
  }

  const identifier = extractIdentifier(digits, pattern);
  return isIdentifierMatch(identifier, pattern)
    ? scoreCodeMatch(weights.identifierMatch, identifier.length, fit)
    : 0;
}

function scoreSubject(
  digits: string,
  pattern: AccountPattern,
  fit: LengthFit,
  weights: Required<ScoringWeights>,
): PatternScore {
  if (!fit.isWithinTemplate) {
    return NO_PATTERN_MATCH;
  }

  const subject = extractSubject(digits, pattern);
  if (subject === null) {
    return NO_PATTERN_MATCH;
  }
  return { score: scoreCodeMatch(weights.subjectMatch, subject.code.length, fit), subject };
}

function isIdentifierMatch(identifier: string, pattern: AccountPattern): boolean {
  const expectedLength = pattern.identifierPosition?.length ?? 0;
  if (identifier.length === 0 || identifier.length < expectedLength) {
    return false;
  }
  if (pattern.identifiers?.includes(identifier)) {
    return true;
  }
  if (pattern.identifierRange === undefined) {
    return false;
  }

  const { from, to } = pattern.identifierRange;
  const value = Number(identifier);
  return Number.isFinite(value) && from <= value && value <= to;
}

/**
 * Weight plus one point per code digit beyond the first; partial input earns half of each part.
 * A zero weight disables the length bonus too.
 */
function scoreCodeMatch(weight: number, codeLength: number, fit: LengthFit): number {
  const lengthBonus = weight > 0 && codeLength > 1 ? codeLength - 1 : 0;
  return scaleForPartialInput(weight, fit) + scaleForPartialInput(lengthBonus, fit);
}

function scaleForPartialInput(points: number, fit: LengthFit): number {
  return fit.isExact ? points : Math.floor(points / 2);
}
