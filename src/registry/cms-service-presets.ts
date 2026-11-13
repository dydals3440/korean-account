import { cmsServices } from "../core/define";

/** PDF ×○○○, the most common row: direct debit, credit transfer and additional services. */
export const REGULAR_ACCOUNT_SERVICES = cmsServices(
  "directDebit",
  "directCredit",
  "additionalServices",
);
