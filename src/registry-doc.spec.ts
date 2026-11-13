import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { templateLength } from "./core/account/template-length";
import { institutions } from "./registry";

/** Pins every docs/registry.md row (code, nameKo, digit lengths) to the registry so the shipped tables cannot rot. */
const registryDoc = readFileSync(new URL("../docs/registry.md", import.meta.url), "utf8");

// Tolerates the column padding oxfmt applies to markdown tables.
function tableRow(code: string): { nameKo: string; lengths: string } | null {
  const match = registryDoc.match(
    new RegExp(`\\|\\s*${code}\\s*\\|\\s*([^|]+?)\\s*\\|[^|]*\\|\\s*([^|]+?)\\s*\\|`),
  );
  if (!match) return null;
  return { nameKo: match[1]!.trim(), lengths: match[2]!.trim() };
}

describe("문서 지원 기관 표 = 레지스트리", () => {
  test.each(
    institutions.map((institution) => [institution.code, institution.nameKo, institution] as const),
  )("%s %s 행이 데이터와 일치한다", (code, nameKo, institution) => {
    // Given
    const lengths = [
      ...new Set(institution.patterns.map((pattern) => templateLength(pattern.template))),
    ]
      .toSorted((left, right) => left - right)
      .join("·");
    const expectedLengths = lengths.length > 0 ? lengths : "—";

    // When
    const row = tableRow(code);
    const documentedLengths = row?.lengths.replace(/ _\(부가서비스 미참가\)_$/, "");

    // Then
    expect(row, `기관 문서 표에 ${code} ${nameKo} 행이 없습니다`).not.toBeNull();
    expect(row?.nameKo).toBe(nameKo);
    expect(documentedLengths).toBe(expectedLengths);
  });

  test("카테고리별 기관 수가 표 제목과 일치한다", () => {
    // Given
    const countOf = (category: string) =>
      institutions.filter((institution) => institution.category === category).length;

    // When
    const bankCount = countOf("bank");
    const nonBankCount = countOf("non-bank") + countOf("clearing");
    const securitiesCount = countOf("securities");

    // Then
    expect(registryDoc).toContain(`### 은행 (${bankCount})`);
    expect(registryDoc).toContain(`### 비은행 (${nonBankCount})`);
    expect(registryDoc).toContain(`증권사 (${securitiesCount})`);
  });
});

describe("문서 계좌 형식의 자리 수", () => {
  const rows = registryDoc.split("\n").flatMap((line, index) => {
    const cells = line.split("|").map((cell) => cell.trim());
    const formats: { line: number; expected: number; format: string }[] = [];
    for (let i = 0; i < cells.length - 1; i += 1) {
      if (!/^\d+$/.test(cells[i]!)) continue;
      const format = cells[i + 1]!.match(/`([□-]+)`/);
      if (format) formats.push({ line: index + 1, expected: Number(cells[i]), format: format[1]! });
    }
    return formats;
  });

  test("자리 수가 표기된 계좌 형식을 80개 넘게 찾는다", () => {
    // Given
    const formatRows = rows;

    // When
    const rowCount = formatRows.length;

    // Then
    expect(rowCount).toBeGreaterThan(80);
  });

  test.each(rows)("$line행 $format 은 $expected자리다", ({ expected, format }) => {
    // Given
    const accountFormat = format;

    // When
    const digitCount = accountFormat.replaceAll("-", "").length;

    // Then
    expect(digitCount).toBe(expected);
  });
});
