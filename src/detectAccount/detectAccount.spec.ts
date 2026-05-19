import { describe, expect, test } from "vitest";
import { FIXTURES, type Fixture } from "../_internal/fixtures";
import { detectAccount } from "./detectAccount";

describe("detectAccount", () => {
  describe("fixture 자동 매칭", () => {
    test.each(FIXTURES as readonly Fixture[])("$input → $id ($kind)", (fixture) => {
      // given
      const input = fixture.input;

      // when
      const results = detectAccount(input);

      // then
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
      // given / when / then
      expect(detectAccount("")).toEqual([]);
      expect(detectAccount("    ")).toEqual([]);
      expect(detectAccount("---")).toEqual([]);
    });

    test("비숫자만 입력은 빈 결과를 반환한다", () => {
      // given / when / then
      expect(detectAccount("abcd")).toEqual([]);
      expect(detectAccount("한글입력")).toEqual([]);
    });

    test("한 자리만 입력은 빈 결과를 반환한다 (식별자 미달성)", () => {
      // given
      const input = "1";

      // when
      const results = detectAccount(input);

      // then
      expect(results).toEqual([]);
    });
  });

  describe("결과 형태", () => {
    test("결과는 점수 내림차순으로 정렬된다", () => {
      // given
      const input = "110-436-387740";

      // when
      const results = detectAccount(input);

      // then
      for (let i = 1; i < results.length; i += 1) {
        expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
      }
    });

    test("formatted는 매칭 패턴 기준 그루핑이다", () => {
      // given
      const input = "110436387740";

      // when
      const results = detectAccount(input);

      // then
      expect(results[0]?.formatted).toBe("110-436-387740");
    });

    test("matchedPattern 이 결과에 포함된다", () => {
      // given
      const input = "110-436-387740";

      // when
      const results = detectAccount(input);

      // then
      expect(results[0]?.matchedPattern).not.toBeNull();
    });

    test("capabilities 필드가 항상 존재한다", () => {
      // given
      const input = "110-436-387740";

      // when
      const [r] = detectAccount(input);

      // then
      expect(r?.capabilities).toBeDefined();
      expect(typeof r?.capabilities.allowsWithdrawal).toBe("boolean");
      expect(typeof r?.capabilities.virtual).toBe("boolean");
    });
  });

  describe("농협 13자리 끝자리 무관 kind=new 유지", () => {
    test.each([
      "01",
      "02",
      "03",
      "04",
      "05",
      "09",
    ])("끝자리 %s 도 보통/저축 prefix 이면 kind=new", (tail) => {
      // given
      const input = `351-1234-5678-${tail}`;

      // when
      const [r] = detectAccount(input);

      // then
      expect(r?.institution.id).toBe("nh-coop");
      expect(r?.kind).toBe("new");
    });
  });

  describe("분기 규칙 — 토스 12자리 17/19", () => {
    test("17-prefix 면 virtual 로 분기한다", () => {
      // given
      const input = "1712-3456-7890";

      // when
      const [r] = detectAccount(input);

      // then
      expect(r?.institution.id).toBe("toss");
      expect(r?.kind).toBe("virtual");
      expect(r?.capabilities.virtual).toBe(true);
    });

    test("19-prefix 면 virtual 로 분기한다", () => {
      // given
      const input = "1912-3456-7890";

      // when
      const [r] = detectAccount(input);

      // then
      expect(r?.institution.id).toBe("toss");
      expect(r?.kind).toBe("virtual");
    });

    // PDF-strict 모드에서 1000/1500 prefix 의 토스 단독 매칭은 컨슈머 (teacher-web)
    // 4자리 prefix 확장으로 보장. 라이브러리만으로는 신한 100 prefix 와 동률.
  });

  describe("회귀 가드", () => {
    test("하나 161-910278-72907 는 하나 단독 1순위", () => {
      // given
      const input = "161-910278-72907";

      // when
      const results = detectAccount(input);

      // then
      expect(results[0]?.institution.id).toBe("hana");
      expect(results[0]?.confidence).not.toBe("low");
    });
  });

  describe("categories 옵션", () => {
    test("['bank'] 이면 증권사 결과를 제외한다", () => {
      // given
      const input = "3333-12-3456789";

      // when
      const results = detectAccount(input, { categories: ["bank"] });

      // then
      expect(results.every((r) => r.institution.category === "bank")).toBe(true);
    });
  });
});
