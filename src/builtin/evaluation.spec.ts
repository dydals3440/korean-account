import { describe, expect, test } from "vitest";

import { extractIdentifier } from "../core/account/extract-identifier";
import { normalizeAccount } from "../core/account/normalize-account";
import { type InstitutionId, institutions } from "../registry";
import type { DetectionResult } from "../types";
import { detect } from "./detect";
import { FIXTURES } from "./detect.fixtures";
import {
  createSeededRandom,
  randomDigits,
  sampleIdentifiablePatterns,
} from "./evaluation.fixtures";

const RANDOM_INPUT_COUNT = 3000;
const SAMPLES_PER_PATTERN = 20;
const RANDOM_LENGTHS = [7, 8, 9, 10, 11, 12, 13, 14];

const SCORE_BAND_RANK = { low: 0, medium: 1, high: 2 } as const;

function scoreBand(score: number): keyof typeof SCORE_BAND_RANK {
  if (score >= 7) {
    return "high";
  }
  return score >= 4 ? "medium" : "low";
}

const ID_SET = new Set<string>(institutions.map((institution) => institution.id));

/** Independent oracle: an identifier, subject or non-fallback branch condition supports the result. */
function hasEvidence(result: DetectionResult, input: string): boolean {
  const digits = normalizeAccount(input);
  const pattern = result.matchedPattern;
  if (result.subject !== undefined) {
    return true;
  }

  const branch = pattern.branchRule?.evaluate(digits) ?? null;
  if (branch !== null && branch.isFallback !== true) {
    return true;
  }

  const position = pattern.identifierPosition;
  const identifier = extractIdentifier(digits, pattern);
  if (position === undefined || identifier === null) {
    return false;
  }
  if (pattern.identifiers?.includes(identifier)) {
    return true;
  }
  const range = pattern.identifierRange;
  const value = Number(identifier);
  return range !== undefined && range.from <= value && value <= range.to;
}

describe("평가 기준: 패턴 표본", () => {
  test("식별자나 과목이 있는 패턴의 무작위 표본은 자기 기관을 최상위 신뢰도 등급에 포함한다", () => {
    // Given
    const samples = sampleIdentifiablePatterns(institutions, SAMPLES_PER_PATTERN, 0xacc0);

    // When
    const hitsByPattern = new Map<string, { hits: number; total: number }>();
    for (const sample of samples) {
      const expectedId =
        sample.pattern.branchRule?.evaluate(sample.digits)?.institutionId ?? sample.institution.id;
      const results = detect(sample.digits, { limit: Infinity });
      const topConfidence = results[0]?.confidence;
      const isHit = results.some(
        (result) => result.institution.id === expectedId && result.confidence === topConfidence,
      );
      const key = `${sample.institution.id}#${sample.patternIndex}`;
      const tally = hitsByPattern.get(key) ?? { hits: 0, total: 0 };
      hitsByPattern.set(key, { hits: tally.hits + (isHit ? 1 : 0), total: tally.total + 1 });
    }
    const weakPatterns = [...hitsByPattern]
      .filter(([, tally]) => tally.hits / tally.total < 0.5)
      .map(([key, tally]) => `${key} ${tally.hits}/${tally.total}`);

    // Then
    expect(hitsByPattern.size).toBeGreaterThanOrEqual(90);
    expect(weakPatterns).toEqual([]);
  });
});

describe("평가 기준: 내용 증거", () => {
  test("무작위 입력에서 식별자·과목·분기 조건 근거 없이 medium 이상인 결과는 없다", () => {
    // Given
    const random = createSeededRandom(0x5eed);
    const inputs = Array.from({ length: RANDOM_INPUT_COUNT }, (_, index) =>
      randomDigits(random, RANDOM_LENGTHS[index % RANDOM_LENGTHS.length] ?? 12),
    );

    // When
    const unsupported = inputs.flatMap((input) =>
      detect(input, { limit: Infinity })
        .filter((result) => result.confidence !== "low" && !hasEvidence(result, input))
        .map(
          (result) => `${input} → ${result.institution.id}:${result.score}:${result.confidence}`,
        ),
    );

    // Then
    expect(unsupported).toEqual([]);
  });

  test.each([
    { input: "555555555555", description: "수협중앙회 형식이지만 2·7·9로 시작하지 않는 12자리" },
    { input: "12345678901234", description: "K뱅크 14자리 형식뿐인 번호" },
  ])("$description 은 low 로만 나온다", ({ input }) => {
    // Given
    const account = input;

    // When
    const results = detect(account, { limit: Infinity });

    // Then
    for (const result of results.filter((candidate) => !hasEvidence(candidate, account))) {
      expect(result.confidence).toBe("low");
    }
  });
});

