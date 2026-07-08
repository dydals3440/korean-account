import { describe, expect, expectTypeOf, test } from "vitest";
import { type InstitutionId, institutions } from "./index";
import { INSTITUTION_IDS } from "./institutionIds";

describe("INSTITUTION_IDS ↔ institutions 동기화", () => {
  test("런타임: 순서까지 포함해 institutions 의 id 와 정확히 일치한다", () => {
    // Given
    const registryIds = institutions.map((institution) => institution.id);

    // When / Then
    expect([...INSTITUTION_IDS]).toEqual(registryIds);
  });

  test("타입: 두 union 이 서로를 완전히 덮는다 (양방향 exhaustiveness)", () => {
    // Given / When / Then — 한쪽에만 id 를 추가하면 여기서 컴파일이 깨진다.
    expectTypeOf<(typeof INSTITUTION_IDS)[number]>().toEqualTypeOf<InstitutionId>();
  });

  test("팩토리 호출 없이 리터럴만 담아 번들러가 순수하다고 판단할 수 있다", () => {
    // Given / When / Then
    expect(INSTITUTION_IDS.every((id) => typeof id === "string")).toBe(true);
  });
});
