import { describe, expect, test } from "vitest";
import { createPatternTemplate } from "../createPatternTemplate";
import { templateLength } from "./templateLength";

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
      // given
      const tpl = createPatternTemplate(template);

      // when
      const result = templateLength(tpl);

      // then
      expect(result).toBe(expected);
    });
  });

  describe("토큰 수만 계산한다", () => {
    test("하이픈 개수와 무관하게 X 토큰 수만 센다", () => {
      // given
      const sparse = createPatternTemplate("X-X-X-X-X");
      const dense = createPatternTemplate("XXXXX");

      // when
      const sparseLen = templateLength(sparse);
      const denseLen = templateLength(dense);

      // then
      expect(sparseLen).toBe(5);
      expect(denseLen).toBe(5);
    });

    test("선행/후행 하이픈도 토큰 수에 영향을 주지 않는다", () => {
      // given
      const leadingDash = createPatternTemplate("-XXXX");
      const trailingDash = createPatternTemplate("XXXX-");

      // when
      const leading = templateLength(leadingDash);
      const trailing = templateLength(trailingDash);

      // then
      expect(leading).toBe(4);
      expect(trailing).toBe(4);
    });
  });

  describe("매우 긴 입력", () => {
    test("길이 1000 의 템플릿도 정확히 센다", () => {
      // given
      const longTemplate = createPatternTemplate("X".repeat(1000));

      // when
      const result = templateLength(longTemplate);

      // then
      expect(result).toBe(1000);
    });
  });
});
