import type { Institution, InstitutionCategory } from "../../types";

/**
 * Returns the given institution unchanged, with `id`, `code` and `category` inferred as literal
 * types.
 *
 * Use it for custom institutions passed to `createDetector` or `detector.extend`, so detection
 * results narrow `institution.id` to your ids. Passing an existing id to `extend` replaces that
 * institution as a whole; spread the original (`{ ...shinhan, ... }`) to keep its patterns.
 * Nothing is validated at runtime; templates are checked when built with {@link patternTemplate}.
 *
 * Each pattern scores on length alone unless it declares `identifierPosition` with
 * `identifiers` or `identifierRange`, or `subjectPosition` with `subjects`; a length-only match
 * is always `"low"` confidence. `userBaseMillions` and `priority` only break score ties.
 *
 * @typeParam TId - Literal institution id.
 * @typeParam TCode - Literal CMS participant code.
 * @typeParam TCategory - Literal institution category.
 * @param institution - Institution data with at least one pattern.
 * @returns The same object.
 * @example
 * const myBank = defineInstitution({
 *   id: "my-bank",
 *   code: "999",
 *   nameKo: "커스텀은행",
 *   category: "bank",
 *   aliases: [],
 *   patterns: [
 *     {
 *       template: patternTemplate("XXX-XXX-XXXXXX"),
 *       kind: "new",
 *       identifierPosition: { start: 0, length: 3 },
 *       identifiers: ["999"],
 *     },
 *   ],
 * });
 *
 * createDetector([myBank]).detect("999-123-456789")[0];
 * // => { institution: { id: "my-bank", ... }, score: 9, confidence: "high", ... }
 * @see {@link defineSubject} and {@link defineBranchRule} for pattern parts.
 */
export function defineInstitution<
  const TId extends string,
  const TCode extends string,
  const TCategory extends InstitutionCategory,
>(institution: Institution<TId, TCode, TCategory>): Institution<TId, TCode, TCategory> {
  return institution;
}
