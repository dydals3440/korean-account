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
    [{ include: ["suhyup-coop"] }, 2],
    [{ exclude: ["suhyup"] }, 2],
    [{ categories: ["non-bank"] }, 2],
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
    const input = "112345678901";

    // When
    const results = detector.detect(input, { include: ["suhyup"] });

    // Then
    expect(results).toHaveLength(1);
    expect(results[0]?.matchedPattern).toBe(suhyupCoop.patterns[0]);
    expect(results.every((result) => result.institution.id === "suhyup")).toBe(true);
  });

  test("필터 후 limit을 적용하고 같은 기관으로 분기한 후보를 합치지 않는다", () => {
    // Given
    const input = "212345678901";

    // When
    const limitedResults = detector.detect(input, { include: ["suhyup-coop"], limit: 1 });
    const minScore8Results = detector.detect(input, { include: ["suhyup-coop"], minScore: 8 });
    const minScore5Results = detector.detect(input, { include: ["suhyup-coop"], minScore: 5 });

    // Then
    expect(limitedResults).toHaveLength(1);
    expect(minScore8Results).toEqual([]);
    expect(minScore5Results).toHaveLength(2);
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
