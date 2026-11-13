import { type } from "arktype";
import { describe, expect, test } from "vitest";

import { MESSAGES } from "../contract";
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

describeAdapterContract<(value: unknown) => unknown>("arktype", {
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
  output: (schema, value) => schema(value),
  firstIssue: (schema, value) => {
    const result = schema(value);
    return result instanceof type.errors ? (result[0]?.message ?? "") : null;
  },
});

describe("arktype 중첩 메시지", () => {
  test("객체 안에 넣어도 메시지 앞에 경로를 붙이지 않는다", () => {
    // Given
    const form = type({ account: accountSchema });

    // When
    const result = form({ account: "12345" });

    // Then
    expect(result instanceof type.errors ? result[0]?.message : null).toBe(MESSAGES.minDigits);
  });
});
