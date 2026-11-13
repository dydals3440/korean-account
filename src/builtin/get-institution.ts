import { createInstitutionLookup } from "../core/lookup/create-institution-lookup";
import type { InstitutionId } from "../registry/institution-ids";
import {
  type InstitutionCode,
  institutions,
  type RegisteredInstitution,
} from "../registry/institutions";
import type { Institution } from "../types";

const findBuiltinInstitution = createInstitutionLookup(institutions);

/**
 * Returns the built-in institution with the given id or CMS participant code.
 *
 * Ids are matched before codes. Codes cover the representative `code` and the `aliasCodes`
 * absorbed through mergers (e.g. `"021"` resolves to Shinhan), but not `commonCode`: `"081"`
 * is Hana Bank's interbank code yet resolves to `"hana-securities-cma"`, whose CMS code it is.
 * Matching is exact and case-sensitive.
 *
 * A registered id or representative code literal narrows the return type to that institution
 * and drops `null`; any other string returns `Institution | null`. This imports the whole
 * registry; when the institution is known in advance, import its constant (e.g. `shinhan`).
 *
 * @typeParam TId - Registered id literal.
 * @param id - Institution id such as `"shinhan"`.
 * @returns The institution, typed as that registry entry.
 * @example
 * getInstitution("shinhan").code; // => "088" (typed as "088")
 * @see {@link searchInstitutions} to filter by category, kind or subject support.
 */
export function getInstitution<TId extends InstitutionId>(
  id: TId,
): Extract<RegisteredInstitution, { id: TId }>;
/**
 * Returns the built-in institution whose representative CMS participant code is `code`.
 *
 * @typeParam TCode - Registered representative code literal.
 * @param code - Three-digit CMS code such as `"088"`.
 * @returns The institution, typed as that registry entry.
 * @example
 * getInstitution("003").id; // => "ibk"
 */
export function getInstitution<TCode extends InstitutionCode>(
  code: TCode,
): Extract<RegisteredInstitution, { code: TCode }>;
/**
 * Returns the built-in institution with the given id, CMS code or alias code, or `null`.
 *
 * Ids are matched before codes; `commonCode` is not searched, and matching is case-sensitive.
 *
 * @param idOrCode - Institution id or CMS participant code, e.g. from user input or a database.
 * @returns The institution, or `null` when nothing matches.
 * @example
 * getInstitution("021")?.id; // => "shinhan" (alias code)
 * getInstitution("SHINHAN"); // => null
 */
export function getInstitution(idOrCode: string): Institution | null;
export function getInstitution(idOrCode: string): Institution | null {
  return findBuiltinInstitution(idOrCode);
}
