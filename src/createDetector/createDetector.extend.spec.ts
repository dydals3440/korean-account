import { describe, expect, test } from "vitest";
import { createPatternTemplate } from "../createPatternTemplate";
import { defineInstitution, institutions } from "../data";
import type { CheckDigitVerifier } from "../types";
import { createDetector } from "./createDetector";

// identifier 를 준다. 없으면 score 3 (lengthExact) 에 그쳐 confidence 가 low 가 되고,
// 같은 자릿수의 실제 은행이 high 로 잡히는 순간 `narrowLowConfidence` 가 걸러 버린다.
const myBank = defineInstitution({
  id: "my-bank",
  code: "999",
  nameKo: "커스텀은행",
  category: "bank",
  aliases: [],
  patterns: [
    {
      template: createPatternTemplate("XXX-XXXXXXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["999"],
    },
  ],
});

describe("Detector.extend — scoring / checkDigitVerifiers", () => {
  test("새로 추가한 institution 의 checkDigitVerifier 를 extend 에서 바로 등록할 수 있다", () => {
    // Given — 예전에는 extend 가 verifier 를 받지 않아 createDetector 로 되돌아가야 했다.
    const detector = createDetector({ institutions }).extend({
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
    const detector = createDetector({ institutions }).extend({
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
    const base = createDetector({
      institutions,
      checkDigitVerifiers: { shinhan: (() => false) as CheckDigitVerifier },
    });

    // When — shinhan 을 교체하고 kb 를 추가
    const extended = base.extend({
      checkDigitVerifiers: { shinhan: () => true, kb: () => true },
    });

    // Then
    const shinhan = extended.detect("110-436-387740").find((r) => r.institution.id === "shinhan");
    expect(shinhan?.capabilities.validatedCheckDigit).toBe(true);
    // 교체 전 detector 는 영향받지 않는다 (immutable).
    const before = base.detect("110-436-387740").find((r) => r.institution.id === "shinhan");
    expect(before?.capabilities.validatedCheckDigit).toBe(false);
  });

  test("scoring 은 기존 가중치 위에 얕게 병합된다", () => {
    // Given — base 는 lengthExact 를 0 으로, extend 는 identifierMatch 만 건드린다.
    const base = createDetector({ institutions, scoring: { lengthExact: 0 } });
    const extended = base.extend({ scoring: { identifierMatch: 0 } });

    // When
    const baseScore = base.detect("110-436-387740")[0]?.score ?? 0;
    const extendedScore = extended.detect("110-436-387740")[0]?.score ?? 0;

    // Then — extend 가 lengthExact: 0 을 덮어쓰지 않았다면 extended 가 더 낮아야 한다.
    expect(extendedScore).toBeLessThan(baseScore);
  });

  test("scoring / checkDigitVerifiers 를 생략하면 기존 설정이 그대로 이어진다", () => {
    // Given
    const base = createDetector({
      institutions,
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
