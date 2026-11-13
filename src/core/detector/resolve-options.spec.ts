import { describe, expect, test } from "vitest";

import { kb, shinhan } from "../../registry";
import { createDetector } from "./create-detector";
import { resolveLimit, resolveMinScore, resolveWeights } from "./resolve-options";
import { DEFAULT_WEIGHTS } from "./score";

describe("resolveWeights", () => {
  test("빈 설정이면 기본 가중치를 반환한다", () => {
    // Given
    const scoring = {};

    // When
    const weights = resolveWeights(scoring);

    // Then
    expect(weights).toEqual(DEFAULT_WEIGHTS);
  });

  test("undefined 값은 기본 가중치를 유지한다", () => {
    // Given
    const scoring = { identifierMatch: undefined, lengthExact: 5 };

    // When
    const weights = resolveWeights(scoring);

    // Then
    expect(weights.identifierMatch).toBe(DEFAULT_WEIGHTS.identifierMatch);
    expect(weights.lengthExact).toBe(5);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])(
    "가중치가 %s 이면 RangeError 를 던진다",
    (invalidWeight) => {
      // Given
      const scoring = { subjectMatch: invalidWeight };

      // When
      const act = () => resolveWeights(scoring);

      // Then
      expect(act).toThrow(RangeError);
      expect(act).toThrow(/scoring\.subjectMatch/);
    },
  );
});

describe("resolveLimit", () => {
  test.each([
    { limit: undefined, expected: 5 },
    { limit: 0, expected: 0 },
    { limit: 3, expected: 3 },
    { limit: Number.POSITIVE_INFINITY, expected: Number.POSITIVE_INFINITY },
  ])("limit 이 $limit 이면 $expected 를 반환한다", ({ limit, expected }) => {
    // Given
    const requested = limit;

    // When
    const resolved = resolveLimit(requested);

    // Then
    expect(resolved).toBe(expected);
  });

  test.each([-1, 2.5, Number.NaN])("limit 이 %s 이면 RangeError 를 던진다", (limit) => {
    // Given
    const requested = limit;

    // When
    const act = () => resolveLimit(requested);

    // Then
    expect(act).toThrow(RangeError);
  });
});

describe("resolveMinScore", () => {
  test("minScore 를 생략하면 1 을 반환한다", () => {
    // Given
    const requested = undefined;

    // When
    const resolved = resolveMinScore(requested);

    // Then
    expect(resolved).toBe(1);
  });

  test("minScore 가 NaN 이면 RangeError 를 던진다", () => {
    // Given
    const requested = Number.NaN;

    // When
    const act = () => resolveMinScore(requested);

    // Then
    expect(act).toThrow(RangeError);
  });
});

describe("createDetector 옵션 검증", () => {
  test("scoring 에 undefined 를 넘겨도 기본 가중치로 정답을 찾는다", () => {
    // Given
    const detector = createDetector([kb, shinhan], { scoring: { identifierMatch: undefined } });

    // When
    const [top] = detector.detect("110-436-387740");

    // Then
    expect(top?.institution.id).toBe("shinhan");
    expect(Number.isFinite(top?.score)).toBe(true);
  });

  test("잘못된 scoring 은 detector 를 만들 때 즉시 RangeError 를 던진다", () => {
    // Given
    const scoring = { lengthExact: Number.NaN };

    // When
    const act = () => createDetector([kb], { scoring });

    // Then
    expect(act).toThrow(RangeError);
  });

  test("detect 의 limit 이 음수면 RangeError 를 던진다", () => {
    // Given
    const detector = createDetector([kb, shinhan]);

    // When
    const act = () => detector.detect("110-436-387740", { limit: -1 });

    // Then
    expect(act).toThrow(RangeError);
  });
});
