import type { InstitutionCategory } from "../types";
import { banks } from "./banks";
import { nonBanks } from "./non-banks";
import { securities } from "./securities";

/**
 * Every built-in institution: banks, then non-banks and the clearing house, then securities
 * firms. This is the list `detect` and `getInstitution` use.
 *
 * Importing it bundles the whole registry. To ship fewer institutions, pass the named exports
 * you need (`kb`, `shinhan`, ...) to `createDetector` instead.
 *
 * @example
 * const detector = createDetector(institutions, { scoring: { identifierMatch: 6 } });
 */
export const institutions = [...banks, ...nonBanks, ...securities] as const;

/**
 * Union of the built-in institution types, each with literal `id`, `code` and `category`.
 *
 * @example
 * type Kb = Extract<RegisteredInstitution, { id: "kb" }>; // code: "004", category: "bank"
 */
export type RegisteredInstitution = (typeof institutions)[number];

/**
 * Union of the built-in representative CMS codes (`Institution.code`), e.g. `"004" | "088"`.
 * Excludes `aliasCodes` and `commonCode`.
 */
export type InstitutionCode = RegisteredInstitution["code"];

/**
 * Union of built-in institution ids in a category.
 *
 * @typeParam TCategory - Category, or a union of categories, to select.
 * @example
 * type BankId = InstitutionIdByCategory<"bank">; // "kdb" | "ibk" | ...
 */
export type InstitutionIdByCategory<TCategory extends InstitutionCategory> = Extract<
  RegisteredInstitution,
  { category: TCategory }
>["id"];
