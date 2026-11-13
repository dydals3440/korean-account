import type { InstitutionCategory } from "../types";
import { banks } from "./banks";
import { nonBanks } from "./non-banks";
import { securities } from "./securities";

/** Every built-in institution, in KFTC registry order. */
export const institutions = [...banks, ...nonBanks, ...securities] as const;

/** Union of the built-in institutions. */
export type RegisteredInstitution = (typeof institutions)[number];

/** Union of built-in representative CMS codes. */
export type InstitutionCode = RegisteredInstitution["code"];

/**
 * Union of built-in institution ids in a category.
 *
 * @example
 * type BankId = InstitutionIdByCategory<"bank">; // "kdb" | "ibk" | ...
 */
export type InstitutionIdByCategory<TCategory extends InstitutionCategory> = Extract<
  RegisteredInstitution,
  { category: TCategory }
>["id"];
