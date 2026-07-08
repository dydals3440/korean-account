/**
 * 등록된 institution id 목록 — **순수 리터럴만** 담는다.
 *
 * `institutions` (`./index`) 는 57개 `defineInstitution(...)` 호출로 만들어지므로
 * 번들러가 순수성을 증명하지 못해 통째로 유지된다. id 하나만 필요한 소비자
 * (예: `korean-account/schema` 의 `institutionIdSchema`) 가 레지스트리 94 KB 를
 * 끌고 오지 않도록, 팩토리 호출 없는 배열을 따로 둔다.
 *
 * `./institutionIds.spec.ts` 가 런타임·타입 양쪽에서 `institutions` 와의 동기화를
 * 강제하므로 한쪽만 고치면 CI 가 실패한다.
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
