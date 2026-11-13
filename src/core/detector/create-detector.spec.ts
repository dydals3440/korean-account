import { describe, expect, test } from "vitest";

import type { Institution } from "../../types";
import { patternTemplate } from "../define/pattern-template";
import { createDetector } from "./create-detector";

const SHINHAN: Institution = {
  id: "shinhan",
  code: "088",
  nameKo: "신한은행",
  nameEn: "Shinhan Bank",
  category: "bank",
  aliases: [],
  priority: 100,
  patterns: [
    {
      template: patternTemplate("XXX-XXX-XXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["110"],
    },
  ],
};

const KAKAO: Institution = {
  id: "kakao",
  code: "090",
  nameKo: "카카오뱅크",
  nameEn: "Kakao",
  category: "bank",
  aliases: [],
  priority: 90,
  patterns: [
    {
      template: patternTemplate("XXXX-XX-XXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["3333"],
    },
  ],
};

describe("createDetector", () => {
  describe("기본 동작", () => {
    test("institutions 없이 (빈 배열) 생성 가능하고 모든 입력에 빈 결과를 반환한다", () => {
      // Given
      const detector = createDetector([]);

      // When
      const result = detector.detect("110-436-387740");

      // Then
      expect(result).toEqual([]);
    });

    test("빈 입력은 빈 결과를 반환한다", () => {
      // Given
      const detector = createDetector([SHINHAN]);

      // When
      const empty = detector.detect("");
      const whitespace = detector.detect("   ");

      // Then
      expect(empty).toEqual([]);
      expect(whitespace).toEqual([]);
    });

    test("매칭되는 institution을 점수 내림차순으로 반환한다", () => {
      // Given
      const detector = createDetector([SHINHAN, KAKAO]);

      // When
      const results = detector.detect("110-436-387740");

      // Then
      expect(results[0]?.institution.id).toBe("shinhan");
      expect(results[0]?.confidence).toBe("high");
      expect(results[0]?.kind).toBe("new");
    });

    test("결과에 capabilities 필드가 포함된다", () => {
      // Given
      const detector = createDetector([SHINHAN]);

      // When
      const [result] = detector.detect("110-436-387740");

      // Then
      expect(result?.capabilities).toEqual({
        allowsWithdrawal: true,
        virtual: false,
        validatedCheckDigit: null,
      });
    });
  });

  describe("옵션 필터", () => {
    test("minScore 미만인 결과는 제외한다", () => {
      // Given
      const detector = createDetector([SHINHAN]);

      // When
      const results = detector.detect("110-436-387740", { minScore: 100 });

      // Then
      expect(results).toEqual([]);
    });

    test("minScore 가 0 이면 모든 매칭 후보를 반환한다", () => {
      // Given
      const detector = createDetector([SHINHAN]);

      // When
      const results = detector.detect("110-436-387740", { minScore: 0 });

      // Then
      expect(results.length).toBeGreaterThan(0);
    });

    test("limit=1 이면 결과를 1개만 반환한다", () => {
      // Given
      const detector = createDetector([SHINHAN, KAKAO]);

      // When
      const results = detector.detect("110-436-387740", { limit: 1 });

      // Then
      expect(results.length).toBe(1);
    });

    test("limit이 결과 수보다 크면 가능한 만큼만 반환한다", () => {
      // Given
      const detector = createDetector([SHINHAN]);

      // When
      const results = detector.detect("110-436-387740", { limit: 100 });

      // Then
      expect(results.length).toBeLessThanOrEqual(100);
      expect(results.length).toBeGreaterThan(0);
    });

    test("categories 와 일치하지 않는 기관은 제외한다", () => {
      // Given
      const detector = createDetector([SHINHAN, KAKAO]);

      // When
      const results = detector.detect("3333-12-3456789", {
        categories: ["securities"],
      });

      // Then
      expect(results).toEqual([]);
    });

    test("kinds 와 일치하지 않는 kind 는 제외한다", () => {
      // Given
      const detector = createDetector([SHINHAN, KAKAO]);

      // When
      const results = detector.detect("110-436-387740", { kinds: ["old"] });

      // Then
      expect(results).toEqual([]);
    });

    test("include + exclude — exclude가 include를 덮어쓴다", () => {
      // Given
      const detector = createDetector([SHINHAN, KAKAO]);

      // When
      const results = detector.detect("110-436-387740", {
        include: ["shinhan", "kakao"],
        exclude: ["shinhan"],
      });

      // Then
      expect(results.every((result) => result.institution.id !== "shinhan")).toBe(true);
    });

    test("categories 와 kinds 를 함께 지정하면 둘 다 만족하는 결과만 반환한다", () => {
      // Given
      const detector = createDetector([SHINHAN, KAKAO]);

      // When
      const results = detector.detect("110-436-387740", {
        categories: ["bank"],
        kinds: ["new"],
      });

      // Then
      expect(results.every((result) => result.institution.category === "bank")).toBe(true);
      expect(results.every((result) => result.kind === "new")).toBe(true);
    });
  });

  describe("동점 처리", () => {
    test("점수 동점이면 priority 내림차순으로 정렬한다", () => {
      // Given
      const lowPriority: Institution = { ...SHINHAN, id: "a", priority: 10 };
      const highPriority: Institution = { ...SHINHAN, id: "b", priority: 50 };
      const midPriority: Institution = { ...SHINHAN, id: "c", priority: 30 };
      const detector = createDetector([lowPriority, highPriority, midPriority]);

      // When
      const results = detector.detect("110-436-387740");

      // Then
      expect(results.map((result) => result.institution.id)).toEqual(["b", "c", "a"]);
    });
  });
});

describe("detector.extend", () => {
  test("새 institution이 추가된 detector를 반환한다", () => {
    // Given
    const base = createDetector([SHINHAN]);

    // When
    const extended = base.extend({ institutions: [KAKAO] });
    const results = extended.detect("3333-12-3456789");

    // Then
    expect(extended.institutions.length).toBe(2);
    expect(results[0]?.institution.id).toBe("kakao");
  });

  test("원본 detector는 변경되지 않는다 (immutability)", () => {
    // Given
    const base = createDetector([SHINHAN]);

    // When
    base.extend({ institutions: [KAKAO] });

    // Then
    expect(base.institutions.length).toBe(1);
  });

  test("globalRules 를 기존 규칙에 누적한다", () => {
    // Given
    const base = createDetector([SHINHAN], {
      globalRules: [() => true],
      scoring: { globalRule: 5 },
    });

    // When
    const extended = base.extend({ globalRules: [() => true] });
    const [result] = extended.detect("110-436-387740");

    // Then — length 3 + identifier 4 + length bonus 2 + globalRule 5 × 2 (1 existing + 1 added)
    expect(result?.score).toBe(3 + 4 + 2 + 5 * 2);
  });
});

describe("detector.remove", () => {
  test("id로 institution을 제거한다", () => {
    // Given
    const base = createDetector([SHINHAN, KAKAO]);

    // When
    const trimmed = base.remove("kakao");

    // Then
    expect(trimmed.institutions.map((institution) => institution.id)).toEqual(["shinhan"]);
  });

  test("predicate로 institution을 제거한다", () => {
    // Given
    const base = createDetector([SHINHAN, KAKAO]);

    // When
    const trimmed = base.remove((institution) => institution.priority === 90);

    // Then
    expect(trimmed.institutions.map((institution) => institution.id)).toEqual(["shinhan"]);
  });

  test("원본은 변경되지 않는다 (immutability)", () => {
    // Given
    const base = createDetector([SHINHAN, KAKAO]);

    // When
    base.remove("kakao");

    // Then
    expect(base.institutions.length).toBe(2);
  });
});

describe("scoring override", () => {
  test("identifierMatch 를 0 으로 override 하면 길이 점수만 남는다", () => {
    // Given
    const detector = createDetector([SHINHAN], {
      scoring: { identifierMatch: 0 },
    });

    // When
    const [result] = detector.detect("110-436-387740");

    // Then — lengthExact 3 only
    expect(result?.score).toBe(3);
  });

  test("kindNewBonus override로 신계좌 가산점을 부여한다", () => {
    // Given
    const detector = createDetector([SHINHAN], {
      scoring: { kindNewBonus: 1 },
    });

    // When
    const [result] = detector.detect("110-436-387740");

    // Then — length 3 + identifier 4 + length bonus 2 + kindNew 1
    expect(result?.score).toBe(3 + 4 + 2 + 1);
  });

  describe("extend — 같은 id 가 들어오면 기존 institution 을 교체한다", () => {
    test("동일 id 로 extend 하면 incoming 가 기존을 replace 한다", () => {
      // Given
      const baseline = createDetector([SHINHAN]);
      const replacement: Institution = {
        ...SHINHAN,
        nameKo: "신한은행 (교체본)",
        patterns: [
          {
            template: patternTemplate("XXX-XXX-XXXXXX"),
            kind: "new",
            identifierPosition: { start: 0, length: 3 },
            identifiers: ["999"], // deliberately different prefix
          },
        ],
      };
      const extended = baseline.extend({ institutions: [replacement] });

      // When
      const results = extended.detect("999-436-387740");

      // Then
      expect(results[0]?.institution.id).toBe("shinhan");
      expect(results[0]?.institution.nameKo).toBe("신한은행 (교체본)");
    });

    test("동일 id 로 extend 하면 중복 없이 institution 1개만 남는다", () => {
      // Given
      const baseline = createDetector([SHINHAN]);
      const replacement: Institution = { ...SHINHAN, nameKo: "교체본" };

      // When
      const extended = baseline.extend({ institutions: [replacement] });

      // Then
      expect(extended.institutions.length).toBe(1);
      expect(extended.institutions[0]?.nameKo).toBe("교체본");
    });

    test("새 id 로 extend 하면 기존 institutions 와 병합된다", () => {
      // Given
      const detector = createDetector([SHINHAN]).extend({
        institutions: [KAKAO],
      });

      // When
      const shinhanHit = detector.detect("110-436-387740");
      const kakaoHit = detector.detect("3333-12-3456789");

      // Then
      expect(shinhanHit[0]?.institution.id).toBe("shinhan");
      expect(kakaoHit[0]?.institution.id).toBe("kakao");
    });

    test("extend 는 immutable — 원본 detector 의 institutions 는 보존된다", () => {
      // Given
      const baseline = createDetector([SHINHAN]);

      // When
      baseline.extend({ institutions: [KAKAO] });

      // Then
      expect(baseline.institutions.length).toBe(1);
      expect(baseline.institutions[0]?.id).toBe("shinhan");
    });
  });
});
