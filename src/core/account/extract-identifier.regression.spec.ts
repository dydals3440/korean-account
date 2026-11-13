import { beforeAll, describe, expect, test } from "vitest";

import { getInstitution } from "../../builtin/get-institution";
import type { AccountPattern } from "../../types";
import { extractIdentifier } from "./extract-identifier";
import { normalizeAccount } from "./normalize-account";

// Regression: 0.1.0 dropped `identifierPosition` when `identifiers` was absent, so Suhyup 12d returned "" instead of "965".
describe("extractIdentifier 는 identifiers 없이 identifierPosition 만으로도 동작한다", () => {
  let suhyup12: AccountPattern;

  beforeAll(() => {
    const suhyup = getInstitution("suhyup");
    expect(suhyup, "suhyup 기관이 레지스트리에 있어야 한다").not.toBeNull();

    const pattern = suhyup?.patterns.find(
      (candidate) => candidate.kind === "new" && candidate.branchRule !== undefined,
    );
    expect(pattern, "수협 12자리 new 패턴이 있어야 한다").toBeDefined();
    if (!pattern) {
      throw new Error("수협 12자리 패턴을 찾지 못했습니다.");
    }
    suhyup12 = pattern;
  });

  test("수협 12자리 new 패턴은 identifiers 없이 identifierPosition 만 갖는다", () => {
    // Given
    const pattern = suhyup12;

    // When
    const { identifierPosition, identifiers, identifierRange } = pattern;

    // Then
    expect(identifierPosition).toEqual({ start: 0, length: 3 });
    expect(identifiers, "identifiers 는 없다 — 그래도 위치는 필요하다").toBeUndefined();
    expect(identifierRange).toBeUndefined();
  });

  test.each([
    ["965182960583", "965"],
    ["927659375731", "927"],
    ["769978387352", "769"],
  ])("'%s' 이면 식별자 '%s' 를 반환한다", (input, expected) => {
    // Given
    const digits = normalizeAccount(input);

    // When
    const result = extractIdentifier(digits, suhyup12);

    // Then
    expect(result).toBe(expected);
  });
});
