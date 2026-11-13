import { beforeAll, describe, expect, test } from "vitest";

import { getInstitution } from "../../builtin/get-institution";
import type { AccountPattern, DigitSpan } from "../../types";
import { extractIdentifier } from "./extract-identifier";
import { normalizeAccount } from "./normalize-account";

const pos = (start: number, length: number): DigitSpan => ({ start, length });

describe("extractIdentifier", () => {
  describe("prefix 식별 (신계좌)", () => {
    test("앞 3자리 추출 — 신한 신계좌 110", () => {
      // Given
      const digits = "110436387740";
      const pattern = { identifierPosition: pos(0, 3) };

      // When
      const result = extractIdentifier(digits, pattern);

      // Then
      expect(result).toBe("110");
    });

    test("앞 4자리 추출 — 카카오 3333", () => {
      // Given
      const digits = "3333123456789";
      const pattern = { identifierPosition: pos(0, 4) };

      // When
      const result = extractIdentifier(digits, pattern);

      // Then
      expect(result).toBe("3333");
    });

    test("앞 3자리 추출 — 농협중앙 351", () => {
      // Given
      const digits = "3511234567890";
      const pattern = { identifierPosition: pos(0, 3) };

      // When
      const result = extractIdentifier(digits, pattern);

      // Then
      expect(result).toBe("351");
    });
  });

  describe("중간 식별 (구계좌)", () => {
    test("12자리 KB 구계좌 — 4·5번째 21", () => {
      // Given
      const digits = "123211234567";
      const pattern = { identifierPosition: pos(3, 2) };

      // When
      const result = extractIdentifier(digits, pattern);

      // Then
      expect(result).toBe("21");
    });

    test("11자리 신한 구 조흥 — 4·5번째 03", () => {
      // Given
      const digits = "12303456789";
      const pattern = { identifierPosition: pos(3, 2) };

      // When
      const result = extractIdentifier(digits, pattern);

      // Then
      expect(result).toBe("03");
    });
  });

  describe("끝 식별 (증권)", () => {
    test("키움 10자리는 끝 2자리 '11' 을 반환한다", () => {
      // Given
      const digits = "1234567811";
      const pattern = { identifierPosition: pos(8, 2) };

      // When
      const result = extractIdentifier(digits, pattern);

      // Then
      expect(result).toBe("11");
    });
  });

  describe("부분 입력 (도달한 자리까지)", () => {
    test("식별 영역 일부만 채워지면 도달한 부분까지만 반환한다", () => {
      // Given
      const digits = "1104";
      const pattern = { identifierPosition: pos(3, 3) };

      // When
      const result = extractIdentifier(digits, pattern);

      // Then
      expect(result).toBe("4");
    });

    test("식별 영역에 도달하지 못하면 null 을 반환한다", () => {
      // Given
      const digitsShort = "11";
      const digitsEmpty = "";
      const pattern = { identifierPosition: pos(3, 3) };

      // When
      const shortResult = extractIdentifier(digitsShort, pattern);
      const emptyResult = extractIdentifier(digitsEmpty, pattern);

      // Then
      expect(shortResult).toBeNull();
      expect(emptyResult).toBeNull();
    });
  });

  describe("identifierPosition 미지정", () => {
    test("identifierPosition 이 없으면 null 을 반환한다", () => {
      // Given
      const digits = "123456789012";
      const pattern = {};

      // When
      const result = extractIdentifier(digits, pattern);

      // Then
      expect(result).toBeNull();
    });
  });
});

// Regression: 0.1.0 dropped `identifierPosition` when `identifiers` was absent, so Suhyup 12d returned "" instead of "965".
describe("extractIdentifier 는 identifiers 없이 identifierPosition 만으로도 동작한다", () => {
  let suhyup12: AccountPattern;

  beforeAll(() => {
    const suhyup = getInstitution("suhyup");
    expect(suhyup, "suhyup 기관이 레지스트리에 있어야 한다").not.toBeNull();

    const pattern = suhyup?.patterns.find(
      (candidate) => candidate.kind === "new" && candidate.branchRule !== undefined,
    );
    expect(pattern, "수협 12자리 new 패턴이 있어야 한다").toBeDefined();
    if (!pattern) {
      throw new Error("수협 12자리 패턴을 찾지 못했습니다.");
    }
    suhyup12 = pattern;
  });

  test("수협 12자리 new 패턴은 identifiers 없이 identifierPosition 만 갖는다", () => {
    // Given
    const pattern = suhyup12;

    // When
    const { identifierPosition, identifiers, identifierRange } = pattern;

    // Then
    expect(identifierPosition).toEqual({ start: 0, length: 3 });
    expect(identifiers, "identifiers 는 없다 — 그래도 위치는 필요하다").toBeUndefined();
    expect(identifierRange).toBeUndefined();
  });

  test.each([
    ["965182960583", "965"],
    ["927659375731", "927"],
    ["769978387352", "769"],
  ])("'%s' 이면 식별자 '%s' 를 반환한다", (input, expected) => {
    // Given
    const digits = normalizeAccount(input);

    // When
    const result = extractIdentifier(digits, suhyup12);

    // Then
    expect(result).toBe(expected);
  });
});
