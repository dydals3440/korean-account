import type { AccountPattern, Subject } from "../../types";
import { templateLength } from "../account/template-length";

/** Precomputed per-pattern data for the scoring hot path. */
export interface PatternLookup {
  readonly digitCount: number;
  readonly identifiers: ReadonlySet<string>;
  readonly subjectsByCode: ReadonlyMap<string, Subject>;
}

// Patterns are immutable data, so each lookup is built once and reused by every detector.
const lookups = new WeakMap<AccountPattern, PatternLookup>();

/** Returns the cached lookup for a pattern, building it on first use. */
export function getPatternLookup(pattern: AccountPattern): PatternLookup {
  const cached = lookups.get(pattern);
  if (cached !== undefined) {
    return cached;
  }

  const lookup: PatternLookup = {
    digitCount: templateLength(pattern.template),
    identifiers: new Set(pattern.identifiers),
    subjectsByCode: indexSubjectsByCode(pattern.subjects ?? []),
  };
  lookups.set(pattern, lookup);
  return lookup;
}

/** First declaration wins, matching `Array#find` order. */
function indexSubjectsByCode(subjects: readonly Subject[]): ReadonlyMap<string, Subject> {
  const subjectsByCode = new Map<string, Subject>();
  for (const subject of subjects) {
    if (!subjectsByCode.has(subject.code)) {
      subjectsByCode.set(subject.code, subject);
    }
  }
  return subjectsByCode;
}
