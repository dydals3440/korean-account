import { describe, expect, test } from "vitest";

import { suhyup, suhyupCoop } from "../../registry";
import type { DetectOptions } from "../../types";
import { defineInstitution } from "../define/define-institution";
import { patternTemplate } from "../define/pattern-template";
import { createDetector } from "./create-detector";

const detector = createDetector([suhyup, suhyupCoop]);

describe("기관 필터는 최종 분기 결과에 적용한다", () => {
  test.each([
    [{ include: ["suhyup"] }, 0],
    [{ exclude: ["suhyup-coop"] }, 0],
    [{ categories: ["bank"] }, 0],
    [{ include: ["suhyup-coop"] }, 1],
    [{ exclude: ["suhyup"] }, 1],
    [{ categories: ["non-bank"] }, 1],
    [{ include: ["suhyup-coop"], exclude: ["suhyup-coop"] }, 0],
    [{ include: [] }, 0],
  ] satisfies readonly [DetectOptions, number][])(
    "%j 이면 중앙회 후보 %i개를 반환한다",
    (options, count) => {
      // Given
      const input = "212345678901";

      // When
      const results = detector.detect(input, options);

      // Then
      expect(results).toHaveLength(count);
      for (const result of results) {
        expect(result.institution.id).toBe("suhyup-coop");
        expect(result.score).toBeGreaterThanOrEqual(5);
      }
    },
  );

  test("최초 기관이 include 대상이 아니어도 최종 기관이 일치하면 유지한다", () => {
    // Given
    const input = "123-43-456789";

    // When
    const results = detector.detect(input, { include: ["suhyup-coop"] });

    // Then
    expect(results).toHaveLength(1);
    expect(results[0]?.institution.id).toBe("suhyup-coop");
    expect(results[0]?.matchedPattern).toBe(suhyup.patterns[0]);
    expect(results[0]?.confidence).toBe("medium");
  });

  describe("동점 중복이면 재배정된 후보보다 기관 자신의 패턴을 남긴다", () => {
    const ownPattern = {
      template: patternTemplate("XXXXXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["123"],
      // Two rule bonuses match the router's branch bonus, so both candidates tie on every key.
      additionalRules: [() => true, () => true],
    } as const;
    const owner = defineInstitution({
      id: "owner",
      code: "996",
      nameKo: "소유 기관",
      category: "bank",
      aliases: [],
      patterns: [ownPattern],
    });
    const router = defineInstitution({
      id: "router",
      code: "995",
      nameKo: "재배정 기관",
      category: "bank",
      aliases: [],
      patterns: [
        {
          template: patternTemplate("XXXXXXXXXX"),
          kind: "new",
          identifierPosition: { start: 0, length: 3 },
          identifiers: ["123"],
          branchRule: { describe: "to-owner", evaluate: () => ({ institutionId: "owner" }) },
        },
      ],
    });

    test.each([
      ["재배정 기관 먼저", [router, owner]],
      ["소유 기관 먼저", [owner, router]],
    ] as const)("%s", (_, order) => {
      // Given
      const tiedDetector = createDetector(order);

      // When
      const results = tiedDetector.detect("1234567890");

      // Then
      expect(results).toHaveLength(1);
      expect(results[0]?.institution.id).toBe("owner");
      expect(results[0]?.matchedPattern).toBe(owner.patterns[0]);
    });
  });

  test("대체 분기로만 라우팅된 후보는 근거가 없어 low 다", () => {
    // Given
    const input = "112345678901";

    // When
    const results = detector.detect(input, { limit: Infinity });

    // Then
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.confidence).toBe("low");
    }
  });

  test("같은 기관이 된 후보는 필터 뒤에 하나로 합치고 limit 은 기관 수를 센다", () => {
    // Given
    const input = "212345678901";

    // When
    const limitedResults = detector.detect(input, { include: ["suhyup-coop"], limit: 1 });
    const minScore8Results = detector.detect(input, { include: ["suhyup-coop"], minScore: 8 });
    const minScore5Results = detector.detect(input, { include: ["suhyup-coop"], minScore: 5 });

    // Then
    expect(limitedResults).toHaveLength(1);
    expect(minScore8Results).toEqual([]);
    expect(minScore5Results).toHaveLength(1);
    expect(minScore5Results[0]?.score).toBe(7);
  });

  test("커스텀 분기는 최종 category와 kind로 검사하고 미등록 대상은 기존 기관을 유지한다", () => {
    // Given
    const source = defineInstitution({
      id: "source",
      code: "998",
      nameKo: "출발 기관",
      category: "bank",
      aliases: [],
      patterns: [
        {
          template: patternTemplate("XXXXXXXXXXXX"),
          kind: "new",
          branchRule: {
            describe: "custom-route",
            evaluate: () => ({ institutionId: "target", kindOverride: "incoming-only" }),
          },
        },
      ],
    });
    const target = defineInstitution({
      id: "target",
      code: "999",
      nameKo: "도착 기관",
      category: "non-bank",
      aliases: [],
      patterns: [],
    });
    const routedOptions = {
      include: ["target"],
      categories: ["non-bank"],
      kinds: ["incoming-only"],
    } as const;
    const input = "123456789012";

    // When
    const routedResults = createDetector([source, target]).detect(input, routedOptions);
    const unroutedResults = createDetector([source]).detect(input, {
      include: ["source"],
      categories: ["bank"],
    });
    const unroutedNonBankResults = createDetector([source]).detect(input, {
      categories: ["non-bank"],
    });

    // Then
    expect(routedResults[0]?.institution.id).toBe("target");
    expect(unroutedResults[0]?.institution.id).toBe("source");
    expect(unroutedNonBankResults).toEqual([]);
  });
});
