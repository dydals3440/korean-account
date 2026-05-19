import { describe, expect, test } from "vitest";
import { createPatternTemplate } from "../createPatternTemplate";
import { formatAccount } from "./formatAccount";

describe("formatAccount", () => {
  describe("기본 그루핑", () => {
    test("digits 를 템플릿 하이픈 위치에 맞춰 그루핑한다", () => {
      // given
      const digits = "110436387740";
      const template = createPatternTemplate("XXX-XXX-XXXXXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("110-436-387740");
    });

    test("XXX-XXX-XXXXXX 신한 신계좌 그루핑", () => {
      // given
      const digits = "110436387740";
      const template = createPatternTemplate("XXX-XXX-XXXXXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("110-436-387740");
    });

    test("XXXX-XX-XXXXXXX 카카오뱅크 그루핑", () => {
      // given
      const digits = "3333123456789";
      const template = createPatternTemplate("XXXX-XX-XXXXXXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("3333-12-3456789");
    });

    test("XXXXXX-XX-XXXXXX KB 14자리 그루핑", () => {
      // given
      const digits = "12345604789012";
      const template = createPatternTemplate("XXXXXX-XX-XXXXXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("123456-04-789012");
    });
  });

  describe("길이가 부족한 입력", () => {
    test("그룹 중간에서 끊긴다", () => {
      // given
      const digits = "11043";
      const template = createPatternTemplate("XXX-XXX-XXXXXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("110-43");
    });

    test("그룹 경계 직전이면 후행 하이픈이 없다", () => {
      // given
      const digits = "110";
      const template = createPatternTemplate("XXX-XXX-XXXXXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("110");
    });

    test("그룹 경계에 정확히 맞으면 다음 그룹 안으로 들어가지 않는다", () => {
      // given
      const digits = "110436";
      const template = createPatternTemplate("XXX-XXX-XXXXXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("110-436");
    });

    test("한 자리만 입력하면 한 자리 그대로 반환한다", () => {
      // given
      const digits = "1";
      const template = createPatternTemplate("XXX-XXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("1");
    });
  });

  describe("길이가 넘치는 입력", () => {
    test("템플릿을 다 소진한 뒤 남은 digits 를 그대로 붙인다", () => {
      // given
      const digits = "12345678";
      const template = createPatternTemplate("XXX-XXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("123-45678");
    });

    test("크게 초과해도 동작한다", () => {
      // given
      const digits = "12345678901234";
      const template = createPatternTemplate("XXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("12345678901234");
    });

    test("매우 긴 입력도 그대로 잘 처리한다", () => {
      // given
      const digits = "1".repeat(60);
      const template = createPatternTemplate("XXX-XXX-XXXXXX");

      // when
      const result = formatAccount(digits, template);

      // then
      // 첫 12자리는 그루핑, 나머지 48자리는 끝에 그대로 붙음
      expect(result).toBe(`111-111-111111${"1".repeat(48)}`);
    });
  });

  describe("엣지 케이스", () => {
    test("빈 digits 는 빈 문자열을 반환한다", () => {
      // given
      const digits = "";
      const template = createPatternTemplate("XXX-XXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("");
    });

    test("같은 길이라도 다른 그루핑이면 결과가 다르다", () => {
      // given
      const digits = "123456";
      const tA = createPatternTemplate("XX-XX-XX");
      const tB = createPatternTemplate("XXX-XXX");

      // when
      const a = formatAccount(digits, tA);
      const b = formatAccount(digits, tB);

      // then
      expect(a).toBe("12-34-56");
      expect(b).toBe("123-456");
    });

    test("하이픈 없는 템플릿이면 그루핑도 없다", () => {
      // given
      const digits = "1234567890";
      const template = createPatternTemplate("XXXXXXXXXX");

      // when
      const result = formatAccount(digits, template);

      // then
      expect(result).toBe("1234567890");
    });
  });

  describe("순수 함수", () => {
    test("같은 입력에 항상 같은 결과를 반환한다", () => {
      // given
      const digits = "110436387740";
      const template = createPatternTemplate("XXX-XXX-XXXXXX");

      // when
      const a = formatAccount(digits, template);
      const b = formatAccount(digits, template);

      // then
      expect(a).toBe(b);
    });
  });
});
