import type { Institution, InstitutionCategory } from "../types";
import { BANKS } from "./banks";
import { NON_BANKS } from "./non-banks";
import { SECURITIES } from "./securities";

/** Every registered institution, in registry order. */
export const institutions = [...BANKS, ...NON_BANKS, ...SECURITIES] as const;

/** Union of all registered institutions. */
export type RegisteredInstitution = (typeof institutions)[number];

/** Union of registered institution ids. */
export type InstitutionId = RegisteredInstitution["id"];

/** Union of registered representative CMS codes. */
export type InstitutionCode = RegisteredInstitution["code"];

/**
 * Union of institution ids within the given category.
 *
 * @example
 * type BankId = InstitutionIdByCategory<"bank">;        // "kdb" | "ibk" | ...
 * type SecId  = InstitutionIdByCategory<"securities">;  // "yuanta" | "kbSec" | ...
 */
export type InstitutionIdByCategory<C extends InstitutionCategory> = Extract<
  RegisteredInstitution,
  { category: C }
>["id"];

// Without the pure annotations, bundlers treat these top-level initializers
// as side effects and retain the whole `institutions` array.
const BY_ID = /* @__PURE__ */ new Map<string, RegisteredInstitution>(
  institutions.map((i) => [i.id, i]),
);

const BY_CODE = /* @__PURE__ */ (() => {
  const map = new Map<string, RegisteredInstitution>();
  for (const i of institutions) {
    map.set(i.code, i);
    if (i.aliasCodes) for (const code of i.aliasCodes) map.set(code, i);
  }
  return map;
})();

/**
 * Looks up an institution by id or CMS code (representative and alias codes
 * both match).
 *
 * Passing a registered literal narrows the return type to that institution
 * and removes `null` — the registry is static, so the lookup cannot miss.
 * Arbitrary strings return `Institution | null`.
 *
 * Importing this pulls the entire registry into your bundle. For a fixed
 * subset, import the institution constants directly.
 *
 * @example
 * getInstitution("shinhan"); // Institution<"shinhan", "088", "bank">
 * getInstitution("088");     // same institution, by representative code
 * getInstitution("078");     // alias code — Institution | null
 * getInstitution("no-such"); // null
 */
export function getInstitution<Id extends InstitutionId>(
  idOrCode: Id,
): Extract<RegisteredInstitution, { id: Id }>;
export function getInstitution<Code extends InstitutionCode>(
  idOrCode: Code,
): Extract<RegisteredInstitution, { code: Code }>;
export function getInstitution(idOrCode: string): Institution | null;
export function getInstitution(idOrCode: string): Institution | null {
  return BY_ID.get(idOrCode) ?? BY_CODE.get(idOrCode) ?? null;
}
