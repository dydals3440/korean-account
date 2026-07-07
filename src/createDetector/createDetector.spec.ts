import { describe, expect, test } from "vitest";
import { createPatternTemplate } from "../createPatternTemplate";
import type { Institution } from "../types";
import { createDetector } from "./createDetector";

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
      template: createPatternTemplate("XXX-XXX-XXXXXX"),
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
      template: createPatternTemplate("XXXX-XX-XXXXXXX"),
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
      const detector = createDetector({ institutions: [] });

      // When
      const result = detector.detect("110-436-387740");

      // Then
      expect(result).toEqual([]);
    });

    test("빈 입력은 빈 결과를 반환한다", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN] });

      // When
      const empty = detector.detect("");
      const whitespace = detector.detect("   ");

      // Then
      expect(empty).toEqual([]);
      expect(whitespace).toEqual([]);
    });

    test("매칭되는 institution을 점수 내림차순으로 반환한다", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN, KAKAO] });

      // When
      const results = detector.detect("110-436-387740");

      // Then
      expect(results[0]?.institution.id).toBe("shinhan");
      expect(results[0]?.confidence).toBe("high");
      expect(results[0]?.kind).toBe("new");
    });

    test("결과에 capabilities 필드가 포함된다", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN] });

      // When
      const [r] = detector.detect("110-436-387740");

      // Then
      expect(r?.capabilities).toEqual({
        allowsWithdrawal: true,
        virtual: false,
        validatedCheckDigit: null,
      });
    });
  });

  describe("옵션 필터", () => {
    test("minScore — 미만 결과 제외", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN] });

      // When
      const results = detector.detect("110-436-387740", { minScore: 100 });

      // Then
      expect(results).toEqual([]);
    });

    test("minScore = 0 — 모든 매칭 후보 통과", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN] });

      // When
      const results = detector.detect("110-436-387740", { minScore: 0 });

      // Then
      expect(results.length).toBeGreaterThan(0);
    });

    test("limit — 결과 개수 제한 (limit=1)", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN, KAKAO] });

      // When
      const results = detector.detect("110-436-387740", { limit: 1 });

      // Then
      expect(results.length).toBe(1);
    });

    test("limit이 결과 수보다 크면 가능한 만큼만 반환한다", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN] });

      // When
      const results = detector.detect("110-436-387740", { limit: 100 });

      // Then
      expect(results.length).toBeLessThanOrEqual(100);
      expect(results.length).toBeGreaterThan(0);
    });

    test("categories — 카테고리 일치만", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN, KAKAO] });

      // When
      const results = detector.detect("3333-12-3456789", {
        categories: ["securities"],
      });

      // Then
      expect(results).toEqual([]);
    });

    test("kinds — kind 일치만", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN, KAKAO] });

      // When
      const results = detector.detect("110-436-387740", { kinds: ["old"] });

      // Then
      expect(results).toEqual([]);
    });

    test("include + exclude — exclude가 include를 덮어쓴다", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN, KAKAO] });

      // When
      const results = detector.detect("110-436-387740", {
        include: ["shinhan", "kakao"],
        exclude: ["shinhan"],
      });

      // Then
      expect(results.every((r) => r.institution.id !== "shinhan")).toBe(true);
    });

    test("categories + kinds 동시 필터", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN, KAKAO] });

      // When
      const results = detector.detect("110-436-387740", {
        categories: ["bank"],
        kinds: ["new"],
      });

      // Then
      expect(results.every((r) => r.institution.category === "bank")).toBe(true);
      expect(results.every((r) => r.kind === "new")).toBe(true);
    });
  });

  describe("동점 처리", () => {
    test("점수 동점이면 priority 내림차순으로 정렬한다", () => {
      // Given
      const a: Institution = { ...SHINHAN, id: "a", priority: 10 };
      const b: Institution = { ...SHINHAN, id: "b", priority: 50 };
      const c: Institution = { ...SHINHAN, id: "c", priority: 30 };
      const detector = createDetector({ institutions: [a, b, c] });

      // When
      const results = detector.detect("110-436-387740");

      // Then
      expect(results.map((r) => r.institution.id)).toEqual(["b", "c", "a"]);
    });
  });
});

describe("detector.extend", () => {
  test("새 institution이 추가된 detector를 반환한다", () => {
    // Given
    const base = createDetector({ institutions: [SHINHAN] });

    // When
    const extended = base.extend({ institutions: [KAKAO] });

    // Then
    expect(extended.institutions.length).toBe(2);
    expect(extended.detect("3333-12-3456789")[0]?.institution.id).toBe("kakao");
  });

  test("원본 detector는 변경되지 않는다 (immutability)", () => {
    // Given
    const base = createDetector({ institutions: [SHINHAN] });

    // When
    base.extend({ institutions: [KAKAO] });

    // Then
    expect(base.institutions.length).toBe(1);
  });

  test("globalRules 도 누적된다", () => {
    // Given
    const base = createDetector({
      institutions: [SHINHAN],
      globalRules: [() => true],
      scoring: { globalRule: 5 },
    });

    // When
    const extended = base.extend({ globalRules: [() => true] });

    // Then — 기존 1개 + 추가 1개 = globalRule 가산 2회 발생해야 함
    // length 3 + identifier 4 + 길이 보너스(3자리=2) + globalRule 5 × 2
    const [r] = extended.detect("110-436-387740");
    expect(r?.score).toBe(3 + 4 + 2 + 5 * 2);
  });
});

