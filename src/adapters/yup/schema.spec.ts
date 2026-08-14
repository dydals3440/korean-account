import { describe, expect, test } from "vitest";
import { ValidationError } from "yup";
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
    expect(firstMessage(() => accountSchema.validateSync(input))).toBe(message);
  });

  test("미등록 기관 id 메시지", () => {
    expect(firstMessage(() => institutionIdSchema.validateSync("unknown"))).toBe(
      MESSAGES.institution,
    );
  });

  test("cast 우회 차단 — 숫자 입력은 문자열로 캐스트되지 않는다", () => {
    expect(accountSchema.isValidSync(1104363877)).toBe(false);
  });
});
