import type { Institution, InstitutionCategory } from "../types";

/**
 * How likely an account of this category is to appear as a receiving account,
 * relative to a bank account from an institution of the same size.
 *
 * Securities accounts are numerous but rarely used to receive transfers;
 * non-bank deposit accounts (새마을금고, 신협, 우체국, ...) sit in between.
 * Clearing institutions issue no retail accounts.
 */
const CATEGORY_RECEIVING_LIKELIHOOD: Record<InstitutionCategory, number> = {
  bank: 1,
  "non-bank": 0.6,
  securities: 0.25,
  clearing: 0,
};

/**
 * Tie-break prior: the relative probability that an account belongs to this
 * institution when the evidence score is equal.
 *
 * `prevalence = userBaseMillions × categoryReceivingLikelihood`, where
 * `userBaseMillions` is the institution's retail customer base in millions
 * (sourced figures and marked estimates — see the DOCS scoring appendix).
 * An explicit `priority` overrides the computed value entirely.
 *
 * This prior is deliberately *ordinal in effect*: it is compared, never added
 * to the evidence score, so it can never outrank an identifier or subject
 * match. See `compareDetections` in detector.ts.
 */
export function prevalence(institution: Institution): number {
  if (institution.priority !== undefined) {
    return institution.priority;
  }
  const userBase = institution.userBaseMillions ?? 0;
  return userBase * CATEGORY_RECEIVING_LIKELIHOOD[institution.category];
}
