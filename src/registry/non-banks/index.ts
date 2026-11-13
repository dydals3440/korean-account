import { forest } from "./forest";
import { kfcc } from "./kfcc";
import { kftc } from "./kftc";
import { nhCoop } from "./nh-coop";
import { post } from "./post";
import { savingsBank } from "./savings-bank";
import { shinhyup } from "./shinhyup";
import { suhyupCoop } from "./suhyup-coop";

export { forest, kfcc, kftc, nhCoop, post, savingsBank, shinhyup, suhyupCoop };

/** Built-in non-bank institutions and KFTC, in KFTC registry order. */
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
