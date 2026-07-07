import { describe, expect, test } from "vitest";
import { templateLength } from "../_internal/templateLength";
import { pickPattern } from "./pickPattern";

describe("pickPattern", () => {
  describe("institution 조회 실패", () => {
    test("존재하지 않는 institutionId면 null을 반환한다", () => {
      // Given
      const id = "nonexistent";

      // When
      const result = pickPattern(id);

      // Then
      expect(result).toBeNull();
    });

    test("빈 institutionId면 null을 반환한다", () => {
      // Given
      const id = "";

      // When
      const result = pickPattern(id);

      // Then
      expect(result).toBeNull();
    });
  });

  describe("필터 없이 호출", () => {
    test("filter 없이 호출하면 첫 패턴을 반환한다", () => {
      // Given
      const id = "shinhan";

      // When
      const result = pickPattern(id);

      // Then
      expect(result).not.toBeNull();
      expect(result?.kind).toBe("new");
    });
  });

  describe("kind 필터", () => {
    test("kind=new — 신계좌 패턴만 반환한다", () => {
      // Given
      const id = "kb";

      // When
      const result = pickPattern(id, { kind: "new" });

      // Then
      expect(result?.kind).toBe("new");
    });

    test("kind=old — 구계좌 패턴만 반환한다", () => {
      // Given
      const id = "kb";

      // When
      const result = pickPattern(id, { kind: "old" });

      // Then
      expect(result?.kind).toBe("old");
    });

    test("kind=virtual — 가상계좌 패턴만 반환한다", () => {
      // Given
      const id = "kb";

      // When
      const result = pickPattern(id, { kind: "virtual" });

      // Then
      expect(result?.kind).toBe("virtual");
    });
  });

  describe("length 필터", () => {
    test("length=12 — 12자리 패턴만 반환한다", () => {
      // Given
      const id = "shinhan";

      // When
      const result = pickPattern(id, { length: 12 });

      // Then
      expect(result).not.toBeNull();
      if (result) {
        expect(templateLength(result.template)).toBe(12);
      }
    });
  });

  describe("kind + length 동시 필터", () => {
    test("IBK 신계좌 14자리 패턴을 반환한다", () => {
      // Given
      const id = "ibk";

      // When
      const result = pickPattern(id, { kind: "new", length: 14 });

      // Then
      expect(result).not.toBeNull();
      expect(result?.kind).toBe("new");
      if (result) {
        expect(templateLength(result.template)).toBe(14);
      }
    });
  });

  describe("조건 미충족", () => {
    test("KDB에는 lifetime 패턴이 없어 null을 반환한다", () => {
      // Given
      const id = "kdb";

      // When
      const result = pickPattern(id, { kind: "lifetime" });

      // Then
      expect(result).toBeNull();
    });

    test("KB에는 lifetime 100자리 패턴이 없어 null을 반환한다", () => {
      // Given
      const id = "kb";

      // When
      const result = pickPattern(id, { kind: "new", length: 100 });

      // Then
      expect(result).toBeNull();
    });
  });
});
