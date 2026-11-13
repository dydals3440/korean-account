import { describe, expect, test } from "vitest";

import { patternTemplate } from "./pattern-template";

describe("patternTemplate", () => {
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
      const result = patternTemplate(input);

      // Then
      expect(result).toBe(input);
    });
  });

  describe("빈 문자열 거부", () => {
    test("빈 문자열이면 TypeError 를 던진다", () => {
      // Given
      const input = "";

      // When
      const act = () => patternTemplate(input);

      // Then
      expect(act).toThrow(TypeError);
      expect(act).toThrow(/non-empty/);
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
    ])("'%s' 이면 TypeError 를 던진다", (template) => {
      // Given
      const input = template;

      // When
      const act = () => patternTemplate(input);

      // Then
      expect(act).toThrow(TypeError);
      expect(act).toThrow(/invalid pattern template/);
    });
  });

  describe("하이픈은 X 묶음 사이에 하나씩만 둘 수 있다", () => {
    test.each(["-", "---", "-XXXX", "XXXX-", "XXX--XX", "--X--"])(
      "'%s' 이면 TypeError 를 던진다",
      (template) => {
        // Given
        const input = template;

        // When
        const act = () => patternTemplate(input);

        // Then
        expect(act).toThrow(TypeError);
        expect(act).toThrow(/invalid pattern template/);
      },
    );
  });

  describe("브랜드 타입", () => {
    test("런타임 값은 입력과 같은 길이의 string 이다", () => {
      // Given
      const input = "XXX-XXX-XXXXXX";

      // When
      const result = patternTemplate(input);

      // Then
      expect(typeof result).toBe("string");
      expect(result.length).toBe(14);
    });
  });
});
