import type { INSTITUTION_CATEGORIES } from "../constants";
import type { AccountPattern } from "./pattern";

/** Financial institution category. */
export type InstitutionCategory = (typeof INSTITUTION_CATEGORIES)[number];

/**
 * A financial institution and its account formats.
 *
 * `TId`, `TCode` and `TCategory` keep literal types so results narrow; `defineInstitution` infers them.
 */
export interface Institution<
  TId extends string = string,
  TCode extends string = string,
  TCategory extends InstitutionCategory = InstitutionCategory,
> {
  readonly id: TId;
  /** Representative CMS participant code. */
  readonly code: TCode;
  /** Interbank code when it differs from `code`, e.g. Hana keeps `code: "005"` with `commonCode: "081"`. */
  readonly commonCode?: string;
  /** Additional CMS participant codes. */
  readonly aliasCodes?: readonly string[];
  readonly nameKo: string;
  readonly nameEn?: string;
  readonly category: TCategory;
  /** Search aliases such as short or former names. */
  readonly aliases: readonly string[];
  /** Retail customers in millions; feeds the tie-break prior, never the score. */
  readonly userBaseMillions?: number;
  /** Explicit tie-break prior that replaces the computed prevalence. */
  readonly priority?: number;
  readonly patterns: readonly AccountPattern[];
  /** Ids of institutions merged into this one. */
  readonly successorOf?: readonly string[];
  readonly notes?: string;
}

/** Institution id that autocompletes known literals but still accepts any string. */
export type InstitutionIdInput<TId extends string = string> = TId | (string & Record<never, never>);
