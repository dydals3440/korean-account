import { describe, expect, test } from "vitest";

import { institutions } from "../registry";
import { searchInstitutions } from "./search-institutions";

describe("searchInstitutions", () => {
  describe("필터 없는 호출", () => {
    test("필터 없이 호출하면 전체 institution 을 반환한다", () => {
      // Given
      const registry = institutions;

      // When
      const result = searchInstitutions();

      // Then
      expect(result).toEqual(registry);
    });
  });

  describe("categories 필터", () => {
    test("['bank'] — 은행만 반환한다", () => {
      // Given
      const filter = { categories: ["bank"] } as const;

      // When
      const banks = searchInstitutions(filter);

      // Then
      expect(banks.every((institution) => institution.category === "bank")).toBe(true);
      expect(banks.length).toBeLessThan(institutions.length);
    });

    test("['securities'] — 증권사만 반환한다", () => {
      // Given
      const filter = { categories: ["securities"] } as const;

      // When
      const securities = searchInstitutions(filter);

      // Then
      expect(securities.every((institution) => institution.category === "securities")).toBe(true);
    });

    test("['non-bank'] — 비은행만 반환한다", () => {
      // Given
      const filter = { categories: ["non-bank"] } as const;

      // When
      const nonBanks = searchInstitutions(filter);

      // Then
      expect(nonBanks.every((institution) => institution.category === "non-bank")).toBe(true);
    });

    test("['bank', 'non-bank'] — 두 카테고리 모두 반환한다", () => {
      // Given
      const filter = { categories: ["bank", "non-bank"] } as const;

      // When
      const results = searchInstitutions(filter);
      const categories: readonly string[] = results.map((institution) => institution.category);

      // Then
      expect(categories).not.toContain("securities");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("include 화이트리스트", () => {
    test("include 에 지정한 두 id 만 반환한다", () => {
      // Given
      const filter = { include: ["shinhan", "kakao"] } as const;

      // When
      const results = searchInstitutions(filter);
      const ids = results.map((institution) => institution.id).toSorted();

      // Then
      expect(ids).toEqual(["kakao", "shinhan"]);
    });

    test("5대 시중은행을 include 하면 5개 기관을 반환한다", () => {
      // Given
      const filter = {
        include: ["kb", "shinhan", "hana", "woori", "nh"],
      } as const;

      // When
      const results = searchInstitutions(filter);

      // Then
      expect(results.length).toBe(5);
    });
  });

  describe("exclude 블랙리스트", () => {
    test("exclude 에 지정한 id 를 제외한다", () => {
      // Given
      const filter = { exclude: ["shinhan"] } as const;

      // When — widen ids to string for the runtime check (the type is already narrow)
      const results = searchInstitutions(filter);
      const ids: readonly string[] = results.map((institution) => institution.id);

      // Then
      expect(ids).not.toContain("shinhan");
    });

    test("인터넷전문은행 3사를 모두 제외한다", () => {
      // Given
      const filter = { exclude: ["kakao", "toss", "kbank"] } as const;

      // When
      const results = searchInstitutions(filter);
      const ids: readonly string[] = results.map((institution) => institution.id);

      // Then
      expect(ids).not.toContain("kakao");
      expect(ids).not.toContain("toss");
      expect(ids).not.toContain("kbank");
    });
  });

  describe("필터 결합 (AND)", () => {
    test("categories 와 exclude 를 함께 적용한다", () => {
      // Given
      const filter = {
        categories: ["bank"],
        exclude: ["shinhan", "kb"],
      } as const;

      // When
      const results = searchInstitutions(filter);
      const ids: readonly string[] = results.map((institution) => institution.id);

      // Then
      expect(results.every((institution) => institution.category === "bank")).toBe(true);
      expect(ids).not.toContain("shinhan");
      expect(ids).not.toContain("kb");
    });

    test("categories + include — include 는 카테고리 안의 id 로 제한된다", () => {
      // Given — a securities id such as kis would not compile in this include
      const filter = {
        categories: ["bank"],
        include: ["shinhan", "kakao", "kb"],
      } as const;

      // When
      const results = searchInstitutions(filter);
      const ids = results.map((institution) => institution.id).toSorted();

      // Then
      expect(ids).toEqual(["kakao", "kb", "shinhan"]);
    });

    test("include + exclude — exclude 가 우선 적용된다", () => {
      // Given
      const filter = {
        include: ["shinhan", "kb", "hana"],
        exclude: ["kb"],
      } as const;

      // When
      const results = searchInstitutions(filter);
      const ids = results.map((institution) => institution.id).toSorted();

      // Then
      expect(ids).toEqual(["hana", "shinhan"]);
    });
  });

  describe("순수 함수", () => {
    test("매 호출마다 동일하지만 새 배열 인스턴스를 반환한다", () => {
      // Given
      const filter = { categories: ["bank"] } as const;

      // When
      const first = searchInstitutions(filter);
      const second = searchInstitutions(filter);

      // Then
      expect(first).toEqual(second);
      expect(first).not.toBe(second);
    });
  });
});
