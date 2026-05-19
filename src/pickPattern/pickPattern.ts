import { templateLength } from "../_internal/templateLength";
import { institutionById } from "../data";
import type { AccountKind, AccountPattern } from "../types";

export interface PickPatternFilter {
  readonly kind?: AccountKind;
  /** 템플릿 길이 (digits 자릿수). */
  readonly length?: number;
}

/**
 * 특정 institution에서 조건에 맞는 패턴 하나를 조회한다.
 *
 * @example
 * pickPattern("kb", { kind: "new", length: 14 });
 * // → KB국민 신계좌 14자리 패턴
 */
export function pickPattern(
  institutionId: string,
  filter: PickPatternFilter = {},
): AccountPattern | null {
  const inst = institutionById(institutionId);
  if (!inst) {
    return null;
  }
  return (
    inst.patterns.find((p) => {
      if (filter.kind && p.kind !== filter.kind) {
        return false;
      }

      if (filter.length !== undefined && templateLength(p.template) !== filter.length) {
        return false;
      }

      return true;
    }) ?? null
  );
}
