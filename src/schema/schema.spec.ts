import { describe, expect, test } from "vitest";
import {
  accountKindSchema,
  accountSchema,
  detectionSchema,
  institutionIdSchema,
  subjectCategorySchema,
} from "./schema";

describe("accountSchema", () => {
  describe("유효한 입력", () => {
    test.each([
      "110-436-387740",
      "1104363877",
      "3333-12-3456789",
      "100 001 1234567",
      "1000-1234-5678",
      "123456-04-789012",
    ])("'%s' 는 통과한다", (input) => {
      // given / when
      const result = accountSchema.safeParse(input);

      // then
      expect(result.success).toBe(true);
    });

    test("자릿수 정확히 6자리는 통과한다", () => {
      // given
      const input = "123456";

      // when
      const result = accountSchema.safeParse(input);

      // then
      expect(result.success).toBe(true);
    });

    test("자릿수 정확히 20자리는 통과한다", () => {
      // given
      const input = "1".repeat(20);

      // when
      const result = accountSchema.safeParse(input);

      // then
      expect(result.success).toBe(true);
    });
  });

  describe("거부 사유", () => {
    test("빈 문자열은 거부된다", () => {
      // given / when / then
      expect(accountSchema.safeParse("").success).toBe(false);
    });

    test("자릿수 5자리는 거부된다", () => {
      // given
      const input = "12345";

      // when
      const result = accountSchema.safeParse(input);

      // then
      expect(result.success).toBe(false);
    });

    test("자릿수 21자리는 거부된다", () => {
      // given
      const input = "1".repeat(21);

      // when
      const result = accountSchema.safeParse(input);

      // then
      expect(result.success).toBe(false);
    });

    test("자릿수가 25자리면 거부된다", () => {
      // given
      const input = "1".repeat(25);

      // when
      const result = accountSchema.safeParse(input);

      // then
      expect(result.success).toBe(false);
    });

    test("허용되지 않은 문자가 들어 있으면 거부된다", () => {
      // given / when / then
      expect(accountSchema.safeParse("110-abc-456").success).toBe(false);
      expect(accountSchema.safeParse("110_456_789").success).toBe(false);
      expect(accountSchema.safeParse("110.436.387740").success).toBe(false);
    });
  });
});

describe("institutionIdSchema", () => {
  test("등록된 id 는 통과한다", () => {
    // given / when / then
    expect(institutionIdSchema.safeParse("shinhan").success).toBe(true);
    expect(institutionIdSchema.safeParse("kakao").success).toBe(true);
    expect(institutionIdSchema.safeParse("nh-coop").success).toBe(true);
    expect(institutionIdSchema.safeParse("savings-bank").success).toBe(true);
  });

  test("등록되지 않은 id 는 거부된다", () => {
    // given / when / then
    expect(institutionIdSchema.safeParse("unknown").success).toBe(false);
    expect(institutionIdSchema.safeParse("").success).toBe(false);
  });

  test("문자열이 아니면 거부된다", () => {
    // given / when / then
    expect(institutionIdSchema.safeParse(123).success).toBe(false);
    expect(institutionIdSchema.safeParse(null).success).toBe(false);
    expect(institutionIdSchema.safeParse(undefined).success).toBe(false);
  });
});

describe("accountKindSchema", () => {
  test.each([
    "new",
    "old",
    "virtual",
    "lifetime",
    "incoming-only",
    "merged-legacy",
  ])("'%s' 는 통과한다", (kind) => {
    // given / when
    const result = accountKindSchema.safeParse(kind);

    // then
    expect(result.success).toBe(true);
  });

  test("enum 외 값은 거부된다", () => {
    // given / when / then
    expect(accountKindSchema.safeParse("foo").success).toBe(false);
    expect(accountKindSchema.safeParse("").success).toBe(false);
    expect(accountKindSchema.safeParse(null).success).toBe(false);
  });
});

describe("subjectCategorySchema", () => {
  test.each([
    "ordinary",
    "treasury",
    "savings",
    "free-savings",
    "household-current",
    "current",
    "corporate-free",
    "yes",
    "linked",
    "installment",
    "trust",
    "isa",
    "other",
  ])("'%s' 는 통과한다", (category) => {
    // given / when
    const result = subjectCategorySchema.safeParse(category);

    // then
    expect(result.success).toBe(true);
  });

  test("enum 외 값은 거부된다", () => {
    // given / when / then
    expect(subjectCategorySchema.safeParse("foo").success).toBe(false);
    expect(subjectCategorySchema.safeParse("Ordinary").success).toBe(false);
  });
});

describe("detectionSchema", () => {
  const baseValid = {
    institutionId: "shinhan",
    kind: "new" as const,
    score: 7,
    confidence: "high" as const,
    formatted: "110-436-387740",
    capabilities: {
      allowsWithdrawal: true,
      virtual: false,
      validatedCheckDigit: null,
    },
  };

  test("v2 형태가 맞으면 통과한다 (capabilities 포함)", () => {
    // given
    const input = baseValid;

    // when
    const result = detectionSchema.safeParse(input);

    // then
    expect(result.success).toBe(true);
  });

  test("subject 가 있으면 함께 검증한다", () => {
    // given
    const input = {
      ...baseValid,
      subject: { code: "110", category: "savings", label: "저축예금" },
    };

    // when
    const result = detectionSchema.safeParse(input);

    // then
    expect(result.success).toBe(true);
  });

  test("subject.label 은 optional 이므로 없어도 통과한다", () => {
    // given
    const input = {
      ...baseValid,
      subject: { code: "110", category: "savings" },
    };

    // when
    const result = detectionSchema.safeParse(input);

    // then
    expect(result.success).toBe(true);
  });

  test("confidence 가 enum 외 값이면 거부된다", () => {
    // given
    const input = { ...baseValid, confidence: "unknown" };

    // when
    const result = detectionSchema.safeParse(input);

    // then
    expect(result.success).toBe(false);
  });

  test("kind 가 enum 외 값이면 거부된다", () => {
    // given
    const input = { ...baseValid, kind: "weird" };

    // when
    const result = detectionSchema.safeParse(input);

    // then
    expect(result.success).toBe(false);
  });

  test("capabilities 가 빠지면 거부된다", () => {
    // given
    const { capabilities: _capabilities, ...withoutCaps } = baseValid;

    // when
    const result = detectionSchema.safeParse(withoutCaps);

    // then
    expect(result.success).toBe(false);
  });

  test("score 가 음수면 거부된다", () => {
    // given
    const input = { ...baseValid, score: -1 };

    // when
    const result = detectionSchema.safeParse(input);

    // then
    expect(result.success).toBe(false);
  });

  test("validatedCheckDigit 가 boolean | null 이면 통과한다", () => {
    // given
    const trueCase = {
      ...baseValid,
      capabilities: { ...baseValid.capabilities, validatedCheckDigit: true },
    };
    const falseCase = {
      ...baseValid,
      capabilities: { ...baseValid.capabilities, validatedCheckDigit: false },
    };
    const nullCase = baseValid;

    // when / then
    expect(detectionSchema.safeParse(trueCase).success).toBe(true);
    expect(detectionSchema.safeParse(falseCase).success).toBe(true);
    expect(detectionSchema.safeParse(nullCase).success).toBe(true);
  });
});
