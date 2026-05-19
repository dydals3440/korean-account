import { type InstitutionIdByCategory, institutions, type RegisteredInstitution } from "../data";
import type { AccountKind, InstitutionCategory } from "../types";

/**
 * `categories` 가 좁혀지면 `include` / `exclude` 가 받을 수 있는 id 도 자동으로
 * 그 카테고리 내 id 로 좁혀진다 (autocomplete + 컴파일 검증).
 *
 * `const` 추론 — array literal 을 그대로 넘기면 literal union 으로 inference.
 */
export interface PickInstitutionsFilter<
  Categories extends InstitutionCategory = InstitutionCategory,
> {
  /** 카테고리 화이트리스트. 없으면 전체. */
  readonly categories?: readonly Categories[];
  /** kind 화이트리스트 — 해당 kind 패턴을 하나라도 가진 institution 만 통과. */
  readonly kinds?: readonly AccountKind[];
  /** subjects (과목) 가 정의된 패턴이 하나라도 있는 institution 만 통과. */
  readonly hasSubject?: boolean;
  /**
   * id 화이트리스트. `categories` 가 함께 지정되면 그 카테고리 내 id 만 받는다.
   *
   * @example
   * pickInstitutions({ categories: ["bank"], include: ["kb"] });     // ✓
   * pickInstitutions({ categories: ["bank"], include: ["kiwoom"] }); // ❌ kiwoom 은 securities
   */
  readonly include?: readonly InstitutionIdByCategory<Categories>[];
  /** id 블랙리스트. `categories` 와 cross-check 동일하게 동작. */
  readonly exclude?: readonly InstitutionIdByCategory<Categories>[];
}

/**
 * 기본 레지스트리에서 조건에 맞는 institution 만 추려 반환한다. 모든 필터는 AND.
 *
 * 반환 institution union 은 `categories` literal 기준으로 narrow 된다
 * (예: `categories: ["bank"]` → 은행 institution 만).
 *
 * `include` 만 사용해 결과를 더 narrow 하고 싶으면 `pickInstitutionsByIds` 를 쓴다.
 *
 * @example
 * pickInstitutions();                                            // 전체
 * pickInstitutions({ categories: ["bank"] });                    // 은행만 — narrow
 * pickInstitutions({ categories: ["bank"], include: ["kb"] });   // 은행 ∩ kb
 * pickInstitutions({ categories: ["bank"], exclude: ["hsbc"] }); // 은행 \ hsbc
 */
export function pickInstitutions<
  const Categories extends InstitutionCategory = InstitutionCategory,
>(
  filter: PickInstitutionsFilter<Categories> = {},
): readonly Extract<RegisteredInstitution, { category: Categories }>[] {
  const categoriesSet = filter.categories ? new Set<InstitutionCategory>(filter.categories) : null;
  const includeSet = filter.include ? new Set<string>(filter.include) : null;
  const excludeSet = filter.exclude ? new Set<string>(filter.exclude) : null;
  const kindSet = filter.kinds ? new Set<AccountKind>(filter.kinds) : null;

  return institutions.filter((i): i is Extract<RegisteredInstitution, { category: Categories }> => {
    if (categoriesSet && !categoriesSet.has(i.category)) {
      return false;
    }
    if (includeSet && !includeSet.has(i.id)) {
      return false;
    }
    if (excludeSet?.has(i.id)) {
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

/**
 * id 만으로 institution 을 추리는 변형. 반환 institution union 이
 * `Extract<RegisteredInstitution, { id: Exclude<IncludeId, ExcludeId> }>` 로
 * 좁혀진다. `categories` 와 동시 사용은 `pickInstitutions` 를 쓰는 게 깔끔하다.
 *
 * @example
 * pickInstitutionsByIds({ include: ["kb", "shinhan", "hana"] });
 * // → Institution<"kb"> | Institution<"shinhan"> | Institution<"hana">
 *
 * pickInstitutionsByIds({ exclude: ["hsbc", "deutsche", "jpmc", "bnp-paribas"] });
 * // → 외국계 4개 제외한 전체 union
 */
export function pickInstitutionsByIds<
  const IncludeId extends RegisteredInstitution["id"] = RegisteredInstitution["id"],
  const ExcludeId extends RegisteredInstitution["id"] = never,
>(
  filter: { readonly include?: readonly IncludeId[]; readonly exclude?: readonly ExcludeId[] } = {},
): readonly Extract<RegisteredInstitution, { id: Exclude<IncludeId, ExcludeId> }>[] {
  const includeSet = filter.include ? new Set<string>(filter.include) : null;
  const excludeSet = filter.exclude ? new Set<string>(filter.exclude) : null;

  return institutions.filter(
    (i): i is Extract<RegisteredInstitution, { id: Exclude<IncludeId, ExcludeId> }> => {
      if (includeSet && !includeSet.has(i.id)) {
        return false;
      }
      if (excludeSet?.has(i.id)) {
        return false;
      }
      return true;
    },
  );
}
