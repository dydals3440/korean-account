import { describe, expect, test } from "vitest";

import { patternTemplate } from "../define/pattern-template";
import { templateLength } from "./template-length";

describe("templateLength", () => {
  describe("정상 케이스", () => {
    test.each([
      { template: "XXX-XX-XXXXXX", expected: 11 },
      { template: "XXXX-XX-XXXXXXX", expected: 13 },
      { template: "XXX", expected: 3 },
      { template: "X-X-X-X", expected: 4 },
      { template: "XXXX-XXXX-XXXX", expected: 12 },
      { template: "XXXXXX-XX-XXXXXX", expected: 14 },
      { template: "X", expected: 1 },
    ])("$template 이면 $expected 를 반환한다", ({ template, expected }) => {
      // Given
      const input = patternTemplate(template);

      // When
      const result = templateLength(input);

      // Then
      expect(result).toBe(expected);
    });
  });

  describe("토큰 수만 계산한다", () => {
    test("하이픈 개수와 무관하게 X 토큰 수만 센다", () => {
      // Given
      const sparse = patternTemplate("X-X-X-X-X");
      const dense = patternTemplate("XXXXX");

      // When
      const sparseResult = templateLength(sparse);
      const denseResult = templateLength(dense);

      // Then
      expect(sparseResult).toBe(5);
      expect(denseResult).toBe(5);
    });
  });

  describe("매우 긴 입력", () => {
    test("길이 1000 의 템플릿도 정확히 센다", () => {
      // Given
      const longTemplate = patternTemplate("X".repeat(1000));

      // When
      const result = templateLength(longTemplate);

      // Then
      expect(result).toBe(1000);
    });
  });
});
