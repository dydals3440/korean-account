import { describe, expect, test } from "vitest";
import {
  accountKindLabels,
  detectBest,
  getInstitution,
  institutions,
  normalizeAccount,
  scoreToConfidence,
} from "./index";

// README 는 tarball 에 실려 나가는 계약이다. 실제로 v0.0.3 부터 0.1.1 까지
// `detectBest("3333-12-3456789")` 가 "카카오뱅크" / "high" 를 반환한다고 적혀 있었지만,
// 실제 반환값은 신한은행 / low 였다. 아무 테스트도 이걸 잡지 못했다.
// README 의 모든 코드 예제가 주장하는 값을 여기서 그대로 단언한다.
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
    // README 의 commonCode 주의사항: CMS 코드와 KFTC 공통 은행코드가 다르다.
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

  // README 가 명시하는 실세계 보강 — 이 동작이 바뀌면 README 도 같이 고쳐야 한다.
  test("실세계 보강 — 카카오뱅크 3333/7979 프리픽스가 core 에 반영", () => {
    const personal = detectBest("3333-12-3456789");
    expect(personal?.institution.nameKo).toBe("카카오뱅크");
    expect(personal?.confidence).toBe("high");

    const group = detectBest("7979-01-2345678");
    expect(group?.institution.id).toBe("kakao");
  });
});
