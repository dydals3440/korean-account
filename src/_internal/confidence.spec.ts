import { describe, expect, test } from "vitest";
import { scoreToConfidence } from "./confidence";

describe("scoreToConfidence", () => {
  describe("경계값", () => {
    test.each([
      { score: -1, expected: "low" },
      { score: 0, expected: "low" },
      { score: 1, expected: "low" },
      { score: 2, expected: "low" },
      { score: 3, expected: "low" },
      { score: 3.99, expected: "low" },
      { score: 4, expected: "medium" },
      { score: 5, expected: "medium" },
      { score: 6, expected: "medium" },
      { score: 6.99, expected: "medium" },
      { score: 7, expected: "high" },
      { score: 7.01, expected: "high" },
      { score: 8, expected: "high" },
      { score: 100, expected: "high" },
      { score: 1_000_000, expected: "high" },
    ] as const)("score=$score 이면 $expected 를 반환한다", ({ score, expected }) => {
      // Given
      const input = score;

      // When
      const result = scoreToConfidence(input);

      // Then
      expect(result).toBe(expected);
    });
  });

  describe("의미적 매칭", () => {
    test("길이만 맞은 경우 (score=3) low 를 반환한다", () => {
      // Given
      const score = 3;

      // When
      const result = scoreToConfidence(score);

      // Then
      expect(result).toBe("low");
    });

    test("길이 + identifier 매칭 (score=7) high 를 반환한다", () => {
      // Given
      const score = 3 + 4;

      // When
      const result = scoreToConfidence(score);

      // Then
      expect(result).toBe("high");
    });

    test("identifier 만 매칭 (score=4) medium 을 반환한다", () => {
      // Given
      const score = 4;

      // When
      const result = scoreToConfidence(score);

      // Then
      expect(result).toBe("medium");
    });

    test("음수 점수는 low 로 처리한다", () => {
      // Given
      const score = -5;

      // When
      const result = scoreToConfidence(score);

      // Then
      expect(result).toBe("low");
    });
  });
});
