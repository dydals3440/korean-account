import { findPattern, type PatternFilter } from "../core/lookup/find-pattern";
import type { InstitutionId } from "../registry/institution-ids";
import type { AccountPattern, InstitutionIdInput } from "../types";
import { getInstitution } from "./get-institution";

/** Criteria for {@link pickPattern}. */
export type PickPatternFilter = PatternFilter;

/**
 * Returns a built-in institution's first pattern matching the filter, or `null`.
 *
 * @example
 * pickPattern("kb", { kind: "new", length: 14 }); // KB 14-digit new-format pattern
 */
export function pickPattern(
  institutionId: InstitutionIdInput<InstitutionId>,
  filter: PickPatternFilter = {},
): AccountPattern | null {
  const institution = getInstitution(institutionId);
  return institution === null ? null : findPattern(institution, filter);
}
