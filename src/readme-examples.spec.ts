import { describe, expect, test } from "vitest";
import {
  accountKindLabels,
  createDetector,
  detectBest,
  kb,
  shinhan,
  toss,
  getInstitution,
  institutions,
  normalizeAccount,
  scoreToConfidence,
} from "./index";

// The README ships in the tarball, so it is a contract. From v0.0.3 through
// 0.1.1 it claimed `detectBest("3333-12-3456789")` returns KakaoBank / "high"
// while the actual result was Shinhan / low — and no test caught it. Every
// value the README's code examples claim is asserted verbatim here.
describe("README 코드 예제가 주장하는 값", () => {
  test("빠른 시작 — detectBest", () => {
    const top = detectBest("1002-123-456789");
    expect(top?.institution.nameKo).toBe("우리은행");
    expect(top?.institution.nameEn).toBe("Woori Bank");
    expect(top?.kind).toBe("new");
    expect(top?.confidence).toBe("high");
  });

  test("첫 화면 예제 — detectBest('110-436-387740')", () => {
    const result = detectBest("110-436-387740");
    expect(result?.institution.id).toBe("shinhan");
    expect(result?.institution.code).toBe("088");
    expect(result?.kind).toBe("new");
    expect(result?.subject?.code).toBe("110");
    expect(result?.subject?.category).toBe("savings");
    expect(result?.formatted).toBe("110-436-387740");
    expect(result?.score).toBe(14);
    expect(result?.confidence).toBe("high");
    expect(result?.capabilities).toEqual({
      allowsWithdrawal: true,
      virtual: false,
      validatedCheckDigit: null,
    });
  });

  test("detectBest 는 매칭이 없으면 null", () => {
    expect(detectBest("1")).toBeNull();
  });

  test("조회 — getInstitution / getInstitution", () => {
    expect(getInstitution("shinhan")?.code).toBe("088");
    expect(getInstitution("088")?.id).toBe("shinhan");
    // README's commonCode caveat: the CMS code and KFTC common bank code differ.
    expect(getInstitution("hana")?.code).toBe("005");
    expect(getInstitution("hana")?.commonCode).toBe("081");
  });

  test("정규화·포맷팅", () => {
    expect(normalizeAccount("110-436-387740")).toBe("110436387740");
    expect(scoreToConfidence(9)).toBe("high");
  });

  test("레지스트리 규모 — README 가 '57곳' 이라고 적는다", () => {
    expect(institutions).toHaveLength(57);
  });

  test("라벨", () => {
    expect(accountKindLabels.virtual).toBe("가상계좌");
  });

  test("필요한 은행만 — createDetector([kb, shinhan, toss]) 도 신한을 1순위로 낸다", () => {
    const scoped = createDetector([kb, shinhan, toss]);
    expect(scoped.detect("110-436-387740")[0]?.institution.id).toBe("shinhan");
  });

  // Real-world augmentation the README states explicitly — if this behavior changes, the README must change too.
  test("실세계 보강 — 카카오뱅크 3333/7979 프리픽스가 core 에 반영", () => {
    const personal = detectBest("3333-12-3456789");
    expect(personal?.institution.nameKo).toBe("카카오뱅크");
    expect(personal?.confidence).toBe("high");

    const group = detectBest("7979-01-2345678");
    expect(group?.institution.id).toBe("kakao");
  });
});
