import { describe, expect, test } from "vitest";
import {
  defineBranchRule,
  kb11FirstDigit,
  kbank10First9,
  kbank14First79,
  suhyup11BranchToCoop,
  suhyup12BranchToCoop,
  suhyup14BranchToCoop,
  suhyupCoop12BranchToBank,
  toss12First1719,
} from "./branchRules";

describe("suhyup11BranchToCoop", () => {
  test("11자리가 아니면 null을 반환한다", () => {
    // Given
    const digits = "1234567890";

    // When
    const result = suhyup11BranchToCoop.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });

  test("4·5번째 자리가 범위 안이면 suhyup-coop으로 라우팅한다 (43)", () => {
    // Given
    const digits = "000" + "43" + "000000";

    // When
    const result = suhyup11BranchToCoop.evaluate(digits);

    // Then
    expect(result).toEqual({ institutionId: "suhyup-coop" });
  });

  test("4·5번째 자리가 47이면 suhyup-coop으로 라우팅한다", () => {
    // Given
    const digits = "000" + "47" + "000000";

    // When
    const result = suhyup11BranchToCoop.evaluate(digits);

    // Then
    expect(result).toEqual({ institutionId: "suhyup-coop" });
  });

  test("4·5번째 자리가 범위 밖이면 null을 반환한다 (50)", () => {
    // Given
    const digits = "000" + "50" + "000000";

    // When
    const result = suhyup11BranchToCoop.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });

  test("4·5번째 자리가 67이면 (66-68 범위) suhyup-coop으로 라우팅한다", () => {
    // Given
    const digits = "000" + "67" + "000000";

    // When
    const result = suhyup11BranchToCoop.evaluate(digits);

    // Then
    expect(result).toEqual({ institutionId: "suhyup-coop" });
  });
});

describe("suhyup12BranchToCoop", () => {
  test("12자리가 아니면 null을 반환한다", () => {
    // Given
    const digits = "1234567890";

    // When
    const result = suhyup12BranchToCoop.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });

  test("첫자리가 2/7/9면 suhyup-coop으로 라우팅한다", () => {
    // Given / When / Then
    for (const first of ["2", "7", "9"] as const) {
      const digits = `${first}11111111111`;
      expect(suhyup12BranchToCoop.evaluate(digits)).toEqual({
        institutionId: "suhyup-coop",
      });
    }
  });

  test("첫자리가 2/7/9 외이면 null을 반환한다", () => {
    // Given
    const digits = "311111111111";

    // When
    const result = suhyup12BranchToCoop.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });
});

describe("suhyup14BranchToCoop", () => {
  test("14자리가 아니면 null을 반환한다", () => {
    // Given
    const digits = "1234567890123";

    // When
    const result = suhyup14BranchToCoop.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });

  test("앞 3자리가 493이면 suhyup-coop으로 라우팅한다", () => {
    // Given
    const digits = "49312345678901";

    // When
    const result = suhyup14BranchToCoop.evaluate(digits);

    // Then
    expect(result).toEqual({ institutionId: "suhyup-coop" });
  });

  test("앞 3자리가 481~489 범위 안이면 suhyup-coop으로 라우팅한다", () => {
    // Given
    const digits = "48512345678901";

    // When
    const result = suhyup14BranchToCoop.evaluate(digits);

    // Then
    expect(result).toEqual({ institutionId: "suhyup-coop" });
  });

  test("앞 3자리가 480이면 null을 반환한다", () => {
    // Given
    const digits = "48012345678901";

    // When
    const result = suhyup14BranchToCoop.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });
});

describe("suhyupCoop12BranchToBank", () => {
  test("12자리가 아니면 null을 반환한다", () => {
    // Given
    const digits = "1234567890";

    // When
    const result = suhyupCoop12BranchToBank.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });

  test("첫자리가 2/7/9면 null을 반환한다 (수협중앙회 유지)", () => {
    // Given / When / Then
    for (const first of ["2", "7", "9"] as const) {
      const digits = `${first}11111111111`;
      expect(suhyupCoop12BranchToBank.evaluate(digits)).toBeNull();
    }
  });

  test("첫자리가 2/7/9 외이면 suhyup으로 라우팅한다", () => {
    // Given
    const digits = "311111111111";

    // When
    const result = suhyupCoop12BranchToBank.evaluate(digits);

    // Then
    expect(result).toEqual({ institutionId: "suhyup" });
  });
});

