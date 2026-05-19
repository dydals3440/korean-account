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
      // given
      const input = template;

      // when
      const result = createPatternTemplate(input);

      // then
      expect(result).toBe(input);
    });
  });

  describe("빈 문자열 거부", () => {
    test("빈 문자열은 throw 한다", () => {
      // given
      const input = "";

      // when / then
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
      // given
      const input = template;

      // when / then
      expect(() => createPatternTemplate(input)).toThrow(/Invalid/);
    });
  });

  describe("브랜드 타입", () => {
    test("런타임 동등성은 단순 string 이다", () => {
      // given
      const input = "XXX-XXX-XXXXXX";

      // when
      const tpl = createPatternTemplate(input);

      // then
      expect(typeof tpl).toBe("string");
      expect(tpl.length).toBe(14);
    });
  });
});
