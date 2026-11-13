import { describe, expect, test } from "vitest";

import { defineBranchRule } from "./define-branch-rule";

describe("defineBranchRule", () => {
  test("입력 BranchRule을 그대로 반환한다 (타입 안전 헬퍼)", () => {
    // Given
    const input = {
      describe: "test rule",
      evaluate: () => null,
    };

    // When
    const result = defineBranchRule(input);

    // Then
    expect(result).toBe(input);
  });
});
