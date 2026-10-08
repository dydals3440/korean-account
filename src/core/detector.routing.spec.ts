import { describe, expect, test } from "vitest";
import { suhyup, suhyupCoop } from "../registry";
import type { DetectOptions } from "../types";
import { defineInstitution } from "./define-institution";
import { createDetector } from "./detector";
import { patternTemplate } from "./pattern-template";

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
  ] satisfies readonly [DetectOptions, number][])("%j — 중앙회 후보 %i개", (options, count) => {
    const results = detector.detect("212345678901", options);
    expect(results).toHaveLength(count);
    for (const result of results) {
      expect(result.institution.id).toBe("suhyup-coop");
      expect(result.score).toBeGreaterThanOrEqual(5);
    }
  });

  test("최초 기관이 include 대상이 아니어도 최종 기관이 일치하면 유지한다", () => {
    const results = detector.detect("112345678901", { include: ["suhyup"] });
    expect(results).toHaveLength(1);
    expect(results[0]?.matchedPattern).toBe(suhyupCoop.patterns[0]);
    expect(results.every((result) => result.institution.id === "suhyup")).toBe(true);
  });

  test("필터 후 limit을 적용하고 같은 기관으로 분기한 후보를 합치지 않는다", () => {
    expect(detector.detect("212345678901", { include: ["suhyup-coop"], limit: 1 })).toHaveLength(1);
    expect(detector.detect("212345678901", { include: ["suhyup-coop"], minScore: 8 })).toEqual([]);
    expect(detector.detect("212345678901", { include: ["suhyup-coop"], minScore: 5 })).toHaveLength(
      2,
    );
  });

  test("커스텀 분기는 최종 category와 kind로 검사하고 미등록 대상은 기존 기관을 유지한다", () => {
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
    const options = {
      include: ["target"],
      categories: ["non-bank"],
      kinds: ["incoming-only"],
    } as const;
    expect(
      createDetector([source, target]).detect("123456789012", options)[0]?.institution.id,
    ).toBe("target");
    expect(
      createDetector([source]).detect("123456789012", {
        include: ["source"],
        categories: ["bank"],
      })[0]?.institution.id,
    ).toBe("source");
    expect(createDetector([source]).detect("123456789012", { categories: ["non-bank"] })).toEqual(
      [],
    );
  });
});
