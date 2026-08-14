import { describe, expect, test } from "vitest";
import { institutions } from "../registry";
import { normalizeSubject } from "./subjects";
import type { Subject } from "../types";
import { createDetector } from "./detector";

describe("branchRule 보너스는 minScore 컷오프보다 먼저 적용된다", () => {
  // Previously the cut happened on baseScore before bonuses were applied, so
  // a candidate that should have cleared minScore thanks to a branch rule was
  // eliminated before ever receiving its bonus.
  const detector = createDetector(institutions);

  test("branchRule 이 적중한 후보가 minScore 때문에 조기 탈락하지 않는다", () => {
    // Given — K Bank 10d has a branchRule (kbank10First9) on first digit 9.
    const input = "9995299148";

    // When
    const withBonus = detector.detect(input, { minScore: 8 });

    // Then — baseScore 7 + branchRuleMatch 2 = 9 ≥ 8, so it must survive.
    const kbank = withBonus.find((r) => r.institution.id === "kbank");
    expect(kbank).toBeDefined();
    expect(kbank?.score).toBeGreaterThanOrEqual(8);
  });

  test("기본 옵션(minScore 미지정) 결과는 달라지지 않는다", () => {
    // Given / When — the default minScore is 1, and a score-0 pattern never matches in the first place.
    const input = "9995299148";

    // Then — reordering bonus application must not change anything for default users.
    expect(detector.detect(input).map((r) => r.institution.id)).toEqual(
      detector.detect(input, { minScore: 1 }).map((r) => r.institution.id),
    );
  });

  test("minScore 를 넘지 못하는 후보는 보너스를 받아도 여전히 탈락한다", () => {
    // Given / When
    const results = detector.detect("9995299148", { minScore: 12 });

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
    // Previously only lifetime was missing, producing the contradiction
    // subject.allowsWithdrawal === true with capabilities.allowsWithdrawal === false.
    ["lifetime", false],
  ] as const)("kind=%s → allowsWithdrawal=%s", (kind, expected) => {
    expect(normalizeSubject(ordinary, kind).allowsWithdrawal).toBe(expected);
  });

  test("명시된 allowsWithdrawal 은 kind 보다 우선한다", () => {
    const explicit: Subject = { code: "01", category: "ordinary", allowsWithdrawal: true };
    expect(normalizeSubject(explicit, "lifetime").allowsWithdrawal).toBe(true);
  });

  test("subject.allowsWithdrawal 과 capabilities.allowsWithdrawal 이 어긋나지 않는다", () => {
    // Given — sweep the whole default registry and check no result contradicts the two values.
    const detector = createDetector(institutions);
    const inputs = ["110-436-387740", "3333-12-3456789", "1002-123-456789", "79094537213886"];

    // When / Then
    for (const input of inputs) {
      for (const result of detector.detect(input, { limit: 20, minScore: 0 })) {
        if (result.subject) {
          expect(result.subject.allowsWithdrawal).toBe(result.capabilities.allowsWithdrawal);
        }
      }
    }
  });
});
