import { type } from "arktype";
import * as v from "valibot";
import { describe, expect, expectTypeOf, test } from "vitest";

import { createDetector, detect, detectBest, institutions, kb, shinhan, toss } from ".";
import { accountSchema as arktypeAccount } from "./adapters/arktype";
import { accountSchema as standardAccount } from "./adapters/standard-schema";
import { accountSchema as valibotAccount } from "./adapters/valibot";
import { accountSchema as yupAccount } from "./adapters/yup";
import { accountSchema as zodAccount, createAccountSchema } from "./adapters/zod";

// README.md and docs/README.en.md ship claims about real outputs; each one is asserted here.
describe("README 코드 예제가 주장하는 값", () => {
  test("첫 예제 — 카카오뱅크 번호는 단독 high 후보다", () => {
    // Given
    const input = "3333-12-3456789";

    // When
    const result = detectBest(input);

    // Then
    expect(result?.institution.id).toBe("kakao");
    expect(result?.institution.nameKo).toBe("카카오뱅크");
    expect(result?.institution.nameEn).toBe("KakaoBank");
    expect(result?.confidence).toBe("high");
    expect(result?.ambiguous).toBe(false);
  });

  test("빠른 시작 — 110-436-387740 은 신한·우체국·신협이 high 로 모호하다", () => {
    // Given
    const input = "110-436-387740";

    // When
    const candidates = detect(input, { limit: 3 });

    // Then
    expect(
      candidates.map((candidate) => [
        candidate.institution.nameKo,
        candidate.institution.nameEn,
        candidate.confidence,
        candidate.ambiguous,
      ]),
    ).toEqual([
      ["신한은행", "Shinhan Bank", "high", true],
      ["우체국", "Korea Post", "high", true],
      ["신협중앙회", "Credit Union Central", "high", true],
    ]);
  });

  test.each([
    ["301-0123-4567-11", "nh"],
    ["302-0123-4567-12", "nh"],
    ["351-0123-4567-13", "nh-coop"],
    ["356-0123-4567-15", "nh-coop"],
  ])("농협 표 — %s 는 %s 단독 high 다", (input, expectedId) => {
    // Given
    const account = input;

    // When
    const candidates = detect(account);

    // Then
    expect(candidates.map((candidate) => [candidate.institution.id, candidate.confidence])).toEqual(
      [[expectedId, "high"]],
    );
    expect(candidates[0]?.ambiguous).toBe(false);
  });

  test("번들 줄이기 — 고른 기관만으로도 신한이 1순위이고 타입이 좁혀진다", () => {
    // Given
    const detector = createDetector([kb, shinhan, toss]);

    // When
    const id = detector.detect("110-436-387740")[0]?.institution.id;

    // Then
    expect(id).toBe("shinhan");
    expectTypeOf(id).toEqualTypeOf<"kb" | "shinhan" | "toss" | undefined>();
  });

  test("기관 목록 — 레지스트리 기관 수가 README 에 적힌 57곳과 같다", () => {
    // Given
    const registry = institutions;

    // When
    const count = registry.length;

    // Then
    expect(count).toBe(57);
  });

  test("한계 — 기본값은 앞자리만으로 후보를 내지 않고, partial 이면 low 로 제안한다", () => {
    // Given
    const prefixOnly = "3333";

    // When
    const byDefault = detect(prefixOnly);
    const [suggested] = detect(prefixOnly, { partial: true });

    // Then
    expect(byDefault).toEqual([]);
    expect(suggested?.institution.id).toBe("kakao");
    expect(suggested?.confidence).toBe("low");
  });

  test("검증 어댑터 — 메시지를 키별로 바꾸고 전각 입력도 받는다", () => {
    // Given
    const schema = createAccountSchema({ messages: { required: "계좌번호를 입력하세요." } });

    // When
    const empty = schema.safeParse("");
    const fullWidth = schema.safeParse("１１０-４３６-３８７７４０");

    // Then
    expect(empty.error?.issues[0]?.message).toBe("계좌번호를 입력하세요.");
    expect(fullWidth.success).toBe(true);
  });
});

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
