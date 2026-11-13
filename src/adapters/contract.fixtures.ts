import { describe, expect, test } from "vitest";

import { detect } from "../builtin/detect";
import { ACCOUNT_KINDS, SUBJECT_CATEGORIES } from "../constants";
import { toDetectionPayload } from "../core/detector/to-detection-payload";
import {
  type AccountMessages,
  type AccountSchemaOptions,
  type DetectionPayload,
  type DetectionSchemaOptions,
  MESSAGES,
} from "./contract";

// Every adapter spec runs this table, so an input passes or fails in all five adapters alike.
// Invalid rows include yup traps: castable numbers, `undefined` for oneOf, missing keys.

const baseDetection: DetectionPayload = {
  institutionId: "shinhan",
  kind: "new",
  score: 14,
  confidence: "high",
  formatted: "110-436-387740",
  capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: null },
};

const ALL_SERVICES = {
  virtualAccount: true,
  directDebit: true,
  directCredit: true,
  additionalServices: false,
};

export interface SchemaCases {
  readonly valid: readonly unknown[];
  readonly invalid: readonly unknown[];
}

export const ADAPTER_CONTRACT = {
  account: {
    valid: [
      "110-436-387740",
      "1104363877",
      "3333-12-3456789",
      "100 001 1234567",
      "123456",
      "1".repeat(20),
      "１１０-４３６-３８７７４０",
      "110－436－387740",
      "110\u3000436 387740",
    ],
    invalid: [
      "",
      "12345",
      "1".repeat(21),
      "110-abc-456",
      "110_456_789",
      "110.436.387740",
      1104363877,
      null,
      undefined,
    ],
  },
  institutionId: {
    valid: ["shinhan", "kakao", "nh-coop", "savings-bank", "kb-sec"],
    invalid: ["unknown", "", "SHINHAN", 123, null, undefined],
  },
  accountKind: {
    valid: [...ACCOUNT_KINDS],
    invalid: ["foo", "", "New", null, undefined],
  },
  subjectCategory: {
    valid: [...SUBJECT_CATEGORIES],
    invalid: ["foo", "", "Ordinary", null, undefined],
  },
  detection: {
    valid: [
      baseDetection,
      ...[-0, 0, 0.5, Number.MAX_VALUE].map((score) => ({ ...baseDetection, score })),
      {
        ...baseDetection,
        subject: { code: "110", category: "savings", label: "저축예금" },
      },
      { ...baseDetection, subject: { code: "01", category: "ordinary" } },
      {
        ...baseDetection,
        capabilities: { allowsWithdrawal: false, virtual: true, validatedCheckDigit: true },
      },
      {
        ...baseDetection,
        capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: false },
      },
      { ...baseDetection, ambiguous: true },
      { ...baseDetection, ambiguous: false },
      { ...baseDetection, capabilities: { ...baseDetection.capabilities, services: null } },
      { ...baseDetection, capabilities: { ...baseDetection.capabilities, services: ALL_SERVICES } },
    ],
    invalid: [
      { ...baseDetection, confidence: "unknown" },
      { ...baseDetection, kind: "weird" },
      { ...baseDetection, institutionId: "unknown" },
      { ...baseDetection, score: -1 },
      ...[NaN, Infinity, -Infinity].map((score) => ({ ...baseDetection, score })),
      { ...baseDetection, score: "7" },
      { ...baseDetection, capabilities: undefined },
      {
        ...baseDetection,
        capabilities: { allowsWithdrawal: true, virtual: false },
      },
      { ...baseDetection, subject: { category: "savings" } },
      { ...baseDetection, subject: "not-an-object" },
      { ...baseDetection, subject: { code: 110, category: "savings" } },
      { ...baseDetection, subject: { code: "110", category: "savings", label: 123 } },
      {
        ...baseDetection,
        capabilities: { allowsWithdrawal: "yes", virtual: false, validatedCheckDigit: null },
      },
      {
        ...baseDetection,
        capabilities: { allowsWithdrawal: true, virtual: 1, validatedCheckDigit: null },
      },
      { ...baseDetection, formatted: 42 },
      { ...baseDetection, ambiguous: "yes" },
      { ...baseDetection, ambiguous: null },
      {
        ...baseDetection,
        capabilities: { ...baseDetection.capabilities, services: { virtualAccount: true } },
      },
      {
        ...baseDetection,
        capabilities: {
          ...baseDetection.capabilities,
          services: { ...ALL_SERVICES, directDebit: "yes" },
        },
      },
      null,
      "not-an-object",
      undefined,
    ],
  },
} as const satisfies Record<string, SchemaCases>;

export type ContractSchemaName = keyof typeof ADAPTER_CONTRACT;

/** One adapter's schemas and factories, plus a way to run them. */
export interface AdapterHarness<TSchema> {
  readonly schemas: Readonly<Record<ContractSchemaName, TSchema>>;
  readonly createAccountSchema: (options: AccountSchemaOptions) => TSchema;
  readonly createInstitutionIdSchema: (ids: readonly string[]) => TSchema;
  readonly createDetectionSchema: (
    ids: readonly string[],
    options?: DetectionSchemaOptions,
  ) => TSchema;
  /** First issue message, or `null` when the value passes. */
  readonly firstIssue: (schema: TSchema, value: unknown) => string | null;
}

const CUSTOM_IDS = ["my-bank", "my-coop"];
const CUSTOM_MESSAGES = {
  required: "Enter an account number.",
  tooLong: "Too long.",
  charset: "Digits, spaces and hyphens only.",
  minDigits: "Too few digits.",
  maxDigits: "Too many digits.",
} as const satisfies AccountMessages;

