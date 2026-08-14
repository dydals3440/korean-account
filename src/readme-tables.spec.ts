import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { institutions } from "./registry";
import { templateLength } from "./core/template-length";

/**
 * The README institution tables are shipped documentation. This spec pins
 * every row (code, nameKo, digit lengths) to the actual registry so the
 * tables cannot rot when patterns change — same contract as
 * readme-examples.spec.ts, applied to data.
 */
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

// Tolerates the column padding oxfmt applies to markdown tables.
function tableRow(code: string): { nameKo: string; lengths: string } | null {
  const match = readme.match(
    new RegExp(`\\|\\s*${code}\\s*\\|\\s*([^|]+?)\\s*\\|[^|]*\\|\\s*([^|]+?)\\s*\\|`),
  );
  if (!match) return null;
  return { nameKo: match[1]!.trim(), lengths: match[2]!.trim() };
}

describe("README 지원 기관 표 = 레지스트리", () => {
  test.each(institutions.map((i) => [i.code, i.nameKo, i] as const))(
    "%s %s 행이 데이터와 일치한다",
    (code, nameKo, institution) => {
      const row = tableRow(code);
      expect(row, `README 표에 ${code} ${nameKo} 행이 없습니다`).not.toBeNull();
      expect(row?.nameKo).toBe(nameKo);

      const lengths = [...new Set(institution.patterns.map((p) => templateLength(p.template)))]
        .toSorted((a, b) => a - b)
        .join("·");
      const expected = lengths.length > 0 ? lengths : "—";
      expect(row?.lengths.replace(/ _\(서비스 미참가\)_$/, "")).toBe(expected);
    },
  );

  test("카테고리별 기관 수가 표 제목과 일치한다", () => {
    const count = (category: string) => institutions.filter((i) => i.category === category).length;
    expect(readme).toContain(`### 은행 (${count("bank")})`);
    expect(readme).toContain(`### 비은행 (${count("non-bank") + count("clearing")})`);
    expect(readme).toContain(`증권사 (${count("securities")})`);
  });
});
