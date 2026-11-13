import { filterInstitutions } from "../core/lookup/filter-institutions";
import {
  type InstitutionIdByCategory,
  institutions,
  type RegisteredInstitution,
} from "../registry/institutions";
import type { AccountKind, InstitutionCategory } from "../types";

/**
 * Criteria for {@link searchInstitutions}. Every given field must match; omitted or `undefined`
 * fields do not filter, and an empty array matches nothing.
 *
 * @typeParam TCategory - Categories in `categories`; `include` and `exclude` then accept only
 *   ids in those categories.
 */
export interface SearchInstitutionsFilter<
  TCategory extends InstitutionCategory = InstitutionCategory,
> {
  /** Keeps institutions in these categories and narrows the result type to them. */
  readonly categories?: readonly TCategory[] | undefined;
  /** Keeps institutions with at least one pattern of these kinds. */
  readonly kinds?: readonly AccountKind[] | undefined;
  /** `true` keeps institutions that declare subject codes on a pattern; `false` does not filter. */
  readonly hasSubject?: boolean | undefined;
  /** Keeps only these ids. Results stay in registry order, not in this order. */
  readonly include?: readonly InstitutionIdByCategory<TCategory>[] | undefined;
  /** Drops these ids; wins over `include`. */
  readonly exclude?: readonly InstitutionIdByCategory<TCategory>[] | undefined;
}

/**
 * Returns the built-in institutions that match every given criterion, in registry order.
 *
 * Use it to build institution pickers or to choose the list passed to {@link createDetector}.
 * Listing `categories` narrows the result type to those categories and restricts `include` and
 * `exclude` to their ids at compile time.
 *
 * This imports the whole registry; when the list is fixed, import the institution constants
 * (e.g. `kb`, `shinhan`) or the `banks`, `nonBanks` and `securities` groups instead.
 *
 * @typeParam TCategory - Inferred from `filter.categories`; defaults to every category.
 * @param filter - Criteria; defaults to `{}`, which returns every built-in institution.
 * @returns The matching institutions, or an empty array when none match.
 * @example
 * const bankList = searchInstitutions({ categories: ["bank"], exclude: ["hsbc"] });
 * bankList[0]?.category; // => "bank" (typed as "bank")
 *
 * searchInstitutions({ include: ["nh", "kb"] }).map((institution) => institution.id);
 * // => ["kb", "nh"]
 *
 * searchInstitutions({ categories: ["bank"], include: ["kiwoom"] }); // type error: securities id
 * @see {@link getInstitution} to look up a single institution by id or code.
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
