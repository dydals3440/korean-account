import { describe, expect, test } from "vitest";
import { getInstitution } from ".";

/**
 * Regression guard for `Institution.commonCode` (KFTC standard bank code).
 *
 * KFTC runs two separate namespaces (CMS auto-transfer vs the interbank
 * standard). Among the 14 major banks, only Hana (the KEB merger) has
 * different representative codes in the two systems. A silently dropped or
 * added commonCode would diverge from teacher-web's server BankCodeSchema
 * and break the form submit boundary.
 */
describe("Institution.commonCode (KFTC 표준은행코드 매핑)", () => {
  test("하나은행 (외환·하나 통합) — CMS code 005 ≠ 표준 081", () => {
    // Given / When
    const hana = getInstitution("hana");

    // Then
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
    // Given / When
    const inst = getInstitution(id);

    // Then
    expect(inst?.code).toBe(code);
    expect(inst?.commonCode).toBeUndefined();
  });

  test("hana-securities-cma — CMS 081 (증권사 CMA, 표준은행코드 대상 아님)", () => {
    // Given / When
    const cma = getInstitution("hana-securities-cma");

    // Then
    expect(cma?.code).toBe("081");
    expect(cma?.commonCode).toBeUndefined();
  });
});
