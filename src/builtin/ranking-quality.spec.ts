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
    const rank = results.findIndex((result) => result.institution.id === fixture.id);
    return { fixture, results, rank };
  });

  test("top-1 적중률 100% — 모든 fixture 의 1순위가 기대 기관", () => {
    // Given
    const corpus = evaluations;

    // When
    const misses = corpus
      .filter((evaluation) => evaluation.rank !== 0)
      .map(
        (evaluation) =>
          `${evaluation.fixture.input} → ${evaluation.results[0]?.institution.id ?? "none"}`,
      );

    // Then
    expect(misses).toEqual([]);
  });

  // Measured 100% (50/50) with DEFAULT_WEIGHTS on 2026-08; pinned below so the corpus can grow.
  test("1순위 high-confidence 비율 래칫 (≥ 95%)", () => {
    // Given
    const topResults = evaluations.map((evaluation) => evaluation.results[0]);

    // When
    const highRatio =
      topResults.filter((top) => top?.confidence === "high").length / topResults.length;

    // Then
    expect(highRatio).toBeGreaterThanOrEqual(0.95);
  });

  // Measured 1.375 after shared identifier/subject spans stopped counting twice (0.5.0).
  test("1·2순위 평균 점수 마진 래칫 (≥ 1.3)", () => {
    // Given
    const multiCandidateHits = evaluations.filter(
      (evaluation) => evaluation.rank === 0 && evaluation.results.length > 1,
    );

    // When
    const margins = multiCandidateHits.map(
      (evaluation) => (evaluation.results[0]?.score ?? 0) - (evaluation.results[1]?.score ?? 0),
    );
    const averageMargin = margins.reduce((sum, margin) => sum + margin, 0) / margins.length;

    // Then
    expect(averageMargin).toBeGreaterThanOrEqual(1.3);
  });
});
