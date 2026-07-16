import { describe, expect, test } from "vitest";
import { templateLength } from "../_internal/templateLength";
import { institutions } from "./index";

// 데이터 파일은 사람이 PDF 를 보고 손으로 채운다. 불변식이 깨져도 런타임은 조용히
// 넘어가므로 (점수 가산이 0 이 될 뿐) 여기서 명시적으로 검사한다.
//
// 단, "position 만 있고 subjects/identifiers 가 없다" 는 것은 위반이 아니다.
// 0.1.0 에서 그렇게 오판해 4개를 지웠다가, 공개 API `extractIdentifier` 의 출력이
// 바뀌는 것을 발견하고 0.1.1 에서 되돌렸다. 불변식은 한 방향으로만 성립한다.

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
  // 성립하는 건 한 방향뿐이다. `position` 단독은 죽은 선언이 아니다 —
  // 점수 가산에는 안 쓰이지만 공개 API (`extractSubject` / `extractIdentifier`) 와
  // `DetectionResult.matchedPattern` 이 그 값을 노출한다.
  // 0.1.0 에서 양방향 불변식으로 오판해 4개를 지웠다가 0.1.1 에서 되돌렸다.
  test.each(patterns)(
    "$institution.id $pattern.template — subjects 는 subjectPosition 을 동반한다",
    ({ pattern }) => {
      if (pattern.subjects?.length) {
        expect(pattern.subjectPosition).toBeDefined();
      }
    },
  );

  // 역방향만 성립한다. `identifierPosition` 단독은 죽은 필드가 아니다 —
  // 점수 가산은 없지만 공개 API `extractIdentifier` 가 이 위치를 읽는다.
  // (0.1.0 에서 이걸 "죽은 필드" 로 오판해 지웠다가 0.1.1 에서 되돌렸다.)
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
      // 모든 digits 를 다 볼 수는 없으니, 룰이 반환할 수 있는 id 를 스모크로 훑는다.
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