describe("kb11FirstDigit", () => {
  test("11자리가 아니면 null을 반환한다", () => {
    // Given
    const digits = "1234567890";

    // When
    const result = kb11FirstDigit.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });

  test("첫자리가 0이면 incoming-only로 분기한다", () => {
    // Given
    const digits = "01234567890";

    // When
    const result = kb11FirstDigit.evaluate(digits);

    // Then
    expect(result).toEqual({ kindOverride: "incoming-only" });
  });

  test("첫자리가 9이면 lifetime으로 분기한다", () => {
    // Given
    const digits = "91234567890";

    // When
    const result = kb11FirstDigit.evaluate(digits);

    // Then
    expect(result).toEqual({ kindOverride: "lifetime" });
  });

  test("첫자리가 0/9 외면 null을 반환한다", () => {
    // Given
    const digits = "11234567890";

    // When
    const result = kb11FirstDigit.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });
});

describe("kbank10First9", () => {
  test("10자리가 아니면 null을 반환한다", () => {
    // Given
    const digits = "123456789";

    // When
    const result = kbank10First9.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });

  test("첫자리가 9이면 incoming-only로 분기한다", () => {
    // Given
    const digits = "9123456789";

    // When
    const result = kbank10First9.evaluate(digits);

    // Then
    expect(result).toEqual({ kindOverride: "incoming-only" });
  });

  test("첫자리가 9 외면 null을 반환한다", () => {
    // Given
    const digits = "1123456789";

    // When
    const result = kbank10First9.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });
});

describe("kbank14First79", () => {
  test("14자리가 아니면 null을 반환한다", () => {
    // Given
    const digits = "1234567890123";

    // When
    const result = kbank14First79.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });

  test("첫자리가 7이면 virtual + virtualOverride=true로 분기한다", () => {
    // Given
    const digits = "71234567890123";

    // When
    const result = kbank14First79.evaluate(digits);

    // Then
    expect(result).toEqual({ kindOverride: "virtual", virtualOverride: true });
  });

  test("첫자리가 9이면 virtual로 분기한다", () => {
    // Given
    const digits = "91234567890123";

    // When
    const result = kbank14First79.evaluate(digits);

    // Then
    expect(result).toEqual({ kindOverride: "virtual", virtualOverride: true });
  });

  test("첫자리가 7/9 외면 여신가상계좌 → incoming-only 로 분기한다", () => {
    // Given
    const digits = "11234567890123";

    // When
    const result = kbank14First79.evaluate(digits);

    // Then
    expect(result).toEqual({ kindOverride: "incoming-only" });
  });
});

describe("toss12First1719", () => {
  test("12자리가 아니면 null을 반환한다", () => {
    // Given
    const digits = "1234567890";

    // When
    const result = toss12First1719.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });

  test("앞 두자리가 17이면 virtual로 분기한다", () => {
    // Given
    const digits = "171234567890";

    // When
    const result = toss12First1719.evaluate(digits);

    // Then
    expect(result).toEqual({ kindOverride: "virtual", virtualOverride: true });
  });

  test("앞 두자리가 19이면 virtual로 분기한다", () => {
    // Given
    const digits = "191234567890";

    // When
    const result = toss12First1719.evaluate(digits);

    // Then
    expect(result).toEqual({ kindOverride: "virtual", virtualOverride: true });
  });

  test("앞 두자리가 17/19 외면 null을 반환한다", () => {
    // Given
    const digits = "101234567890";

    // When
    const result = toss12First1719.evaluate(digits);

    // Then
    expect(result).toBeNull();
  });
});

describe("defineBranchRule", () => {
  test("입력 BranchRule을 그대로 반환한다 (타입 안전 헬퍼)", () => {
    // Given
    const input = {
      describe: "test rule",
      evaluate: () => null,
    };

    // When
    const result = defineBranchRule(input);

    // Then
    expect(result).toBe(input);
  });
});
