import { describe, expect, test } from "vitest";
import { defineSubject } from "../_internal/subjects";
import type { AccountPattern, Subject } from "../types";
import { extractSubject } from "./extractSubject";

type SubjectPattern = Pick<AccountPattern, "subjectPosition" | "subjects">;

describe("extractSubject", () => {
  describe("null 반환 조건", () => {
    test("subjectPosition이 없으면 null을 반환한다", () => {
      // given
      const digits = "100123456789";
      const pattern: SubjectPattern = {
        subjects: [defineSubject({ code: "100", category: "ordinary" })],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result).toBeNull();
    });

    test("subjects가 없으면 null을 반환한다", () => {
      // given
      const digits = "100123456789";
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 3 },
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result).toBeNull();
    });

    test("subjects가 빈 배열이면 null을 반환한다", () => {
      // given
      const digits = "100123456789";
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 3 },
        subjects: [],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result).toBeNull();
    });

    test("digits가 빈 문자열이면 null을 반환한다", () => {
      // given
      const digits = "";
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 2 },
        subjects: [defineSubject({ code: "01", category: "ordinary" })],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result).toBeNull();
    });

    test("digits가 subjectPosition 끝에 도달하지 못하면 null을 반환한다", () => {
      // given
      const digits = "10";
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 3 },
        subjects: [defineSubject({ code: "100", category: "ordinary" })],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result).toBeNull();
    });

    test("추출 값이 subjects에 없으면 null을 반환한다", () => {
      // given
      const digits = "999123456789";
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 3 },
        subjects: [defineSubject({ code: "100", category: "ordinary" })],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result).toBeNull();
    });
  });

  describe("정상 추출", () => {
    test("digits가 정확히 subjectPosition 끝에 도달하면 추출한다", () => {
      // given
      const digits = "100";
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 3 },
        subjects: [defineSubject({ code: "100", category: "ordinary" })],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result?.code).toBe("100");
    });

    test("앞 3자리 추출 — 신한 12d 보통예금 '100'", () => {
      // given
      const digits = "100123456789";
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 3 },
        subjects: [defineSubject({ code: "100", category: "ordinary" })],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result?.code).toBe("100");
      expect(result?.category).toBe("ordinary");
    });

    test("중간 2자리 추출 — KB 12d 저축 '21'", () => {
      // given
      const digits = "123211234567";
      const pattern: SubjectPattern = {
        subjectPosition: { start: 3, length: 2 },
        subjects: [defineSubject({ code: "21", category: "savings" })],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result?.code).toBe("21");
      expect(result?.category).toBe("savings");
    });

    test("끝 2자리 추출 — 키움 10d 보통예금 '11'", () => {
      // given
      const digits = "1234567811";
      const pattern: SubjectPattern = {
        subjectPosition: { start: 8, length: 2 },
        subjects: [defineSubject({ code: "11", category: "ordinary" })],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result?.code).toBe("11");
      expect(result?.category).toBe("ordinary");
    });

    test("3자리 길이 추출 — 신한 12d 가계당좌 '150'", () => {
      // given
      const digits = "150123456789";
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 3 },
        subjects: [defineSubject({ code: "150", category: "current" })],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result?.code).toBe("150");
      expect(result?.category).toBe("current");
    });

    test("virtual:true 인 subject 도 그대로 반환한다", () => {
      // given
      const digits = "560123456789";
      const virtualSubject: Subject = defineSubject({
        code: "560",
        category: "ordinary",
        virtual: true,
      });
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 3 },
        subjects: [virtualSubject],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result).toEqual(virtualSubject);
    });

    test("effectiveFrom이 있는 subject도 정상 추출한다", () => {
      // given
      const digits = "92991234567";
      const datedSubject: Subject = defineSubject({
        code: "92",
        category: "ordinary",
        virtual: true,
        effectiveFrom: "2010-08-26",
      });
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 2 },
        subjects: [datedSubject],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result?.effectiveFrom).toBe("2010-08-26");
    });

    test("digits가 subjectPosition 범위보다 길어도 해당 범위만 추출한다", () => {
      // given
      const digits = "100000000000000000000";
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 3 },
        subjects: [defineSubject({ code: "100", category: "ordinary" })],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result?.code).toBe("100");
    });

    test("subjects 중 정확히 일치하는 항목만 반환한다", () => {
      // given
      const digits = "150123456789";
      const target = defineSubject({ code: "150", category: "current" });
      const pattern: SubjectPattern = {
        subjectPosition: { start: 0, length: 3 },
        subjects: [
          defineSubject({ code: "100", category: "ordinary" }),
          target,
          defineSubject({ code: "200", category: "savings" }),
        ],
      };

      // when
      const result = extractSubject(digits, pattern);

      // then
      expect(result).toBe(target);
    });
  });
});
