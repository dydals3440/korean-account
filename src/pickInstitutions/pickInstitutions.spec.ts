import { describe, expect, test } from "vitest";
import { institutions } from "../data";
import { pickInstitutions } from "./pickInstitutions";

describe("pickInstitutions", () => {
  describe("필터 없는 호출", () => {
    test("필터 없이 호출하면 전체 institution 을 반환한다", () => {
      // given / when
      const result = pickInstitutions();

      // then
      expect(result).toEqual(institutions);
    });
  });

  describe("categories 필터", () => {
    test("['bank'] — 은행만 반환한다", () => {
      // given
      const filter = { categories: ["bank"] } as const;

      // when
      const banks = pickInstitutions(filter);

      // then
      expect(banks.every((i) => i.category === "bank")).toBe(true);
      expect(banks.length).toBeLessThan(institutions.length);
    });

    test("['securities'] — 증권사만 반환한다", () => {
      // given
      const filter = { categories: ["securities"] } as const;

      // when
      const sec = pickInstitutions(filter);

      // then
      expect(sec.every((i) => i.category === "securities")).toBe(true);
    });

    test("['non-bank'] — 비은행만 반환한다", () => {
      // given
      const filter = { categories: ["non-bank"] } as const;

      // when
      const nb = pickInstitutions(filter);

      // then
      expect(nb.every((i) => i.category === "non-bank")).toBe(true);
    });

    test("['bank', 'non-bank'] — 두 카테고리 모두 반환한다", () => {
      // given
      const filter = { categories: ["bank", "non-bank"] } as const;

      // when
      const both = pickInstitutions(filter);

      // then
      const categories: readonly string[] = both.map((i) => i.category);
      expect(categories).not.toContain("securities");
      expect(both.length).toBeGreaterThan(0);
    });
  });

  describe("include 화이트리스트", () => {
    test("두 개 id 만 추려진다", () => {
      // given
      const filter = { include: ["shinhan", "kakao"] } as const;

      // when
      const picked = pickInstitutions(filter);

      // then
      expect(picked.map((i) => i.id).sort()).toEqual(["kakao", "shinhan"]);
    });

    test("5대 시중은행 동시 포함", () => {
      // given
      const filter = {
        include: ["kb", "shinhan", "hana", "woori", "nh"],
      } as const;

      // when
      const big5 = pickInstitutions(filter);

      // then
      expect(big5.length).toBe(5);
    });
  });

  describe("exclude 블랙리스트", () => {
    test("특정 id 가 제외된다", () => {
      // given
      const filter = { exclude: ["shinhan"] } as const;

      // when
      const picked = pickInstitutions(filter);

      // then — id 를 string 으로 펼쳐 런타임 검증 (타입은 이미 narrow)
      const ids: readonly string[] = picked.map((i) => i.id);
      expect(ids).not.toContain("shinhan");
    });

    test("인터넷전문은행 3사를 모두 제외한다", () => {
      // given
      const filter = { exclude: ["kakao", "toss", "kbank"] } as const;

      // when
      const picked = pickInstitutions(filter);

      // then
      const ids: readonly string[] = picked.map((i) => i.id);
      expect(ids).not.toContain("kakao");
      expect(ids).not.toContain("toss");
      expect(ids).not.toContain("kbank");
    });
  });

  describe("필터 결합 (AND)", () => {
    test("categories + exclude 동시 적용", () => {
      // given
      const filter = {
        categories: ["bank"],
        exclude: ["shinhan", "kb"],
      } as const;

      // when
      const picked = pickInstitutions(filter);

      // then
      expect(picked.every((i) => i.category === "bank")).toBe(true);
      const ids: readonly string[] = picked.map((i) => i.id);
      expect(ids).not.toContain("shinhan");
      expect(ids).not.toContain("kb");
    });

    test("categories + include — include 는 카테고리 안의 id 로 제한된다", () => {
      // given — kis (securities) 를 bank 카테고리에 함께 넣으면 컴파일 에러.
      // 컴파일 가능한 조합: bank 안의 id 들만.
      const filter = {
        categories: ["bank"],
        include: ["shinhan", "kakao", "kb"],
      } as const;

      // when
      const picked = pickInstitutions(filter);

      // then
      expect(picked.map((i) => i.id).sort()).toEqual(["kakao", "kb", "shinhan"]);
    });

    test("include + exclude — exclude 가 우선 적용된다", () => {
      // given
      const filter = {
        include: ["shinhan", "kb", "hana"],
        exclude: ["kb"],
      } as const;

      // when
      const picked = pickInstitutions(filter);

      // then
      expect(picked.map((i) => i.id).sort()).toEqual(["hana", "shinhan"]);
    });
  });

  describe("순수 함수", () => {
    test("매 호출마다 동일하지만 새 배열 인스턴스를 반환한다", () => {
      // given
      const filter = { categories: ["bank"] } as const;

      // when
      const a = pickInstitutions(filter);
      const b = pickInstitutions(filter);

      // then
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });
});
