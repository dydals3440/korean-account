/**
 * Securities firms. Digit counts and subject positions vary widely by firm
 * and some are undisclosed. Only the digit-count variants stated in the PDF
 * are registered; firms using bare serial numbers get length-only matching
 * without `subjects`.
 *
 * The `securities` array below is the registry-order authority — order is
 * locked by institution-ids.types.spec.ts.
 */

export { yuanta } from "./yuanta";
export { kbSec } from "./kb-sec";
export { miraeAsset } from "./mirae-asset";
export { samsungSec } from "./samsung-sec";
export { kis } from "./kis";
export { nhInv } from "./nh-inv";
export { kyoboSec } from "./kyobo-sec";
export { imSec } from "./im-sec";
export { hyundaiMotorSec } from "./hyundai-motor-sec";
export { kiwoom } from "./kiwoom";
export { lsSec } from "./ls-sec";
export { skSec } from "./sk-sec";
export { daishin } from "./daishin";
export { hanwhaInv } from "./hanwha-inv";
export { hanaSec } from "./hana-sec";
export { shinhanInv } from "./shinhan-inv";
export { dbSec } from "./db-sec";
export { eugeneInv } from "./eugene-inv";
export { meritz } from "./meritz";
export { kakaopaySec } from "./kakaopay-sec";
export { bookookSec } from "./bookook-sec";
export { shinyoungSec } from "./shinyoung-sec";
export { capeInv } from "./cape-inv";
export { wooriInv } from "./woori-inv";

import { yuanta } from "./yuanta";
import { kbSec } from "./kb-sec";
import { miraeAsset } from "./mirae-asset";
import { samsungSec } from "./samsung-sec";
import { kis } from "./kis";
import { nhInv } from "./nh-inv";
import { kyoboSec } from "./kyobo-sec";
import { imSec } from "./im-sec";
import { hyundaiMotorSec } from "./hyundai-motor-sec";
import { kiwoom } from "./kiwoom";
import { lsSec } from "./ls-sec";
import { skSec } from "./sk-sec";
import { daishin } from "./daishin";
import { hanwhaInv } from "./hanwha-inv";
import { hanaSec } from "./hana-sec";
import { shinhanInv } from "./shinhan-inv";
import { dbSec } from "./db-sec";
import { eugeneInv } from "./eugene-inv";
import { meritz } from "./meritz";
import { kakaopaySec } from "./kakaopay-sec";
import { bookookSec } from "./bookook-sec";
import { shinyoungSec } from "./shinyoung-sec";
import { capeInv } from "./cape-inv";
import { wooriInv } from "./woori-inv";

/** All securities firms, in KFTC CMS registry order. */
export const securities = [
  yuanta,
  kbSec,
  miraeAsset,
  samsungSec,
  kis,
  nhInv,
  kyoboSec,
  imSec,
  hyundaiMotorSec,
  kiwoom,
  lsSec,
  skSec,
  daishin,
  hanwhaInv,
  hanaSec,
  shinhanInv,
  dbSec,
  eugeneInv,
  meritz,
  kakaopaySec,
  bookookSec,
  shinyoungSec,
  capeInv,
  wooriInv,
] as const;
