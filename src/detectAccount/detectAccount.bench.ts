import { bench, describe } from "vitest";
import { detectAccount } from "./detectAccount";

describe("detectAccount benchmark", () => {
  bench("신한 신계좌 12자리 (high confidence)", () => {
    detectAccount("110-436-387740");
  });

  bench("IBK 14자리 신계좌 (high confidence)", () => {
    detectAccount("318-081775-01-014");
  });

  bench("농협 13자리 가상계좌 분기", () => {
    detectAccount("351-1234-5678-01");
  });

  bench("토스 12자리 가상 분기 (17-prefix)", () => {
    detectAccount("1712-3456-7890");
  });

  bench("매칭 없는 14자리 입력", () => {
    detectAccount("99999999999999");
  });

  bench("부분 입력 7자리 (저격 단계)", () => {
    detectAccount("3333-12");
  });
});
