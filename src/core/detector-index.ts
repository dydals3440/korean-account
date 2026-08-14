import type { Institution } from "../types";
import { templateLength } from "./template-length";

/**
 * Pre-built length → institution[] index that narrows detect() candidates.
 *
 * Only institutions with a pattern matching the input's digit count get
 * evaluated, cutting ~180 scorePattern calls (57 institutions × ~3 patterns)
 * down to ~10 on average.
 *
 * An institution with patterns of several lengths appears in several buckets;
 * detect() deduplicates via a Set so each is evaluated once. Buckets also
 * cover length ± 1 to keep partial inputs matching while the user types.
 */
export interface DetectorIndex<I extends Institution> {
  /** Institutions whose pattern length is within ±1 of `length`. */
  byLengthNear(length: number): readonly I[];
}

export function buildDetectorIndex<I extends Institution>(
  institutions: readonly I[],
): DetectorIndex<I> {
  const exact = new Map<number, I[]>();
  for (const institution of institutions) {
    const lengths = new Set<number>();
    for (const pattern of institution.patterns) {
      lengths.add(templateLength(pattern.template));
    }
    for (const length of lengths) {
      let bucket = exact.get(length);
      if (!bucket) {
        bucket = [];
        exact.set(length, bucket);
      }
      bucket.push(institution);
    }
  }

  const byLengthNear = (length: number): readonly I[] => {
    const seen = new Set<I>();
    for (const offset of [-1, 0, 1]) {
      const bucket = exact.get(length + offset);
      if (!bucket) {
        continue;
      }
      for (const institution of bucket) {
        seen.add(institution);
      }
    }
    return Array.from(seen);
  };

  return { byLengthNear };
}
