import { describe, expect, test } from "vitest";
import { institutions } from "../registry";
import type { CheckDigitVerifier } from "../types";
import { createDetector } from "./detector";

describe("createDetector — checkDigitVerifiers framework", () => {
  test("verifier 미등록 시 capabilities.validatedCheckDigit 가 null", () => {
    // Given
    const detector = createDetector(institutions);

    // When
    const [r] = detector.detect("110-436-387740");

    // Then
    expect(r?.capabilities.validatedCheckDigit).toBeNull();
  });

  test("verifier 등록 + 통과 시 true", () => {
    // Given
    const alwaysTrue: CheckDigitVerifier = () => true;
    const detector = createDetector(institutions, {
      checkDigitVerifiers: { shinhan: alwaysTrue },
    });

    // When
    const [r] = detector.detect("110-436-387740");

    // Then
    expect(r?.institution.id).toBe("shinhan");
    expect(r?.capabilities.validatedCheckDigit).toBe(true);
  });

  test("verifier 등록 + 실패 시 false", () => {
    // Given
    const alwaysFalse: CheckDigitVerifier = () => false;
    const detector = createDetector(institutions, {
      checkDigitVerifiers: { shinhan: alwaysFalse },
    });

    // When
    const [r] = detector.detect("110-436-387740");

    // Then
    expect(r?.capabilities.validatedCheckDigit).toBe(false);
  });

  test("패턴 validatesCheckDigit: false 면 verifier 가 있어도 null", () => {
    // Given — the Gwangju 12d subject-731 pattern states validatesCheckDigit:
    // false. The Suhyup 12d new pattern shares the policy and would also work.
    const alwaysTrue: CheckDigitVerifier = () => true;
    const detector = createDetector(institutions, {
      checkDigitVerifiers: { suhyup: alwaysTrue },
    });

    // When — Suhyup 12d new-account input. Same-length Shinhan/Shinhyup rank
    // higher, so Suhyup is looked up in the candidate list rather than taken
    // as the top result. (With `const [r] = ...` the condition would be
    // forever false and the assertion would never run.)
    const suhyup = detector.detect("131-234567890").find((r) => r.institution.id === "suhyup");

    // Then
    expect(suhyup, "수협 12d 신계좌가 후보에 있어야 한다").toBeDefined();
    expect(suhyup?.matchedPattern.validatesCheckDigit).toBe(false);
    expect(suhyup?.capabilities.validatedCheckDigit).toBeNull();
  });

  test("verifier 는 digits (정규화된 입력) 를 받는다", () => {
    // Given
    let received: string | null = null;
    const detector = createDetector(institutions, {
      checkDigitVerifiers: {
        shinhan: (digits) => {
          received = digits;
          return true;
        },
      },
    });

    // When
    detector.detect("110-436-387740");

    // Then
    expect(received).toBe("110436387740");
  });

  test("extend / remove 후에도 verifier 가 전파된다", () => {
    // Given
    const verifier: CheckDigitVerifier = () => true;
    const detector = createDetector(institutions, {
      checkDigitVerifiers: { shinhan: verifier },
    });

    // When
    const after = detector.remove("hsbc").extend({ institutions: [] });
    const [r] = after.detect("110-436-387740");

    // Then
    expect(r?.capabilities.validatedCheckDigit).toBe(true);
  });
});
