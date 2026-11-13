import type { Institution } from "../../types";
import { templateLength } from "../account/template-length";

/** Looks up institutions by the digit lengths of their patterns. */
export interface LengthIndex<TInstitution extends Institution> {
  /** Institutions with a pattern whose length is within ±1 of `length`. */
  candidatesNear(length: number): readonly TInstitution[];
}

/** Indexes institutions by pattern length so `detect` scores only plausible candidates. */
export function createLengthIndex<TInstitution extends Institution>(
  institutions: readonly TInstitution[],
): LengthIndex<TInstitution> {
  const byLength = new Map<number, TInstitution[]>();
  for (const institution of institutions) {
    const lengths = new Set(
      institution.patterns.map((pattern) => templateLength(pattern.template)),
    );
    for (const length of lengths) {
      const bucket = byLength.get(length) ?? [];
      bucket.push(institution);
      byLength.set(length, bucket);
    }
  }

  return {
    candidatesNear(length) {
      const candidates = new Set<TInstitution>();
      for (const nearLength of [length - 1, length, length + 1]) {
        for (const institution of byLength.get(nearLength) ?? []) {
          candidates.add(institution);
        }
      }
      return [...candidates];
    },
  };
}
