import { describe, expectTypeOf, test } from "vitest";
import {
  type InstitutionId,
  type InstitutionIdByCategory,
  institutionByCode,
  institutionById,
  type RegisteredInstitution,
} from "../data";
import { pickInstitutions, pickInstitutionsByIds } from "./pickInstitutions";

describe("Institution Id/Code/Category generic narrowing", () => {
  test("institutionById('shinhan') 는 id/code/category 모두 literal 로 narrow", () => {
    // Given / When
    const shinhan = institutionById("shinhan");
    if (!shinhan) throw new Error("missing");

    // Then
    expectTypeOf(shinhan.id).toEqualTypeOf<"shinhan">();
    expectTypeOf(shinhan.code).toEqualTypeOf<"088">();
    expectTypeOf(shinhan.category).toEqualTypeOf<"bank">();
  });

  test("institutionByCode('264') 는 키움증권 으로 narrow", () => {
    // Given / When
    const kiwoom = institutionByCode("264");
    if (!kiwoom) throw new Error("missing");

    // Then
    expectTypeOf(kiwoom.id).toEqualTypeOf<"kiwoom">();
    expectTypeOf(kiwoom.category).toEqualTypeOf<"securities">();
  });
});

describe("pickInstitutions cross-narrow", () => {
  test("categories: ['bank'] → 반환 institution 은 bank 카테고리만", () => {
    // Given / When
    const banks = pickInstitutions({ categories: ["bank"] });
    type Bank = (typeof banks)[number];

    // Then
    expectTypeOf<Bank["category"]>().toEqualTypeOf<"bank">();
    expectTypeOf<Bank["id"]>().toEqualTypeOf<InstitutionIdByCategory<"bank">>();
  });

  test("categories: ['securities'] → 반환 institution 은 securities 카테고리만", () => {
    // Given / When
    const securities = pickInstitutions({ categories: ["securities"] });
    type Sec = (typeof securities)[number];

    // Then
    expectTypeOf<Sec["category"]>().toEqualTypeOf<"securities">();
  });

  test("categories + include — include 가 카테고리 안의 id 로 제한된다", () => {
    // Given / When / Then — OK
    pickInstitutions({ categories: ["bank"], include: ["kb", "shinhan"] });

    // 컴파일 에러: kiwoom 은 securities 라 bank 카테고리 include 에 못 들어감
    // @ts-expect-error
    pickInstitutions({ categories: ["bank"], include: ["kiwoom"] });
  });

  test("categories + exclude — exclude 도 카테고리 안의 id 만 받는다", () => {
    // Given / When / Then — OK
    pickInstitutions({ categories: ["bank"], exclude: ["hsbc"] });

    // 컴파일 에러
    // @ts-expect-error
    pickInstitutions({ categories: ["bank"], exclude: ["kiwoom"] });
  });

  test("필터 없이 호출 — 전체 RegisteredInstitution", () => {
    // Given / When
    const all = pickInstitutions();
    type All = (typeof all)[number];

    // Then
    expectTypeOf<All>().toEqualTypeOf<RegisteredInstitution>();
  });
});

describe("pickInstitutionsByIds — id 기반 narrow", () => {
  test("include literal → 그 id 만의 institution union", () => {
    // Given / When
    const major = pickInstitutionsByIds({ include: ["kb", "shinhan", "hana"] });
    type Major = (typeof major)[number];

    // Then
    expectTypeOf<Major["id"]>().toEqualTypeOf<"kb" | "shinhan" | "hana">();
  });

  test("exclude literal → 그 id 들이 union 에서 빠진다", () => {
    // Given / When
    const noForeign = pickInstitutionsByIds({
      exclude: ["hsbc", "deutsche", "jpmc", "bnp-paribas"],
    });
    type NoForeign = (typeof noForeign)[number];

    // Then
    expectTypeOf<NoForeign["id"]>().toEqualTypeOf<
      Exclude<InstitutionId, "hsbc" | "deutsche" | "jpmc" | "bnp-paribas">
    >();
  });

  test("include + exclude — exclude 우선", () => {
    // Given / When
    const filtered = pickInstitutionsByIds({
      include: ["kb", "shinhan", "hana"],
      exclude: ["hana"],
    });
    type Filtered = (typeof filtered)[number];

    // Then
    expectTypeOf<Filtered["id"]>().toEqualTypeOf<"kb" | "shinhan">();
  });
});
