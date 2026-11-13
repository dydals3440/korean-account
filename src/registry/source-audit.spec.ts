import { describe, expect, test } from "vitest";

import { institutions, type InstitutionId } from ".";
import { detect } from "../builtin/detect";
import { getInstitution } from "../builtin/get-institution";
import { templateLength } from "../core/account/template-length";
import { createDetector } from "../core/detector/create-detector";
import { HSBC_SOURCE_RANGES, SOURCE_FORMATS } from "./source-audit.fixtures";

function scoped(id: InstitutionId, digits: string) {
  return createDetector([getInstitution(id)]).detect(digits)[0];
}

describe("2026.05.08 PDF의 독립 길이 기대값", () => {
  test("대조표가 레지스트리의 57개 기관 id 를 모두 포함한다", () => {
    // Given
    const registryIds = institutions.map((institution) => institution.id).toSorted();

    // When
    const auditedIds = SOURCE_FORMATS.map((row) => row.id).toSorted();

    // Then
    expect(auditedIds).toEqual(registryIds);
  });
  test.each(SOURCE_FORMATS)("$id 의 패턴 길이가 PDF $pages 기대값과 같다", ({ id, lengths }) => {
    // Given
    const institution = getInstitution(id);

    // When
    const actualLengths = [
      ...new Set(institution.patterns.map((pattern) => templateLength(pattern.template))),
    ].toSorted((left, right) => left - right);

    // Then
    expect(actualLengths).toEqual(lengths);
  });
});

describe("SC — PDF p.5", () => {
  test.each([
    ["12310123456", "ordinary", false],
    ["12315123456", "ordinary", true],
  ] as const)("11자리 %s 는 %s 과목·virtual=%s 로 7점을 받는다", (digits, category, virtual) => {
    // Given
    const account = digits;

    // When
    const result = scoped("sc", account);

    // Then
    expect(result?.matchedPattern.template).toBe("XXX-XX-XXXXX-X");
    expect(result?.subject?.category).toBe(category);
    expect(result?.capabilities.virtual).toBe(virtual);
    expect(result?.score).toBe(7);
  });
  test("10자리는 정확한 계좌 길이로 취급하지 않고 14자리는 유지한다", () => {
    // Given
    const tenDigits = "1231012345";
    const fourteenDigits = "12316123456789";

    // When
    const tenDigitResult = scoped("sc", tenDigits);
    const fourteenDigitResult = scoped("sc", fourteenDigits);

    // Then
    expect(tenDigitResult?.confidence).toBe("low");
    expect(fourteenDigitResult?.matchedPattern.template).toBe("XXX-XX-XXXXXXXXX");
  });
});

test("SC 11자리 과목 15는 하나와 충돌하며 기존 동점 순서를 유지한다", () => {
  // Given
  const input = "123-15-67890-1";

  // When
  const topTwo = detect(input)
    .slice(0, 2)
    .map((result) => [result.institution.id, result.score]);

  // Then
  expect(topTwo).toEqual([
    ["hana", 7],
    ["sc", 7],
  ]);
});

describe("제주 — PDF p.8의 열거 식별자", () => {
  const listed = new Set([
    700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 711, 712, 713, 714, 769, 770, 771, 772, 773,
    774, 775, 776, 777, 778, 779,
  ]);
  test.each(Array.from({ length: 80 }, (_, i) => 700 + i))(
    "접두어 %i 는 열거되었으면 14점과 과목을, 아니면 3점을 받는다",
    (prefix) => {
      // Given
      const digits = String(prefix) + "111111111";
      const isListed = listed.has(prefix);

      // When
      const result = scoped("jeju", digits);

      // Then
      expect(result?.score).toBe(isListed ? 14 : 3);
      expect(result?.subject !== undefined).toBe(isListed);
    },
  );
});

describe("교보 — PDF p.16·20", () => {
  test("0으로 시작하는 11자리는 구계좌 과목을 추출하고 규칙 가산점을 받는다", () => {
    // Given
    const digits = "02301123456";

    // When
    const result = scoped("kyobo-sec", digits);

    // Then
    expect(result?.kind).toBe("old");
    expect(result?.subject?.code).toBe("01");
    expect(result?.score).toBe(8);
  });
  test.each(["12301123456", "92301123456"])(
    "0 이외의 %s는 구계좌 과목으로 오인하지 않는다",
    (digits) => {
      // Given
      const account = digits;

      // When
      const result = scoped("kyobo-sec", account);

      // Then
      expect(result?.kind).toBe("new");
      expect(result?.subject).toBeUndefined();
      expect(result?.score).toBe(4);
    },
  );
});

