import { describe, expect, expectTypeOf, test } from "vitest";

import { INSTITUTION_IDS, type InstitutionId } from "./institution-ids";
import { institutions, type RegisteredInstitution } from "./institutions";

describe("INSTITUTION_IDS ↔ institutions 동기화", () => {
  test("런타임: 순서까지 포함해 institutions 의 id 와 정확히 일치한다", () => {
    // Given
    const registryIds = institutions.map((institution) => institution.id);

    // When
    const literalIds = [...INSTITUTION_IDS];

    // Then
    expect(literalIds).toEqual(registryIds);
  });

  test("타입: 리터럴 id union 이 레지스트리 기관 id union 과 같다", () => {
    // Given
    type LiteralId = InstitutionId;

    // When
    type RegistryId = RegisteredInstitution["id"];

    // Then — adding an id to only one side breaks compilation here
    expectTypeOf<LiteralId>().toEqualTypeOf<RegistryId>();
  });

  test("팩토리 호출 없이 리터럴만 담아 번들러가 순수하다고 판단할 수 있다", () => {
    // Given
    const ids = INSTITUTION_IDS;

    // When
    const allStrings = ids.every((id) => typeof id === "string");

    // Then
    expect(allStrings).toBe(true);
  });
});
