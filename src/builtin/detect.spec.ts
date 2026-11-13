import { describe, expect, expectTypeOf, test } from "vitest";

import type { RegisteredInstitution } from "../registry";
import type { DetectionResult } from "../types";
import { detect, detectBest } from "./detect";
import { FIXTURES, type Fixture } from "./detect.fixtures";

describe("detect", () => {
  describe("fixture 자동 매칭", () => {
    test.each(FIXTURES as readonly Fixture[])("$input → $id ($kind)", (fixture) => {
      // Given
      const input = fixture.input;

      // When
      const results = detect(input);

      // Then
      expect(results[0]?.institution.id).toBe(fixture.id);
      if (fixture.kind) {
        expect(results[0]?.kind).toBe(fixture.kind);
      }
      if (fixture.subjectCategory) {
        expect(results[0]?.subject?.category).toBe(fixture.subjectCategory);
      }
    });
  });

  describe("엣지 케이스", () => {
    test("빈 / 공백 / 하이픈만 입력은 빈 결과를 반환한다", () => {
      // Given
      const inputs = ["", "    ", "---"];

      // When
      const resultsPerInput = inputs.map((input) => detect(input));

      // Then
      for (const results of resultsPerInput) {
        expect(results).toEqual([]);
      }
    });

    test("비숫자만 입력은 빈 결과를 반환한다", () => {
      // Given
      const inputs = ["abcd", "한글입력"];

      // When
      const resultsPerInput = inputs.map((input) => detect(input));

      // Then
      for (const results of resultsPerInput) {
        expect(results).toEqual([]);
      }
    });

    test("한 자리만 입력은 빈 결과를 반환한다 (식별자 미달성)", () => {
      // Given
      const input = "1";

      // When
      const results = detect(input);

      // Then
      expect(results).toEqual([]);
    });
  });

  describe("결과 형태", () => {
    test("결과는 점수 내림차순으로 정렬된다", () => {
      // Given
      const input = "110-436-387740";

      // When
      const results = detect(input);

      // Then
      for (let i = 1; i < results.length; i += 1) {
        expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
      }
    });

    test("formatted는 매칭 패턴 기준 그루핑이다", () => {
      // Given
      const input = "110436387740";

      // When
      const results = detect(input);

      // Then
      expect(results[0]?.formatted).toBe("110-436-387740");
    });

    test("matchedPattern 이 결과에 포함된다", () => {
      // Given
      const input = "110-436-387740";

      // When
      const results = detect(input);

      // Then
      expect(results[0]?.matchedPattern).not.toBeNull();
    });

    test("capabilities 필드가 항상 존재한다", () => {
      // Given
      const input = "110-436-387740";

      // When
      const [result] = detect(input);

      // Then
      expect(result?.capabilities).toBeDefined();
      expect(typeof result?.capabilities.allowsWithdrawal).toBe("boolean");
      expect(typeof result?.capabilities.virtual).toBe("boolean");
    });
  });

  describe("농협 13자리 계좌구분 게이트 (PDF p.4)", () => {
    test.each(["03", "04", "05"])("끝자리 %s → 농협중앙회 kind=new", (tail) => {
      // Given
      const input = `351-1234-5678-${tail}`;

      // When
      const [result] = detect(input);

      // Then
      expect(result?.institution.id).toBe("nh-coop");
      expect(result?.kind).toBe("new");
    });

    test.each(["01", "02"])(
      "끝자리 %s (은행 소유 구분) 은 중앙회 351 prefix 와 매칭되지 않는다",
      (tail) => {
        // Given
        const input = `351-1234-5678-${tail}`;

        // When
        const results = detect(input);

        // Then
        expect(results.find((result) => result.institution.id === "nh-coop")).toBeUndefined();
      },
    );
  });

  describe("분기 규칙 — 토스 12자리 17/19", () => {
    test("17-prefix 면 virtual 로 분기한다", () => {
      // Given
      const input = "1712-3456-7890";

      // When
      const [result] = detect(input);

      // Then
      expect(result?.institution.id).toBe("toss");
      expect(result?.kind).toBe("virtual");
      expect(result?.capabilities.virtual).toBe(true);
    });

    test("19-prefix 면 virtual 로 분기한다", () => {
      // Given
      const input = "1912-3456-7890";

      // When
      const [result] = detect(input);

      // Then
      expect(result?.institution.id).toBe("toss");
      expect(result?.kind).toBe("virtual");
    });

    // No 1000/1500 case: the library alone ties Toss with Shinhan's 100; consumers break the tie.
  });

  describe("회귀 가드", () => {
    test("하나 161-910278-72907 는 하나 단독 1순위", () => {
      // Given
      const input = "161-910278-72907";

      // When
      const results = detect(input);

      // Then
      expect(results[0]?.institution.id).toBe("hana");
      expect(results[0]?.confidence).not.toBe("low");
    });
  });

  describe("categories 옵션", () => {
    test("['bank'] 이면 증권사 결과를 제외한다", () => {
      // Given
      const input = "3333-12-3456789";

      // When
      const results = detect(input, { categories: ["bank"] });

      // Then
      expect(results.every((result) => result.institution.category === "bank")).toBe(true);
    });
  });
});

describe("detectBest", () => {
  describe("성공 케이스", () => {
    test("매칭이 있으면 1순위 DetectionResult 를 반환한다", () => {
      // Given
      const input = "110-436-387740";

      // When
      const result = detectBest(input);

      // Then
      expect(result).not.toBeNull();
      expect(result?.institution.id).toBe("shinhan");
    });

    test("categories 옵션을 전달하면 해당 카테고리의 1순위를 반환한다", () => {
      // Given
      const input = "3333-12-3456789";

      // When
      const result = detectBest(input, { categories: ["bank"] });

      // Then
      expect(result?.institution.category).toBe("bank");
    });
  });

  describe("실패 케이스", () => {
    test("빈 입력이면 null 을 반환한다", () => {
      // Given
      const input = "";

      // When
      const result = detectBest(input);

      // Then
      expect(result).toBeNull();
    });

    test("비숫자 입력이면 null 을 반환한다", () => {
      // Given
      const input = "abcd";

      // When
      const result = detectBest(input);

      // Then
      expect(result).toBeNull();
    });

    test("minScore 가 너무 높아 매칭이 없으면 null 을 반환한다", () => {
      // Given
      const input = "1";

      // When
      const result = detectBest(input, { minScore: 100 });

      // Then
      expect(result).toBeNull();
    });
  });

  describe("타입 narrow", () => {
    test("반환 타입이 DetectionResult<RegisteredInstitution> | null 이다", () => {
      // Given
      const input = "110-436-387740";

      // When
      const result = detectBest(input);

      // Then
      expectTypeOf(result).toEqualTypeOf<DetectionResult<RegisteredInstitution> | null>();
    });
  });
});
