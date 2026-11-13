import { describe, expect, expectTypeOf, test } from "vitest";

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
  type StandardSchemaV1,
  subjectCategorySchema,
} from "./schema";

/** Runs `~standard.validate`, failing the test if it returns a Promise. */
function validateSync<Output>(
  schema: StandardSchemaV1<unknown, Output>,
  value: unknown,
): StandardSchemaV1.Result<Output> {
  const result = schema["~standard"].validate(value);
  if (result instanceof Promise) throw new Error("validate must be synchronous");
  return result;
}

describeAdapterContract<StandardSchemaV1<unknown, unknown>>("standard-schema", {
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
  output: (schema, value) => {
    const result = validateSync(schema, value);
    return result.issues === undefined ? result.value : null;
  },
  firstIssue: (schema, value) => {
    const result = validateSync(schema, value);
    return result.issues === undefined ? null : (result.issues[0]?.message ?? "");
  },
});

describe("standard-schema 인터페이스", () => {
  test("~standard 메타데이터로 version 1 과 vendor 'korean-account' 를 노출한다", () => {
    // Given
    const schema = accountSchema;

    // When
    const metadata = schema["~standard"];

    // Then
    expect(metadata.version).toBe(1);
    expect(metadata.vendor).toBe("korean-account");
  });

  test("유효하면 value 를, 무효하면 한국어 message 이슈를 반환한다", () => {
    // Given
    const validInput = "110-436-387740";
    const invalidInput = "12345";

    // When
    const pass = validateSync(accountSchema, validInput);
    const failure = validateSync(accountSchema, invalidInput);

    // Then
    expect(pass).toEqual({ value: "110-436-387740" });
    expect(failure.issues?.[0]?.message).toBe(MESSAGES.minDigits);
  });

  test("detection 의 institutionId 가 무효하면 이슈 path 에 ['institutionId'] 를 싣는다", () => {
    // Given
    const input = {
      institutionId: "unknown",
      kind: "new",
      score: 1,
      confidence: "high",
      formatted: "x",
      capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: null },
    };

    // When
    const result = validateSync(detectionSchema, input);

    // Then
    expect(result.issues?.[0]?.path).toEqual(["institutionId"]);
  });

  test("detection 의 무효한 필드를 한 번에 모두 이슈로 모은다", () => {
    // Given
    const input = { institutionId: "unknown", kind: "new", score: -1, confidence: "high" };

    // When
    const result = validateSync(detectionSchema, input);

    // Then
    expect(result.issues?.map((issue) => issue.path)).toEqual([
      ["institutionId"],
      ["score"],
      ["formatted"],
      ["capabilities"],
    ]);
  });

  test("InferOutput 은 accountSchema 의 출력 타입을 string 으로 추론한다", () => {
    // Given
    const schema = accountSchema;

    // When
    type Output = StandardSchemaV1.InferOutput<typeof schema>;

    // Then
    expectTypeOf<Output>().toEqualTypeOf<string>();
  });
});
