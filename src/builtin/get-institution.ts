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
 * Looks up a built-in institution by id, representative code or alias code.
 * A registered literal narrows the return type and removes `null`.
 *
 * @example
 * getInstitution("shinhan"); // Institution<"shinhan", "088", "bank">
 * getInstitution("088");     // same institution, by code
 * getInstitution("no-such"); // null
 */
export function getInstitution<TId extends InstitutionId>(
  id: TId,
): Extract<RegisteredInstitution, { id: TId }>;
export function getInstitution<TCode extends InstitutionCode>(
  code: TCode,
): Extract<RegisteredInstitution, { code: TCode }>;
export function getInstitution(idOrCode: string): Institution | null;
export function getInstitution(idOrCode: string): Institution | null {
  return findBuiltinInstitution(idOrCode);
}
