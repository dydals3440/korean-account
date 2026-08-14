import {
  type InstitutionIdByCategory,
  institutions,
  type RegisteredInstitution,
} from "../registry";
import type { AccountKind, Institution, InstitutionCategory } from "../types";

/** Passes when inside `include` (if given) and outside `exclude` (always wins). */
function passesIdFilter(
  institution: Institution,
  includeSet: ReadonlySet<string> | null,
  excludeSet: ReadonlySet<string> | null,
): boolean {
  if (includeSet && !includeSet.has(institution.id)) {
    return false;
  }
  return !excludeSet?.has(institution.id);
}

function toSet(ids: readonly string[] | undefined): ReadonlySet<string> | null {
  return ids ? new Set<string>(ids) : null;
}

/**
 * When `categories` narrows, the ids accepted by `include` / `exclude` narrow
 * to that category as well (autocomplete + compile-time checking).
 */
export interface SearchInstitutionsFilter<
  Categories extends InstitutionCategory = InstitutionCategory,
> {
  /** Category allowlist. Omit for all categories. */
  readonly categories?: readonly Categories[];
  /** Kind allowlist — keeps institutions with at least one pattern of these kinds. */
  readonly kinds?: readonly AccountKind[];
  /** Keeps institutions that declare subject codes on at least one pattern. */
  readonly hasSubject?: boolean;
  /**
   * Id allowlist. Combined with `categories`, only ids within those
   * categories are accepted.
   *
   * @example
   * searchInstitutions({ categories: ["bank"], include: ["kb"] });     // ✓
   * searchInstitutions({ categories: ["bank"], include: ["kiwoom"] }); // ✗ kiwoom is securities
   */
  readonly include?: readonly InstitutionIdByCategory<Categories>[];
  /** Id blocklist. Cross-checked against `categories` the same way. */
  readonly exclude?: readonly InstitutionIdByCategory<Categories>[];
}

/**
 * Filters the built-in registry. All filters combine with AND.
 *
 * The returned institution union narrows by the `categories` literals
 * (e.g. `categories: ["bank"]` returns only bank institutions).
 *
 * Importing this pulls the entire registry into your bundle. For a
 * bundle-size-sensitive fixed subset, import the institution constants
 * directly instead: `createDetector([kb, shinhan])`.
 *
 * @example
 * searchInstitutions();                                            // everything
 * searchInstitutions({ categories: ["bank"] });                    // banks only — narrowed
 * searchInstitutions({ categories: ["bank"], include: ["kb"] });   // banks ∩ kb
 * searchInstitutions({ categories: ["bank"], exclude: ["hsbc"] }); // banks \ hsbc
 */
export function searchInstitutions<
  const Categories extends InstitutionCategory = InstitutionCategory,
>(
  filter: SearchInstitutionsFilter<Categories> = {},
): readonly Extract<RegisteredInstitution, { category: Categories }>[] {
  const categoriesSet = filter.categories ? new Set<InstitutionCategory>(filter.categories) : null;
  const includeSet = toSet(filter.include);
  const excludeSet = toSet(filter.exclude);
  const kindSet = filter.kinds ? new Set<AccountKind>(filter.kinds) : null;

  return institutions.filter((i): i is Extract<RegisteredInstitution, { category: Categories }> => {
    if (categoriesSet && !categoriesSet.has(i.category)) {
      return false;
    }
    if (!passesIdFilter(i, includeSet, excludeSet)) {
      return false;
    }
    if (kindSet && !i.patterns.some((p) => kindSet.has(p.kind))) {
      return false;
    }
    if (filter.hasSubject && !i.patterns.some((p) => p.subjects && p.subjects.length > 0)) {
      return false;
    }
    return true;
  });
}
