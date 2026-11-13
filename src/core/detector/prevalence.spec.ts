import { describe, expect, test } from "vitest";

import { defineInstitution } from "../define/define-institution";
import { prevalence } from "./prevalence";

const base = {
  id: "x",
  code: "999",
  nameKo: "테스트",
  aliases: [],
  patterns: [],
} as const;

describe("prevalence", () => {
  test("userBaseMillions 에 카테고리 계수를 곱한 값을 반환한다", () => {
    // Given
    const bank = defineInstitution({ ...base, category: "bank", userBaseMillions: 20 });
    const nonBank = defineInstitution({ ...base, category: "non-bank", userBaseMillions: 20 });
    const securities = defineInstitution({ ...base, category: "securities", userBaseMillions: 20 });
    const clearing = defineInstitution({ ...base, category: "clearing", userBaseMillions: 20 });

    // When
    const bankResult = prevalence(bank);
    const nonBankResult = prevalence(nonBank);
    const securitiesResult = prevalence(securities);
    const clearingResult = prevalence(clearing);

    // Then
    expect(bankResult).toBe(20);
    expect(nonBankResult).toBe(12);
    expect(securitiesResult).toBe(5);
    expect(clearingResult).toBe(0);
  });

  test("priority 수동 오버라이드가 계산식을 대체한다", () => {
    // Given
    const overridden = defineInstitution({
      ...base,
      category: "securities",
      userBaseMillions: 20,
      priority: 99,
    });

    // When
    const result = prevalence(overridden);

    // Then
    expect(result).toBe(99);
  });

  test("userBaseMillions 미지정이면 0 을 반환한다", () => {
    // Given
    const institution = defineInstitution({ ...base, category: "bank" });

    // When
    const result = prevalence(institution);

    // Then
    expect(result).toBe(0);
  });
});
