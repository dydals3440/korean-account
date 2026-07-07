import { describe, expect, test } from "vitest";
import { institutions } from "../data";
import { pickInstitutions } from "./pickInstitutions";

describe("pickInstitutions", () => {
  describe("필터 없는 호출", () => {
    test("필터 없이 호출하면 전체 institution 을 반환한다", () => {
      // Given / When
      const result = pickInstitutions();

      // Then
      expect(result).toEqual(institutions);
    });
  });

  describe("categories 필터", () => {
    test("['bank'] — 은행만 반환한다", () => {
      // Given
      const filter = { categories: ["bank"] } as const;

      // When
      const banks = pickInstitutions(filter);

      // Then
      expect(banks.every((i) => i.category === "bank")).toBe(true);
      expect(banks.length).toBeLessThan(institutions.length);
    });

    test("['securities'] — 증권사만 반환한다", () => {
      // Given
      const filter = { categories: ["securities"] } as const;

      // When
      const sec = pickInstitutions(filter);

      // Then
      expect(sec.every((i) => i.category === "securities")).toBe(true);
    });

    test("['non-bank'] — 비은행만 반환한다", () => {
      // Given
      const filter = { categories: ["non-bank"] } as const;

      // When
      const nb = pickInstitutions(filter);

      // Then
      expect(nb.every((i) => i.category === "non-bank")).toBe(true);
    });

    test("['bank', 'non-bank'] — 두 카테고리 모두 반환한다", () => {
      // Given
      const filter = { categories: ["bank", "non-bank"] } as const;

      // When
      const both = pickInstitutions(filter);

      // Then
      const categories: readonly string[] = both.map((i) => i.category);
      expect(categories).not.toContain("securities");
      expect(both.length).toBeGreaterThan(0);
    });
  });

  describe("include 화이트리스트", () => {
    test("두 개 id 만 추려진다", () => {
      // Given
      const filter = { include: ["shinhan", "kakao"] } as const;

      // When
      const picked = pickInstitutions(filter);

      // Then
      expect(picked.map((i) => i.id).sort()).toEqual(["kakao", "shinhan"]);
    });

    test("5대 시중은행 동시 포함", () => {
      // Given
      const filter = {
        include: ["kb", "shinhan", "hana", "woori", "nh"],
      } as const;

      // When
      const big5 = pickInstitutions(filter);

      // Then
      expect(big5.length).toBe(5);
    });
  });

  describe("exclude 블랙리스트", () => {
    test("특정 id 가 제외된다", () => {
      // Given
      const filter = { exclude: ["shinhan"] } as const;

      // When
      const picked = pickInstitutions(filter);

      // Then — id 를 string 으로 펼쳐 런타임 검증 (타입은 이미 narrow)
      const ids: readonly string[] = picked.map((i) => i.id);
      expect(ids).not.toContain("shinhan");
    });

    test("인터넷전문은행 3사를 모두 제외한다", () => {
      // Given
      const filter = { exclude: ["kakao", "toss", "kbank"] } as const;

      // When
      const picked = pickInstitutions(filter);

      // Then
      const ids: readonly string[] = picked.map((i) => i.id);
      expect(ids).not.toContain("kakao");
      expect(ids).not.toContain("toss");
      expect(ids).not.toContain("kbank");
    });
  });

  describe("필터 결합 (AND)", () => {
    test("categories + exclude 동시 적용", () => {
      // Given
      const filter = {
        categories: ["bank"],
        exclude: ["shinhan", "kb"],
      } as const;

      // When
      const picked = pickInstitutions(filter);

      // Then
      expect(picked.every((i) => i.category === "bank")).toBe(true);
      const ids: readonly string[] = picked.map((i) => i.id);
      expect(ids).not.toContain("shinhan");
      expect(ids).not.toContain("kb");
    });

    test("categories + include — include 는 카테고리 안의 id 로 제한된다", () => {
      // Given — kis (securities) 를 bank 카테고리에 함께 넣으면 컴파일 에러.
      // 컴파일 가능한 조합: bank 안의 id 들만.
      const filter = {
        categories: ["bank"],
        include: ["shinhan", "kakao", "kb"],
      } as const;

      // When
      const picked = pickInstitutions(filter);

      // Then
      expect(picked.map((i) => i.id).sort()).toEqual(["kakao", "kb", "shinhan"]);
    });

    test("include + exclude — exclude 가 우선 적용된다", () => {
      // Given
      const filter = {
        include: ["shinhan", "kb", "hana"],
        exclude: ["kb"],
      } as const;

      // When
      const picked = pickInstitutions(filter);

      // Then
      expect(picked.map((i) => i.id).sort()).toEqual(["hana", "shinhan"]);
    });
  });

  describe("순수 함수", () => {
    test("매 호출마다 동일하지만 새 배열 인스턴스를 반환한다", () => {
      // Given
      const filter = { categories: ["bank"] } as const;

      // When
      const a = pickInstitutions(filter);
      const b = pickInstitutions(filter);

      // Then
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });
});
