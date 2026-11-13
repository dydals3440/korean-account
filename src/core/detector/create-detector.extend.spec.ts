import { describe, expect, test } from "vitest";

import { institutions } from "../../registry";
import type { CheckDigitVerifier } from "../../types";
import { defineInstitution } from "../define/define-institution";
import { patternTemplate } from "../define/pattern-template";
import { createDetector } from "./create-detector";

// Carries an identifier on purpose: without one it stalls at low confidence and `narrowLowConfidence` filters it out.
const myBank = defineInstitution({
  id: "my-bank",
  code: "999",
  nameKo: "커스텀은행",
  category: "bank",
  aliases: [],
  patterns: [
    {
      template: patternTemplate("XXX-XXXXXXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["999"],
    },
  ],
});

describe("Detector.extend — scoring / checkDigitVerifiers", () => {
  test("새로 추가한 institution 의 checkDigitVerifier 를 extend 에서 바로 등록할 수 있다", () => {
    // Given
    const detector = createDetector(institutions).extend({
      institutions: [myBank],
      checkDigitVerifiers: { "my-bank": () => true },
    });

    // When
    const result = detector
      .detect("99912345678901")
      .find((candidate) => candidate.institution.id === "my-bank");

    // Then
    expect(result).toBeDefined();
    expect(result?.capabilities.validatedCheckDigit).toBe(true);
  });

  test("verifier 가 false 를 반환하면 validatedCheckDigit 가 false", () => {
    // Given
    const detector = createDetector(institutions).extend({
      institutions: [myBank],
      checkDigitVerifiers: { "my-bank": () => false },
    });

    // When
    const result = detector
      .detect("99912345678901")
      .find((candidate) => candidate.institution.id === "my-bank");

    // Then
    expect(result?.capabilities.validatedCheckDigit).toBe(false);
  });

  test("기존 verifier 는 유지되고 같은 id 는 새 verifier 로 교체된다", () => {
    // Given
    const base = createDetector(institutions, {
      checkDigitVerifiers: { shinhan: (() => false) as CheckDigitVerifier },
    });

    // When
    const extended = base.extend({
      checkDigitVerifiers: { shinhan: () => true, kb: () => true },
    });
    const extendedShinhan = extended
      .detect("110-436-387740")
      .find((result) => result.institution.id === "shinhan");
    const baseShinhan = base
      .detect("110-436-387740")
      .find((result) => result.institution.id === "shinhan");

    // Then — the pre-replacement detector is unaffected (immutable)
    expect(extendedShinhan?.capabilities.validatedCheckDigit).toBe(true);
    expect(baseShinhan?.capabilities.validatedCheckDigit).toBe(false);
  });

  test("scoring 은 기존 가중치 위에 얕게 병합된다", () => {
    // Given — base sets lengthExact to 0; extend touches only identifierMatch.
    const base = createDetector(institutions, { scoring: { lengthExact: 0 } });
    const extended = base.extend({ scoring: { identifierMatch: 0 } });

    // When
    const baseScore = base.detect("110-436-387740")[0]?.score ?? 0;
    const extendedScore = extended.detect("110-436-387740")[0]?.score ?? 0;

    // Then — if extend did not overwrite lengthExact: 0, extended must score lower.
    expect(extendedScore).toBeLessThan(baseScore);
  });

  test("scoring / checkDigitVerifiers 를 생략하면 기존 설정이 그대로 이어진다", () => {
    // Given
    const base = createDetector(institutions, {
      scoring: { lengthExact: 0 },
      checkDigitVerifiers: { shinhan: () => true },
    });

    // When
    const extended = base.extend({ institutions: [myBank] });
    const extendedResults = extended.detect("110-436-387740");
    const baseResults = base.detect("110-436-387740");
    const shinhan = extendedResults.find((result) => result.institution.id === "shinhan");

    // Then
    expect(shinhan?.capabilities.validatedCheckDigit).toBe(true);
    expect(extendedResults[0]?.score).toBe(baseResults[0]?.score);
  });
});

describe("확장 규칙과 날짜 메타데이터의 사용 계약", () => {
  test("false global rule은 후보를 거부하지 않으며 추가 규칙은 기존 순서 뒤에서 평가한다", () => {
    // Given
    const order: string[] = [];
    const base = createDetector([myBank], {
      globalRules: [
        () => {
          order.push("base");
          return false;
        },
      ],
    });
    const extended = base.extend({
      globalRules: [
        () => {
          order.push("extra");
          return true;
        },
      ],
    });

    // When
    const baseScore = base.detect("99912345678901")[0]?.score;
    const baseOrder = order.splice(0);
    const extendedScore = extended.detect("99912345678901")[0]?.score;
    const extendedOrder = order.splice(0);

    // Then
    expect(baseScore).toBe(9);
    expect(baseOrder).toEqual(["base"]);
    expect(extendedScore).toBe(10);
    expect(extendedOrder).toEqual(["base", "extra"]);
  });

  test("미래 effectiveFrom은 자동 제외하지 않고 undefined 검증 설정에서도 등록 verifier가 실행된다", () => {
    // Given
    const future = defineInstitution({
      ...myBank,
      patterns: myBank.patterns.map((pattern) => ({ ...pattern, effectiveFrom: "2999-01-01" })),
    });
    const detector = createDetector([future], { checkDigitVerifiers: { "my-bank": () => false } });

    // When
    const results = detector.detect("99912345678901");

    // Then
    expect(results).toHaveLength(1);
    expect(results[0]?.matchedPattern.effectiveFrom).toBe("2999-01-01");
    expect(results[0]?.capabilities.validatedCheckDigit).toBe(false);
  });
});