/** Shared describe-block every adapter spec runs once. */
export function describeAdapterContract<TSchema>(
  adapterName: string,
  harness: AdapterHarness<TSchema>,
): void {
  const { schemas, firstIssue } = harness;

  describe(`adapter contract — ${adapterName}`, () => {
    for (const [name, cases] of Object.entries(ADAPTER_CONTRACT)) {
      const schema = schemas[name as ContractSchemaName];
      test.each([...cases.valid])(`${name} 은 유효한 값 %j 를 통과시킨다`, (value) => {
        // Given
        const input = value;

        // When
        const issue = firstIssue(schema, input);

        // Then
        expect(issue).toBeNull();
      });
      test.each([...cases.invalid])(`${name} 은 무효한 값 %j 를 거부한다`, (value) => {
        // Given
        const input = value;

        // When
        const issue = firstIssue(schema, input);

        // Then
        expect(issue).not.toBeNull();
      });
    }

    test.each([
      ["", "required"],
      ["1".repeat(41), "tooLong"],
      ["110-abc", "charset"],
      ["12345", "minDigits"],
      ["1".repeat(21), "maxDigits"],
    ] as const)("accountSchema 는 %j 에 기본 메시지 %s 를 낸다", (input, key) => {
      // Given
      const schema = schemas.account;

      // When
      const issue = firstIssue(schema, input);

      // Then
      expect(issue).toBe(MESSAGES[key]);
    });

    test.each([
      ["", "required"],
      ["1".repeat(41), "tooLong"],
      ["110-abc", "charset"],
      ["12345", "minDigits"],
      ["1".repeat(21), "maxDigits"],
    ] as const)("createAccountSchema 는 %j 에 덮어쓴 메시지 %s 를 낸다", (input, key) => {
      // Given
      const schema = harness.createAccountSchema({ messages: CUSTOM_MESSAGES });

      // When
      const issue = firstIssue(schema, input);

      // Then
      expect(issue).toBe(CUSTOM_MESSAGES[key]);
    });

    test("createAccountSchema 는 생략하거나 undefined 로 둔 메시지에 기본값을 쓴다", () => {
      // Given
      const schema = harness.createAccountSchema({
        messages: { minDigits: "Too few digits.", charset: undefined },
      });

      // When
      const issue = firstIssue(schema, "110-abc");

      // Then
      expect(issue).toBe(MESSAGES.charset);
    });

    test.each([1104363877, null, undefined, {}])(
      "accountSchema 는 문자열이 아닌 %j 에 required 메시지를 낸다",
      (value) => {
        // Given
        const schema = schemas.account;

        // When
        const issue = firstIssue(schema, value);

        // Then
        expect(issue).toBe(MESSAGES.required);
      },
    );

    test("createAccountSchema 의 required 덮어쓰기는 문자열이 아닌 입력에도 쓰인다", () => {
      // Given
      const schema = harness.createAccountSchema({ messages: CUSTOM_MESSAGES });

      // When
      const issue = firstIssue(schema, 1104363877);

      // Then
      expect(issue).toBe(CUSTOM_MESSAGES.required);
    });

    test("createDetectionSchema 는 덮어쓴 점수 메시지를 그대로 낸다", () => {
      // Given
      const schema = harness.createDetectionSchema(CUSTOM_IDS, {
        messages: { finiteScore: "Score must be a finite number." },
      });

      // When
      const issue = firstIssue(schema, { ...baseDetection, institutionId: "my-bank", score: -1 });

      // Then
      expect(issue).toBe("Score must be a finite number.");
    });

    test("createInstitutionIdSchema 는 넘긴 ID 만 받는다", () => {
      // Given
      const schema = harness.createInstitutionIdSchema(CUSTOM_IDS);

      // When
      const issues = ["my-bank", "my-coop", "shinhan"].map((id) => firstIssue(schema, id));

      // Then
      expect(issues).toEqual([null, null, MESSAGES.institution]);
    });

    test("createDetectionSchema 는 커스텀 기관 ID 의 payload 를 받고 내장 ID 는 거부한다", () => {
      // Given
      const schema = harness.createDetectionSchema(CUSTOM_IDS);

      // When
      const customIssue = firstIssue(schema, { ...baseDetection, institutionId: "my-bank" });
      const builtinIssue = firstIssue(schema, baseDetection);

      // Then
      expect(customIssue).toBeNull();
      expect(builtinIssue).not.toBeNull();
    });

    test.each(["110-436-387740", "301-0123-4567-11", "352-0123-4567-13", "123-01-123456"])(
      "detectionSchema 는 toDetectionPayload(detect(%j)) 결과를 모두 통과시킨다",
      (account) => {
        // Given
        const payloads = detect(account).map((result) => toDetectionPayload(result));

        // When
        const issues = payloads.map((payload) => firstIssue(schemas.detection, payload));

        // Then
        expect(payloads.length).toBeGreaterThan(0);
        expect(issues.every((issue) => issue === null)).toBe(true);
      },
    );

    test("detectionSchema 는 JSON 왕복을 거친 payload 도 통과시킨다", () => {
      // Given
      const [top] = detect("110-436-387740");
      const payload: unknown = JSON.parse(JSON.stringify(top && toDetectionPayload(top)));

      // When
      const issue = firstIssue(schemas.detection, payload);

      // Then
      expect(issue).toBeNull();
    });
  });
}
