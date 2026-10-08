import { describe, expect, test } from "vitest";
import { createDetector } from "../core/detector";
import { templateLength } from "../core/template-length";
import { detect } from "../core/detect";
import { getInstitution, institutions, type InstitutionId } from "./index";
import { SOURCE_FORMATS } from "./source-audit.fixtures";

function scoped(id: InstitutionId, digits: string) {
  return createDetector([getInstitution(id)]).detect(digits)[0];
}

describe("2026.05.08 PDF의 독립 길이 기대값", () => {
  test("57개 라이브러리 항목을 모두 대조한다", () => {
    expect(SOURCE_FORMATS.map((row) => row.id).toSorted()).toEqual(
      institutions.map((i) => i.id).toSorted(),
    );
  });
  test.each(SOURCE_FORMATS)("$id — PDF $pages", ({ id, lengths }) => {
    const actual = [
      ...new Set(getInstitution(id).patterns.map((p) => templateLength(p.template))),
    ].toSorted((a, b) => a - b);
    expect(actual).toEqual(lengths);
  });
});

describe("SC — PDF p.5", () => {
  test.each([
    ["12310123456", "ordinary", false],
    ["12315123456", "ordinary", true],
  ] as const)("11자리 %s", (digits, category, virtual) => {
    const result = scoped("sc", digits);
    expect(result?.matchedPattern.template).toBe("XXX-XX-XXXXX-X");
    expect(result?.subject?.category).toBe(category);
    expect(result?.capabilities.virtual).toBe(virtual);
    expect(result?.score).toBe(7);
  });
  test("10자리는 정확한 계좌 길이로 취급하지 않고 14자리는 유지한다", () => {
    expect(scoped("sc", "1231012345")?.confidence).toBe("low");
    expect(scoped("sc", "12316123456789")?.matchedPattern.template).toBe("XXX-XX-XXXXXXXXX");
  });
});

test("SC 11자리 과목 15는 하나와 충돌하며 기존 동점 순서를 유지한다", () => {
  const results = detect("123-15-67890-1");
  expect(results.slice(0, 2).map((r) => [r.institution.id, r.score])).toEqual([
    ["hana", 7],
    ["sc", 7],
  ]);
});
