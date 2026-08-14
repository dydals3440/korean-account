import { describe, expectTypeOf, test } from "vitest";
import type {
  ACCOUNT_KINDS,
  CONFIDENCE_LEVELS,
  INSTITUTION_CATEGORIES,
  SUBJECT_CATEGORIES,
} from "./constants";
import type { AccountKind, Confidence, InstitutionCategory, SubjectCategory } from "../types";

// `as const satisfies readonly X[]` only guarantees "every array element is
// an X". It cannot catch the reverse — a union member added but missing from
// the array — so bidirectional equality is asserted here.
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
