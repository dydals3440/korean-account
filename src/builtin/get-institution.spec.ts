import { describe, expect, test } from "vitest";

import { getInstitution } from "./get-institution";

// Hana is the only major bank whose CMS code (005) differs from its interbank code (081).
describe("Institution.commonCode (KFTC 표준은행코드 매핑)", () => {
  test("하나은행 (외환·하나 통합) — 기존 라이브러리 code 005·commonCode 081 유지", () => {
    // Given
    const id = "hana";

    // When
    const hana = getInstitution(id);

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
    // Given
    const institutionId = id;

    // When
    const institution = getInstitution(institutionId);

    // Then
    expect(institution?.code).toBe(code);
    expect(institution?.commonCode).toBeUndefined();
  });

  test("hana-securities-cma — CMS 081 (증권사 CMA, 표준은행코드 대상 아님)", () => {
    // Given
    const id = "hana-securities-cma";

    // When
    const cma = getInstitution(id);

    // Then
    expect(cma?.code).toBe("081");
    expect(cma?.commonCode).toBeUndefined();
  });
});
