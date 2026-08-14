import { describe, expect, test } from "vitest";
import { ACCOUNT_KINDS, SUBJECT_CATEGORIES } from "../shared/constants";
import type { DetectionPayload } from "./shared";

// Behavioral contract shared by every validation adapter. Each adapter's spec
// runs this exact table through its own library, so the five schema families
// cannot drift: an input either passes everywhere or fails everywhere.
// The invalid rows deliberately include the yup trap inputs (numbers that
// would cast, undefined that oneOf would pass, objects with missing keys).

const baseDetection: DetectionPayload = {
  institutionId: "shinhan",
  kind: "new",
  score: 14,
  confidence: "high",
  formatted: "110-436-387740",
  capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: null },
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
    ],
    invalid: [
      { ...baseDetection, confidence: "unknown" },
      { ...baseDetection, kind: "weird" },
      { ...baseDetection, institutionId: "unknown" },
      { ...baseDetection, score: -1 },
      { ...baseDetection, score: "7" },
      { ...baseDetection, capabilities: undefined },
      {
        ...baseDetection,
        capabilities: { allowsWithdrawal: true, virtual: false },
      },
      { ...baseDetection, subject: { category: "savings" } },
      null,
      "not-an-object",
      undefined,
    ],
  },
} as const satisfies Record<string, SchemaCases>;

export type ContractSchemaName = keyof typeof ADAPTER_CONTRACT;

/** Returns whether the adapter's schema of that name accepts the value. */
export type Accepts = (schema: ContractSchemaName, value: unknown) => boolean;

/** Shared describe-block every adapter spec runs once. */
export function describeAdapterContract(adapterName: string, accepts: Accepts): void {
  describe(`adapter contract — ${adapterName}`, () => {
    for (const [name, cases] of Object.entries(ADAPTER_CONTRACT)) {
      const schemaName = name as ContractSchemaName;
      test.each([...cases.valid])(`${name} accepts %j`, (value) => {
        expect(accepts(schemaName, value)).toBe(true);
      });
      test.each([...cases.invalid])(`${name} rejects %j`, (value) => {
        expect(accepts(schemaName, value)).toBe(false);
      });
    }
  });
}
