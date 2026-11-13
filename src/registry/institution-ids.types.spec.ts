import { describe, expect, expectTypeOf, test } from "vitest";

import { INSTITUTION_IDS, type InstitutionId } from "./institution-ids";
import { institutions, type RegisteredInstitution } from "./institutions";

describe("INSTITUTION_IDS ↔ institutions 동기화", () => {
  test("런타임: 순서까지 포함해 institutions 의 id 와 정확히 일치한다", () => {
    // Given
    const registryIds = institutions.map((institution) => institution.id);

    // When / Then
    expect([...INSTITUTION_IDS]).toEqual(registryIds);
  });

  test("타입: 리터럴 id union 이 레지스트리 기관 id union 과 같다", () => {
    // Given / When / Then — adding an id to only one side breaks compilation here.
    expectTypeOf<InstitutionId>().toEqualTypeOf<RegisteredInstitution["id"]>();
  });

  test("팩토리 호출 없이 리터럴만 담아 번들러가 순수하다고 판단할 수 있다", () => {
    // Given / When / Then
    expect(INSTITUTION_IDS.every((id) => typeof id === "string")).toBe(true);
  });
});
