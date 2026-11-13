import type { INSTITUTION_CATEGORIES } from "../constants";
import type { AccountPattern } from "./pattern";

/**
 * Kind of financial institution: `"bank"`, `"non-bank"` (cooperative central banks, savings
 * banks and Korea Post), `"securities"` or `"clearing"` (KFTC itself).
 *
 * Besides filtering, the category weights the `prevalence` tie-break prior: for the same user
 * base, banks rank above non-banks, which rank above securities firms.
 */
export type InstitutionCategory = (typeof INSTITUTION_CATEGORIES)[number];

/**
 * A financial institution and the account-number formats it issues.
 *
 * Declare custom institutions with `defineInstitution`, which keeps `id`, `code` and `category`
 * as literal types so detection results narrow to them.
 *
 * @typeParam TId - Literal institution id.
 * @typeParam TCode - Literal representative CMS code.
 * @typeParam TCategory - Literal category.
 * @example
 * const myBank = defineInstitution({
 *   id: "my-bank",
 *   code: "999",
 *   nameKo: "커스텀은행",
 *   category: "bank",
 *   aliases: [],
 *   patterns: [{ template: patternTemplate("XXX-XXX-XXXXXX"), kind: "new" }],
 * });
 * const detector = createDetector(institutions).extend({ institutions: [myBank] });
 */
export interface Institution<
  TId extends string = string,
  TCode extends string = string,
  TCategory extends InstitutionCategory = InstitutionCategory,
> {
  /**
   * Unique kebab-case id, e.g. `"shinhan"`. Used by `getInstitution`, the `include` and
   * `exclude` filters, `checkDigitVerifiers` and `BranchRuleResult.institutionId`.
   */
  readonly id: TId;
  /**
   * Representative CMS participant code (참가기관 코드), a zero-padded three-digit string such
   * as `"088"`. `getInstitution` resolves it.
   */
  readonly code: TCode;
  /**
   * KFTC standard bank code (표준은행코드) when it differs from `code`; `undefined` means it
   * equals `code`. Hana keeps `code: "005"` with `commonCode: "081"`. `getInstitution` does not
   * resolve it; read `commonCode ?? code` for systems keyed by the standard code.
   */
  readonly commonCode?: string | undefined;
  /**
   * Further CMS participant codes that `getInstitution` resolves to this institution, such as
   * codes of merged banks; `undefined` means none.
   */
  readonly aliasCodes?: readonly string[] | undefined;
  /** Korean display name, e.g. `"신한은행"`. */
  readonly nameKo: string;
  /** English display name; `undefined` when not set. */
  readonly nameEn?: string | undefined;
  /** Institution category. */
  readonly category: TCategory;
  /**
   * Short or former names, e.g. `["국민", "KB"]`, for your own search UI; detection does not
   * read them. Empty when there are none.
   */
  readonly aliases: readonly string[];
  /**
   * Retail customers in millions. Multiplied by a category factor to form the `prevalence`
   * prior, which orders equal scores and never changes a score; `undefined` counts as 0.
   */
  readonly userBaseMillions?: number | undefined;
  /**
   * Tie-break prior that replaces the computed `prevalence` outright, on the same scale as a
   * bank's `userBaseMillions`. Prefer `userBaseMillions`; `undefined` computes the prior.
   */
  readonly priority?: number | undefined;
  /**
   * Account-number formats. `detect` scores each one and keeps the institution's best match, so
   * an institution without patterns never matches.
   */
  readonly patterns: readonly AccountPattern[];
  /**
   * Ids of institutions merged into this one, e.g. Hana's `["keb-foreign-exchange"]`.
   * Informational; the ids need not be registered.
   */
  readonly successorOf?: readonly string[] | undefined;
  /** Free-form maintainer notes; detection does not read them. */
  readonly notes?: string | undefined;
}

/**
 * Institution id parameter that autocompletes the known `TId` literals but still accepts any
 * string, such as the id of an institution added with `extend`.
 *
 * @typeParam TId - Known ids to suggest.
 */
export type InstitutionIdInput<TId extends string = string> = TId | (string & Record<never, never>);
