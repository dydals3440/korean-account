import type { Institution, InstitutionCategory } from "../../types";

/**
 * Declares an institution, keeping `id`, `code` and `category` as literal types.
 *
 * @example
 * const myBank = defineInstitution({
 *   id: "my-bank",
 *   code: "999",
 *   nameKo: "커스텀은행",
 *   category: "bank",
 *   aliases: [],
 *   patterns: [{ template: patternTemplate("XXX-XXX-XXXXXX"), kind: "new" }],
 * });
 */
export function defineInstitution<
  const TId extends string,
  const TCode extends string,
  const TCategory extends InstitutionCategory,
>(institution: Institution<TId, TCode, TCategory>): Institution<TId, TCode, TCategory> {
  return institution;
}
