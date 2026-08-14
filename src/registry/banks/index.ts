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

import { kdb } from "./kdb";
import { ibk } from "./ibk";
import { kb } from "./kb";
import { hana } from "./hana";
import { suhyup } from "./suhyup";
import { nh } from "./nh";
import { woori } from "./woori";
import { sc } from "./sc";
import { citi } from "./citi";
import { imBank } from "./im-bank";
import { busan } from "./busan";
import { gwangju } from "./gwangju";
import { jeju } from "./jeju";
import { jeonbuk } from "./jeonbuk";
import { gyeongnam } from "./gyeongnam";
import { hsbc } from "./hsbc";
import { deutsche } from "./deutsche";
import { jpmc } from "./jpmc";
import { boa } from "./boa";
import { bnpParibas } from "./bnp-paribas";
import { hanaSecuritiesCma } from "./hana-securities-cma";
import { shinhan } from "./shinhan";
import { kbank } from "./kbank";
import { kakao } from "./kakao";
import { toss } from "./toss";

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
