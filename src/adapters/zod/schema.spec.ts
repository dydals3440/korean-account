import { describe, expect, test } from "vitest";

import { type ContractSchemaName, describeAdapterContract } from "../contract.fixtures";
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
      // Given
      const account = input;

      // When
      const result = accountSchema.safeParse(account);

      // Then
      expect(result.success).toBe(true);
    });

    test("자릿수 정확히 6자리는 통과한다", () => {
      // Given
      const input = "123456";

      // When
      const result = accountSchema.safeParse(input);

      // Then
      expect(result.success).toBe(true);
    });

    test("자릿수 정확히 20자리는 통과한다", () => {
      // Given
      const input = "1".repeat(20);

      // When
      const result = accountSchema.safeParse(input);

      // Then
      expect(result.success).toBe(true);
    });
  });

  describe("거부 사유", () => {
    test("빈 문자열은 거부된다", () => {
      // Given
      const input = "";

      // When
      const result = accountSchema.safeParse(input);

      // Then
      expect(result.success).toBe(false);
    });

    test("자릿수 5자리는 거부된다", () => {
      // Given
      const input = "12345";

      // When
      const result = accountSchema.safeParse(input);

      // Then
      expect(result.success).toBe(false);
    });

    test("자릿수 21자리는 거부된다", () => {
      // Given
      const input = "1".repeat(21);

      // When
      const result = accountSchema.safeParse(input);

      // Then
      expect(result.success).toBe(false);
    });

    test("자릿수가 25자리면 거부된다", () => {
      // Given
      const input = "1".repeat(25);

      // When
      const result = accountSchema.safeParse(input);

      // Then
      expect(result.success).toBe(false);
    });

    test("허용되지 않은 문자가 들어 있으면 거부된다", () => {
      // Given
      const inputs = ["110-abc-456", "110_456_789", "110.436.387740"];

      // When
      const results = inputs.map((input) => accountSchema.safeParse(input));

      // Then
      for (const result of results) {
        expect(result.success).toBe(false);
      }
    });
  });
});

describe("institutionIdSchema", () => {
  test("등록된 id 는 통과한다", () => {
    // Given
    const inputs = ["shinhan", "kakao", "nh-coop", "savings-bank"];

    // When
    const results = inputs.map((input) => institutionIdSchema.safeParse(input));

    // Then
    for (const result of results) {
      expect(result.success).toBe(true);
    }
  });

  test("등록되지 않은 id 는 거부된다", () => {
    // Given
    const inputs = ["unknown", ""];

    // When
    const results = inputs.map((input) => institutionIdSchema.safeParse(input));

    // Then
    for (const result of results) {
      expect(result.success).toBe(false);
    }
  });

  test("문자열이 아니면 거부된다", () => {
    // Given
    const inputs = [123, null, undefined];

    // When
    const results = inputs.map((input) => institutionIdSchema.safeParse(input));

    // Then
    for (const result of results) {
      expect(result.success).toBe(false);
    }
  });
});

describe("accountKindSchema", () => {
  test.each(["new", "old", "virtual", "lifetime", "incoming-only", "merged-legacy"])(
    "'%s' 는 통과한다",
    (input) => {
      // Given
      const kind = input;

      // When
      const result = accountKindSchema.safeParse(kind);

      // Then
      expect(result.success).toBe(true);
    },
  );

  test("enum 외 값은 거부된다", () => {
    // Given
    const inputs = ["foo", "", null];

    // When
    const results = inputs.map((input) => accountKindSchema.safeParse(input));

    // Then
    for (const result of results) {
      expect(result.success).toBe(false);
    }
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
  ])("'%s' 는 통과한다", (input) => {
    // Given
    const category = input;

    // When
    const result = subjectCategorySchema.safeParse(category);

    // Then
    expect(result.success).toBe(true);
  });

  test("enum 외 값은 거부된다", () => {
    // Given
    const inputs = ["foo", "Ordinary"];

    // When
    const results = inputs.map((input) => subjectCategorySchema.safeParse(input));

    // Then
    for (const result of results) {
      expect(result.success).toBe(false);
    }
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
    // Given
    const input = baseValid;

    // When
    const result = detectionSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  test("subject 가 있으면 함께 검증한다", () => {
    // Given
    const input = {
      ...baseValid,
      subject: { code: "110", category: "savings", label: "저축예금" },
    };

    // When
    const result = detectionSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  test("subject.label 은 optional 이므로 없어도 통과한다", () => {
    // Given
    const input = {
      ...baseValid,
      subject: { code: "110", category: "savings" },
    };

    // When
    const result = detectionSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  test("confidence 가 enum 외 값이면 거부된다", () => {
    // Given
    const input = { ...baseValid, confidence: "unknown" };

    // When
    const result = detectionSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test("kind 가 enum 외 값이면 거부된다", () => {
    // Given
    const input = { ...baseValid, kind: "weird" };

    // When
    const result = detectionSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test("capabilities 가 빠지면 거부된다", () => {
    // Given
    const { capabilities: _capabilities, ...withoutCapabilities } = baseValid;

    // When
    const result = detectionSchema.safeParse(withoutCapabilities);

    // Then
    expect(result.success).toBe(false);
  });

  test("score 가 음수면 거부된다", () => {
    // Given
    const input = { ...baseValid, score: -1 };

    // When
    const result = detectionSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test("validatedCheckDigit 가 boolean | null 이면 통과한다", () => {
    // Given
    const trueCase = {
      ...baseValid,
      capabilities: { ...baseValid.capabilities, validatedCheckDigit: true },
    };
    const falseCase = {
      ...baseValid,
      capabilities: { ...baseValid.capabilities, validatedCheckDigit: false },
    };
    const nullCase = baseValid;

    // When
    const trueResult = detectionSchema.safeParse(trueCase);
    const falseResult = detectionSchema.safeParse(falseCase);
    const nullResult = detectionSchema.safeParse(nullCase);

    // Then
    expect(trueResult.success).toBe(true);
    expect(falseResult.success).toBe(true);
    expect(nullResult.success).toBe(true);
  });
});

const contractSchemas = {
  account: accountSchema,
  institutionId: institutionIdSchema,
  accountKind: accountKindSchema,
  subjectCategory: subjectCategorySchema,
  detection: detectionSchema,
} as const satisfies Record<ContractSchemaName, unknown>;

describeAdapterContract("zod", (name, value) => contractSchemas[name].safeParse(value).success);
