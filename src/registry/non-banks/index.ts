/**
 * Non-bank deposit institutions (Suhyup coop, NH coop, KFCC, Shinhyup,
 * savings banks, forestry coop, Korea Post) + KFTC (099, metadata only).
 */

export { suhyupCoop } from "./suhyup-coop";
export { nhCoop } from "./nh-coop";
export { kfcc } from "./kfcc";
export { shinhyup } from "./shinhyup";
export { savingsBank } from "./savings-bank";
export { forest } from "./forest";
export { post } from "./post";
export { kftc } from "./kftc";

import { forest } from "./forest";
import { kfcc } from "./kfcc";
import { kftc } from "./kftc";
import { nhCoop } from "./nh-coop";
import { post } from "./post";
import { savingsBank } from "./savings-bank";
import { shinhyup } from "./shinhyup";
import { suhyupCoop } from "./suhyup-coop";

/** All nonBanks institutions, in KFTC CMS registry order. */
export const nonBanks = [
  suhyupCoop,
  nhCoop,
  kfcc,
  shinhyup,
  savingsBank,
  forest,
  post,
  kftc,
] as const;
