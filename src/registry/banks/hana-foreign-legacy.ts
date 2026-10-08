import type { AdditionalRule } from "../../types";

/** Historical augmentation, not enumerated or proven exclusive by the PDF. */
export const HANA_FOREIGN_LEGACY_PREFIXES: ReadonlySet<string> = new Set([
  "117",
  "158",
  "161",
  "162",
  "210",
  "379",
  "600",
  "655",
]);

export const isHanaForeignLegacy14: AdditionalRule = (digits) =>
  digits.length === 14 && HANA_FOREIGN_LEGACY_PREFIXES.has(digits.slice(0, 3));

export const isNotHanaForeignLegacy14: AdditionalRule = (digits) =>
  digits.length === 14 && !HANA_FOREIGN_LEGACY_PREFIXES.has(digits.slice(0, 3));
