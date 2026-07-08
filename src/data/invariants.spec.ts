import { describe, expect, test } from "vitest";
import { templateLength } from "../_internal/templateLength";
import { institutions } from "./index";

// 데이터 파일은 사람이 PDF 를 보고 손으로 채운다. 아래 불변식이 깨져도 런타임은
// 조용히 넘어가고 (점수 가산이 0 이 될 뿐) 어떤 테스트도 실패하지 않았다.
// 실제로 이 spec 을 쓰기 전까지 죽은 subjectPosition 3개와 identifierPosition 1개가
// 아무 신호 없이 존재했다.

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
  test.each(patterns)("$institution.id $pattern.template — subjectPosition ⟺ subjects", ({
    pattern,
  }) => {
    // 한쪽만 있으면 scoreSubjectMatch 가 조용히 0 을 반환한다 (죽은 선언).
    expect(Boolean(pattern.subjectPosition)).toBe(Boolean(pattern.subjects?.length));
  });

  test.each(
    patterns,
  )("$institution.id $pattern.template — identifierPosition 은 identifiers 나 identifierRange 를 동반한다", ({
    pattern,
  }) => {
    if (pattern.identifierPosition) {
      expect(Boolean(pattern.identifiers?.length) || Boolean(pattern.identifierRange)).toBe(true);
    }
  });

  test.each(
    patterns,
  )("$institution.id $pattern.template — 모든 subjects[].code 길이가 subjectPosition.length 와 같다", ({
    pattern,
  }) => {
    if (!pattern.subjectPosition || !pattern.subjects) {
      return;
    }
    for (const subject of pattern.subjects) {
      expect(subject.code).toHaveLength(pattern.subjectPosition.length);
    }
  });

  test.each(
    patterns,
  )("$institution.id $pattern.template — 모든 identifiers[] 길이가 identifierPosition.length 와 같다", ({
    pattern,
  }) => {
    if (!pattern.identifierPosition || !pattern.identifiers) {
      return;
    }
    for (const identifier of pattern.identifiers) {
      expect(identifier).toHaveLength(pattern.identifierPosition.length);
    }
  });

  test.each(
    patterns,
  )("$institution.id $pattern.template — position 이 템플릿 범위를 넘지 않는다", ({ pattern }) => {
    const length = templateLength(pattern.template);
    for (const position of [pattern.subjectPosition, pattern.identifierPosition]) {
      if (position) {
        expect(position.start + position.length).toBeLessThanOrEqual(length);
        expect(position.length).toBeGreaterThan(0);
      }
    }
  });

  test.each(patterns)("$institution.id $pattern.template — subjects[].code 가 중복되지 않는다", ({
    pattern,
  }) => {
    const codes = (pattern.subjects ?? []).map((s) => s.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("branchRule 이 가리키는 institutionId 는 실재한다", () => {
  const ids = new Set(institutions.map((i) => i.id));

  test.each(patterns.filter((p) => p.pattern.branchRule))("$institution.id $pattern.template", ({
    pattern,
  }) => {
    // 모든 digits 를 다 볼 수는 없으니, 룰이 반환할 수 있는 id 를 스모크로 훑는다.
    for (let d = 0; d < 10; d++) {
      const digits = String(d).repeat(templateLength(pattern.template));
      const result = pattern.branchRule?.evaluate(digits);
      if (result?.institutionId) {
        expect(ids).toContain(result.institutionId);
      }
    }
  });
});
