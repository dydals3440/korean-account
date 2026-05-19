import { describe, expect, test } from "vitest";
import { normalize } from "./normalize";

/**
 * 테스트용 wrapper — runtime guard 동작을 검증하기 위해 비-string 입력을
 * 통과시킨다. `as Type` cast 없이 `@ts-expect-error` 로 타입만 우회한다.
 */
function normalizeUnknown(input: unknown): string {
  // @ts-expect-error — intentionally pass non-string to test runtime guard
  return normalize(input);
}

describe("normalize", () => {
  describe("숫자만 추출한다", () => {
    test.each([
      { input: "110-436-387740", expected: "110436387740" },
      { input: "110 436 387740", expected: "110436387740" },
      { input: "  3333-12-3456789  ", expected: "3333123456789" },
      { input: "110.436.387740", expected: "110436387740" },
      { input: "abc110xyz436", expected: "110436" },
      { input: "한글110과 숫자436", expected: "110436" },
      { input: "110/436/387740", expected: "110436387740" },
      { input: "110_436_387740", expected: "110436387740" },
      { input: "010-1234-5678", expected: "01012345678" },
    ])("'$input' → '$expected'", ({ input, expected }) => {
      // given
      const raw = input;

      // when
      const result = normalize(raw);

      // then
      expect(result).toBe(expected);
    });
  });

  describe("빈 입력 / 숫자 없는 입력은 빈 문자열을 반환한다", () => {
    test.each(["", "abcdef", "----", "   ", "-_-_-_-", "♣♥♠♦", "★"])("'%s' → ''", (input) => {
      // given
      const raw = input;

      // when
      const result = normalize(raw);

      // then
      expect(result).toBe("");
    });
  });

  describe("타입이 문자열이 아니면 빈 문자열을 반환한다 (runtime guard)", () => {
    test("null 입력", () => {
      // given
      const input = null;

      // when
      const result = normalizeUnknown(input);

      // then
      expect(result).toBe("");
    });

    test("undefined 입력", () => {
      // given
      const input = undefined;

      // when
      const result = normalizeUnknown(input);

      // then
      expect(result).toBe("");
    });

    test("number 입력", () => {
      // given
      const input = 123;

      // when
      const result = normalizeUnknown(input);

      // then
      expect(result).toBe("");
    });

    test("object 입력", () => {
      // given
      const input = {};

      // when
      const result = normalizeUnknown(input);

      // then
      expect(result).toBe("");
    });

    test("array 입력", () => {
      // given
      const input = [1, 2, 3];

      // when
      const result = normalizeUnknown(input);

      // then
      expect(result).toBe("");
    });

    test("boolean 입력", () => {
      // given
      const input = true;

      // when
      const result = normalizeUnknown(input);

      // then
      expect(result).toBe("");
    });
  });

  describe("유니코드 입력", () => {
    test("이모지가 섞여도 ASCII 숫자만 추출한다", () => {
      // given
      const input = "💰110-436";

      // when
      const result = normalize(input);

      // then
      expect(result).toBe("110436");
    });

    test("surrogate pair 문자가 섞여도 영향이 없다", () => {
      // given
      const input = "𝟏𝟐𝟑110"; // bold mathematical digits are NOT ASCII

      // when
      const result = normalize(input);

      // then
      expect(result).toBe("110");
    });

    test("전각 숫자(０-９)는 ASCII 범위 밖이므로 무시된다", () => {
      // given
      const input = "１２３456";

      // when
      const result = normalize(input);

      // then
      expect(result).toBe("456");
    });
  });

  describe("매우 긴 입력", () => {
    test("매우 긴 입력도 잘리지 않고 그대로 처리한다", () => {
      // given
      const digits = "1".repeat(100);

      // when
      const result = normalize(digits);

      // then
      expect(result).toBe(digits);
    });

    test("1만 자 입력도 모두 추출한다", () => {
      // given
      const digits = "9".repeat(10_000);

      // when
      const result = normalize(digits);

      // then
      expect(result.length).toBe(10_000);
    });
  });

  describe("부수적 보장", () => {
    test("다양한 구분자가 연속되어도 모두 제거된다", () => {
      // given
      const input = "1-1 0/4*3#6%3@8 7 7+4=0";

      // when
      const result = normalize(input);

      // then
      expect(result).toBe("110436387740");
    });

    test("같은 입력에 항상 같은 결과를 반환한다 (순수 함수)", () => {
      // given
      const input = "110-436-387740";

      // when
      const a = normalize(input);
      const b = normalize(input);

      // then
      expect(a).toBe(b);
    });
  });
});
