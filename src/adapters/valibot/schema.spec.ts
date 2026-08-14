import * as v from "valibot";
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
} as const satisfies Record<ContractSchemaName, v.GenericSchema<unknown>>;

describeAdapterContract(
  "valibot",
  (name, value) => v.safeParse(contractSchemas[name], value).success,
);

describe("valibot 한국어 메시지", () => {
  test.each([
    ["12345", MESSAGES.minDigits],
    ["1".repeat(41), MESSAGES.tooLong],
    ["110-abc", MESSAGES.charset],
    ["", MESSAGES.required],
  ])("'%s' → %s", (input, message) => {
    // Given / When
    const result = v.safeParse(accountSchema, input);

    // Then
    expect(result.success).toBe(false);
    expect(result.issues?.[0]?.message).toBe(message);
  });

  test("미등록 기관 id 메시지", () => {
    const result = v.safeParse(institutionIdSchema, "unknown");
    expect(result.issues?.[0]?.message).toBe(MESSAGES.institution);
  });
});
