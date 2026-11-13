import { describe, expect, test } from "vitest";

import { institutions } from "../../registry";
import type { Subject } from "../../types";
import { defineInstitution } from "../define/define-institution";
import { patternTemplate } from "../define/pattern-template";
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

describe("순위는 신뢰도 등급을 점수보다 먼저 본다", () => {
  const evidenced = defineInstitution({
    id: "evidenced",
    code: "901",
    nameKo: "근거 기관",
    category: "bank",
    aliases: [],
    priority: 1,
    patterns: [
      {
        template: patternTemplate("XXX-XXXXXXX"),
        kind: "old",
        identifierPosition: { start: 0, length: 3 },
        identifiers: ["123"],
      },
    ],
  });
  const lengthOnly = defineInstitution({
    id: "length-only",
    code: "902",
    nameKo: "길이만 맞는 기관",
    category: "bank",
    aliases: [],
    priority: 100,
    patterns: [{ template: patternTemplate("XXXXXXXXXX"), kind: "new" }],
  });

  test("근거 없는 low 후보는 점수가 더 높아도 근거 있는 후보보다 뒤에 온다", () => {
    // Given
    const detector = createDetector([lengthOnly, evidenced], {
      scoring: { identifierMatch: 0.5, kindNewBonus: 3 },
    });

    // When
    const results = detector.detect("1234567890");

    // Then
    expect(results.map((result) => [result.institution.id, result.confidence])).toEqual([
      ["evidenced", "medium"],
    ]);
  });
});

describe("ambiguous 는 옵션 필터와 무관하게 입력 기준으로 판정한다", () => {
  const twin = (id: string, code: string) =>
    defineInstitution({
      id,
      code,
      nameKo: id,
      category: id === "twin-a" ? "bank" : "non-bank",
      aliases: [],
      patterns: [
        {
          template: patternTemplate("XXX-XXXXXXX"),
          kind: "new",
          identifierPosition: { start: 0, length: 3 },
          identifiers: ["123"],
        },
      ],
    });
  const detector = createDetector([twin("twin-a", "903"), twin("twin-b", "904")]);

  test.each([
    { include: ["twin-a"] },
    { exclude: ["twin-b"] },
    { categories: ["bank"] },
    { limit: 1 },
  ] as const)("%j 로 경쟁 기관을 숨겨도 ambiguous 는 true 다", (options) => {
    // Given
    const input = "1234567890";

    // When
    const [top] = detector.detect(input, options);

    // Then
    expect(top?.institution.id).toBe("twin-a");
    expect(top?.ambiguous).toBe(true);
  });
});

describe("옵션 검증은 입력과 무관하다", () => {
  test.each(["", "숫자 없음"])("입력 %j 에도 잘못된 limit 은 RangeError 다", (input) => {
    // Given
    const detector = createDetector(institutions);

    // When
    const run = () => detector.detect(input, { limit: -1 });

    // Then
    expect(run).toThrow(RangeError);
  });
});

describe("기관 안에서도 근거 있는 패턴을 먼저 고른다", () => {
  test("점수가 같으면 근거 있는 패턴이 근거 없는 패턴을 이긴다", () => {
    // Given
    const institution = defineInstitution({
      id: "two-patterns",
      code: "905",
      nameKo: "패턴 둘",
      category: "bank",
      aliases: [],
      patterns: [
        {
          template: patternTemplate("XXX-XXXX-XXXX-XX"),
          kind: "new",
          additionalRules: [() => true],
        },
        {
          template: patternTemplate("XXX-XXXX-XXXX-XXX"),
          kind: "virtual",
          identifierPosition: { start: 0, length: 3 },
          identifiers: ["790"],
        },
      ],
    });
    const detector = createDetector([institution]);

    // When
    const [top] = detector.detect("7901234567890");

    // Then
    expect(top?.kind).toBe("virtual");
    expect(top?.score).toBe(4);
    expect(top?.confidence).toBe("medium");
  });
});

describe("extend 의 scoring 병합", () => {
  test("undefined 로 둔 가중치는 기존 detector 의 값을 유지한다", () => {
    // Given
    const base = createDetector(institutions, { scoring: { identifierMatch: 6 } });

    // When
    const extended = base.extend({ scoring: { identifierMatch: undefined, subjectMatch: 2 } });

    // Then
    expect(extended.detect("110-436-387740")[0]?.score).toBe(
      base.detect("110-436-387740")[0]?.score,
    );
  });
});
