import type { AccountKind, AccountPattern, Institution } from "../../types";
import { templateLength } from "../account/template-length";

/** Criteria for {@link findPattern}. */
export interface PatternFilter {
  readonly kind?: AccountKind;
  /** Template length in digits, hyphens excluded. */
  readonly length?: number;
}

/** Returns the institution's first pattern matching the filter, or `null`. */
export function findPattern(
  institution: Institution,
  filter: PatternFilter = {},
): AccountPattern | null {
  const matches = (pattern: AccountPattern): boolean => {
    const isWantedKind = filter.kind === undefined || pattern.kind === filter.kind;
    const isWantedLength =
      filter.length === undefined || templateLength(pattern.template) === filter.length;
    return isWantedKind && isWantedLength;
  };

  return institution.patterns.find(matches) ?? null;
}