describe("detector.remove", () => {
  test("id로 institution을 제거한다", () => {
    // Given
    const base = createDetector({ institutions: [SHINHAN, KAKAO] });

    // When
    const trimmed = base.remove("kakao");

    // Then
    expect(trimmed.institutions.map((i) => i.id)).toEqual(["shinhan"]);
  });

  test("predicate로 institution을 제거한다", () => {
    // Given
    const base = createDetector({ institutions: [SHINHAN, KAKAO] });

    // When
    const trimmed = base.remove((i) => i.priority === 90);

    // Then
    expect(trimmed.institutions.map((i) => i.id)).toEqual(["shinhan"]);
  });

  test("원본은 변경되지 않는다 (immutability)", () => {
    // Given
    const base = createDetector({ institutions: [SHINHAN, KAKAO] });

    // When
    base.remove("kakao");

    // Then
    expect(base.institutions.length).toBe(2);
  });
});

describe("scoring override", () => {
  test("identifierMatch override가 적용된다", () => {
    // Given
    const detector = createDetector({
      institutions: [SHINHAN],
      scoring: { identifierMatch: 0 },
    });

    // When
    const [r] = detector.detect("110-436-387740");

    // Then — identifierMatch=0이면 길이만 +3
    expect(r?.score).toBe(3);
  });

  test("kindNewBonus override로 신계좌 가산점을 부여한다", () => {
    // Given
    const detector = createDetector({
      institutions: [SHINHAN],
      scoring: { kindNewBonus: 1 },
    });

    // When
    const [r] = detector.detect("110-436-387740");

    // Then — length +3, identifier +4, 길이 보너스(3자리=2), kindNew +1
    expect(r?.score).toBe(3 + 4 + 2 + 1);
  });

  describe("extend — 같은 id 가 들어오면 기존 institution 을 교체한다", () => {
    test("동일 id 로 extend 하면 incoming 가 기존을 replace 한다", () => {
      // Given
      const baseline = createDetector({ institutions: [SHINHAN] });
      const replacement: Institution = {
        ...SHINHAN,
        nameKo: "신한은행 (교체본)",
        patterns: [
          {
            template: createPatternTemplate("XXX-XXX-XXXXXX"),
            kind: "new",
            identifierPosition: { start: 0, length: 3 },
            identifiers: ["999"], // 일부러 다른 prefix
          },
        ],
      };
      const extended = baseline.extend({ institutions: [replacement] });

      // When
      const replacedHit = extended.detect("999-436-387740");

      // Then — replacement 가 999 prefix 로 매칭되고 이름도 교체된 본
      expect(replacedHit[0]?.institution.id).toBe("shinhan");
      expect(replacedHit[0]?.institution.nameKo).toBe("신한은행 (교체본)");
    });

    test("동일 id 로 extend 후 institutions 길이는 1 (중복 없음)", () => {
      // Given
      const baseline = createDetector({ institutions: [SHINHAN] });
      const replacement: Institution = { ...SHINHAN, nameKo: "교체본" };

      // When
      const extended = baseline.extend({ institutions: [replacement] });

      // Then — silent duplicate 가 생기지 않고 1개만 남음
      expect(extended.institutions.length).toBe(1);
      expect(extended.institutions[0]?.nameKo).toBe("교체본");
    });

    test("새 id 로 extend 하면 기존 institutions 와 병합된다", () => {
      // Given
      const detector = createDetector({ institutions: [SHINHAN] }).extend({
        institutions: [KAKAO],
      });

      // When
      const shinhanHit = detector.detect("110-436-387740");
      const kakaoHit = detector.detect("3333-12-3456789");

      // Then — 둘 다 매칭
      expect(shinhanHit[0]?.institution.id).toBe("shinhan");
      expect(kakaoHit[0]?.institution.id).toBe("kakao");
    });

    test("extend 는 immutable — 원본 detector 의 institutions 는 보존된다", () => {
      // Given
      const baseline = createDetector({ institutions: [SHINHAN] });

      // When
      baseline.extend({ institutions: [KAKAO] });

      // Then — 원본 detector 의 institutions 는 1건 그대로
      expect(baseline.institutions.length).toBe(1);
      expect(baseline.institutions[0]?.id).toBe("shinhan");
    });
  });
});
