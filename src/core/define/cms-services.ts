import type { CmsService, CmsServices } from "../../types";

/**
 * Returns a service-availability record with the listed services available and the rest not.
 *
 * Mirrors the four service columns of the KFTC CMS account-number table, in order: virtual
 * account (가상계좌), direct debit (출금이체), direct credit (입금이체) and additional services
 * (부가서비스). Copy a table row into a pattern's `services` by listing the columns marked ○.
 * Detection reports the record as `capabilities.services`, and `directDebit` decides
 * `capabilities.allowsWithdrawal` unless the matched subject overrides it.
 *
 * @param available - Services marked ○; order and duplicates do not matter, and none at all
 *   marks every service unavailable.
 * @returns A new record with all four services set.
 * @example
 * cmsServices("directDebit", "directCredit", "additionalServices"); // table row × ○ ○ ○
 * // => { virtualAccount: false, directDebit: true, directCredit: true, additionalServices: true }
 *
 * cmsServices("virtualAccount", "directCredit"); // table row ○ × ○ ×
 * // => { virtualAccount: true, directDebit: false, directCredit: true, additionalServices: false }
 */
export function cmsServices(...available: readonly CmsService[]): CmsServices {
  return {
    virtualAccount: available.includes("virtualAccount"),
    directDebit: available.includes("directDebit"),
    directCredit: available.includes("directCredit"),
    additionalServices: available.includes("additionalServices"),
  };
}
