import { describe, expect, test } from "vitest";

import { institutions } from "../../registry";
import type { Subject } from "../../types";
import { createDetector } from "./create-detector";
import { normalizeSubject } from "./normalize-subject";

// Regression: minScore used to cut on baseScore, dropping candidates before their branchRule bonus applied.
describe("branchRule 보너스는 minScore 컷오프보다 먼저 적용된다", () => {
  const detector = createDetector(institutions);

  test("branchRule 이 적중한 후보가 minScore 때문에 조기 탈락하지 않는다", () => {
    // Given — K Bank 10d has a branchRule (kbank10First9) on first digit 9.
    const input = "9995299148";

    // When
    const kbank = detector
      .detect(input, { minScore: 8 })
      .find((result) => result.institution.id === "kbank");

    // Then — baseScore 7 + branchRuleMatch 2 = 9 ≥ 8, so it must survive.
    expect(kbank).toBeDefined();
    expect(kbank?.score).toBeGreaterThanOrEqual(8);
  });

  test("기본 옵션(minScore 미지정) 결과는 minScore: 1 과 같다", () => {
    // Given — the default minScore is 1, and a score-0 pattern never matches in the first place.
    const input = "9995299148";

    // When
    const defaultIds = detector.detect(input).map((result) => result.institution.id);
    const explicitIds = detector
      .detect(input, { minScore: 1 })
      .map((result) => result.institution.id);

    // Then
    expect(defaultIds).toEqual(explicitIds);
  });

  test("minScore 를 넘지 못하는 후보는 보너스를 받아도 여전히 탈락한다", () => {
    // Given
    const input = "9995299148";

    // When
    const results = detector.detect(input, { minScore: 12 });

    // Then
    for (const result of results) {
      expect(result.score).toBeGreaterThanOrEqual(12);
    }
  });
});

describe("normalizeSubject 의 출금 판정은 computeCapabilities 와 같은 정의를 쓴다", () => {
  const ordinary: Subject = { code: "01", category: "ordinary" };

  test.each([
    ["new", true],
    ["old", true],
    ["merged-legacy", true],
    ["virtual", false],
    ["incoming-only", false],
    // Regression: lifetime once reported subject true vs capabilities false.
    ["lifetime", false],
  ] as const)("kind=%s 이면 allowsWithdrawal=%s 를 반환한다", (kind, expected) => {
    // Given
    const subject = ordinary;

    // When
    const result = normalizeSubject(subject, kind);

    // Then
    expect(result.allowsWithdrawal).toBe(expected);
  });

  test("명시된 allowsWithdrawal 은 kind 보다 우선한다", () => {
    // Given
    const explicit: Subject = { code: "01", category: "ordinary", allowsWithdrawal: true };

    // When
    const result = normalizeSubject(explicit, "lifetime");

    // Then
    expect(result.allowsWithdrawal).toBe(true);
  });

  test("subject.allowsWithdrawal 과 capabilities.allowsWithdrawal 이 어긋나지 않는다", () => {
    // Given — sweep the whole default registry
    const detector = createDetector(institutions);
    const inputs = ["110-436-387740", "3333-12-3456789", "1002-123-456789", "79094537213886"];

    // When
    const results = inputs.flatMap((input) => detector.detect(input, { limit: 20, minScore: 0 }));

    // Then
    for (const result of results) {
      if (result.subject) {
        expect(result.subject.allowsWithdrawal).toBe(result.capabilities.allowsWithdrawal);
      }
    }
  });
});
