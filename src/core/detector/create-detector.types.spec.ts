import { describe, expectTypeOf, test } from "vitest";

import type { DetectionResult, RegisteredInstitution } from "../..";
import { institutions, kb, shinhan, toss } from "../../registry";
import { defineInstitution } from "../define/define-institution";
import { patternTemplate } from "../define/pattern-template";
import { createDetector } from "./create-detector";

describe("createDetector generic narrowing", () => {
  test("두 기관만 넘기면 결과 id 가 그 union 으로 좁혀진다", () => {
    // Given
    const detector = createDetector([kb, shinhan]);

    // When
    const results = detector.detect("110-436-387740");

    // Then
    expectTypeOf(results[0]!.institution.id).toEqualTypeOf<"kb" | "shinhan">();
  });

  test("include 옵션이 넘긴 기관의 id 로 autocomplete 된다", () => {
    // Given
    const detector = createDetector([kb, shinhan, toss]);

    // When
    type Detect = typeof detector.detect;

    // Then — arbitrary strings stay accepted (autocomplete-with-widening)
    expectTypeOf<Detect>().toBeCallableWith("110", { include: ["kb", "toss"] });
    expectTypeOf<Detect>().toBeCallableWith("110", { include: ["my-custom-bank"] });
  });

  test("전체 레지스트리를 넘기면 RegisteredInstitution 으로 추론된다", () => {
    // Given
    const detector = createDetector(institutions);

    // When
    const results = detector.detect("110-436-387740");

    // Then
    expectTypeOf(results).toEqualTypeOf<readonly DetectionResult<RegisteredInstitution>[]>();
  });

  test("extend 는 union 을 확장한다", () => {
    // Given
    const detector = createDetector([kb]);

    // When
    const extended = detector.extend({ institutions: [shinhan] });

    // Then
    expectTypeOf(extended.institutions[0]!.id).toEqualTypeOf<"kb" | "shinhan">();
  });
});

describe("정의 타입과 exactOptionalPropertyTypes", () => {
  test("선택 필드에 undefined 를 명시해도 기관을 정의할 수 있다", () => {
    // Given
    const note: string | undefined = undefined;

    // When
    const institution = defineInstitution({
      id: "my-bank",
      code: "999",
      nameKo: "내 은행",
      nameEn: undefined,
      category: "bank",
      aliases: [],
      priority: undefined,
      notes: note,
      patterns: [
        {
          template: patternTemplate("XXX-XXXXXX"),
          kind: "new",
          identifierPosition: undefined,
          subjects: [{ code: "01", category: "ordinary", label: undefined, services: {} }],
          note,
        },
      ],
    });

    // Then
    expectTypeOf(institution.id).toEqualTypeOf<"my-bank">();
  });
});

describe("extend 의 결과 타입", () => {
  test("기관 없이 가중치만 바꾸면 기존 기관 id 유니온을 유지한다", () => {
    // Given
    const detector = createDetector([kb, shinhan]);

    // When
    const tuned = detector.extend({ scoring: { identifierMatch: 6 } });

    // Then
    type Id = ReturnType<typeof tuned.detect>[number]["institution"]["id"];
    expectTypeOf<Id>().toEqualTypeOf<"kb" | "shinhan">();
  });

  test("기관을 더하면 그 id 가 유니온에 추가된다", () => {
    // Given
    const detector = createDetector([kb]);

    // When
    const extended = detector.extend({ institutions: [toss] });

    // Then
    type Id = ReturnType<typeof extended.detect>[number]["institution"]["id"];
    expectTypeOf<Id>().toEqualTypeOf<"kb" | "toss">();
  });
});
