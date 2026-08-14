import { describe, expectTypeOf, test } from "vitest";
import { institutions, kb, shinhan, toss } from "../registry";
import type { DetectionResult, RegisteredInstitution } from "../index";
import { createDetector } from "./detector";

describe("createDetector generic narrowing", () => {
  test("두 기관만 넘기면 결과 id 가 그 union 으로 좁혀진다", () => {
    const detector = createDetector([kb, shinhan]);
    const results = detector.detect("110-436-387740");

    expectTypeOf(results[0]!.institution.id).toEqualTypeOf<"kb" | "shinhan">();
  });

  test("include 옵션이 넘긴 기관의 id 로 autocomplete 된다", () => {
    const detector = createDetector([kb, shinhan, toss]);

    detector.detect("110", { include: ["kb", "toss"] });
    // arbitrary strings stay accepted (autocomplete-with-widening)
    detector.detect("110", { include: ["my-custom-bank"] });
  });

  test("전체 레지스트리를 넘기면 RegisteredInstitution 으로 추론된다", () => {
    const detector = createDetector(institutions);
    const results = detector.detect("110-436-387740");

    expectTypeOf(results).toEqualTypeOf<readonly DetectionResult<RegisteredInstitution>[]>();
  });

  test("extend 는 union 을 확장한다", () => {
    const detector = createDetector([kb]);
    const extended = detector.extend({ institutions: [shinhan] });

    expectTypeOf(extended.institutions[0]!.id).toEqualTypeOf<"kb" | "shinhan">();
  });
});
