import { describe, expect, test } from "vitest";
import { institutionById } from ".";

/**
 * `Institution.commonCode` (KFTC 표준은행코드) 회귀 가드.
 *
 * 같은 KFTC 가 운영하는 두 namespace (CMS 자동이체 vs 금융공동망 표준) 가 별개.
 * 14 메이저 은행 중 하나(외환·하나 통합) 만 두 체계 대표코드가 다름.
 * commonCode 가 silently 누락되거나 추가되면 teacher-web 서버 BankCodeSchema 와
 * 어긋나 form submit boundary 가 깨지므로 회귀 가드.
 */
describe("Institution.commonCode (KFTC 표준은행코드 매핑)", () => {
  test("하나은행 (외환·하나 통합) — CMS code 005 ≠ 표준 081", () => {
    const hana = institutionById("hana");
    expect(hana?.code).toBe("005");
    expect(hana?.commonCode).toBe("081");
  });

  test.each([
    ["kb", "004"],
    ["shinhan", "088"],
    ["nh", "011"],
    ["nh-coop", "012"],
    ["woori", "020"],
    ["ibk", "003"],
    ["im-bank", "031"],
    ["busan", "032"],
    ["gyeongnam", "039"],
    ["jeonbuk", "037"],
    ["gwangju", "034"],
    ["sc", "023"],
    ["post", "071"],
    ["savings-bank", "050"],
    ["kbank", "089"],
    ["kakao", "090"],
    ["toss", "092"],
  ] as const)("%s — CMS code 와 표준은행코드 일치 (commonCode 생략)", (id, code) => {
    const inst = institutionById(id);
    expect(inst?.code).toBe(code);
    expect(inst?.commonCode).toBeUndefined();
  });

  test("hana-securities-cma — CMS 081 (증권사 CMA, 표준은행코드 대상 아님)", () => {
    const cma = institutionById("hana-securities-cma");
    expect(cma?.code).toBe("081");
    expect(cma?.commonCode).toBeUndefined();
  });
});
