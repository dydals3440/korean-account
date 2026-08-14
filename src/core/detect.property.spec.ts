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

const ID_SET = new Set<string>(institutions.map((i) => i.id));

describe("detect property-based invariants", () => {
  test("임의 14자리 digits 1000건: limit·정렬·confidence 일관", () => {
    // Given
    const rng = mulberry32(0xc0ffee);
    const iterations = 1000;

    for (let i = 0; i < iterations; i += 1) {
      const input = randomDigits(rng, 14);

      // When
      const results = detect(input);

      // Then — verify the invariants
      expect(results.length).toBeLessThanOrEqual(5);

      // Scores in descending order
      for (let k = 1; k < results.length; k += 1) {
        const prev = results[k - 1];
        const curr = results[k];
        if (!prev || !curr) {
          continue;
        }
        expect(prev.score).toBeGreaterThanOrEqual(curr.score);
      }

      // A high/medium top result removes low candidates (narrowing)
      const top = results[0];
      if (top && (top.confidence === "high" || top.confidence === "medium")) {
        expect(results.every((r) => r.confidence !== "low")).toBe(true);
      }

      // Confidence consistent with score
      for (const r of results) {
        if (r.score >= 7) {
          expect(r.confidence).toBe("high");
        } else if (r.score >= 4) {
          expect(r.confidence).toBe("medium");
        } else {
          expect(r.confidence).toBe("low");
        }
      }

      // institution.id is a registered InstitutionId
      for (const r of results) {
        const id: string = r.institution.id;
        expect(ID_SET.has(id)).toBe(true);
      }
    }
  });

  test("임의 길이 5~16자리 500건: 빈 결과 또는 매칭", () => {
    // Given
    const rng = mulberry32(0xbeef);
    const iterations = 500;

    for (let i = 0; i < iterations; i += 1) {
      const length = 5 + Math.floor(rng() * 12);
      const input = randomDigits(rng, length);

      // When
      const results = detect(input);

      // Then — every result carries institution / matchedPattern / capabilities
      for (const r of results) {
        expect(r.institution).toBeDefined();
        expect(r.matchedPattern).toBeDefined();
        expect(r.capabilities).toBeDefined();
        expect(typeof r.capabilities.allowsWithdrawal).toBe("boolean");
        expect(typeof r.capabilities.virtual).toBe("boolean");
      }
    }
  });

  test("빈 입력 / 비숫자 / 1자리 — 항상 빈 결과", () => {
    // Given / When / Then
    const inputs = ["", " ", "---", "abc", "한글", "1"];
    for (const input of inputs) {
      expect(detect(input)).toEqual([]);
    }
  });

  test("매칭된 institution.id 는 InstitutionId union 안에 있다", () => {
    // Given — every registered institution's id equals the type-level InstitutionId
    const ids: InstitutionId[] = institutions.map((i) => i.id);

    // When / Then
    expect(ids.length).toBe(institutions.length);
    expect(new Set(ids).size).toBe(ids.length); // 중복 없음
  });
});
