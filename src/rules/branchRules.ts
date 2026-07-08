import type { BranchRule } from "../types";

function inRange(value: number, from: number, to: number): boolean {
  return value >= from && value <= to;
}

function digitsAt(digits: string, start: number, length: number): string {
  return digits.slice(start, start + length);
}

export const suhyup11BranchToCoop: BranchRule = {
  describe: "수협 11자리: 4·5번째 자리에 따라 030(중앙회) 라우팅",
  evaluate(digits) {
    if (digits.length !== 11) {
      return null;
    }
    const midTwoDigits = Number(digitsAt(digits, 3, 2));
    if (Number.isNaN(midTwoDigits)) {
      return null;
    }
    const routesToCoop =
      inRange(midTwoDigits, 43, 45) ||
      midTwoDigits === 47 ||
      midTwoDigits === 49 ||
      midTwoDigits === 59 ||
      inRange(midTwoDigits, 61, 64) ||
      inRange(midTwoDigits, 66, 68) ||
      midTwoDigits === 74 ||
      midTwoDigits === 75 ||
      midTwoDigits === 78 ||
      inRange(midTwoDigits, 81, 85) ||
      midTwoDigits === 93;
    if (routesToCoop) {
      return { institutionId: "suhyup-coop" };
    }
    return null;
  },
};

export const suhyup12BranchToCoop: BranchRule = {
  describe: "수협 12자리: 1번째 자리가 2/7/9면 030(중앙회) 라우팅",
  evaluate(digits) {
    if (digits.length !== 12) {
      return null;
    }
    const firstDigit = digits[0];
    const routesToCoop = firstDigit === "2" || firstDigit === "7" || firstDigit === "9";
    if (routesToCoop) {
      return { institutionId: "suhyup-coop" };
    }
    return null;
  },
};

export const suhyup14BranchToCoop: BranchRule = {
  describe: "수협 14자리: 1·2·3번째가 493/481~489면 030 라우팅",
  evaluate(digits) {
    if (digits.length !== 14) {
      return null;
    }
    const prefixThreeDigits = Number(digitsAt(digits, 0, 3));
    if (Number.isNaN(prefixThreeDigits)) {
      return null;
    }
    const routesToCoop = prefixThreeDigits === 493 || inRange(prefixThreeDigits, 481, 489);
    if (routesToCoop) {
      return { institutionId: "suhyup-coop" };
    }
    return null;
  },
};

export const suhyupCoop12BranchToBank: BranchRule = {
  describe: "수협중앙회 12자리: 1번째가 2/7/9 아니면 007 라우팅",
  evaluate(digits) {
    if (digits.length !== 12) {
      return null;
    }
    const firstDigit = digits[0];
    const staysWithCoop = firstDigit === "2" || firstDigit === "7" || firstDigit === "9";
    if (staysWithCoop) {
      return null;
    }
    return { institutionId: "suhyup" };
  },
};

export const kb11FirstDigit: BranchRule = {
  describe: "국민 11자리 첫자리: 0 → incoming-only, 9 → lifetime",
  evaluate(digits) {
    if (digits.length !== 11) {
      return null;
    }
    if (digits[0] === "0") {
      return { kindOverride: "incoming-only" };
    }
    if (digits[0] === "9") {
      return { kindOverride: "lifetime" };
    }
    return null;
  },
};

export const kbank10First9: BranchRule = {
  describe: "K뱅크 10자리 첫자리=9 → incoming-only",
  evaluate(digits) {
    if (digits.length !== 10) {
      return null;
    }
    if (digits[0] === "9") {
      return { kindOverride: "incoming-only" };
    }
    return null;
  },
};

export const kbank14First79: BranchRule = {
  describe:
    "K뱅크 14자리: 첫자리 7/9 → 간편송금·안심·신용카드결제 가상계좌, 그 외 → 여신가상계좌(원리금 납부 입금전용)",
  evaluate(digits) {
    if (digits.length !== 14) {
      return null;
    }
    if (digits[0] === "7" || digits[0] === "9") {
      return { kindOverride: "virtual", virtualOverride: true };
    }
    return { kindOverride: "incoming-only" };
  },
};

export const toss12First1719: BranchRule = {
  describe: "토스 12자리 1·2번째 17/19 → virtual",
  evaluate(digits) {
    if (digits.length !== 12) {
      return null;
    }
    const prefixTwoDigits = digitsAt(digits, 0, 2);
    if (prefixTwoDigits === "17" || prefixTwoDigits === "19") {
      return { kindOverride: "virtual", virtualOverride: true };
    }
    return null;
  },
};

export function defineBranchRule(input: BranchRule): BranchRule {
  return input;
}
