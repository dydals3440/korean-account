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

describe("제주 — PDF p.8의 열거 식별자", () => {
  const listed = new Set([
    700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 711, 712, 713, 714, 769, 770, 771, 772, 773,
    774, 775, 776, 777, 778, 779,
  ]);
  test.each(Array.from({ length: 80 }, (_, i) => 700 + i))("접두어 %i", (prefix) => {
    const digits = String(prefix) + "111111111";
    const result = scoped("jeju", digits);
    expect(result?.score).toBe(listed.has(prefix) ? 14 : 3);
    expect(result?.subject !== undefined).toBe(listed.has(prefix));
  });
});

describe("교보 — PDF p.16·20", () => {
  test("0으로 시작하는 11자리는 구계좌 과목을 추출하고 규칙 가산점을 받는다", () => {
    const result = scoped("kyobo-sec", "02301123456");
    expect(result?.kind).toBe("old");
    expect(result?.subject?.code).toBe("01");
    expect(result?.score).toBe(8);
  });
  test.each(["12301123456", "92301123456"])(
    "0 이외의 %s는 구계좌 과목으로 오인하지 않는다",
    (digits) => {
      const result = scoped("kyobo-sec", digits);
      expect(result?.kind).toBe("new");
      expect(result?.subject).toBeUndefined();
      expect(result?.score).toBe(4);
    },
  );
});

describe("신한 통합 14자리 — PDF p.12", () => {
  test.each(["560", "561", "562"])("%s의 901 예외와 별도 구계좌 보존", (prefix) => {
    for (const accountType of ["900", "902"]) {
      const result = scoped("shinhan", prefix + accountType + "11111111");
      expect(result?.matchedPattern).toBe(getInstitution("shinhan").patterns[1]);
      expect(result?.subject?.code).toBe(prefix);
      expect(result?.score).toBe(9);
    }
    const legacy = scoped("shinhan", prefix + "90111111111");
    expect(legacy?.matchedPattern).toBe(getInstitution("shinhan").patterns[6]);
    expect(legacy?.subject?.code).toBe("901");
  });
});

test("산업 010 — PDF p.1의 저축성 과목이며 기존 출금 flag는 유지한다", () => {
  const result = scoped("kdb", "01011111111111");
  expect(result?.subject?.category).toBe("savings");
  expect(result?.subject?.label).toBe("저축예금");
  expect(result?.capabilities.allowsWithdrawal).toBe(true);
  expect(result?.score).toBe(14);
});

test("광주 — PDF p.8의 109는 13자리 보통예금·12자리 국고로 구분한다", () => {
  const current = scoped("gwangju", "1109111111111");
  const legacy = scoped("gwangju", "111109111111");
  expect(current?.subject?.category).toBe("ordinary");
  expect(current?.subject?.label).toBe("보통예금");
  expect(legacy?.subject?.category).toBe("treasury");
  expect(legacy?.subject?.label).toBe("국고");
});
