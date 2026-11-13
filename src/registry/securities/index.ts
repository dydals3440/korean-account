import { bookookSec } from "./bookook-sec";
import { capeInv } from "./cape-inv";
import { daishin } from "./daishin";
import { dbSec } from "./db-sec";
import { eugeneInv } from "./eugene-inv";
import { hanaSec } from "./hana-sec";
import { hanwhaInv } from "./hanwha-inv";
import { hyundaiMotorSec } from "./hyundai-motor-sec";
import { imSec } from "./im-sec";
import { kakaopaySec } from "./kakaopay-sec";
import { kbSec } from "./kb-sec";
import { kis } from "./kis";
import { kiwoom } from "./kiwoom";
import { kyoboSec } from "./kyobo-sec";
import { lsSec } from "./ls-sec";
import { meritz } from "./meritz";
import { miraeAsset } from "./mirae-asset";
import { nhInv } from "./nh-inv";
import { samsungSec } from "./samsung-sec";
import { shinhanInv } from "./shinhan-inv";
import { shinyoungSec } from "./shinyoung-sec";
import { skSec } from "./sk-sec";
import { wooriInv } from "./woori-inv";
import { yuanta } from "./yuanta";

export {
  bookookSec,
  capeInv,
  daishin,
  dbSec,
  eugeneInv,
  hanaSec,
  hanwhaInv,
  hyundaiMotorSec,
  imSec,
  kakaopaySec,
  kbSec,
  kis,
  kiwoom,
  kyoboSec,
  lsSec,
  meritz,
  miraeAsset,
  nhInv,
  samsungSec,
  shinhanInv,
  shinyoungSec,
  skSec,
  wooriInv,
  yuanta,
};

/** Built-in securities firms, in KFTC registry order. */
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
