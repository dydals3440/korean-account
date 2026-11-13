import type { Institution, InstitutionCategory } from "../../types";

/** Relative chance that an account of this category is a transfer destination. */
const RECEIVING_LIKELIHOOD: Readonly<Record<InstitutionCategory, number>> = {
  bank: 1,
  "non-bank": 0.6,
  securities: 0.25,
  clearing: 0,
};

/**
 * Returns the prior that orders detection candidates with equal scores; higher ranks first.
 *
 * The prior is `institution.priority` when set. Otherwise it is `userBaseMillions` (0 when
 * absent) times how likely the category is to receive transfers: bank 1, non-bank 0.6,
 * securities 0.25, clearing 0. It never changes a score or confidence, so it cannot outrank
 * stronger evidence; it only decides the order within a tie. Use it to reproduce the ranking,
 * or to choose `priority` or `userBaseMillions` for a custom institution.
 *
 * @param institution - Any institution, built-in or custom.
 * @returns The tie-break prior.
 * @example
 * prevalence(shinhan); // => 24  (bank: userBaseMillions 24 × 1)
 * prevalence(post);    // => 7.8 (non-bank: userBaseMillions 13 × 0.6)
 * // Both score 9 for "110-436-387740", so detect() lists shinhan first.
 */
export function prevalence(institution: Institution): number {
  if (institution.priority !== undefined) {
    return institution.priority;
  }
  return (institution.userBaseMillions ?? 0) * RECEIVING_LIKELIHOOD[institution.category];
}
