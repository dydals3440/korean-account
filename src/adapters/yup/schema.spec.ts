import { describe, expect, test } from "vitest";
import { ValidationError } from "yup";

import { MESSAGES } from "../contract";
import { type ContractSchemaName, describeAdapterContract } from "../contract.fixtures";
import {
  accountKindSchema,
  accountSchema,
  detectionSchema,
  institutionIdSchema,
  subjectCategorySchema,
} from "./schema";

const contractSchemas = {
  account: accountSchema,
  institutionId: institutionIdSchema,
  accountKind: accountKindSchema,
  subjectCategory: subjectCategorySchema,
  detection: detectionSchema,
} as const;

describeAdapterContract("yup", (name, value) =>
  contractSchemas[name as ContractSchemaName].isValidSync(value, { strict: true }),
);

function firstMessage(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    return error instanceof ValidationError ? error.message : undefined;
  }
}

describe("yup 한국어 메시지", () => {
  test.each([
    ["12345", MESSAGES.minDigits],
    ["1".repeat(41), MESSAGES.tooLong],
    ["110-abc", MESSAGES.charset],
    ["", MESSAGES.required],
  ])("'%s' → %s", (input, message) => {
    // Given
    const account = input;

    // When
    const errorMessage = firstMessage(() => accountSchema.validateSync(account));

    // Then
    expect(errorMessage).toBe(message);
  });

  test("미등록 기관 id 는 기관 메시지로 거부한다", () => {
    // Given
    const institutionId = "unknown";

    // When
    const errorMessage = firstMessage(() => institutionIdSchema.validateSync(institutionId));

    // Then
    expect(errorMessage).toBe(MESSAGES.institution);
  });

  test("cast 우회 차단 — 숫자 입력은 문자열로 캐스트되지 않는다", () => {
    // Given
    const input = 1104363877;

    // When
    const result = accountSchema.isValidSync(input);

    // Then
    expect(result).toBe(false);
  });
});
