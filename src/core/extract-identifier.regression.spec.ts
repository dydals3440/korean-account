import { beforeAll, describe, expect, test } from "vitest";
import { getInstitution } from "../registry";
import { normalizeAccount } from "./normalize-account";
import type { AccountPattern } from "../types";
import { extractIdentifier } from "./extract-identifier";

// 0.1.0 deleted `identifierPosition` as a "dead field" because `identifiers`
// was absent. It is indeed unused for scoring, but the public API
// `extractIdentifier` reads the position — so 12-digit Suhyup accounts began
// returning "" instead of "965". 0.1.1 reverted; this spec pins it down.
describe("extractIdentifier 는 identifiers 없이 identifierPosition 만으로도 동작한다", () => {
  let suhyup12: AccountPattern;

  beforeAll(() => {
    const suhyup = getInstitution("suhyup");
    expect(suhyup, "suhyup 기관이 레지스트리에 있어야 한다").not.toBeNull();

    const pattern = suhyup?.patterns.find((p) => p.kind === "new" && p.branchRule !== undefined);
    expect(pattern, "수협 12자리 new 패턴이 있어야 한다").toBeDefined();
    if (!pattern) {
      throw new Error("수협 12자리 패턴을 찾지 못했습니다.");
    }
    suhyup12 = pattern;
  });

  test("identifiers 없이 identifierPosition 만 갖는다", () => {
    expect(suhyup12.identifierPosition).toEqual({ start: 0, length: 3 });
    expect(suhyup12.identifiers, "identifiers 는 없다 — 그래도 위치는 필요하다").toBeUndefined();
    expect(suhyup12.identifierRange).toBeUndefined();
  });

  test.each([
    ["965182960583", "965"],
    ["927659375731", "927"],
    ["769978387352", "769"],
  ])("extractIdentifier(%s) === %s", (input, expected) => {
    expect(extractIdentifier(normalizeAccount(input), suhyup12)).toBe(expected);
  });
});
