import { bench, describe } from "vitest";
import { detect } from "./detect";

describe("detect benchmark", () => {
  bench("신한 신계좌 12자리 (high confidence)", () => {
    detect("110-436-387740");
  });

  bench("IBK 14자리 신계좌 (high confidence)", () => {
    detect("318-081775-01-014");
  });

  bench("농협 13자리 가상계좌 분기", () => {
    detect("351-1234-5678-01");
  });

  bench("토스 12자리 가상 분기 (17-prefix)", () => {
    detect("1712-3456-7890");
  });

  bench("매칭 없는 14자리 입력", () => {
    detect("99999999999999");
  });

  bench("부분 입력 7자리 (저격 단계)", () => {
    detect("3333-12");
  });
});
