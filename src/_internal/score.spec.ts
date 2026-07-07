import { describe, expect, test } from "vitest";
import { createPatternTemplate } from "../createPatternTemplate";
import type { Institution } from "../types";
import { DEFAULT_WEIGHTS, scoreInstitution } from "./score";

function makeInstitution(patterns: Institution["patterns"]): Institution {
  return {
    id: "test",
    code: "999",
    nameKo: "테스트",
    nameEn: "Test",
    category: "bank",
    aliases: [],
    patterns,
  };
}

const W = DEFAULT_WEIGHTS;

/** 정확 길이 매칭일 때의 identifier/subject 길이 보너스 — `len - 1`. */
function lengthBonus(len: number): number {
  return Math.max(0, len - 1);
}

describe("scoreInstitution", () => {
  describe("빈 입력 / 빈 패턴", () => {
    test("빈 digits면 0점과 디지트 그대로 formatted를 반환한다", () => {
      // Given
      const institution = makeInstitution([
        { template: createPatternTemplate("XXX-XXX-XXXXXX"), kind: "old" },
      ]);

      // When
      const result = scoreInstitution("", institution, []);

      // Then
      expect(result.score).toBe(0);
      expect(result.matchedPattern).toBeNull();
      expect(result.formatted).toBe("");
    });

    test("institution.patterns 가 비어 있으면 0점", () => {
      // Given
      const institution = makeInstitution([]);

      // When
      const result = scoreInstitution("110436387740", institution, []);

      // Then
      expect(result.score).toBe(0);
      expect(result.matchedPattern).toBeNull();
    });
  });

  describe("길이 매칭", () => {
    test("자릿수가 정확히 일치하면 lengthExact 가중치를 부여한다 (old 패턴)", () => {
      // Given
      const digits = "123456789012";
      const institution = makeInstitution([
        { template: createPatternTemplate("XXX-XXX-XXXXXX"), kind: "old" },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then
      expect(result.score).toBe(W.lengthExact);
    });

    test("자릿수 정확 — kind=new 도 동일 점수 (kindNewBonus 기본 0)", () => {
      // Given
      const digits = "123456789012";
      const institution = makeInstitution([
        { template: createPatternTemplate("XXX-XXX-XXXXXX"), kind: "new" },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then
      expect(result.score).toBe(W.lengthExact + W.kindNewBonus);
    });

    test("자릿수가 -1이면 lengthNear 가중치만 부여한다", () => {
      // Given
      const digits = "12345678901";
      const institution = makeInstitution([
        { template: createPatternTemplate("XXX-XXX-XXXXXX"), kind: "old" },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then
      expect(result.score).toBe(W.lengthNear);
    });

    test("자릿수가 +1이면 lengthNear 가중치만 부여한다", () => {
      // Given
      const digits = "1234567890123";
      const institution = makeInstitution([
        { template: createPatternTemplate("XXX-XXX-XXXXXX"), kind: "old" },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then
      expect(result.score).toBe(W.lengthNear);
    });

    test("자릿수 차이가 2 이상이면 0점", () => {
      // Given
      const institution = makeInstitution([
        { template: createPatternTemplate("XXX-XXX-XXXXXX"), kind: "old" },
      ]);

      // When
      const tooShort = scoreInstitution("1234567890", institution, []);
      const tooLong = scoreInstitution("12345678901234", institution, []);

      // Then
      expect(tooShort.score).toBe(0);
      expect(tooLong.score).toBe(0);
    });
  });

  describe("identifier 매칭", () => {
    test("prefix 식별 매칭 시 identifierMatch 가중치 가산", () => {
      // Given
      const digits = "110436387740";
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXX-XXX-XXXXXX"),
          kind: "old",
          identifierPosition: { start: 0, length: 3 },
          identifiers: ["110"],
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then — 3자리 식별자 → 보너스 +2
      expect(result.score).toBe(W.lengthExact + W.identifierMatch + lengthBonus(3));
    });

    test("중간 식별 매칭 — KB 14자리 과목 위치", () => {
      // Given
      const digits = "12345604789012";
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXXXXX-XX-XXXXXX"),
          kind: "new",
          identifierPosition: { start: 6, length: 2 },
          identifiers: ["04"],
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then — 2자리 식별자 → 보너스 +1
      expect(result.score).toBe(W.lengthExact + W.identifierMatch + lengthBonus(2));
    });

    test("identifierRange 범위 안이면 매칭으로 인정한다", () => {
      // Given
      const digits = "550436387740";
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXX-XXX-XXXXXX"),
          kind: "old",
          identifierPosition: { start: 0, length: 3 },
          identifierRange: { from: 500, to: 599 },
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then — identifierRange 3자리 → 보너스 +2
      expect(result.score).toBe(W.lengthExact + W.identifierMatch + lengthBonus(3));
    });

    test("identifier 부분 입력은 절반 점수만 부여한다", () => {
      // Given
      const digits = "110";
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXX-XXX-XXXXXX"),
          kind: "new",
          identifierPosition: { start: 0, length: 3 },
          identifiers: ["110"],
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then — 부분 입력: 기본 점수 절반 + 길이 보너스(3자리=2) 절반
      expect(result.score).toBe(Math.floor(W.identifierMatch / 2) + Math.floor(lengthBonus(3) / 2));
    });
  });

  describe("subject 매칭", () => {
    test("subject 코드 일치 시 subjectMatch 가중치 가산", () => {
      // Given
      const digits = "12345604789012";
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXXXXX-XX-XXXXXX"),
          kind: "new",
          subjectPosition: { start: 6, length: 2 },
          subjects: [{ code: "04", category: "free-savings" }],
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then — 2자리 과목 → 보너스 +1
      expect(result.subject?.code).toBe("04");
      expect(result.score).toBe(W.lengthExact + W.subjectMatch + lengthBonus(2));
    });

    test("subject 코드 불일치 시 subject는 null, 가산 없음", () => {
      // Given
      const digits = "12345699789012";
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXXXXX-XX-XXXXXX"),
          kind: "old",
          subjectPosition: { start: 6, length: 2 },
          subjects: [{ code: "04", category: "free-savings" }],
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then
      expect(result.subject).toBeNull();
      expect(result.score).toBe(W.lengthExact);
    });

    test("subject 부분 입력은 절반 점수만 부여한다", () => {
      // Given — digits 가 subjectPosition 끝(8)에 막 도달, 템플릿 14d 보다 짧음
      const digits = "12345604";
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXXXXX-XX-XXXXXX"),
          kind: "new",
          subjectPosition: { start: 6, length: 2 },
          subjects: [{ code: "04", category: "free-savings" }],
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then — 부분 입력: 기본 점수 절반 + 길이 보너스(2자리=1) 절반
      expect(result.subject?.code).toBe("04");
      expect(result.score).toBe(Math.floor(W.subjectMatch / 2) + Math.floor(lengthBonus(2) / 2));
    });
  });

  describe("양방향 길이 가드 (회귀 가드)", () => {
    test("입력이 템플릿보다 훨씬 길면 우연한 identifier 일치를 무시한다", () => {
      // Given — 14d 입력, 11d 템플릿
      const digits = "97202762901013";
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXX-XX-XXXXXX"),
          kind: "old",
          identifierPosition: { start: 3, length: 2 },
          identifiers: ["02"],
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then
      expect(result.score).toBe(0);
    });

    test("입력이 템플릿보다 훨씬 짧아도 identifier 영역을 지나면 절반 매칭", () => {
      // Given
      const digits = "110";
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXX-XXX-XXXXXX"),
          kind: "new",
          identifierPosition: { start: 0, length: 3 },
          identifiers: ["110"],
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then — 부분 입력: 기본 점수 절반 + 길이 보너스(3자리=2) 절반
      expect(result.score).toBe(Math.floor(W.identifierMatch / 2) + Math.floor(lengthBonus(3) / 2));
    });
  });

  describe("additionalRules", () => {
    test("통과한 룰 1개당 additionalRule 가중치 가산", () => {
      // Given
      const digits = "110436387740";
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXX-XXX-XXXXXX"),
          kind: "old",
          additionalRules: [
            (d) => d.startsWith("1"),
            (d) => d.length === 12,
            (d) => d.endsWith("0"),
          ],
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then
      expect(result.score).toBe(W.lengthExact + 3 * W.additionalRule);
    });

    test("자릿수가 일치하는 입력에 대해 가드가 실패하면 패턴이 매칭되지 않는다", () => {
      // Given — additionalRules 는 PDF·실세계 도메인 제약을 매칭 조건으로 갖는다.
      // 자릿수가 일치하는 부분 입력 까지는 가드를 적용해 부적합 패턴을 후보에서 빼고,
      // 통과 시에만 룰 1건당 가산점도 함께 부여한다.
      const digits = "110436387740";
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXX-XXX-XXXXXX"),
          kind: "old",
          additionalRules: [(d) => d.startsWith("999")],
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then
      expect(result.score).toBe(0);
    });

    test("자릿수가 한참 짧은 부분 입력에는 가드를 면제 — 사용자가 입력 중인 경우 보호", () => {
      // Given — 가드 적용 범위는 ±1 자리. 그보다 짧으면 가드를 평가할 정보가
      // 부족해 면제. 단 가드 면제 시에는 통과 가산도 면제 (점수 인플레이션 방지).
      const digits = "11"; // expected 12 보다 10자리 짧음
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXX-XXX-XXXXXX"),
          kind: "old",
          additionalRules: [(d) => d.startsWith("999")],
        },
      ]);

      // When
      const result = scoreInstitution(digits, institution, []);

      // Then — length-near 도 아니므로 모든 가산 면제, score 0.
      expect(result.score).toBe(0);
    });
  });

  describe("globalRules", () => {
    test("패턴 점수가 0보다 클 때만 globalRule이 가산된다", () => {
      // Given
      const institution = makeInstitution([
        {
          template: createPatternTemplate("XXX-XXX-XXXXXX"),
          kind: "old",
          identifierPosition: { start: 0, length: 3 },
          identifiers: ["110"],
        },
      ]);

      // When
      const noMatch = scoreInstitution("999999999", institution, [() => true]);
      const matched = scoreInstitution("110436387740", institution, [() => true, () => true]);

      // Then — 3자리 식별자 → 보너스 +2 포함
      expect(noMatch.score).toBe(0);
      expect(matched.score).toBe(
        W.lengthExact + W.identifierMatch + lengthBonus(3) + 2 * W.globalRule,
      );
    });
  });

  describe("kindNewBonus override", () => {
    test("kindNewBonus 가중치를 override 하면 kind=new 패턴에만 가산된다", () => {
      // Given
      const digits = "123456789012";
      const newInstitution = makeInstitution([
        { template: createPatternTemplate("XXX-XXX-XXXXXX"), kind: "new" },
      ]);
      const oldInstitution = makeInstitution([
        { template: createPatternTemplate("XXX-XXX-XXXXXX"), kind: "old" },
      ]);
      const weights = { ...W, kindNewBonus: 2 };

      // When
      const newResult = scoreInstitution(digits, newInstitution, [], weights);
      const oldResult = scoreInstitution(digits, oldInstitution, [], weights);

      // Then
      expect(newResult.score).toBe(W.lengthExact + 2);
      expect(oldResult.score).toBe(W.lengthExact);
    });
  });
});
