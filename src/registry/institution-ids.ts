/**
 * Built-in institution ids as plain literals, in `institutions` order. Adapters validate ids
 * against this list without bundling the registry data; `institution-ids.types.spec.ts` fails
 * when it drifts from the registry.
 */
export const INSTITUTION_IDS = [
  // banks (25)
  "kdb",
  "ibk",
  "kb",
  "hana",
  "suhyup",
  "nh",
  "woori",
  "sc",
  "citi",
  "im-bank",
  "busan",
  "gwangju",
  "jeju",
  "jeonbuk",
  "gyeongnam",
  "hsbc",
  "deutsche",
  "jpmc",
  "boa",
  "bnp-paribas",
  "hana-securities-cma",
  "shinhan",
  "kbank",
  "kakao",
  "toss",
  // non-banks + clearing (8)
  "suhyup-coop",
  "nh-coop",
  "kfcc",
  "shinhyup",
  "savings-bank",
  "forest",
  "post",
  "kftc",
  // securities (24)
  "yuanta",
  "kb-sec",
  "mirae-asset",
  "samsung-sec",
  "kis",
  "nh-inv",
  "kyobo-sec",
  "im-sec",
  "hyundai-motor-sec",
  "kiwoom",
  "ls-sec",
  "sk-sec",
  "daishin",
  "hanwha-inv",
  "hana-sec",
  "shinhan-inv",
  "db-sec",
  "eugene-inv",
  "meritz",
  "kakaopay-sec",
  "bookook-sec",
  "shinyoung-sec",
  "cape-inv",
  "woori-inv",
] as const;

/**
 * Union of built-in institution ids, e.g. `"kb" | "shinhan" | "toss" | ...`. Accepted by
 * `getInstitution`, `pickPattern` and the `detect` filters.
 */
export type InstitutionId = (typeof INSTITUTION_IDS)[number];
