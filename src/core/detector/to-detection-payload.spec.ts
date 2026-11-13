import { describe, expect, test } from "vitest";

import { detectBest } from "../../builtin/detect";
import { defineInstitution } from "../define/define-institution";
import { patternTemplate } from "../define/pattern-template";
import { createDetector } from "./create-detector";
import { toDetectionPayload } from "./to-detection-payload";

describe("toDetectionPayload", () => {
  test("결과에서 JSON 으로 보낼 필드만 정확히 옮긴다", () => {
    // Given
    const result = detectBest("110-436-387740");

    // When
    const payload = result && toDetectionPayload(result);

    // Then
    expect(payload).toStrictEqual({
      institutionId: "shinhan",
      kind: "new",
      subject: { code: "110", category: "savings", label: "저축예금" },
      score: 9,
      confidence: "high",
      ambiguous: true,
      formatted: "110-436-387740",
      capabilities: {
        allowsWithdrawal: true,
        virtual: false,
        validatedCheckDigit: null,
        services: {
          virtualAccount: false,
          directDebit: true,
          directCredit: true,
          additionalServices: true,
        },
      },
    });
  });

  test("과목이 없으면 subject 를 생략하고 서비스 열이 없으면 services 는 null 이다", () => {
    // Given
    const plain = defineInstitution({
      id: "plain",
      code: "907",
      nameKo: "단순",
      category: "bank",
      aliases: [],
      patterns: [
        {
          template: patternTemplate("XXX-XXXXXX"),
          kind: "new",
          identifierPosition: { start: 0, length: 3 },
          identifiers: ["123"],
        },
      ],
    });
    const [result] = createDetector([plain]).detect("123-456789");

    // When
    const payload = result && toDetectionPayload(result);

    // Then
    expect(payload).not.toHaveProperty("subject");
    expect(payload?.capabilities.services).toBeNull();
  });

  test("JSON 왕복 뒤에도 같은 값이다", () => {
    // Given
    const result = detectBest("3333-12-3456789");
    const payload = result && toDetectionPayload(result);

    // When
    const roundTripped: unknown = JSON.parse(JSON.stringify(payload));

    // Then
    expect(roundTripped).toStrictEqual(payload);
  });
});
