import { filterInstitutions } from "../core/lookup/filter-institutions";
import {
  type InstitutionIdByCategory,
  institutions,
  type RegisteredInstitution,
} from "../registry/institutions";
import type { AccountKind, InstitutionCategory } from "../types";

/** Criteria for {@link searchInstitutions}. With `categories`, `include`/`exclude` accept only ids in those categories. */
export interface SearchInstitutionsFilter<
  TCategory extends InstitutionCategory = InstitutionCategory,
> {
  readonly categories?: readonly TCategory[];
  /** Keeps institutions with at least one pattern of these kinds. */
  readonly kinds?: readonly AccountKind[];
  /** Keeps institutions that declare subject codes on at least one pattern. */
  readonly hasSubject?: boolean;
  readonly include?: readonly InstitutionIdByCategory<TCategory>[];
  readonly exclude?: readonly InstitutionIdByCategory<TCategory>[];
}

/**
 * Filters the built-in registry; all criteria combine with AND.
 * The result narrows to the given `categories`.
 *
 * @example
 * searchInstitutions({ categories: ["bank"], exclude: ["hsbc"] });
 */
export function searchInstitutions<
  const TCategory extends InstitutionCategory = InstitutionCategory,
>(
  filter: SearchInstitutionsFilter<TCategory> = {},
): readonly Extract<RegisteredInstitution, { category: TCategory }>[] {
  const isInCategory = (
    institution: RegisteredInstitution,
  ): institution is Extract<RegisteredInstitution, { category: TCategory }> =>
    filter.categories === undefined ||
    filter.categories.some((category) => category === institution.category);

  return filterInstitutions(institutions, filter).filter(isInCategory);
}
