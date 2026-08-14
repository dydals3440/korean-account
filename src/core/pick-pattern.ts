import { templateLength } from "./template-length";
import { getInstitution } from "../registry";
import type { AccountKind, AccountPattern } from "../types";

export interface PickPatternFilter {
  readonly kind?: AccountKind;
  /** Template length in digits (hyphens excluded). */
  readonly length?: number;
}

/**
 * Looks up a single matching pattern on a registered institution.
 *
 * @example
 * pickPattern("kb", { kind: "new", length: 14 });
 * // → the KB Kookmin 14-digit new-format pattern
 */
export function pickPattern(
  institutionId: string,
  filter: PickPatternFilter = {},
): AccountPattern | null {
  const inst = getInstitution(institutionId);
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
