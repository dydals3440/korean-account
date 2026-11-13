import type { Institution, InstitutionCategory } from "../../types";

/** Relative chance that an account of this category is a transfer destination. */
const RECEIVING_LIKELIHOOD: Readonly<Record<InstitutionCategory, number>> = {
  bank: 1,
  "non-bank": 0.6,
  securities: 0.25,
  clearing: 0,
};

/**
 * Tie-break prior used only when scores are equal:
 * `priority`, or `userBaseMillions × category likelihood`.
 *
 * @example
 * prevalence(kb) > prevalence(kiwoom); // true — banks receive transfers more often
 */
export function prevalence(institution: Institution): number {
  if (institution.priority !== undefined) {
    return institution.priority;
  }
  return (institution.userBaseMillions ?? 0) * RECEIVING_LIKELIHOOD[institution.category];
}
