import { findPattern, type PatternFilter } from "../core/lookup/find-pattern";
import type { InstitutionId } from "../registry/institution-ids";
import type { AccountPattern, InstitutionIdInput } from "../types";
import { getInstitution } from "./get-institution";

/**
 * Criteria for {@link pickPattern}: `kind` and `length` (template digits, hyphens excluded).
 * Omitted or `undefined` fields match any pattern.
 */
export type PickPatternFilter = PatternFilter;

/**
 * Returns the first pattern of a built-in institution that matches the filter.
 *
 * Patterns are searched in declaration order, and every given filter field must match. Use it to
 * read a format's template, identifier and subject spans, e.g. to pass to
 * {@link extractSubject} or {@link formatAccount}, or to assert that a pattern your detector
 * extends still exists after a library update.
 *
 * This imports the whole registry. With an institution constant in hand, read
 * `institution.patterns` directly instead.
 *
 * @param institutionId - Built-in institution id or CMS participant code, as accepted by
 *   {@link getInstitution}.
 * @param filter - Pattern criteria; defaults to `{}`, which returns the first pattern.
 * @returns The pattern, or `null` when the institution is unknown or no pattern matches.
 * @example
 * pickPattern("shinhan", { kind: "new" })?.template; // => "XXX-XXX-XXXXXX"
 * pickPattern("kb", { length: 14 })?.kind;           // => "virtual"
 * pickPattern("kb", { kind: "new" });                // => null (no such format)
 */
export function pickPattern(
  institutionId: InstitutionIdInput<InstitutionId>,
  filter: PickPatternFilter = {},
): AccountPattern | null {
  const institution = getInstitution(institutionId);
  return institution === null ? null : findPattern(institution, filter);
}
