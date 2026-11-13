import { describe, expect, test } from "vitest";

import type { AccountPattern, Subject } from "../../types";
import { cmsServices } from "../define/cms-services";
import { patternTemplate } from "../define/pattern-template";
import { resolveServices } from "./capabilities";

const pattern: AccountPattern = {
  template: patternTemplate("XXX-XX-XXXXXX"),
  kind: "new",
  services: cmsServices("virtualAccount", "directDebit", "directCredit"),
};

describe("resolveServices", () => {
  test("패턴에 서비스 열이 없으면 null 을 반환한다", () => {
    // Given
    const withoutServices: AccountPattern = { template: pattern.template, kind: "new" };

    // When
    const services = resolveServices(withoutServices, null);

    // Then
    expect(services).toBeNull();
  });

  test("과목 예외가 있으면 그 열만 바꾼다", () => {
    // Given
    const subject: Subject = {
      code: "91",
      category: "other",
      services: { directDebit: false },
    };

    // When
    const services = resolveServices(pattern, subject);

    // Then
    expect(services).toEqual({
      virtualAccount: true,
      directDebit: false,
      directCredit: true,
      additionalServices: false,
    });
  });

  test("과목 예외를 undefined 로 두면 패턴 값을 그대로 쓴다", () => {
    // Given
    const subject: Subject = {
      code: "01",
      category: "ordinary",
      services: { directDebit: undefined, virtualAccount: undefined },
    };

    // When
    const services = resolveServices(pattern, subject);

    // Then
    expect(services).toEqual(pattern.services);
  });

  test("레지스트리 객체를 그대로 내주지 않고 새 객체를 만든다", () => {
    // Given
    const subject = null;

    // When
    const services = resolveServices(pattern, subject);

    // Then
    expect(services).toEqual(pattern.services);
    expect(services).not.toBe(pattern.services);
  });
});
