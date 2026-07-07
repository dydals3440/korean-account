import { describe, expect, test } from "vitest";
import { createPatternTemplate } from "./createPatternTemplate";

describe("createPatternTemplate", () => {
  describe("유효한 템플릿은 그대로 반환한다", () => {
    test.each([
      "XXX-XX-XXXXXX",
      "XXXX-XX-XXXXXXX",
      "X-X-X",
      "XXX-XXX-XXXXXX",
      "XXXX-XXXX-XXXX",
      "XXXXXX-XX-XXXXXX",
      "X",
    ])("'%s' 는 그대로 반환된다", (template) => {
      // Given
      const input = template;

      // When
      const result = createPatternTemplate(input);

      // Then
      expect(result).toBe(input);
    });
  });

  describe("빈 문자열 거부", () => {
    test("빈 문자열은 throw 한다", () => {
      // Given
      const input = "";

      // When / Then
      expect(() => createPatternTemplate(input)).toThrow(/non-empty/);
    });
  });

  describe("허용되지 않은 문자가 포함되면 throw 한다", () => {
    test.each([
      "Y",
      "Z",
      "C",
      "XXX-YY-ZZZZZZ",
      "XXX-AA-XX",
      "X X X",
      "XXX_YY",
      "XXX*YY",
      "한XXY",
      "1234",
      "XXX.YY",
      "XXX/YY",
    ])("'%s' 는 throw 한다", (template) => {
      // Given
      const input = template;

      // When / Then
      expect(() => createPatternTemplate(input)).toThrow(/Invalid/);
    });
  });

  describe("브랜드 타입", () => {
    test("런타임 동등성은 단순 string 이다", () => {
      // Given
      const input = "XXX-XXX-XXXXXX";

      // When
      const tpl = createPatternTemplate(input);

      // Then
      expect(typeof tpl).toBe("string");
      expect(tpl.length).toBe(14);
    });
  });
});
