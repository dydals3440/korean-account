import { describe, expect, test } from "vitest";

import { institutions } from ".";
import { templateLength } from "../core/account/template-length";

// Registry data files are filled in by hand from the PDF. A broken invariant
// fails silently at runtime (the score bonus just becomes 0), so it is
// checked explicitly here.
//
// Note: "position present without subjects/identifiers" is NOT a violation.
// 0.1.0 misjudged it as one and deleted 4 such fields, which changed the
// output of the public API `extractIdentifier`; 0.1.1 reverted. The
// invariants hold in one direction only.

const patterns = institutions.flatMap((institution) =>
  institution.patterns.map((pattern) => ({ institution, pattern })),
);

describe("institution 레지스트리 불변식", () => {
  test("id 가 중복되지 않는다", () => {
    // Given
    const ids = institutions.map((institution) => institution.id);

    // When
    const uniqueIds = new Set(ids);

    // Then
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("대표 code 와 aliasCode 를 통틀어 중복되지 않는다", () => {
    // Given
    const codes = institutions.flatMap((institution) => [
      institution.code,
      ...(institution.aliasCodes ?? []),
    ]);

    // When
    const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);

    // Then
    expect(duplicates).toEqual([]);
  });

  test("successorOf 는 자기 자신을 가리키지 않는다", () => {
    // Given
    const registry = institutions;

    // When
    const successions = registry.map((institution) => ({
      id: institution.id,
      predecessors: institution.successorOf ?? [],
    }));

    // Then
    for (const { id, predecessors } of successions) {
      expect(predecessors).not.toContain(id);
    }
  });
});

describe("pattern 불변식", () => {
  // One direction only: a bare subjectPosition is still exposed by extractSubject / matchedPattern.
  test.each(patterns)(
    "$institution.id $pattern.template — subjects 는 subjectPosition 을 동반한다",
    ({ pattern }) => {
      // Given
      const { subjects, subjectPosition } = pattern;

      // When
      const declaresSubjects = Boolean(subjects?.length);

      // Then
      if (declaresSubjects) {
        expect(subjectPosition).toBeDefined();
      }
    },
  );

  // One direction only: a bare identifierPosition is still read by extractIdentifier.
  test.each(patterns)(
    "$institution.id $pattern.template — identifiers / identifierRange 는 identifierPosition 을 동반한다",
    ({ pattern }) => {
      // Given
      const { identifiers, identifierRange, identifierPosition } = pattern;

      // When
      const declaresIdentifiers = Boolean(identifiers?.length || identifierRange);

      // Then
      if (declaresIdentifiers) {
        expect(identifierPosition).toBeDefined();
      }
    },
  );

  test.each(patterns)(
    "$institution.id $pattern.template — 모든 subjects[].code 길이가 subjectPosition.length 와 같다",
    ({ pattern }) => {
      // Given
      const { subjects = [], subjectPosition } = pattern;

      // When
      const expectedLength = subjectPosition?.length;

      // Then
      if (expectedLength !== undefined) {
        for (const subject of subjects) {
          expect(subject.code).toHaveLength(expectedLength);
        }
      }
    },
  );

  test.each(patterns)(
    "$institution.id $pattern.template — 모든 identifiers[] 길이가 identifierPosition.length 와 같다",
    ({ pattern }) => {
      // Given
      const { identifiers = [], identifierPosition } = pattern;

      // When
      const expectedLength = identifierPosition?.length;

      // Then
      if (expectedLength !== undefined) {
        for (const identifier of identifiers) {
          expect(identifier).toHaveLength(expectedLength);
        }
      }
    },
  );

  test.each(patterns)(
    "$institution.id $pattern.template — position 이 템플릿 범위를 넘지 않는다",
    ({ pattern }) => {
      // Given
      const positions = [pattern.subjectPosition, pattern.identifierPosition];

      // When
      const digitCount = templateLength(pattern.template);

      // Then
      for (const position of positions) {
        if (position) {
          expect(position.start + position.length).toBeLessThanOrEqual(digitCount);
          expect(position.length).toBeGreaterThan(0);
        }
      }
    },
  );

  test.each(patterns)(
    "$institution.id $pattern.template — subjects[].code 가 중복되지 않는다",
    ({ pattern }) => {
      // Given
      const codes = (pattern.subjects ?? []).map((subject) => subject.code);

      // When
      const uniqueCodes = new Set(codes);

      // Then
      expect(uniqueCodes.size).toBe(codes.length);
    },
  );
});

describe("branchRule 이 가리키는 institutionId 는 실재한다", () => {
  const ids = new Set(institutions.map((institution) => institution.id));

  test.each(patterns.filter(({ pattern }) => pattern.branchRule))(
    "$institution.id $pattern.template",
    ({ pattern }) => {
      // Given — exhausting all digits is impossible; smoke-test one repeated digit per 0–9
      const digitCount = templateLength(pattern.template);
      const samples = Array.from({ length: 10 }, (_, digit) => String(digit).repeat(digitCount));

      // When
      const results = samples.map((digits) => pattern.branchRule?.evaluate(digits));

      // Then
      for (const result of results) {
        if (result?.institutionId) {
          expect(ids).toContain(result.institutionId);
        }
      }
    },
  );
});
