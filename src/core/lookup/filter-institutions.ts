import type { AccountKind, Institution, InstitutionCategory } from "../../types";

/** Criteria for {@link filterInstitutions}. All given criteria must match; `exclude` wins over `include`. */
export interface InstitutionFilter {
  readonly categories?: readonly InstitutionCategory[];
  /** Keeps institutions with at least one pattern of these kinds. */
  readonly kinds?: readonly AccountKind[];
  /** Keeps institutions that declare subject codes on at least one pattern. */
  readonly hasSubject?: boolean;
  readonly include?: readonly string[];
  readonly exclude?: readonly string[];
}

/** Returns the institutions matching every given criterion, in input order. */
export function filterInstitutions<TInstitution extends Institution>(
  institutions: readonly TInstitution[],
  filter: InstitutionFilter,
): TInstitution[] {
  const categories = filter.categories ? new Set(filter.categories) : null;
  const kinds = filter.kinds ? new Set(filter.kinds) : null;
  const includedIds = filter.include ? new Set(filter.include) : null;
  const excludedIds = filter.exclude ? new Set(filter.exclude) : null;

  return institutions.filter((institution) => {
    const isInCategory = categories?.has(institution.category) ?? true;
    const isIncluded = includedIds?.has(institution.id) ?? true;
    const isExcluded = excludedIds?.has(institution.id) ?? false;
    const hasKind = kinds ? institution.patterns.some((pattern) => kinds.has(pattern.kind)) : true;
    const hasSubjects = filter.hasSubject
      ? institution.patterns.some((pattern) => (pattern.subjects?.length ?? 0) > 0)
      : true;

    return isInCategory && isIncluded && !isExcluded && hasKind && hasSubjects;
  });
}
