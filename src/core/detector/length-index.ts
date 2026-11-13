import type { Institution } from "../../types";
import { getPatternLookup } from "./pattern-lookup";

/** Looks up institutions by the digit lengths of their patterns. */
export interface LengthIndex<TInstitution extends Institution> {
  /** Institutions with a pattern whose length is within ±1 of `length`. */
  candidatesNear(length: number): readonly TInstitution[];
}

const NO_CANDIDATES: readonly never[] = [];

/** Indexes institutions by pattern length once, so `detect` scores only plausible candidates. */
export function createLengthIndex<TInstitution extends Institution>(
  institutions: readonly TInstitution[],
): LengthIndex<TInstitution> {
  const byLength = new Map<number, TInstitution[]>();
  for (const institution of institutions) {
    const lengths = new Set(
      institution.patterns.map((pattern) => getPatternLookup(pattern).digitCount),
    );
    for (const length of lengths) {
      const bucket = byLength.get(length) ?? [];
      bucket.push(institution);
      byLength.set(length, bucket);
    }
  }

  const nearByLength = new Map<number, readonly TInstitution[]>();
  for (const length of byLength.keys()) {
    for (const inputLength of [length - 1, length, length + 1]) {
      if (nearByLength.has(inputLength)) {
        continue;
      }
      const candidates = new Set<TInstitution>();
      for (const nearLength of [inputLength - 1, inputLength, inputLength + 1]) {
        for (const institution of byLength.get(nearLength) ?? []) {
          candidates.add(institution);
        }
      }
      nearByLength.set(inputLength, [...candidates]);
    }
  }

  return {
    candidatesNear: (length) => nearByLength.get(length) ?? NO_CANDIDATES,
  };
}
