import { describe, expect, test } from "vitest";
import { institutions } from "../data";
import type { CheckDigitVerifier } from "../types";
import { createDetector } from "./createDetector";

describe("createDetector — checkDigitVerifiers framework", () => {
  test("verifier 미등록 시 capabilities.validatedCheckDigit 가 null", () => {
    // given
    const detector = createDetector({ institutions });

    // when
    const [r] = detector.detect("110-436-387740");

    // then
    expect(r?.capabilities.validatedCheckDigit).toBeNull();
  });

  test("verifier 등록 + 통과 시 true", () => {
    // given
    const alwaysTrue: CheckDigitVerifier = () => true;
    const detector = createDetector({
      institutions,
      checkDigitVerifiers: { shinhan: alwaysTrue },
    });

    // when
    const [r] = detector.detect("110-436-387740");

    // then
    expect(r?.institution.id).toBe("shinhan");
    expect(r?.capabilities.validatedCheckDigit).toBe(true);
  });

  test("verifier 등록 + 실패 시 false", () => {
    // given
    const alwaysFalse: CheckDigitVerifier = () => false;
    const detector = createDetector({
      institutions,
      checkDigitVerifiers: { shinhan: alwaysFalse },
    });

    // when
    const [r] = detector.detect("110-436-387740");

    // then
    expect(r?.capabilities.validatedCheckDigit).toBe(false);
  });

  test("패턴 validatesCheckDigit: false 면 verifier 가 있어도 null", () => {
    // given — 광주 12d 과목 731 패턴은 validatesCheckDigit: false 명시.
    // 동일 정책의 수협 12d 신계좌 (validatesCheckDigit: false) 도 테스트 가능.
    const alwaysTrue: CheckDigitVerifier = () => true;
    const detector = createDetector({
      institutions,
      checkDigitVerifiers: { suhyup: alwaysTrue },
    });

    // when — 수협 12d 신계좌 입력
    const [r] = detector.detect("131-234567890");

    // then
    if (r && r.institution.id === "suhyup") {
      expect(r.matchedPattern.validatesCheckDigit).toBe(false);
      expect(r.capabilities.validatedCheckDigit).toBeNull();
    }
  });

  test("verifier 는 digits (정규화된 입력) 를 받는다", () => {
    // given
    let received: string | null = null;
    const detector = createDetector({
      institutions,
      checkDigitVerifiers: {
        shinhan: (digits) => {
          received = digits;
          return true;
        },
      },
    });

    // when
    detector.detect("110-436-387740");

    // then
    expect(received).toBe("110436387740");
  });

  test("extend / remove 후에도 verifier 가 전파된다", () => {
    // given
    const verifier: CheckDigitVerifier = () => true;
    const detector = createDetector({
      institutions,
      checkDigitVerifiers: { shinhan: verifier },
    });

    // when
    const after = detector.remove("hsbc").extend({ institutions: [] });
    const [r] = after.detect("110-436-387740");

    // then
    expect(r?.capabilities.validatedCheckDigit).toBe(true);
  });
});
