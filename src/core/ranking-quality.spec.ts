import { describe, expect, test } from "vitest";
import { detect } from "./detect";
import { FIXTURES } from "./detect.fixtures";

/**
 * Aggregate ranking-quality ratchet over the full fixture corpus.
 *
 * detect.spec.ts asserts each fixture's top-1 individually; this spec pins the
 * corpus-level quality numbers so scoring-weight changes must show their
 * effect here instead of being eyeballed. Thresholds sit just below the
 * measured values — raise them when quality genuinely improves.
 */
describe("ranking quality (corpus ratchet)", () => {
  const evaluations = FIXTURES.map((fixture) => {
    const results = detect(fixture.input);
    const rank = results.findIndex((r) => r.institution.id === fixture.id);
    return { fixture, results, rank };
  });

  test("top-1 적중률 100% — 모든 fixture 의 1순위가 기대 기관", () => {
    const misses = evaluations.filter((e) => e.rank !== 0);
    expect(
      misses.map((e) => `${e.fixture.input} → ${e.results[0]?.institution.id ?? "none"}`),
    ).toEqual([]);
  });

  // Measured 100% (50/50) with DEFAULT_WEIGHTS on 2026-08. Pinned slightly
  // below so the corpus can grow without churn, while a weight regression
  // that demotes real accounts to medium/low still fails loudly.
  test("1순위 high-confidence 비율 래칫 (≥ 95%)", () => {
    const highCount = evaluations.filter((e) => e.results[0]?.confidence === "high").length;
    expect(highCount / evaluations.length).toBeGreaterThanOrEqual(0.95);
  });

  // Measured 2.55 over 40 multi-candidate inputs. The margin is what keeps
  // rank 1 stable when new institutions join the registry.
  test("1·2순위 평균 점수 마진 래칫 (≥ 2.0)", () => {
    const margins = evaluations
      .filter((e) => e.rank === 0 && e.results.length > 1)
      .map((e) => (e.results[0]?.score ?? 0) - (e.results[1]?.score ?? 0));
    const avg = margins.reduce((a, b) => a + b, 0) / margins.length;
    expect(avg).toBeGreaterThanOrEqual(2.0);
  });
});
