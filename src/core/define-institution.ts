import type { Institution, InstitutionCategory } from "../types";

/**
 * Type-safe `Institution` construction helper.
 *
 * Preserves the `id` / `code` / `category` literals as generics so consumers
 * can narrow, e.g. `Extract<RegisteredInstitution, { category: "bank" }>`.
 *
 * @example
 * const myBank = defineInstitution({
 *   id: "my-bank",
 *   code: "999",
 *   nameKo: "커스텀은행",
 *   nameEn: "My Bank",
 *   category: "bank",
 *   aliases: [],
 *   patterns: [{ template: patternTemplate("XXX-XXX-XXXXXX"), kind: "new" }],
 * });
 * const detector = createDetector([...institutions, myBank]);
 */
export function defineInstitution<
  const Id extends string,
  const Code extends string,
  const Category extends InstitutionCategory,
>(input: Institution<Id, Code, Category>): Institution<Id, Code, Category> {
  return input;
}
