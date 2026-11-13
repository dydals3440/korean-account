import { describe, expect, test } from "vitest";

import { institutions } from "../../registry";
import type { CheckDigitVerifier } from "../../types";
import { createDetector } from "./create-detector";

describe("createDetector — checkDigitVerifiers framework", () => {
  test("verifier 를 등록하지 않으면 validatedCheckDigit 가 null 이다", () => {
    // Given
    const detector = createDetector(institutions);

    // When
    const [result] = detector.detect("110-436-387740");

    // Then
    expect(result?.capabilities.validatedCheckDigit).toBeNull();
  });

  test("등록한 verifier 가 통과하면 validatedCheckDigit 가 true 다", () => {
    // Given
    const alwaysTrue: CheckDigitVerifier = () => true;
    const detector = createDetector(institutions, {
      checkDigitVerifiers: { shinhan: alwaysTrue },
    });

    // When
    const [result] = detector.detect("110-436-387740");

    // Then
    expect(result?.institution.id).toBe("shinhan");
    expect(result?.capabilities.validatedCheckDigit).toBe(true);
  });

  test("등록한 verifier 가 실패하면 validatedCheckDigit 가 false 다", () => {
    // Given
    const alwaysFalse: CheckDigitVerifier = () => false;
    const detector = createDetector(institutions, {
      checkDigitVerifiers: { shinhan: alwaysFalse },
    });

    // When
    const [result] = detector.detect("110-436-387740");

    // Then
    expect(result?.capabilities.validatedCheckDigit).toBe(false);
  });

  test("패턴이 validatesCheckDigit: false 면 verifier 가 있어도 null 이다", () => {
    // Given — the Suhyup 12d new pattern declares validatesCheckDigit: false
    const alwaysTrue: CheckDigitVerifier = () => true;
    const detector = createDetector(institutions, {
      checkDigitVerifiers: { suhyup: alwaysTrue },
    });

    // When — same-length Shinhan/Shinhyup rank higher, so Suhyup is looked up among the candidates
    const suhyup = detector
      .detect("131-234567890")
      .find((result) => result.institution.id === "suhyup");

    // Then
    expect(suhyup, "수협 12d 신계좌가 후보에 있어야 한다").toBeDefined();
    expect(suhyup?.matchedPattern.validatesCheckDigit).toBe(false);
    expect(suhyup?.capabilities.validatedCheckDigit).toBeNull();
  });

  test("verifier 는 digits (정규화된 입력) 를 받는다", () => {
    // Given
    let receivedDigits: string | null = null;
    const detector = createDetector(institutions, {
      checkDigitVerifiers: {
        shinhan: (digits) => {
          receivedDigits = digits;
          return true;
        },
      },
    });

    // When
    detector.detect("110-436-387740");

    // Then
    expect(receivedDigits).toBe("110436387740");
  });

  test("extend / remove 후에도 verifier 가 전파된다", () => {
    // Given
    const verifier: CheckDigitVerifier = () => true;
    const detector = createDetector(institutions, {
      checkDigitVerifiers: { shinhan: verifier },
    });

    // When
    const rebuilt = detector.remove("hsbc").extend({ institutions: [] });
    const [result] = rebuilt.detect("110-436-387740");

    // Then
    expect(result?.capabilities.validatedCheckDigit).toBe(true);
  });
});
