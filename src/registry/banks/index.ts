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

export {
  bnpParibas,
  boa,
  busan,
  citi,
  deutsche,
  gwangju,
  gyeongnam,
  hana,
  hanaSecuritiesCma,
  hsbc,
  ibk,
  imBank,
  jeju,
  jeonbuk,
  jpmc,
  kakao,
  kb,
  kbank,
  kdb,
  nh,
  sc,
  shinhan,
  suhyup,
  toss,
  woori,
};

/** Built-in banks, in KFTC registry order. */
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
