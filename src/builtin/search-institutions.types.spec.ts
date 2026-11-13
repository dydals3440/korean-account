import { describe, expect, expectTypeOf, test } from "vitest";

import { type InstitutionIdByCategory, type RegisteredInstitution } from "../registry";
import { getInstitution } from "./get-institution";
import { searchInstitutions } from "./search-institutions";

describe("Institution Id/Code/Category generic narrowing", () => {
  test("getInstitution('shinhan') 는 id/code/category 모두 literal 로 narrow", () => {
    // Given
    const id = "shinhan";

    // When
    const shinhan = getInstitution(id);

    // Then
    expect(shinhan).toBeTruthy();
    expectTypeOf(shinhan.id).toEqualTypeOf<"shinhan">();
    expectTypeOf(shinhan.code).toEqualTypeOf<"088">();
    expectTypeOf(shinhan.category).toEqualTypeOf<"bank">();
  });

  test("getInstitution('264') 는 키움증권 으로 narrow", () => {
    // Given
    const code = "264";

    // When
    const kiwoom = getInstitution(code);

    // Then
    expect(kiwoom).toBeTruthy();
    expectTypeOf(kiwoom.id).toEqualTypeOf<"kiwoom">();
    expectTypeOf(kiwoom.category).toEqualTypeOf<"securities">();
  });
});

describe("searchInstitutions cross-narrow", () => {
  test("categories: ['bank'] → 반환 institution 은 bank 카테고리만", () => {
    // Given
    const filter = { categories: ["bank"] } as const;

    // When
    const banks = searchInstitutions(filter);
    type Bank = (typeof banks)[number];

    // Then
    expectTypeOf<Bank["category"]>().toEqualTypeOf<"bank">();
    expectTypeOf<Bank["id"]>().toEqualTypeOf<InstitutionIdByCategory<"bank">>();
  });

  test("categories: ['securities'] → 반환 institution 은 securities 카테고리만", () => {
    // Given
    const filter = { categories: ["securities"] } as const;

    // When
    const securities = searchInstitutions(filter);
    type Securities = (typeof securities)[number];

    // Then
    expectTypeOf<Securities["category"]>().toEqualTypeOf<"securities">();
  });

  test("categories + include — include 가 카테고리 안의 id 로 제한된다", () => {
    // Given
    const categories = ["bank"] as const;

    // When
    const searchBankIds = () => searchInstitutions({ categories, include: ["kb", "shinhan"] });
    // @ts-expect-error — kiwoom is securities, so a bank-category include rejects it
    const searchSecuritiesId = () => searchInstitutions({ categories, include: ["kiwoom"] });

    // Then
    expect(searchBankIds).not.toThrow();
    expect(searchSecuritiesId).not.toThrow();
  });

  test("categories + exclude — exclude 도 카테고리 안의 id 만 받는다", () => {
    // Given
    const categories = ["bank"] as const;

    // When
    const excludeBankId = () => searchInstitutions({ categories, exclude: ["hsbc"] });
    // @ts-expect-error — kiwoom is securities, so a bank-category exclude rejects it
    const excludeSecuritiesId = () => searchInstitutions({ categories, exclude: ["kiwoom"] });

    // Then
    expect(excludeBankId).not.toThrow();
    expect(excludeSecuritiesId).not.toThrow();
  });

  test("필터 없이 호출 — 전체 RegisteredInstitution", () => {
    // Given
    type Registered = RegisteredInstitution;

    // When
    const all = searchInstitutions();
    type All = (typeof all)[number];

    // Then
    expectTypeOf<All>().toEqualTypeOf<Registered>();
  });
});
