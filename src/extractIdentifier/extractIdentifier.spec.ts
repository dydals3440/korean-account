import { describe, expect, test } from "vitest";
import type { Position } from "../types";
import { extractIdentifier } from "./extractIdentifier";

const pos = (start: number, length: number): Position => ({ start, length });

describe("extractIdentifier", () => {
  describe("prefix 식별 (신계좌)", () => {
    test("앞 3자리 추출 — 신한 신계좌 110", () => {
      // given
      const digits = "110436387740";
      const pattern = { identifierPosition: pos(0, 3) };

      // when
      const result = extractIdentifier(digits, pattern);

      // then
      expect(result).toBe("110");
    });

    test("앞 4자리 추출 — 카카오 3333", () => {
      // given
      const digits = "3333123456789";
      const pattern = { identifierPosition: pos(0, 4) };

      // when
      const result = extractIdentifier(digits, pattern);

      // then
      expect(result).toBe("3333");
    });

    test("앞 3자리 추출 — 농협중앙 351", () => {
      // given
      const digits = "3511234567890";
      const pattern = { identifierPosition: pos(0, 3) };

      // when
      const result = extractIdentifier(digits, pattern);

      // then
      expect(result).toBe("351");
    });
  });

  describe("중간 식별 (구계좌)", () => {
    test("12자리 KB 구계좌 — 4·5번째 21", () => {
      // given
      const digits = "123211234567";
      const pattern = { identifierPosition: pos(3, 2) };

      // when
      const result = extractIdentifier(digits, pattern);

      // then
      expect(result).toBe("21");
    });

    test("11자리 신한 구 조흥 — 4·5번째 03", () => {
      // given
      const digits = "12303456789";
      const pattern = { identifierPosition: pos(3, 2) };

      // when
      const result = extractIdentifier(digits, pattern);

      // then
      expect(result).toBe("03");
    });
  });

  describe("끝 식별 (증권)", () => {
    test("키움 10자리 끝 2자리", () => {
      // given
      const digits = "1234567811";
      const pattern = { identifierPosition: pos(8, 2) };

      // when
      const result = extractIdentifier(digits, pattern);

      // then
      expect(result).toBe("11");
    });
  });

  describe("부분 입력 (도달한 자리까지)", () => {
    test("식별 영역 일부만 채워지면 도달한 부분까지만 반환한다", () => {
      // given
      const digits = "1104";
      const pattern = { identifierPosition: pos(3, 3) };

      // when
      const result = extractIdentifier(digits, pattern);

      // then
      expect(result).toBe("4");
    });

    test("식별 영역에 도달하지 못하면 빈 문자열을 반환한다", () => {
      // given
      const digitsShort = "11";
      const digitsEmpty = "";
      const pattern = { identifierPosition: pos(3, 3) };

      // when
      const shortResult = extractIdentifier(digitsShort, pattern);
      const emptyResult = extractIdentifier(digitsEmpty, pattern);

      // then
      expect(shortResult).toBe("");
      expect(emptyResult).toBe("");
    });
  });

  describe("identifierPosition 미지정", () => {
    test("identifierPosition 이 없으면 빈 문자열을 반환한다", () => {
      // given
      const digits = "123456789012";
      const pattern = {};

      // when
      const result = extractIdentifier(digits, pattern);

      // then
      expect(result).toBe("");
    });
  });
});