describe("평가 기준: 농협은행 ↔ 지역농축협", () => {
  test.each([
    { input: "301-1234-5678-11", expected: "nh" },
    { input: "302-1234-5678-12", expected: "nh" },
    { input: "351-1234-5678-13", expected: "nh-coop" },
    { input: "351-1234-5678-15", expected: "nh-coop" },
    { input: "028-1234-5678-11", expected: "nh" },
    { input: "028-1234-5678-14", expected: "nh-coop" },
    { input: "123456-64-123456", expected: "nh" },
    { input: "123456-66-123456", expected: "nh-coop" },
    { input: "790-1234-5678-12-3", expected: "nh" },
    { input: "792-1234-5678-12-3", expected: "nh-coop" },
  ])("$input 은 $expected 가 1순위다", ({ input, expected }) => {
    // Given
    const account = input;

    // When
    const [top] = detect(account);

    // Then
    expect(top?.institution.id).toBe(expected);
    expect(top?.confidence).toBe("high");
  });

  test.each([
    { input: "301-1234-5678-13", rejected: "nh-coop" },
    { input: "351-1234-5678-11", rejected: "nh" },
  ])(
    "과목과 계좌구분이 모순되는 $input 에서 $rejected 는 medium 이상이 아니다",
    ({ input, rejected }) => {
      // Given
      const account = input;

      // When
      const results = detect(account, { limit: Infinity });

      // Then
      const rejectedResult = results.find((result) => result.institution.id === rejected);
      expect(rejectedResult?.confidence ?? "low").toBe("low");
    },
  );
});

describe("평가 기준: 모호성", () => {
  test("서로 다른 기관이 같은 신뢰도 등급이면 ambiguous 로 표시한다", () => {
    // Given
    const input = "123-01-123456";

    // When
    const results = detect(input);

    // Then
    const topConfidence = results[0]?.confidence;
    const sameBand = results.filter((result) => result.confidence === topConfidence);
    expect(new Set(sameBand.map((result) => result.institution.id)).size).toBeGreaterThan(1);
    for (const result of sameBand) {
      expect(result.ambiguous).toBe(true);
    }
  });

  test("단독 1순위는 ambiguous 가 아니다", () => {
    // Given
    const input = "351-1234-5678-13";

    // When
    const [top] = detect(input);

    // Then
    expect(top?.ambiguous).toBe(false);
  });
});

describe("평가 기준: 실제 계좌 코퍼스 래칫", () => {
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

  // Measured 0.75 once overlapping identifier/subject digits count once (0.5.0); ties surface as `ambiguous`.
  test("1·2순위 평균 점수 마진 래칫 (≥ 0.7)", () => {
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
    expect(averageMargin).toBeGreaterThanOrEqual(0.7);
  });
});

describe("평가 기준: 무작위 입력 불변식", () => {
  test("임의 14자리 digits 1000건이면 limit·기관 중복 없음·정렬·confidence 상한을 지킨다", () => {
    // Given
    const rng = createSeededRandom(0xc0ffee);
    const inputs = Array.from({ length: 1000 }, () => randomDigits(rng, 14));

    // When
    const resultsPerInput = inputs.map((input) => ({ input, results: detect(input) }));

    // Then
    for (const { input, results } of resultsPerInput) {
      expect(results.length).toBeLessThanOrEqual(5);
      expect(new Set(results.map((result) => result.institution.id)).size).toBe(results.length);

      // Ordered by band, then evidence, then score.
      const sortKeys = results.map((result) => [
        SCORE_BAND_RANK[result.confidence],
        hasEvidence(result, input) ? 1 : 0,
        result.score,
      ]);
      for (let k = 1; k < sortKeys.length; k += 1) {
        const [prevBand = 0, prevEvidence = 0, prevScore = 0] = sortKeys[k - 1] ?? [];
        const [band = 0, evidence = 0, score = 0] = sortKeys[k] ?? [];
        const isOrdered =
          prevBand > band ||
          (prevBand === band && prevEvidence > evidence) ||
          (prevBand === band && prevEvidence === evidence && prevScore >= score);
        expect(isOrdered).toBe(true);
      }

      // A high/medium top result narrows out low candidates.
      const top = results[0];
      if (top && (top.confidence === "high" || top.confidence === "medium")) {
        expect(results.every((result) => result.confidence !== "low")).toBe(true);
      }

      // Confidence never exceeds the score band; missing evidence lowers it to low.
      for (const result of results) {
        expect(SCORE_BAND_RANK[result.confidence]).toBeLessThanOrEqual(
          SCORE_BAND_RANK[scoreBand(result.score)],
        );
      }

      for (const result of results) {
        const id: string = result.institution.id;
        expect(ID_SET.has(id)).toBe(true);
      }
    }
  });

  test("임의 길이 5~16자리 500건: 모든 결과가 institution·matchedPattern·capabilities 를 갖는다", () => {
    // Given
    const rng = createSeededRandom(0xbeef);
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
