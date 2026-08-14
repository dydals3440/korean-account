import { describe, expect, test } from "vitest";
import { patternTemplate } from "./pattern-template";
import { institutions } from "../registry";
import { defineInstitution } from "./define-institution";
import type { CheckDigitVerifier } from "../types";
import { createDetector } from "./detector";

// The test institution carries an identifier on purpose. Without one it
// stalls at score 3 (lengthExact), confidence low — and the moment a
// same-length real bank scores high, `narrowLowConfidence` filters it out.
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
    // Given — extend previously did not accept a verifier, forcing a fallback to createDetector.
    const detector = createDetector(institutions).extend({
      institutions: [myBank],
      checkDigitVerifiers: { "my-bank": () => true },
    });

    // When
    const r = detector.detect("99912345678901").find((x) => x.institution.id === "my-bank");

    // Then
    expect(r).toBeDefined();
    expect(r?.capabilities.validatedCheckDigit).toBe(true);
  });

  test("verifier 가 false 를 반환하면 validatedCheckDigit 가 false", () => {
    // Given
    const detector = createDetector(institutions).extend({
      institutions: [myBank],
      checkDigitVerifiers: { "my-bank": () => false },
    });

    // When
    const r = detector.detect("99912345678901").find((x) => x.institution.id === "my-bank");

    // Then
    expect(r?.capabilities.validatedCheckDigit).toBe(false);
  });

  test("기존 verifier 는 유지되고 같은 id 는 새 verifier 로 교체된다", () => {
    // Given
    const base = createDetector(institutions, {
      checkDigitVerifiers: { shinhan: (() => false) as CheckDigitVerifier },
    });

    // When — replace shinhan and add kb
    const extended = base.extend({
      checkDigitVerifiers: { shinhan: () => true, kb: () => true },
    });

    // Then
    const shinhan = extended.detect("110-436-387740").find((r) => r.institution.id === "shinhan");
    expect(shinhan?.capabilities.validatedCheckDigit).toBe(true);
    // The pre-replacement detector is unaffected (immutable).
    const before = base.detect("110-436-387740").find((r) => r.institution.id === "shinhan");
    expect(before?.capabilities.validatedCheckDigit).toBe(false);
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

    // Then
    const r = extended.detect("110-436-387740").find((x) => x.institution.id === "shinhan");
    expect(r?.capabilities.validatedCheckDigit).toBe(true);
    expect(extended.detect("110-436-387740")[0]?.score).toBe(
      base.detect("110-436-387740")[0]?.score,
    );
  });
});
