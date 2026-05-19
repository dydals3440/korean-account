import { describe, expect, test } from "vitest";
import { type InstitutionId, institutions } from "../data";
import { detectAccount } from "./detectAccount";

/**
 * Property-based 스타일 검증.
 *
 * 외부 generator (fast-check 등) 없이 deterministic seed 로 random digit 생성.
 * detect 의 invariant 만 가볍게 검증한다.
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

describe("detectAccount property-based invariants", () => {
  test("임의 14자리 digits 1000건: limit·정렬·confidence 일관", () => {
    // given
    const rng = mulberry32(0xc0ffee);
    const iterations = 1000;

    for (let i = 0; i < iterations; i += 1) {
      const input = randomDigits(rng, 14);

      // when
      const results = detectAccount(input);

      // then — invariant 검증
      expect(results.length).toBeLessThanOrEqual(5);

      // 점수 내림차순
      for (let k = 1; k < results.length; k += 1) {
        const prev = results[k - 1];
        const curr = results[k];
        if (!prev || !curr) {
          continue;
        }
        expect(prev.score).toBeGreaterThanOrEqual(curr.score);
      }

      // top 이 high/medium 이면 low 제거 (narrowing)
      const top = results[0];
      if (top && (top.confidence === "high" || top.confidence === "medium")) {
        expect(results.every((r) => r.confidence !== "low")).toBe(true);
      }

      // confidence 가 score 와 일관
      for (const r of results) {
        if (r.score >= 7) {
          expect(r.confidence).toBe("high");
        } else if (r.score >= 4) {
          expect(r.confidence).toBe("medium");
        } else {
          expect(r.confidence).toBe("low");
        }
      }

      // institution.id 는 등록된 InstitutionId
      for (const r of results) {
        const id: string = r.institution.id;
        expect(ID_SET.has(id)).toBe(true);
      }
    }
  });

  test("임의 길이 5~16자리 500건: 빈 결과 또는 매칭", () => {
    // given
    const rng = mulberry32(0xbeef);
    const iterations = 500;

    for (let i = 0; i < iterations; i += 1) {
      const length = 5 + Math.floor(rng() * 12);
      const input = randomDigits(rng, length);

      // when
      const results = detectAccount(input);

      // then — 모든 결과는 institution / matchedPattern / capabilities 보유
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
    // given / when / then
    const inputs = ["", " ", "---", "abc", "한글", "1"];
    for (const input of inputs) {
      expect(detectAccount(input)).toEqual([]);
    }
  });

  test("매칭된 institution.id 는 InstitutionId union 안에 있다", () => {
    // given — 모든 등록 institution 의 id 가 type-level InstitutionId 와 동일
    const ids: InstitutionId[] = institutions.map((i) => i.id);

    // when / then
    expect(ids.length).toBe(institutions.length);
    expect(new Set(ids).size).toBe(ids.length); // 중복 없음
  });
});
