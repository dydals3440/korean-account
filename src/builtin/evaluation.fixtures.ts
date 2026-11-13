import { templateLength } from "../core/account/template-length";
import type { AccountPattern, Institution } from "../types";

const MAX_ATTEMPTS = 50;

/** Deterministic PRNG (mulberry32) returning floats in [0, 1). */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomDigits(random: () => number, length: number): string {
  return Array.from({ length }, () => Math.floor(random() * 10).toString()).join("");
}

/** A sampled account number for one built-in pattern. */
export interface PatternSample {
  readonly institution: Institution;
  readonly pattern: AccountPattern;
  readonly patternIndex: number;
  readonly digits: string;
}

/**
 * Samples digits a real account of this pattern could have: a declared identifier and
 * subject in place, random serial digits elsewhere, every additional rule satisfied.
 * Returns `null` when no attempt satisfies the rules.
 */
export function samplePatternDigits(pattern: AccountPattern, random: () => number): string | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const digits = buildSample(pattern, random);
    const rulesPass = (pattern.additionalRules ?? []).every((rule) => rule(digits));
    if (rulesPass) {
      return digits;
    }
  }
  return null;
}

/** `samplesPerPattern` samples for every pattern that declares identifiers or subjects. */
export function sampleIdentifiablePatterns(
  institutions: readonly Institution[],
  samplesPerPattern: number,
  seed: number,
): readonly PatternSample[] {
  const random = createSeededRandom(seed);
  return institutions.flatMap((institution) =>
    institution.patterns.flatMap((pattern, patternIndex) => {
      const isIdentifiable = pattern.identifiers !== undefined || pattern.subjects !== undefined;
      if (!isIdentifiable) {
        return [];
      }
      return Array.from({ length: samplesPerPattern }, () =>
        samplePatternDigits(pattern, random),
      ).flatMap((digits) =>
        digits === null ? [] : [{ institution, pattern, patternIndex, digits }],
      );
    }),
  );
}

function buildSample(pattern: AccountPattern, random: () => number): string {
  const digits = [...randomDigits(random, templateLength(pattern.template))];
  const place = (start: number, code: string): void => {
    [...code].forEach((digit, offset) => {
      digits[start + offset] = digit;
    });
  };
  const pick = <T>(items: readonly T[]): T | undefined =>
    items[Math.floor(random() * items.length)];

  const identifier = pickIdentifier(pattern, pick);
  if (pattern.identifierPosition !== undefined && identifier !== null) {
    place(pattern.identifierPosition.start, identifier);
  }

  const subjectPosition = pattern.subjectPosition;
  const sharesIdentifierSpan =
    subjectPosition !== undefined &&
    subjectPosition.start === pattern.identifierPosition?.start &&
    subjectPosition.length === pattern.identifierPosition.length;
  const subject = pick(pattern.subjects ?? []);
  if (subjectPosition !== undefined && subject !== undefined && !sharesIdentifierSpan) {
    place(subjectPosition.start, subject.code);
  }

  return digits.join("");
}

function pickIdentifier(
  pattern: AccountPattern,
  pick: <T>(items: readonly T[]) => T | undefined,
): string | null {
  const listed = pick(pattern.identifiers ?? []);
  if (listed !== undefined) {
    return listed;
  }
  const range = pattern.identifierRange;
  if (range === undefined || pattern.identifierPosition === undefined) {
    return null;
  }
  return String(range.from).padStart(pattern.identifierPosition.length, "0");
}
