import { describe, expectTypeOf, test } from "vitest";
import type {
  ACCOUNT_KINDS,
  CONFIDENCE_LEVELS,
  INSTITUTION_CATEGORIES,
  SUBJECT_CATEGORIES,
} from "./constants";
import type { AccountKind, Confidence, InstitutionCategory, SubjectCategory } from "./types";

// `as const satisfies readonly X[]` 는 "배열의 모든 원소가 X 다" 만 보장한다.
// 반대 방향 — union 에 멤버를 추가했는데 배열에 안 넣은 경우 — 은 잡지 못하므로
// 여기서 양방향 동등성을 단언한다.
describe("리터럴 배열 ↔ union 양방향 exhaustiveness", () => {
  test("ACCOUNT_KINDS", () => {
    expectTypeOf<(typeof ACCOUNT_KINDS)[number]>().toEqualTypeOf<AccountKind>();
  });

  test("SUBJECT_CATEGORIES", () => {
    expectTypeOf<(typeof SUBJECT_CATEGORIES)[number]>().toEqualTypeOf<SubjectCategory>();
  });

  test("INSTITUTION_CATEGORIES", () => {
    expectTypeOf<(typeof INSTITUTION_CATEGORIES)[number]>().toEqualTypeOf<InstitutionCategory>();
  });

  test("CONFIDENCE_LEVELS", () => {
    expectTypeOf<(typeof CONFIDENCE_LEVELS)[number]>().toEqualTypeOf<Confidence>();
  });
});
