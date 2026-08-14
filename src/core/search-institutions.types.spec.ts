import { describe, expectTypeOf, test } from "vitest";
import {
  getInstitution,
  type InstitutionIdByCategory,
  type RegisteredInstitution,
} from "../registry";
import { searchInstitutions } from "./search-institutions";

describe("Institution Id/Code/Category generic narrowing", () => {
  test("getInstitution('shinhan') 는 id/code/category 모두 literal 로 narrow", () => {
    // Given / When
    const shinhan = getInstitution("shinhan");
    if (!shinhan) throw new Error("missing");

    // Then
    expectTypeOf(shinhan.id).toEqualTypeOf<"shinhan">();
    expectTypeOf(shinhan.code).toEqualTypeOf<"088">();
    expectTypeOf(shinhan.category).toEqualTypeOf<"bank">();
  });

  test("getInstitution('264') 는 키움증권 으로 narrow", () => {
    // Given / When
    const kiwoom = getInstitution("264");
    if (!kiwoom) throw new Error("missing");

    // Then
    expectTypeOf(kiwoom.id).toEqualTypeOf<"kiwoom">();
    expectTypeOf(kiwoom.category).toEqualTypeOf<"securities">();
  });
});

describe("searchInstitutions cross-narrow", () => {
  test("categories: ['bank'] → 반환 institution 은 bank 카테고리만", () => {
    // Given / When
    const banks = searchInstitutions({ categories: ["bank"] });
    type Bank = (typeof banks)[number];

    // Then
    expectTypeOf<Bank["category"]>().toEqualTypeOf<"bank">();
    expectTypeOf<Bank["id"]>().toEqualTypeOf<InstitutionIdByCategory<"bank">>();
  });

  test("categories: ['securities'] → 반환 institution 은 securities 카테고리만", () => {
    // Given / When
    const securities = searchInstitutions({ categories: ["securities"] });
    type Sec = (typeof securities)[number];

    // Then
    expectTypeOf<Sec["category"]>().toEqualTypeOf<"securities">();
  });

  test("categories + include — include 가 카테고리 안의 id 로 제한된다", () => {
    // Given / When / Then — OK
    searchInstitutions({ categories: ["bank"], include: ["kb", "shinhan"] });

    // Compile error: kiwoom is securities, so it cannot appear in a bank-category include
    // @ts-expect-error
    searchInstitutions({ categories: ["bank"], include: ["kiwoom"] });
  });

  test("categories + exclude — exclude 도 카테고리 안의 id 만 받는다", () => {
    // Given / When / Then — OK
    searchInstitutions({ categories: ["bank"], exclude: ["hsbc"] });

    // Compile error
    // @ts-expect-error
    searchInstitutions({ categories: ["bank"], exclude: ["kiwoom"] });
  });

  test("필터 없이 호출 — 전체 RegisteredInstitution", () => {
    // Given / When
    const all = searchInstitutions();
    type All = (typeof all)[number];

    // Then
    expectTypeOf<All>().toEqualTypeOf<RegisteredInstitution>();
  });
});
