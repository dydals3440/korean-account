import type {
  AccountPattern,
  DigitSpan,
  GlobalRule,
  Institution,
  ScoringWeights,
  Subject,
} from "../../types";
import { extractIdentifier } from "../account/extract-identifier";
import { extractSubject } from "../account/extract-subject";
import { formatAccount } from "../account/format-account";
import { templateLength } from "../account/template-length";
import { CONFIDENCE_RANK, scoreToConfidence } from "./confidence";

/** Scoring weights with every default applied. */
export type ResolvedScoringWeights = {
  readonly [TKey in keyof ScoringWeights]-?: NonNullable<ScoringWeights[TKey]>;
};

/** Default scoring weights; see `ScoringWeights` for what each one rewards. */
export const DEFAULT_WEIGHTS: ResolvedScoringWeights = {
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
  /** An identifier or subject code matched, not just length and rules. */
  readonly hasEvidence: boolean;
}

interface PatternScore {
  readonly score: number;
  readonly subject: Subject | null;
  readonly hasEvidence: boolean;
}

interface CodeMatch {
  readonly score: number;
  readonly isMatched: boolean;
}

interface LengthFit {
  readonly isExact: boolean;
  readonly isNear: boolean;
  /** Input is not longer than the template, so positional codes can be read. */
  readonly isWithinTemplate: boolean;
}

const NO_PATTERN_MATCH: PatternScore = { score: 0, subject: null, hasEvidence: false };
const NO_CODE_MATCH: CodeMatch = { score: 0, isMatched: false };

/**
 * Scores every pattern of an institution and keeps the best one: the strongest evidence-backed
 * band first, then the highest score, then the first declared. Global rules add their bonus only
 * when some pattern matched.
 */
export function scoreInstitution(
  digits: string,
  institution: Institution,
  globalRules: readonly GlobalRule[],
  weights: ResolvedScoringWeights = DEFAULT_WEIGHTS,
): InstitutionScore {
  let bestPattern: AccountPattern | null = null;
  let best = NO_PATTERN_MATCH;

  if (digits.length > 0) {
    for (const pattern of institution.patterns) {
      const candidate = scorePattern(digits, pattern, weights);
      if (isStrongerPattern(candidate, best)) {
        bestPattern = pattern;
        best = candidate;
      }
    }
  }

  if (bestPattern === null) {
    return { score: 0, matchedPattern: null, formatted: digits, subject: null, hasEvidence: false };
  }

  const passedGlobalRules = globalRules.filter((rule) => rule(digits, institution)).length;
  return {
    score: best.score + passedGlobalRules * weights.globalRule,
    matchedPattern: bestPattern,
    formatted: formatAccount(digits, bestPattern.template),
    subject: best.subject,
    hasEvidence: best.hasEvidence,
  };
}

/** Band the pattern alone earns; without evidence it is `low`, as in the final result. */
function patternBand(match: PatternScore): number {
  return CONFIDENCE_RANK[match.hasEvidence ? scoreToConfidence(match.score) : "low"];
}

function isStrongerPattern(candidate: PatternScore, best: PatternScore): boolean {
  const bandDifference = patternBand(candidate) - patternBand(best);
  return bandDifference > 0 || (bandDifference === 0 && candidate.score > best.score);
}

function scorePattern(
  digits: string,
  pattern: AccountPattern,
  weights: ResolvedScoringWeights,
): PatternScore {
  const fit = measureLengthFit(digits.length, templateLength(pattern.template));
  const rules = pattern.additionalRules ?? [];

  // Shorter partial input cannot be judged by the rules yet, so they neither gate nor score it.
  const isRuleCheckable = fit.isExact || fit.isNear;
  if (isRuleCheckable && !rules.every((rule) => rule(digits))) {
    return NO_PATTERN_MATCH;
  }

  const identifierMatch = scoreIdentifier(digits, pattern, fit, weights);
  const subjectMatch = scoreSubject(digits, pattern, fit, weights);
  const ruleBonus = isRuleCheckable ? rules.length * weights.additionalRule : 0;
  const score =
    scoreLength(fit, weights) +
    combineCodeScores(pattern, identifierMatch.score, subjectMatch.score) +
    ruleBonus;

  const newKindBonus = score > 0 && pattern.kind === "new" ? weights.kindNewBonus : 0;
  return {
    score: score + newKindBonus,
    subject: subjectMatch.subject,
    hasEvidence: identifierMatch.isMatched || subjectMatch.subject !== null,
  };
}

/** The same digits count once: when identifier and subject spans overlap, only the larger score counts. */
function combineCodeScores(
  pattern: AccountPattern,
  identifierScore: number,
  subjectScore: number,
): number {
  const identifierSpan = pattern.identifierPosition;
  const subjectSpan = pattern.subjectPosition;
  const isOverlapping =
    identifierSpan !== undefined &&
    subjectSpan !== undefined &&
    spansOverlap(identifierSpan, subjectSpan);

  return isOverlapping ? Math.max(identifierScore, subjectScore) : identifierScore + subjectScore;
}

function spansOverlap(first: DigitSpan, second: DigitSpan): boolean {
  return first.start < second.start + second.length && second.start < first.start + first.length;
}

function measureLengthFit(digitCount: number, templateDigits: number): LengthFit {
  return {
    isExact: digitCount === templateDigits,
    isNear: Math.abs(digitCount - templateDigits) === 1,
    isWithinTemplate: digitCount <= templateDigits,
  };
}

function scoreLength(fit: LengthFit, weights: ResolvedScoringWeights): number {
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
  weights: ResolvedScoringWeights,
): CodeMatch {
  const hasIdentifierRule =
    pattern.identifierPosition !== undefined &&
    (pattern.identifiers !== undefined || pattern.identifierRange !== undefined);
  if (!fit.isWithinTemplate || !hasIdentifierRule) {
    return NO_CODE_MATCH;
  }

  const identifier = extractIdentifier(digits, pattern);
  if (!isIdentifierMatch(identifier, pattern)) {
    return NO_CODE_MATCH;
  }
  return {
    score: scoreCodeMatch(weights.identifierMatch, identifier.length, fit),
    isMatched: true,
  };
}

function scoreSubject(
  digits: string,
  pattern: AccountPattern,
  fit: LengthFit,
  weights: ResolvedScoringWeights,
): PatternScore {
  if (!fit.isWithinTemplate) {
    return NO_PATTERN_MATCH;
  }

  const subject = extractSubject(digits, pattern);
  if (subject === null) {
    return NO_PATTERN_MATCH;
  }
  return {
    score: scoreCodeMatch(weights.subjectMatch, subject.code.length, fit),
    subject,
    hasEvidence: true,
  };
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
