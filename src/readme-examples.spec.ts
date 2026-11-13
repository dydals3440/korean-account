import { type } from "arktype";
import * as v from "valibot";
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
} from ".";
import { accountSchema as arktypeAccount } from "./adapters/arktype";
import { accountSchema as standardAccount } from "./adapters/standard-schema";
import { accountSchema as valibotAccount } from "./adapters/valibot";
import { accountSchema as yupAccount } from "./adapters/yup";
import { accountSchema as zodAccount } from "./adapters/zod";

// The README ships in the tarball, so every value its examples claim is asserted verbatim here.
describe("README 코드 예제가 주장하는 값", () => {
  test("빠른 시작 — detectBest 는 우리은행 신계좌를 high 로 판별한다", () => {
    // Given
    const input = "1002-123-456789";

    // When
    const result = detectBest(input);

    // Then
    expect(result?.institution.nameKo).toBe("우리은행");
    expect(result?.institution.nameEn).toBe("Woori Bank");
    expect(result?.kind).toBe("new");
    expect(result?.confidence).toBe("high");
  });

  test("첫 화면 예제 — detectBest('110-436-387740') 는 신한 신계좌 결과를 반환한다", () => {
    // Given
    const input = "110-436-387740";

    // When
    const result = detectBest(input);

    // Then
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

  test("detectBest 는 매칭이 없으면 null 을 반환한다", () => {
    // Given
    const input = "1";

    // When
    const result = detectBest(input);

    // Then
    expect(result).toBeNull();
  });

  test("조회 — getInstitution 은 id 와 기관 코드로 기관을 찾는다", () => {
    // Given
    const shinhanId = "shinhan";
    const shinhanCode = "088";
    const hanaId = "hana";

    // When
    const byId = getInstitution(shinhanId);
    const byCode = getInstitution(shinhanCode);
    const hana = getInstitution(hanaId);

    // Then
    expect(byId?.code).toBe("088");
    expect(byCode?.id).toBe("shinhan");
    // Preserve the library's historical Hana code representation.
    expect(hana?.code).toBe("005");
    expect(hana?.commonCode).toBe("081");
  });

  test("정규화·포맷팅 — 숫자만 남기고 score 9 를 high 로 변환한다", () => {
    // Given
    const account = "110-436-387740";
    const score = 9;

    // When
    const normalized = normalizeAccount(account);
    const confidence = scoreToConfidence(score);

    // Then
    expect(normalized).toBe("110436387740");
    expect(confidence).toBe("high");
  });

  test("레지스트리 규모 — 기관 수가 README 에 적힌 57곳과 같다", () => {
    // Given
    const registry = institutions;

    // When
    const count = registry.length;

    // Then
    expect(count).toBe(57);
  });

  test("라벨 — virtual 의 한글 라벨은 '가상계좌' 다", () => {
    // Given
    const kind = "virtual";

    // When
    const label = accountKindLabels[kind];

    // Then
    expect(label).toBe("가상계좌");
  });

  test("필요한 은행만 — createDetector([kb, shinhan, toss]) 도 신한을 1순위로 낸다", () => {
    // Given
    const scoped = createDetector([kb, shinhan, toss]);

    // When
    const results = scoped.detect("110-436-387740");

    // Then
    expect(results[0]?.institution.id).toBe("shinhan");
  });

  // The README states this augmentation explicitly — if the behavior changes, the README must change too.
  test("실세계 보강 — 카카오뱅크 3333/7979 프리픽스를 카카오뱅크로 판별한다", () => {
    // Given
    const personalInput = "3333-12-3456789";
    const groupInput = "7979-01-2345678";

    // When
    const personal = detectBest(personalInput);
    const group = detectBest(groupInput);

    // Then
    expect(personal?.institution.nameKo).toBe("카카오뱅크");
    expect(personal?.confidence).toBe("high");
    expect(group?.institution.id).toBe("kakao");
  });
});

// README claims all five adapters expose behaviorally identical schemas.
describe("README — 검증 어댑터 5종 동작 동일", () => {
  const accepts = {
    zod: (input: unknown) => zodAccount.safeParse(input).success,
    valibot: (input: unknown) => v.safeParse(valibotAccount, input).success,
    yup: (input: unknown) => yupAccount.isValidSync(input, { strict: true }),
    arktype: (input: unknown) => !(arktypeAccount(input) instanceof type.errors),
    "standard-schema": (input: unknown) => {
      const result = standardAccount["~standard"].validate(input);
      if (result instanceof Promise) throw new Error("sync only");
      return result.issues === undefined;
    },
  } as const;

  test.each(Object.entries(accepts))(
    "%s 는 유효한 계좌를 통과시키고 5자리 입력을 거부한다",
    (_, accept) => {
      // Given
      const validAccount = "110-436-387740";
      const tooShortAccount = "12345";

      // When
      const validAccepted = accept(validAccount);
      const tooShortAccepted = accept(tooShortAccount);

      // Then
      expect(validAccepted).toBe(true);
      expect(tooShortAccepted).toBe(false);
    },
  );
});
