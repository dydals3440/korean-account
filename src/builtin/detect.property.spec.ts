import { describe, expect, test } from "vitest";

import { type InstitutionId, institutions } from "../registry";
import { detect } from "./detect";

/**
 * Property-based style checks.
 *
 * Random digits come from a deterministic seed — no external generator
 * (fast-check etc.). Only detect's invariants are verified, lightly.
 */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomDigits(rng: () => number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += Math.floor(rng() * 10).toString();
  }
  return out;
}

const ID_SET = new Set<string>(institutions.map((institution) => institution.id));

describe("detect property-based invariants", () => {
  test("임의 14자리 digits 1000건: limit·정렬·confidence 일관", () => {
    // Given
    const rng = mulberry32(0xc0ffee);
    const inputs = Array.from({ length: 1000 }, () => randomDigits(rng, 14));

    // When
    const resultsPerInput = inputs.map((input) => detect(input));

    // Then
    for (const results of resultsPerInput) {
      expect(results.length).toBeLessThanOrEqual(5);

      for (let k = 1; k < results.length; k += 1) {
        const prev = results[k - 1];
        const curr = results[k];
        if (!prev || !curr) {
          continue;
        }
        expect(prev.score).toBeGreaterThanOrEqual(curr.score);
      }

      // A high/medium top result narrows out low candidates.
      const top = results[0];
      if (top && (top.confidence === "high" || top.confidence === "medium")) {
        expect(results.every((result) => result.confidence !== "low")).toBe(true);
      }

      for (const result of results) {
        if (result.score >= 7) {
          expect(result.confidence).toBe("high");
        } else if (result.score >= 4) {
          expect(result.confidence).toBe("medium");
        } else {
          expect(result.confidence).toBe("low");
        }
      }

      for (const result of results) {
        const id: string = result.institution.id;
        expect(ID_SET.has(id)).toBe(true);
      }
    }
  });

  test("임의 길이 5~16자리 500건: 모든 결과가 institution·matchedPattern·capabilities 를 갖는다", () => {
    // Given
    const rng = mulberry32(0xbeef);
    const inputs = Array.from({ length: 500 }, () => {
      const length = 5 + Math.floor(rng() * 12);
      return randomDigits(rng, length);
    });

    // When
    const resultsPerInput = inputs.map((input) => detect(input));

    // Then
    for (const results of resultsPerInput) {
      for (const result of results) {
        expect(result.institution).toBeDefined();
        expect(result.matchedPattern).toBeDefined();
        expect(result.capabilities).toBeDefined();
        expect(typeof result.capabilities.allowsWithdrawal).toBe("boolean");
        expect(typeof result.capabilities.virtual).toBe("boolean");
      }
    }
  });

  test("빈 입력 / 비숫자 / 1자리면 항상 빈 결과를 반환한다", () => {
    // Given
    const inputs = ["", " ", "---", "abc", "한글", "1"];

    // When
    const resultsPerInput = inputs.map((input) => detect(input));

    // Then
    for (const results of resultsPerInput) {
      expect(results).toEqual([]);
    }
  });

  test("등록된 institution id 는 모두 InstitutionId 이며 중복되지 않는다", () => {
    // Given
    const registry = institutions;

    // When — the InstitutionId[] annotation fails to compile if an id falls outside the union
    const ids: InstitutionId[] = registry.map((institution) => institution.id);

    // Then
    expect(ids.length).toBe(registry.length);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
