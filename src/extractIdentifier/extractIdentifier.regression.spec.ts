import { beforeAll, describe, expect, test } from "vitest";
import { institutionById } from "../data";
import { normalize } from "../normalize";
import type { AccountPattern } from "../types";
import { extractIdentifier } from "./extractIdentifier";

// 0.1.0 에서 `identifiers` 가 없다는 이유로 `identifierPosition` 을 "죽은 필드" 로
// 판단해 지웠다. 점수 가산에는 실제로 쓰이지 않지만, 공개 API `extractIdentifier`
// 가 이 위치를 읽는다. 그 결과 12자리 수협 계좌에서 "965" 대신 "" 가 반환됐다.
// 0.1.1 에서 되돌렸고, 여기서 못 박는다.
describe("extractIdentifier 는 identifiers 없이 identifierPosition 만으로도 동작한다", () => {
  let suhyup12: AccountPattern;

  beforeAll(() => {
    const suhyup = institutionById("suhyup");
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
    expect(extractIdentifier(normalize(input), suhyup12)).toBe(expected);
  });
});
