import { describe, expect, test } from "vitest";
import { defineInstitution } from "./define-institution";
import { prevalence } from "./prevalence";

const base = {
  id: "x",
  code: "999",
  nameKo: "테스트",
  aliases: [],
  patterns: [],
} as const;

describe("prevalence", () => {
  test("userBaseMillions × 카테고리 계수", () => {
    expect(prevalence(defineInstitution({ ...base, category: "bank", userBaseMillions: 20 }))).toBe(
      20,
    );
    expect(
      prevalence(defineInstitution({ ...base, category: "non-bank", userBaseMillions: 20 })),
    ).toBe(12);
    expect(
      prevalence(defineInstitution({ ...base, category: "securities", userBaseMillions: 20 })),
    ).toBe(5);
    expect(
      prevalence(defineInstitution({ ...base, category: "clearing", userBaseMillions: 20 })),
    ).toBe(0);
  });

  test("priority 수동 오버라이드가 계산식을 대체한다", () => {
    const overridden = defineInstitution({
      ...base,
      category: "securities",
      userBaseMillions: 20,
      priority: 99,
    });
    expect(prevalence(overridden)).toBe(99);
  });

  test("userBaseMillions 미지정이면 0", () => {
    expect(prevalence(defineInstitution({ ...base, category: "bank" }))).toBe(0);
  });
});
