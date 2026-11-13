/**
 * Commercial, special-purpose, regional, internet-only, and foreign banks.
 *
 * Codes, digit counts, and identifier/subject positions follow the KFTC CMS
 * per-participant account number layout (2026.05.08):
 * https://www.cmsedi.or.kr/cms/board/workdata/cms
 *
 * Patterns are split by `kind`, so new/old/virtual/lifetime/incoming-only/
 * merged-legacy patterns coexist within one institution. Patterns with
 * `subjects` also expose the account subject category in match results.
 */

export { kdb } from "./kdb";
export { ibk } from "./ibk";
export { kb } from "./kb";
export { hana } from "./hana";
export { suhyup } from "./suhyup";
export { nh } from "./nh";
export { woori } from "./woori";
export { sc } from "./sc";
export { citi } from "./citi";
export { imBank } from "./im-bank";
export { busan } from "./busan";
export { gwangju } from "./gwangju";
export { jeju } from "./jeju";
export { jeonbuk } from "./jeonbuk";
export { gyeongnam } from "./gyeongnam";
export { hsbc } from "./hsbc";
export { deutsche } from "./deutsche";
export { jpmc } from "./jpmc";
export { boa } from "./boa";
export { bnpParibas } from "./bnp-paribas";
export { hanaSecuritiesCma } from "./hana-securities-cma";
export { shinhan } from "./shinhan";
export { kbank } from "./kbank";
export { kakao } from "./kakao";
export { toss } from "./toss";

import { bnpParibas } from "./bnp-paribas";
import { boa } from "./boa";
import { busan } from "./busan";
import { citi } from "./citi";
import { deutsche } from "./deutsche";
import { gwangju } from "./gwangju";
import { gyeongnam } from "./gyeongnam";
import { hana } from "./hana";
import { hanaSecuritiesCma } from "./hana-securities-cma";
import { hsbc } from "./hsbc";
import { ibk } from "./ibk";
import { imBank } from "./im-bank";
import { jeju } from "./jeju";
import { jeonbuk } from "./jeonbuk";
import { jpmc } from "./jpmc";
import { kakao } from "./kakao";
import { kb } from "./kb";
import { kbank } from "./kbank";
import { kdb } from "./kdb";
import { nh } from "./nh";
import { sc } from "./sc";
import { shinhan } from "./shinhan";
import { suhyup } from "./suhyup";
import { toss } from "./toss";
import { woori } from "./woori";

/** All bank institutions, in KFTC CMS registry order. */
export const banks = [
  kdb,
  ibk,
  kb,
  hana,
  suhyup,
  nh,
  woori,
  sc,
  citi,
  imBank,
  busan,
  gwangju,
  jeju,
  jeonbuk,
  gyeongnam,
  hsbc,
  deutsche,
  jpmc,
  boa,
  bnpParibas,
  hanaSecuritiesCma,
  shinhan,
  kbank,
  kakao,
  toss,
] as const;
