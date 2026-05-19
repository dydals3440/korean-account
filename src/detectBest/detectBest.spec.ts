import { describe, expect, expectTypeOf, test } from "vitest";
import type { RegisteredInstitution } from "../data";
import type { DetectionResult } from "../types";
import { detectBest } from "./detectBest";

describe("detectBest", () => {
  describe("성공 케이스", () => {
    test("매칭이 있으면 1순위 DetectionResult 를 반환한다", () => {
      // given
      const input = "110-436-387740";

      // when
      const result = detectBest(input);

      // then
      expect(result).not.toBeNull();
      expect(result?.institution.id).toBe("shinhan");
    });

    test("옵션 (categories) 을 전달할 수 있다", () => {
      // given
      const input = "3333-12-3456789";

      // when
      const result = detectBest(input, { categories: ["bank"] });

      // then
      expect(result?.institution.category).toBe("bank");
    });
  });

  describe("실패 케이스", () => {
    test("빈 입력이면 null 을 반환한다", () => {
      // given
      const input = "";

      // when
      const result = detectBest(input);

      // then
      expect(result).toBeNull();
    });

    test("비숫자 입력이면 null 을 반환한다", () => {
      // given
      const input = "abcd";

      // when
      const result = detectBest(input);

      // then
      expect(result).toBeNull();
    });

    test("minScore 가 너무 높아 매칭이 없으면 null", () => {
      // given
      const input = "1";

      // when
      const result = detectBest(input, { minScore: 100 });

      // then
      expect(result).toBeNull();
    });
  });

  describe("타입 narrow", () => {
    test("반환 타입이 DetectionResult<RegisteredInstitution> | null 이다", () => {
      // given / when
      const result = detectBest("110-436-387740");

      // then
      expectTypeOf(result).toEqualTypeOf<DetectionResult<RegisteredInstitution> | null>();
    });
  });
});
