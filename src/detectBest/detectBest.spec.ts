import { describe, expect, expectTypeOf, test } from "vitest";
import type { RegisteredInstitution } from "../data";
import type { DetectionResult } from "../types";
import { detectBest } from "./detectBest";

describe("detectBest", () => {
  describe("성공 케이스", () => {
    test("매칭이 있으면 1순위 DetectionResult 를 반환한다", () => {
      // Given
      const input = "110-436-387740";

      // When
      const result = detectBest(input);

      // Then
      expect(result).not.toBeNull();
      expect(result?.institution.id).toBe("shinhan");
    });

    test("옵션 (categories) 을 전달할 수 있다", () => {
      // Given
      const input = "3333-12-3456789";

      // When
      const result = detectBest(input, { categories: ["bank"] });

      // Then
      expect(result?.institution.category).toBe("bank");
    });
  });

  describe("실패 케이스", () => {
    test("빈 입력이면 null 을 반환한다", () => {
      // Given
      const input = "";

      // When
      const result = detectBest(input);

      // Then
      expect(result).toBeNull();
    });

    test("비숫자 입력이면 null 을 반환한다", () => {
      // Given
      const input = "abcd";

      // When
      const result = detectBest(input);

      // Then
      expect(result).toBeNull();
    });

    test("minScore 가 너무 높아 매칭이 없으면 null", () => {
      // Given
      const input = "1";

      // When
      const result = detectBest(input, { minScore: 100 });

      // Then
      expect(result).toBeNull();
    });
  });

  describe("타입 narrow", () => {
    test("반환 타입이 DetectionResult<RegisteredInstitution> | null 이다", () => {
      // Given / When
      const result = detectBest("110-436-387740");

      // Then
      expectTypeOf(result).toEqualTypeOf<DetectionResult<RegisteredInstitution> | null>();
    });
  });
});
