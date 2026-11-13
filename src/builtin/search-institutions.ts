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
  readonly categories?: readonly TCategory[] | undefined;
  /** Keeps institutions with at least one pattern of these kinds. */
  readonly kinds?: readonly AccountKind[] | undefined;
  /** Keeps institutions that declare subject codes on at least one pattern. */
  readonly hasSubject?: boolean | undefined;
  readonly include?: readonly InstitutionIdByCategory<TCategory>[] | undefined;
  readonly exclude?: readonly InstitutionIdByCategory<TCategory>[] | undefined;
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
