import type { AdditionalRule } from "../../types";

/**
 * Prefixes occupied by 005 Hana Bank's merged foreign-exchange legacy 14d
 * pattern (`XXX-XXXXXX-XXXXX`).
 *
 * Used as an exclusion condition in `additionalRules` so that same-length
 * 14d patterns (iM Bank new, Hana Securities CMA, ...) do not
 * false-positive.
 */
export const HANA_FOREIGN_LEGACY_PREFIXES: ReadonlySet<string> = /* @__PURE__ */ new Set([
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