describe("신한 통합 14자리 — PDF p.12", () => {
  test.each(["560", "561", "562"])(
    "%s 뒤 900·902 는 통합 패턴으로, 901 은 별도 구계좌 패턴으로 매칭한다",
    (prefix) => {
      // Given
      const shinhan = getInstitution("shinhan");
      const integratedInputs = ["900", "902"].map(
        (accountType) => prefix + accountType + "11111111",
      );
      const legacyInput = prefix + "90111111111";

      // When
      const integratedResults = integratedInputs.map((digits) => scoped("shinhan", digits));
      const legacy = scoped("shinhan", legacyInput);

      // Then
      for (const result of integratedResults) {
        expect(result?.matchedPattern).toBe(shinhan.patterns[1]);
        expect(result?.subject?.code).toBe(prefix);
        expect(result?.score).toBe(9);
      }
      expect(legacy?.matchedPattern).toBe(shinhan.patterns[6]);
      expect(legacy?.subject?.code).toBe("901");
    },
  );
});

test("산업 010 — PDF p.1의 저축성 과목이며 기존 출금 flag는 유지한다", () => {
  // Given
  const digits = "01011111111111";

  // When
  const result = scoped("kdb", digits);

  // Then
  expect(result?.subject?.category).toBe("savings");
  expect(result?.subject?.label).toBe("저축예금");
  expect(result?.capabilities.allowsWithdrawal).toBe(true);
  expect(result?.score).toBe(14);
});

test("광주 — PDF p.8의 109는 13자리 보통예금·12자리 국고로 구분한다", () => {
  // Given
  const currentDigits = "1109111111111";
  const legacyDigits = "111109111111";

  // When
  const current = scoped("gwangju", currentDigits);
  const legacy = scoped("gwangju", legacyDigits);

  // Then
  expect(current?.subject?.category).toBe("ordinary");
  expect(current?.subject?.label).toBe("보통예금");
  expect(legacy?.subject?.category).toBe("treasury");
  expect(legacy?.subject?.label).toBe("국고");
});

test("신한 298 — PDF p.12·20의 공익신탁과 출금 제한", () => {
  // Given
  const digits = "298111111111";

  // When
  const result = scoped("shinhan", digits);

  // Then
  expect(result?.subject?.category).toBe("trust");
  expect(result?.subject?.label).toBe("청년희망펀드 공익신탁");
  expect(result?.capabilities.allowsWithdrawal).toBe(false);
});

test.each([
  ["110", "ordinary"],
  ["177", "savings"],
] as const)("신협 %s — PDF p.9의 입금전용 각주", (code, category) => {
  // Given
  const digits = code + "111111111";

  // When
  const result = scoped("shinhyup", digits);

  // Then
  expect(result?.kind).toBe("new");
  expect(result?.subject?.category).toBe(category);
  expect(result?.subject?.allowsWithdrawal).toBe(false);
  expect(result?.capabilities.allowsWithdrawal).toBe(false);
  expect(result?.capabilities.virtual).toBe(false);
  expect(result?.score).toBe(14);
});

test("케이뱅크 13자리 — PDF p.13의 전화번호 연결 형식과 입금전용", () => {
  // Given
  const digits = "0010123456789";

  // When
  const result = scoped("kbank", digits);

  // Then
  expect(result?.formatted).toBe("00-101-2345-6789");
  expect(result?.kind).toBe("incoming-only");
  expect(result?.capabilities.allowsWithdrawal).toBe(false);
  expect(result?.capabilities.virtual).toBe(false);
});

describe("HSBC — PDF p.10의 과목과 부가서비스", () => {
  for (const { category, ranges } of HSBC_SOURCE_RANGES) {
    const codes = ranges.flatMap(([from, to]) =>
      Array.from({ length: to - from + 1 }, (_, i) => String(from + i).padStart(3, "0")),
    );
    test.each(codes)(`${category} 과목 %s 는 출금 가능 과목으로 8점을 받는다`, (code) => {
      // Given
      const digits = "123123451" + code;

      // When
      const result = scoped("hsbc", digits);

      // Then
      expect(result?.subject?.code).toBe(code);
      expect(result?.subject?.category).toBe(category);
      expect(result?.capabilities.allowsWithdrawal).toBe(true);
      expect(result?.score).toBe(8);
    });
  }
  test.each([
    "020",
    "031",
    "065",
    "070",
    "071",
    "074",
    "080",
    "085",
    "090",
    "295",
    "298",
    "984",
    "995",
  ])("미열거 %s는 과목 가산점을 받지 않는다", (code) => {
    // Given
    const digits = "123123451" + code;

    // When
    const result = scoped("hsbc", digits);

    // Then
    expect(result?.subject).toBeUndefined();
    expect(result?.score).toBe(3);
  });
});
