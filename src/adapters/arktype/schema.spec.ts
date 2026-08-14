import { type } from "arktype";
import { describe, expect, test } from "vitest";
import { type ContractSchemaName, describeAdapterContract } from "../adapter-contract.fixtures";
import { MESSAGES } from "../shared";
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

describeAdapterContract(
  "arktype",
  (name, value) => !(contractSchemas[name as ContractSchemaName](value) instanceof type.errors),
);

describe("arktype 한국어 메시지", () => {
  test.each([
    ["12345", MESSAGES.minDigits],
    ["1".repeat(41), MESSAGES.tooLong],
    ["110-abc", MESSAGES.charset],
    ["", MESSAGES.required],
  ])("'%s' → %s", (input, message) => {
    // Given / When
    const result = accountSchema(input);

    // Then
    expect(result).toBeInstanceOf(type.errors);
    expect(String(result)).toContain(message);
  });

  test("미등록 기관 id 메시지", () => {
    const result = institutionIdSchema("unknown");
    expect(String(result)).toContain(MESSAGES.institution);
  });
});
