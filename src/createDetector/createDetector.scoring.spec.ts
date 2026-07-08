import { describe, expect, test } from "vitest";
import { institutions } from "../data";
import { normalizeSubject } from "../subjects";
import type { Subject } from "../types";
import { createDetector } from "./createDetector";

describe("branchRule 보너스는 minScore 컷오프보다 먼저 적용된다", () => {
  // 예전에는 baseScore 로 먼저 자르고 나서 보너스를 얹었다. 그 결과 "분기 규칙 덕에
  // minScore 를 넘겼어야 할 후보" 가 보너스를 받아보지도 못하고 탈락했다.
  const detector = createDetector({ institutions });

  test("branchRule 이 적중한 후보가 minScore 때문에 조기 탈락하지 않는다", () => {
    // Given — K뱅크 10d 는 첫 자리 9 에 branchRule (kbank10First9) 이 걸려 있다.
    const input = "9995299148";

    // When
    const withBonus = detector.detect(input, { minScore: 8 });

    // Then — baseScore 7 + branchRuleMatch 2 = 9 ≥ 8 이므로 살아남아야 한다.
    const kbank = withBonus.find((r) => r.institution.id === "kbank");
    expect(kbank).toBeDefined();
    expect(kbank?.score).toBeGreaterThanOrEqual(8);
  });

  test("기본 옵션(minScore 미지정) 결과는 달라지지 않는다", () => {
    // Given / When — 기본 minScore 는 1 이고, score 0 인 패턴은 애초에 매칭되지 않는다.
    const input = "9995299148";

    // Then — 보너스 적용 순서가 바뀌어도 기본 사용자에게는 변화가 없다.
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
    // 예전에는 lifetime 만 빠져 있어, subject.allowsWithdrawal 은 true 인데
    // capabilities.allowsWithdrawal 은 false 인 모순이 났다.
    ["lifetime", false],
  ] as const)("kind=%s → allowsWithdrawal=%s", (kind, expected) => {
    expect(normalizeSubject(ordinary, kind).allowsWithdrawal).toBe(expected);
  });

  test("명시된 allowsWithdrawal 은 kind 보다 우선한다", () => {
    const explicit: Subject = { code: "01", category: "ordinary", allowsWithdrawal: true };
    expect(normalizeSubject(explicit, "lifetime").allowsWithdrawal).toBe(true);
  });

  test("subject.allowsWithdrawal 과 capabilities.allowsWithdrawal 이 어긋나지 않는다", () => {
    // Given — 기본 레지스트리 전체를 훑어, 두 값이 모순되는 결과가 없는지 확인.
    const detector = createDetector({ institutions });
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
