import { describe, expect, expectTypeOf, test } from "vitest";
import { type ContractSchemaName, describeAdapterContract } from "../adapter-contract.fixtures";
import { MESSAGES } from "../shared";
import {
  accountKindSchema,
  accountSchema,
  detectionSchema,
  institutionIdSchema,
  type StandardSchemaV1,
  subjectCategorySchema,
} from "./schema";

const contractSchemas = {
  account: accountSchema,
  institutionId: institutionIdSchema,
  accountKind: accountKindSchema,
  subjectCategory: subjectCategorySchema,
  detection: detectionSchema,
} as const;

describeAdapterContract("standard-schema", (name, value) => {
  const result = contractSchemas[name as ContractSchemaName]["~standard"].validate(value);
  if (result instanceof Promise) throw new Error("validate must be synchronous");
  return result.issues === undefined;
});

describe("standard-schema 인터페이스", () => {
  test("~standard 메타데이터", () => {
    expect(accountSchema["~standard"].version).toBe(1);
    expect(accountSchema["~standard"].vendor).toBe("korean-account");
  });

  test("성공 시 value, 실패 시 한국어 message", () => {
    const pass = accountSchema["~standard"].validate("110-436-387740");
    const failure = accountSchema["~standard"].validate("12345");
    if (pass instanceof Promise || failure instanceof Promise) throw new Error("sync only");

    expect(pass).toEqual({ value: "110-436-387740" });
    expect(failure.issues?.[0]?.message).toBe(MESSAGES.minDigits);
  });

  test("detection 이슈에 path 가 실린다", () => {
    const result = detectionSchema["~standard"].validate({
      institutionId: "unknown",
      kind: "new",
      score: 1,
      confidence: "high",
      formatted: "x",
      capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: null },
    });
    if (result instanceof Promise) throw new Error("sync only");

    expect(result.issues?.[0]?.path).toEqual(["institutionId"]);
  });

  test("InferOutput 이 정확한 타입을 준다", () => {
    expectTypeOf<StandardSchemaV1.InferOutput<typeof accountSchema>>().toEqualTypeOf<string>();
  });
});
