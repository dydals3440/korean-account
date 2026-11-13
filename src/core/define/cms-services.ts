import type { CmsService, CmsServices } from "../../types";

/**
 * Builds the PDF service columns from the services marked available (○).
 *
 * @example
 * cmsServices("directDebit", "directCredit", "additionalServices"); // PDF ×○○○
 * cmsServices("virtualAccount", "directCredit");                     // PDF ○×○×
 */
export function cmsServices(...available: readonly CmsService[]): CmsServices {
  return {
    virtualAccount: available.includes("virtualAccount"),
    directDebit: available.includes("directDebit"),
    directCredit: available.includes("directCredit"),
    additionalServices: available.includes("additionalServices"),
  };
}
