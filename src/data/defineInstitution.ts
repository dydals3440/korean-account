import type { Institution, InstitutionCategory } from "../types";

/**
 * type-safe `Institution` 생성 헬퍼.
 *
 * `id` / `code` / `category` literal 을 generic 으로 보존해 소비자 측에서
 * `Extract<RegisteredInstitution, { category: "bank" }>` 같은 narrow 가 가능하게 한다.
 *
 * @example
 * const myBank = defineInstitution({
 *   id: "my-bank",
 *   code: "999",
 *   nameKo: "커스텀은행",
 *   nameEn: "My Bank",
 *   category: "bank",
 *   aliases: [],
 *   patterns: [{ template: createPatternTemplate("XXX-XXX-XXXXXX"), kind: "new" }],
 * });
 * defaultDetector.extend({ institutions: [myBank] });
 */
export function defineInstitution<
  const Id extends string,
  const Code extends string,
  const Category extends InstitutionCategory,
>(input: Institution<Id, Code, Category>): Institution<Id, Code, Category> {
  return input;
}
