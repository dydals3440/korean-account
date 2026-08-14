import { describe, expect, test } from "vitest";
import { templateLength } from "../core/template-length";
import { institutions } from "./index";

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
    const ids = institutions.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("대표 code 와 aliasCode 를 통틀어 중복되지 않는다", () => {
    const codes = institutions.flatMap((i) => [i.code, ...(i.aliasCodes ?? [])]);
    const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
    expect(duplicates).toEqual([]);
  });

  test("successorOf 는 자기 자신을 가리키지 않는다", () => {
    for (const institution of institutions) {
      expect(institution.successorOf ?? []).not.toContain(institution.id);
    }
  });
});

describe("pattern 불변식", () => {
  // One direction only. A bare `position` is not a dead declaration — it is
  // unused for scoring, but the public API (`extractSubject` /
  // `extractIdentifier`) and `DetectionResult.matchedPattern` expose it.
  // 0.1.0 misread this as bidirectional and deleted 4 fields; 0.1.1 reverted.
  test.each(patterns)(
    "$institution.id $pattern.template — subjects 는 subjectPosition 을 동반한다",
    ({ pattern }) => {
      if (pattern.subjects?.length) {
        expect(pattern.subjectPosition).toBeDefined();
      }
    },
  );

  // Reverse direction only. A bare `identifierPosition` is not a dead field —
  // no score bonus, but the public API `extractIdentifier` reads the position.
  // (0.1.0 misjudged it as dead and deleted it; 0.1.1 reverted.)
  test.each(patterns)(
    "$institution.id $pattern.template — identifiers / identifierRange 는 identifierPosition 을 동반한다",
    ({ pattern }) => {
      if (pattern.identifiers?.length || pattern.identifierRange) {
        expect(pattern.identifierPosition).toBeDefined();
      }
    },
  );

  test.each(patterns)(
    "$institution.id $pattern.template — 모든 subjects[].code 길이가 subjectPosition.length 와 같다",
    ({ pattern }) => {
      if (!pattern.subjectPosition || !pattern.subjects) {
        return;
      }
      for (const subject of pattern.subjects) {
        expect(subject.code).toHaveLength(pattern.subjectPosition.length);
      }
    },
  );

  test.each(patterns)(
    "$institution.id $pattern.template — 모든 identifiers[] 길이가 identifierPosition.length 와 같다",
    ({ pattern }) => {
      if (!pattern.identifierPosition || !pattern.identifiers) {
        return;
      }
      for (const identifier of pattern.identifiers) {
        expect(identifier).toHaveLength(pattern.identifierPosition.length);
      }
    },
  );

  test.each(patterns)(
    "$institution.id $pattern.template — position 이 템플릿 범위를 넘지 않는다",
    ({ pattern }) => {
      const length = templateLength(pattern.template);
      for (const position of [pattern.subjectPosition, pattern.identifierPosition]) {
        if (position) {
          expect(position.start + position.length).toBeLessThanOrEqual(length);
          expect(position.length).toBeGreaterThan(0);
        }
      }
    },
  );

  test.each(patterns)(
    "$institution.id $pattern.template — subjects[].code 가 중복되지 않는다",
    ({ pattern }) => {
      const codes = (pattern.subjects ?? []).map((s) => s.code);
      expect(new Set(codes).size).toBe(codes.length);
    },
  );
});

describe("branchRule 이 가리키는 institutionId 는 실재한다", () => {
  const ids = new Set(institutions.map((i) => i.id));

  test.each(patterns.filter((p) => p.pattern.branchRule))(
    "$institution.id $pattern.template",
    ({ pattern }) => {
      // Exhausting every digits value is impossible; smoke-test the ids the rule can return.
      for (let d = 0; d < 10; d++) {
        const digits = String(d).repeat(templateLength(pattern.template));
        const result = pattern.branchRule?.evaluate(digits);
        if (result?.institutionId) {
          expect(ids).toContain(result.institutionId);
        }
      }
    },
  );
});
