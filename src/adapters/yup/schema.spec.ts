import { describe, expect, test } from "vitest";
import { type Schema, ValidationError } from "yup";

import { describeAdapterContract } from "../contract.fixtures";
import {
  accountKindSchema,
  accountSchema,
  createAccountSchema,
  createDetectionSchema,
  createInstitutionIdSchema,
  detectionSchema,
  institutionIdSchema,
  subjectCategorySchema,
} from "./schema";

describeAdapterContract<Schema<unknown>>("yup", {
  schemas: {
    account: accountSchema,
    institutionId: institutionIdSchema,
    accountKind: accountKindSchema,
    subjectCategory: subjectCategorySchema,
    detection: detectionSchema,
  },
  createAccountSchema,
  createInstitutionIdSchema,
  createDetectionSchema,
  output: (schema, value) => schema.validateSync(value),
  firstIssue: (schema, value) => {
    try {
      schema.validateSync(value, { strict: true });
      return null;
    } catch (error) {
      if (error instanceof ValidationError) return error.message;
      throw error;
    }
  },
});

describe("yup 캐스팅 함정", () => {
  test("숫자 입력은 문자열로 캐스트되지 않는다", () => {
    // Given
    const input = 1104363877;

    // When
    const isValid = accountSchema.isValidSync(input);

    // Then
    expect(isValid).toBe(false);
  });

  test("subject 를 생략한 payload 를 cast 해도 빈 객체가 생기지 않는다", () => {
    // Given
    const payload = {
      institutionId: "shinhan",
      kind: "new",
      score: 14,
      confidence: "high",
      formatted: "110-436-387740",
      capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: null },
    };

    // When
    const cast = detectionSchema.cast(payload);

    // Then
    expect(cast).not.toHaveProperty("subject", {});
    expect(cast.capabilities.services).toBeUndefined();
  });
});
