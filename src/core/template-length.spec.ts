import { describe, expect, test } from "vitest";
import { patternTemplate } from "./pattern-template";
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
    ])("$template 의 토큰 수는 $expected", ({ template, expected }) => {
      // Given
      const tpl = patternTemplate(template);

      // When
      const result = templateLength(tpl);

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
      const sparseLen = templateLength(sparse);
      const denseLen = templateLength(dense);

      // Then
      expect(sparseLen).toBe(5);
      expect(denseLen).toBe(5);
    });

    test("선행/후행 하이픈도 토큰 수에 영향을 주지 않는다", () => {
      // Given
      const leadingDash = patternTemplate("-XXXX");
      const trailingDash = patternTemplate("XXXX-");

      // When
      const leading = templateLength(leadingDash);
      const trailing = templateLength(trailingDash);

      // Then
      expect(leading).toBe(4);
      expect(trailing).toBe(4);
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
